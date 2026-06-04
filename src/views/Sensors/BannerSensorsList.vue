<template>
	<div class="view-wrapper view-list-wrapper">
		<div :class="{ mcontainer: !insideOtherPage }">
			<div :class="{ 'view-content-card card content-row': !insideOtherPage }">
				<div :class="{ 'card-content': !insideOtherPage }">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideCreate
						hideDelete
						searchbarClass="ml-auto"
						:actionButtons="actionButtons"
						@event="handleEvent"
					/>

					<CustomDataListTable
						ref="itemsTableRef"
						:itemsLoading="itemsLoading"
						:itemsSaving="rebaselineLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						@event="handleEvent"
					/>

					<PaginationContainer
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
						@setFilters="setFilters"
					/>
				</div>
			</div>
		</div>

		<FFTRequestBlock
			ref="fftRequestBlockRef"
			:sensorData="sensorDataForFFT"
			:isSending="sendingFFTRequest"
			@update:isSending="sendingFFTRequest = $event"
			@onSocketSuccess="refetchItemsList"
		/>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';

import { ENTITIES } from '@/config/entities';
import {
	DATASET,
	rebase_lines,
	rebase_wheel,
	itemSpeedOptionsList,
} from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { cloneDeep, findItemBy } from '@/helpers';
import { setupConnectionStrengthCell } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useSensors } from '@/composables/useSensors';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useSensorsStore } from '@/stores/SensorsStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import FFTRequestBlock from './FilterBlock/FFTRequestBlock.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'BannerSensorsList',
});

const props = defineProps({
	insideOtherPage: Boolean,
	controllerId: { type: [String, Number], default: null },
	propsFilters: { type: Object, default: () => ({}) },
});

const itemsTableRef = ref(null);
const fftRequestBlockRef = ref(null);
const sendingFFTRequest = ref(false);
const sensorDataForFFT = ref(null);
const rebaselineLoading = ref(false);

const authStore = useAuthStore();
const sensorsStore = useSensorsStore();
const equipmentsStore = useEquipmentsStore();
const { filters } = storeToRefs(sensorsStore);
const { filters: equipmentsFilters } = storeToRefs(equipmentsStore);
const { changeRoute } = useNavigation();
const { sensorRebaseLine } = useSensors();

const propsFiltersRef = computed(() => ({
	...props.propsFilters,
	...(props.controllerId ? { controllerId: props.controllerId } : {}),
}));

const predefinedFilters = Object.freeze({
	orderByColumn: 'port_number',
	orderByMethod: 'asc',
	plantId: null,
});

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	refetchItemsList,
	createItem,
	editItem,
	deleteItem,
	handleDeleteItems,
} = useItemsData({
	entityKey: 'Sensors',
	itemStore: sensorsStore,
	options: {
		tableRef: itemsTableRef,
		predefinedFilters,
		propsFilters: propsFiltersRef,
		localCreateItem: () => {
			changeRoute({ path: `${ENTITIES.Sensors.routeBase}/new` });
		},
		localEditItem: ({ row }) => {
			changeRoute({ path: `${ENTITIES.Sensors.routeBase}/${row.id}` });
		},
	},
	itemsName: computed(() => ({
		one: `Banner ${tt('Sensor')}`,
		mult: `Banner ${tt('Sensors')}`,
		instanceName: 'sensors',
	})),
});

const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_dashboard']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_dashboard']));

const actionButtons = computed(() => {
	const actions = [];

	if (hasAccessToEdit.value) {
		actions.push({ id: 1, text: 'Add', event: 'createItem' });
	}
	if (hasAccessToDelete.value) {
		actions.push({ id: 2, text: 'Delete', isDelete: true, event: 'handleDeleteItems' });
	}

	return Object.freeze(translate(actions, { key: 'text' }));
});

const hasBannerV2Sensors = computed(() =>
	itemsList.value.some((sensor) =>
		[DATASET.BANNER_TEMP_VIBE_V2, DATASET.BANNER_V2_GENERIC].includes(sensor.data_set),
	),
);

const setupRPMcell = (sensor) => {
	const { rpmSources, equipment } = sensor || {};
	if (rpmSources && equipment) {
		const option = findItemBy('id', equipment.rpm_source_item, itemSpeedOptionsList());
		if (option) return `${option.name} - ${rpmSources[option.source_key]}`;
	}
	return '';
};

const tableSettings = computed(() => {
	const settings = {
		tableClass: 'controller-devices-table',
		columns: [{ label: 'Location', prop: 'location_in_equipment' }],
		operations: { actions: [] },
	};

	if (hasBannerV2Sensors.value) {
		settings.columns.push(
			{ label: `${tt('device')} id`, prop: 'device_address_id', skipTranslate: true },
			{ label: `${tt('sensor')} id`, skipTranslate: true, prop: 'fft_sensor_id' },
		);
	}

	settings.columns.push(
		{
			label: 'Asset',
			prop: 'equipment.asset.name',
			min_width: 100,
			meta: {
				action: {
					name: 'handleAssetClick',
					className: 'table-link info-color',
					button_text_prop: 'equipment.asset.name',
					disablePopover: true,
					conditionSettings: {
						conditions: [{ prop: 'equipment.asset.id', method: '!=', control_value: null }],
					},
				},
			},
		},
		{
			label: 'RPM',
			prop: ' ',
			meta: {
				cell_class: 'text-center',
				prepareValue: {
					localMethod: setupRPMcell,
					useAllInstanceData: true,
				},
			},
		},
		{ label: 'Item', prop: 'equipment.equipmentType.name', min_width: 100 },
		{ label: 'Node', prop: 'port_number', width: 65 },
		{
			label: 'FW',
			prop: 'device_data.SenFwVer',
			skipTranslate: true,
			width: 76,
			meta: {
				cellComponent: { componentFileLoader: () => import('./SensorFirmwareStatusCell.vue') },
			},
		},
		{
			label: 'Status',
			prop: 'rssi',
			width: 76,
			meta: {
				cell_class: 'text-center',
				prepareValue: {
					localMethod: setupConnectionStrengthCell,
					args: {
						noSignalForInactive: 1,
						onSignalForActive: 1,
					},
					useAllInstanceData: true,
				},
			},
		},
		{
			label: 'Chart',
			width: 55,
			meta: {
				action: {
					linkSettings: { linkRoute: 'equipments/:equipment_id/details/pdm/:id' },
					className: 'el-button action-button sensor-statistics-button gray mini',
					icon: 'icomoon icon-chart3',
					disablePopover: true,
				},
			},
		},
	);

	settings.columns = translate(settings.columns);

	if (hasAccessToEdit.value) {
		settings.operations.actions.push(
			{
				name: 'makeFFTrequest',
				tooltip_text: 'fft',
				conditionSettings: {
					conditions: [
						{
							prop: 'data_set',
							array_method: 'some',
							control_value: [
								DATASET.NCD_ALL_IN_ONE_TEMP_VIBE,
								DATASET.NCD_WIRED_TEMP_VIBE,
								DATASET.NCD_TEMP_VIBE_CURRENT,
								DATASET.BANNER_TEMP_VIBE_V2,
								DATASET.BANNER_TEMP_VIBE_V2_1,
							],
						},
					],
				},
				buttonContent: {
					component: { componentFileLoader: () => import('./SensorFFTRequestButton.vue') },
				},
			},
			{
				name: 'makeRebaseline',
				tooltip_text: 'rebaseline',
				className: 'rebaselineButton',
				img: rebase_wheel,
				second_img: rebase_lines,
				conditionSettings: {
					conditions: [
						{
							prop: 'data_set',
							method: '!=',
							control_value: [DATASET.NCD_ENVIRONMENTAL, DATASET.HUMIDITY],
						},
					],
				},
			},
			standardTableOperations.edit,
		);
	}

	if (hasAccessToDelete.value) {
		settings.operations.actions.push(standardTableOperations.delete);
	}

	settings.operations.actions = translate(settings.operations.actions, { key: 'tooltip_text' });

	return Object.freeze(settings);
});

const handleAssetClick = ({ row }) => {
	equipmentsStore.set_equipments_filters({
		...equipmentsFilters.value,
		page: 1,
		isShowList: true,
		assetId: row.equipment.asset.id,
	});
	changeRoute({ path: '/dashboard/plant', query: 'scrollTo=.equipments-layout' });
};

const makeFFTrequest = ({ row }) => {
	if (row.is_fft_processing) return;
	sensorDataForFFT.value = cloneDeep(row);
	setTimeout(() => {
		fftRequestBlockRef.value?.confirmFFTRequest();
	}, 50);
};

const makeRebaseline = ({ row }) => {
	ElMessageBox.confirm(`${tt('aliases.rebaseline_confirm') || tt('rebaseline')}?`)
		.then(() => {
			rebaselineLoading.value = true;
			return sensorRebaseLine({ itemId: row.id });
		})
		.then(() => refetchItemsList())
		.finally(() => {
			rebaselineLoading.value = false;
		});
};

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	deleteItem,
	handleDeleteItems,
	handleAssetClick,
	makeFFTrequest,
	makeRebaseline,
});
</script>
