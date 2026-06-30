<template>
	<div>
		<div
			v-if="sensorsAlarmsDataList.length"
			class="dialog-body-container drag-n-drop-wrapper sensors-alarms-drag-n-drop-wrapper"
		>
			<el-button
				v-if="additionalProps.enableDragNDrop"
				:class="['ml-auto drag_n_drop-locker', { active: !draggingLocked }]"
				native-type="button"
				@click="toggleDragNDrop"
			>
				<i
					:class="[
						'icomoon',
						{ 'icon-lock2': draggingLocked },
						{ 'icon-unlock': !draggingLocked },
					]"
				></i>
			</el-button>

			<div :class="['drag-n-drop-list', { 'dragndrop-active': !draggingLocked }]">
				<SensorAlarmsChartsListWrapper
					v-for="(item, idx) in sensorsAlarmsDataList"
					ref="chartWrappersRefs"
					:key="`data-${item.sensor_id}`"
					:chartsContainerIdx="idx"
					:rootFilters="filters"
					:additionalProps="additionalProps"
					:alarmItem="item"
					@event="(payload) => emit('event', payload)"
				/>
			</div>
		</div>

		<div v-if="additionalProps.showSaveButton && sensorsAlarmsDataList.length" class="dialog-footer flex justify-center">
			<el-button type="primary" native-type="button" class="item-action-button" @click="saveSensorsAlarmsChartsForms">
				<span class="uppercase">{{ tt('SAVE') }}</span>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { cloneDeep, findItemBy, getDateRange, groupBy } from '@/helpers';
import { Lang } from '@/localization';
import { useDragNdropSortable } from '@/composables/mixins/useDragNdropSortable';
import SensorAlarmsChartsListWrapper from './SensorAlarmsChartsListWrapper.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardSensorsAlarmsContainer' });

const props = defineProps({
	rootFilters: { type: Object, default: () => ({}) },
	itemData: { type: Object, default: null },
	additionalProps: { type: Object, default: () => ({}) },
	sensorsAlarms: { type: [Array, Object], default: () => [] },
	sensorsList: { type: Array, required: true },
	sensorsLoading: Boolean,
	measurement: Number,
});
const emit = defineEmits(['event']);

const chartWrappersRefs = ref([]);
const reorderGraphsHistory = ref([]);

const sensorsAlarmsDataList = computed(() => {
	if (props.sensorsLoading) return [];

	const alarmsArray = Array.isArray(props.sensorsAlarms)
		? props.sensorsAlarms
		: Object.values(props.sensorsAlarms || {});

	if (!props.sensorsList.length || !alarmsArray.length) return [];

	return Object.values(groupBy(alarmsArray, 'sensor_id', '_'))
		.map((sensorGraphsGroup) => {
			const sensor = findItemBy('id', sensorGraphsGroup[0]?.sensor_id, props.sensorsList);
			if (!sensor) return null;

			return Object.freeze({
				sensor_id: sensor.id,
				sensorData: sensor,
				parameters: sensorGraphsGroup.map((item) => item.parameter).filter(Boolean),
				sensorGraphsGroup,
			});
		})
		.filter(Boolean);
});

const daterange = computed(() => {
	if (props.rootFilters?.daterange?.length) return props.rootFilters.daterange;
	if (props.itemData) {
		return getDateRange('last_7_days', {
			getDateString: true,
			customDate: props.itemData.created_at,
		});
	}
	return getDateRange('last_7_days', { getDateString: true });
});

const filters = computed(() =>
	Object.freeze({
		measurement: props.measurement,
		daterange: daterange.value,
	}),
);

const toggleDragNDrop = () => {
	draggingLocked.value = !draggingLocked.value;
};
const reorderHandler = (event) => {
	const { oldIndex, newIndex } = event;
	if (oldIndex !== newIndex) {
		reorderGraphsHistory.value.push({ oldIndex, newIndex });
	}
};
const sortGraphsByHistory = (alarms, history) => {
	const alarmsGrouped = Object.values(groupBy(alarms, 'sensor_id', '_'));
	history.forEach(({ oldIndex, newIndex }) => {
		const group = alarmsGrouped[oldIndex];
		alarmsGrouped.splice(oldIndex, 1);
		alarmsGrouped.splice(newIndex, 0, group);
	});
	return alarmsGrouped.reduce((list, group) => list.concat(group), []);
};
const prepareNewGraphsList = (alarms) => {
	let alarmsCopy = cloneDeep(alarms);
	if (reorderGraphsHistory.value.length) {
		alarmsCopy = sortGraphsByHistory(alarmsCopy, reorderGraphsHistory.value);
	}

	alarmsCopy = alarmsCopy.filter((alarm) => !alarm.remove_this_graph);
	const newNotesSettings = [];

	alarmsCopy.forEach((alarm) => {
		const { machine_id, sensor_id, notes } = alarm;
		if (!notes) return;

		const newNotes = [];
		notes.forEach((note) => {
			const formItemSettings = {
				formData: {
					description: note.description,
					machine_id,
					sensor_ids: [sensor_id],
				},
				unshift: true,
			};

			if (note.is_add_to_recommended_actions && note.is_add_to_recommended_actions_initial) {
				newNotesSettings.push({
					listName: 'recommendedActionsItemsList',
					prefix: 'ra_i-',
					formItemSettings,
				});
			}
			if (note.is_add_to_next_activities && note.is_add_to_next_activities_initial) {
				newNotesSettings.push({
					listName: 'activitiesPlannedForNextItemsList',
					prefix: 'an_i-',
					formItemSettings,
				});
			}
			if (note.is_add_to_current_activities && note.is_add_to_current_activities_initial) {
				newNotesSettings.push({
					listName: 'activitiesItemsList',
					prefix: 'a_i-',
					formItemSettings,
				});
			}

			const noteItem = { ...note };
			delete noteItem.is_add_to_recommended_actions_initial;
			delete noteItem.is_add_to_next_activities_initial;
			delete noteItem.is_add_to_current_activities_initial;
			newNotes.push(noteItem);
		});

		alarm.notes = newNotes;
	});

	return {
		graphs: alarmsCopy,
		newNotesSettings,
	};
};

const { draggingLocked } = useDragNdropSortable({
	wrapperSelector: '.sensors-alarms-drag-n-drop-wrapper',
	reorderHandler,
});

const saveSensorsAlarmsChartsForms = () => {
	const wrappersData = chartWrappersRefs.value.map((wrapper) => wrapper.getSensorsAlarmsChartsForms());
	if (wrappersData.every((items) => items.every((chartData) => !!chartData))) {
		const alarms = [];
		wrappersData.forEach((items) => items.forEach((alarm) => alarms.push(alarm)));
		emit('event', {
			eventName: 'updateFormDataGraphs',
			data: prepareNewGraphsList(alarms),
		});
	}
};

defineExpose({ saveSensorsAlarmsChartsForms });
</script>
