<template>
	<div
		:class="[
			'sensor-alarms-charts-wrapper content-row relative',
			{ 'drag-n-drop-item': additionalProps.enableDragNDrop }
		]"
	>
		<div class="dark-overlay" v-if="additionalProps.enableDragNDrop">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="card">
			<div class="card-header flex mrow wrap align-center" v-if="sensorData">
				<div class="mcol-xs-2 mcol-lg-1">
					<EquipmentPictureBlock
						@event="handleEventNew"
						:equipmentData="equipmentData"
					/>
				</div>

				<div class="mcol-xs-8 mcol-sm-6 mcol-lg-8">
					<div class="title article-title" v-html="sensorTitle"></div>
				</div>

				<div class="ml-auto mcol-xs-auto" v-if="additionalProps.showDatePicker">
					<Datepicker
						setupDaterangeFilter
						enableShortcuts
						v-model="daterange"
						type="daterange"
					/>
				</div>
			</div>
		</div>

		<div class="charts-data-container">
			<!-- <ChartsPreloader
				:showMock="
					!chartsListWrapperLoading && chartsListWrapperReady && !hasStatistics
				"
				:showPreloader="chartsListWrapperLoading && !hasStatistics"
			/> -->

			<!-- v-show="!(chartsListWrapperReady && !hasStatistics)" -->
			<div :class="['charts-list']">
				<div
					:class="['chart-container-wrapper content-row']"
					v-for="(chart, idx) in chartsList"
					:key="`chart-${chart.chart_id}_idx-${idx}`"
				>
					<ChartItemContainer
						:key="updateChartsList"
						:ref="`chart_item-${chart.chart_id}`"
						@event="handleEventNew"
						:ChartInstance="chart"
						:rootFilters="newFilters"
						:sensorData="sensorData"
						:additionalProps="additionalProps"
						:currentSensorType="currentSensorType"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { executeChartsListFactory } from '@/modules/charts_factory/index.js';
import { eventHandler, sensorTypeMixin } from '@/mixins';
import { getSensorTitle } from '@/helpers/specialHelpers';

export default {
	mixins: [eventHandler(), sensorTypeMixin()],
	components: {
		ChartItemContainer: () => import('./SensorAlarmsChartItemContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		// ChartsPreloader: () => import('@/components/charts/ChartsPreloader.vue'),
		EquipmentPictureBlock: () =>
			import('@/views/Sensors/charts/EquipmentPictureBlock.vue')
	},
	props: {
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		additionalProps: { type: Object, default: () => ({}) },
		injectToChartOptions: { type: Object,	default: () => ({}) },
		chartsContainerIdx: null,
		alarmItem: { type: Object, required: true }
	},
	data() {
		return {
			updateChartsList: 0,
			chartsListInstancesInitialBuild: true,
			hasStatistics: false,
			chartsListWrapperReady: false,
			chartsListWrapperLoading: false,
			// chartsWrapperReadyCount: 0,

			daterange: []

			// resetChartListData: false
			// ---------------
		};
	},

	computed: {
		currentSensorTypeDataKey: () => 'sensorData',
		sensorData: that => Object.freeze(that.alarmItem.sensorData),
		equipmentData() {
			if (this.sensorData) {
				return Object.freeze(this.sensorData.equipment);
			}
			return null;
		},
		sensorTitle() {
			if (this.sensorData) {
				return getSensorTitle(this.sensorData, { boldLabels: true });
			}
			return '';
		},
		// -----------------
		newFilters() {
			return {
				...this.rootFilters,
				daterange: this.daterange,
				daterange_setted_at: Date.now()
			};
		},

		chartsListInstanceEventsList() {
			return Object.freeze({
				chartsListWrapperReady: hasStatistics => {
					this.hasStatistics = hasStatistics;
					this.chartsListWrapperReady = true;
				},
				chartsListWrapperLoading: val => (this.chartsListWrapperLoading = val)
			});
		},

		ChartsListInstance() {
			// this.handleChartsListInstanceReady(Instance);
			let { injectToChartOptions } = this;
			injectToChartOptions = injectToChartOptions || {};
			// console.log('ChartsListInstance', injectToChartOptions)

			return executeChartsListFactory('sensorAlarmsChartsListFactory', {
				//1 level payload
				settings: {
					events: this.chartsListInstanceEventsList,
					settings_payload: {
						/*chartDataReadySettings: { 
								useFirstStatisticsItemForAll: true,
							},*/
						inject_options: {
							navigator: { enabled: false },
							...injectToChartOptions
						}
						// disableNavigator: true
					},
					setupChartsConfigsListSettings: {
						// filterParamsBy: { prop: 'axis_id', value: this.activeAxis },
						// getParamsByIds: this.getParamsByIds,
					}
				},
				payload_1: {
					sensorType: this.currentChartSettingsKey,
					sensorItem: this.sensorData,
					alarmItem: this.alarmItem,
					currentSensorType: this.currentSensorType,
					enableDescriptionForm: this.additionalProps.enableDescriptionForm,
					enableAnnotations: this.additionalProps.enableAnnotations
					// setValue: ['chartTitle', 'title from payload 1'],
				}
			});
		},

		buildChartsSettings() {
			const { joinChartsBy, currentChartSettingsKey, alarmItem } = this;
			// console.log('metric', this.metric)
			let settings = {
				chartFactoryName: 'SensorAlarmsChart',
				// chart_instance_name: 'SensorChart',
				setupChartsConfigsListSettings: {
					configsKey: 'sensorChartsListsConfig',
					chartKey: currentChartSettingsKey,
					joinChartsBy,
					getParamsByIds: alarmItem.parameters
					// getParamsByIds: [alarmItem.parameters[1]], //todo
				}
			};

			return Object.freeze(settings);
		},

		chartsList: that =>
			that.updateChartsList ? that.ChartsListInstance.getCharts() : []
	},

	methods: {
		buildCharts({ settings, payload }) {
			payload = payload || {};

			this.ChartsListInstance.buildCharts({
				settings,
				payload_1: { ...payload },
				filters: { ...this.rootFilters }
			});

			if (this.chartsListInstancesInitialBuild) {
				this.chartsListInstancesInitialBuild = false;
			}

			this.updateChartsList++;
			window[`ChartsListInstance_${this.chartsContainerIdx}`] = this.ChartsListInstance;
		},

		reloadChart(ids) {
			this.ChartsListInstance.reloadCharts(ids);
		},

		setupDaterange(graph) {
			if (!this.daterange.length) {
				if (graph.date_start && graph.date_finish) {
					this.daterange = [graph.date_start, graph.date_finish];
				} else if (this.rootFilters.daterange) {
					this.daterange = this.rootFilters.daterange;
				}
			}
		},

		// --------------------------
		getSensorsAlarmsChartsForms() {
			return this.ChartsListInstance.getSensorsAlarmsChartsForms();
		}
	},

	watch: {
		buildChartsSettings(settings) {
			this.buildCharts({ settings });
		}
	},
	created() {
		const { alarmItem } = this;
		if (alarmItem && alarmItem.sensorGraphsGroup) {
			alarmItem.sensorGraphsGroup.forEach(graph => {
				this.setupDaterange(graph);
			});
		}

		this.buildCharts({ settings: this.buildChartsSettings });
	}
};
</script>
