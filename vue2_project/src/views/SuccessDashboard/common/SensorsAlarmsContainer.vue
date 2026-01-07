<template>
	<div class="">
		<div
			class="dialog-body-container drag-n-drop-wrapper"
			v-if="sensorsAlarmsDataList.length"
		>
			<!-- <div class="flex" > -->
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
						{ 'icon-unlock': !draggingLocked }
					]"
				></i>
			</el-button>
			<!-- </div> -->

			<!-- :alarmItems="sensorsAlarmsDataList" -->
			<div
				:class="['drag-n-drop-list', { 'dragndrop-active': !draggingLocked }]"
				v-if="sensorsAlarmsDataList.length"
			>
				<SensorAlarmsChartsListWrapper
					ref="SensorAlarmsChartsListWrapper"
					v-for="(item, idx) in sensorsAlarmsDataList"
					:key="`data-${item.sensor_id}`"
					:chartsContainerIdx="idx"
					@event="handleEventNew"
					:rootFilters="filters"
					:additionalProps="additionalProps"
					:alarmItem="item"
				/>
			</div>
		</div>

		<div
			class="dialog-footer flex justify-center"
			v-if="additionalProps.showSaveButton && sensorsAlarmsDataList.length"
		>
			<el-button
				@click="saveSensorsAlarmsChartsForms"
				type="primary"
				native-type="button"
				class="item-action-button"
			>
				<span class="uppercase">{{ $t('SAVE') }}</span>
			</el-button>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';

import Highcharts from 'highcharts';
// import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
// stockInit(Highcharts);
boost(Highcharts);
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { findItemBy, groupBy, getDateRange, cloneDeep } from '@/helpers';

// import { mapActions } from 'vuex';
import { eventHandler, dragNdropSortableMixin } from '@/mixins';

export default {
	mixins: [eventHandler(), dragNdropSortableMixin()],
	components: {
		SensorAlarmsChartsListWrapper: () =>
			import('./SensorAlarmsChartsListWrapper.vue')
	},
	props: {
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		itemData: null,
		additionalProps: { type: Object, default: () => ({}) },
		sensorsAlarms: null,
		sensorsList: { type: Array, required: true },
		sensorsLoading: Boolean,
		measurement: Number
	},
	data() {
		return {
			reorderGraphsHistory: []
			// sensorsAlarmsDataList: []
		};
	},

	computed: {
		drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',

		sensorsAlarmsDataList() {
			// one item - one ChartWrapper
			if (!this.sensorsLoading) {
				const { sensorsAlarms, sensorsList } = this;
				let alarmsArray =
					sensorsAlarms instanceof Array
						? sensorsAlarms
						: Object.values(sensorsAlarms);

				if (sensorsList.length && alarmsArray.length) {
					let alarmsGgrouped = groupBy(alarmsArray, 'sensor_id', '_');
					// console.log('alarmsGgrouped: ', alarmsGgrouped, alarmsArray);

					// let groupedTest = this.testGroup(alarmsArray, 'sensor_id', '_');
					// console.log(groupedTest)
					return Object.values(alarmsGgrouped).map(sensorGraphsGroup => {
						// return alarmsArray.map(graphItem => {
						// const sensor = findItemBy('id', graphItem.sensor_id, sensorsList);
						const sensor = findItemBy(
							'id',
							sensorGraphsGroup[0].sensor_id,
							sensorsList
						);
						// console.log(sensorsAlarms, sensorsList)
						if (sensor) {
							return Object.freeze({
								sensor_id: sensor.id,
								sensorData: sensor,
								// parameters: [graphItem.parameter],
								// alarmItemData: graphItem,
								parameters: sensorGraphsGroup
									.map(gi => gi.parameter)
									.filter(pi => !!pi),
								sensorGraphsGroup: sensorGraphsGroup
								/*descriptions: graphItem.map(ai => ({
									parameter: ai.parameter,
									description: ai.description
								})).filter(di => !!di.parameter || !!di.description )*/
							});
						} else {
							console.warn('Error! Sensor is not present in sensorsList');
							return null;
						}
					});
				}
			}

			return [];
		},

		daterange() {
			const { itemData, rootFilters } = this;
			if (rootFilters && rootFilters.daterange && rootFilters.daterange.length) {
				return rootFilters.daterange;
			} else if (itemData) {
				return getDateRange('last_7_days', {
					getDateString: true,
					customDate: itemData.created_at
				});
			} else {
				return getDateRange('last_7_days', { getDateString: true });
			}
		},

		filters() {
			return Object.freeze({
				measurement: this.measurement,
				daterange: this.daterange
			});
		}
	},

	methods: {
		toggleDragNDrop() {
			this.draggingLocked = !this.draggingLocked;
		},

		reorderHandler(event) {
			const { oldIndex, newIndex } = event;

			if (oldIndex !== newIndex) {
				this.reorderGraphsHistory.push({ oldIndex, newIndex });
			}
		},

		sortGraphsByHistory(alarms, history) {
			let alarmsGgrouped = Object.values(groupBy(alarms, 'sensor_id', '_'));
			// console.log(alarmsGgrouped, history)

			history.forEach(({ oldIndex, newIndex }) => {
				// console.log('oldIndex ', oldIndex, 'newIndex ', newIndex)
				const group = alarmsGgrouped[oldIndex];
				alarmsGgrouped.splice(oldIndex, 1);
				alarmsGgrouped.splice(newIndex, 0, group);
			});

			let sortedGrafs = [];

			alarmsGgrouped.forEach(group => {
				sortedGrafs = sortedGrafs.concat(group);
			});
			// console.log(sortedGrafs)
			return sortedGrafs;
		},

		// ----------------------------------

		saveSensorsAlarmsChartsForms() {
			const wrappersData = this.$refs.SensorAlarmsChartsListWrapper.map(ref =>
				ref.getSensorsAlarmsChartsForms()
			);

			if (wrappersData.every(wid => wid.every(chartData => !!chartData))) {
				let alarms = [];
				wrappersData.forEach(wid => wid.forEach(alarm => alarms.push(alarm)));
				// console.log(this.prepareNewGraphsList(alarms))

				this.$emit('event', {
					eventName: 'updateFormDataGraphs',
					data: this.prepareNewGraphsList(alarms)
				});
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('warning'),
					message: this.$t('phrases.check_form_fields')
				});
			}
		},

		prepareNewGraphsList(alarms) {
			let alarmsCopy = cloneDeep(alarms);

			if (this.reorderGraphsHistory && this.reorderGraphsHistory.length) {
				alarmsCopy = this.sortGraphsByHistory(alarmsCopy, this.reorderGraphsHistory);
			}

			alarmsCopy.filter(alarm => !alarm.remove_this_graph);

			let newNotesSettings = [];

			alarmsCopy.forEach(ai => {
				const { machine_id, sensor_id, notes } = ai;

				if (notes) {
					const newNotes = [];

					notes.forEach(ni => {
						const formItemSettings = {
							formData: {
								description: ni.description,
								machine_id: machine_id,
								sensor_ids: [sensor_id]
							},
							unshift: true
						};

						if (
							ni.is_add_to_recommended_actions &&
							ni.is_add_to_recommended_actions_initial
						) {
							newNotesSettings.push({
								listName: 'recommendedActionsItemsList',
								prefix: 'ra_i-',
								formItemSettings
							});
							// this.addFormItem('recommendedActionsItemsList', 'ra_i-', formItemSettings);
						}
						if (
							ni.is_add_to_next_activities &&
							ni.is_add_to_next_activities_initial
						) {
							newNotesSettings.push({
								listName: 'activitiesPlannedForNextItemsList',
								prefix: 'an_i-',
								formItemSettings
							});
						}
						if (
							ni.is_add_to_current_activities &&
							ni.is_add_to_current_activities_initial
						) {
							newNotesSettings.push({
								listName: 'activitiesItemsList',
								prefix: 'a_i-',
								formItemSettings
							});
						}

						let noteItem = { ...ni };
						delete noteItem.is_add_to_recommended_actions_initial;
						delete noteItem.is_add_to_next_activities_initial;
						delete noteItem.is_add_to_current_activities_initial;
						newNotes.push(noteItem);
					});

					ai.notes = newNotes;
				}
			});
			// console.log(newAlarms)
			return {
				graphs: alarmsCopy,
				newNotesSettings
			};
		}
	}
};
</script>
