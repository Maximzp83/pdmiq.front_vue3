<template>
	<div class="block-item statistics-block ">
		<div class="relative">
			<div class="charts-data-container">
				<!-- <SimpleSpinner :active="chartsListWrapperLoading" /> -->

				<div
					class="text-center"
					v-if="
						!chartsListWrapperLoading && chartsListWrapperReady && !hasStatistics
					"
				>
					{{ tt('phrases.FFT_data_is_not_valid') }}
				</div>

				<div
					:class="['charts-list']"
					v-show="!(chartsListWrapperReady && !hasStatistics)"
				>
					<div
						:class="['chart-container-wrapper content-row']"
						v-for="(chart, idx) in chartsList"
						:key="`chart-${chart.chart_id}_idx-${idx}`"
					>
						<!-- :key="updateChartsList" -->
						<FFTChartItemContainer
							:ref="`chart_item-${chart.chart_id}`"
							@event="handleEventNew"
							:ChartInstance="chart"
							:rootFilters="rootFilters"
							:sensorData="sensorData"
							:additionalProps="additionalProps"
							:prevFFTItems="prevFFTItems"
							:currentFFTItem="currentFFTItem"
							:activeAxis="activeAxis"
						/>
						<!-- :currentFFTId="fftId" -->
						<!-- :prevFFTId="prevFFTId" -->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { executeChartsListFactory } from '@/modules/charts_factory/index.js';
import { BANNER_REQUEST_TYPES } from '@/constants/global';

import { navigation, eventHandler, sensorTypeMixin } from '@/mixins';

export default {
	mixins: [navigation(), eventHandler(), sensorTypeMixin()],
	components: {
		FFTChartItemContainer: () => import('./FFTChartItemContainer.vue')
	},
	props: {
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		sensorData: {
			type: Object,
			default: () => ({})
		},
		additionalProps: { type: Object, default: () => ({}) },
		activeAxis: Number,
		enableAxisSelector: Boolean,
		sensorId: Number,
		fftId: Number,
		measurement: Number,
		splitCharts: Boolean,
		prevFFTItems: Array,
		currentFFTItem: Object,

	},

	data: () => ({
		updateChartsList: 0,
		chartsListInstancesInitialBuild: true,

		hasStatistics: false,
		chartsListWrapperReady: false,
		chartsListWrapperLoading: false
	}),

	computed: {
		isRequestTypeEnvelope: that => that.currentFFTItem && that.currentFFTItem.banner_request_type === BANNER_REQUEST_TYPES.ENVELOPE,

		chartsList: that =>
			that.updateChartsList ? that.ChartsListInstance.getCharts() : [],

		joinChartsBy() {
			return { prop: this.splitCharts ? '' : 'split' };
		},

		chartsListInstanceEventsList() {
			let events = {
				chartsListWrapperReady: hasStatistics => {
					this.hasStatistics = hasStatistics;
					this.chartsListWrapperReady = true;
				},
				chartsListWrapperLoading: val => (this.chartsListWrapperLoading = val)
			};
			// console.log('2',events)
			return Object.freeze(events);
		},

		ChartsListInstance() {
			// console.log('ChartsListInstance', executeChartsListFactory)
			return executeChartsListFactory('FFTChartsListFactory', {
				//1 level payload
				settings: {
					events: this.chartsListInstanceEventsList,
				},
				payload_1: {
					sensorType: this.currentChartSettingsKey,
					sensorItem: this.sensorData,
					fftId: this.fftId,
					currentSensorType: this.currentSensorType,
					isRequestTypeEnvelope: this.isRequestTypeEnvelope
				}
			});
		},

		currentSensorTypeDataKey: () => 'sensorData',

		buildChartsSettings() {
			const { splitCharts, activeAxis, joinChartsBy, getParamsByIds } = this;
			// console.log('measurement', this.measurement)
			var settings = {
				chartFactoryName: 'FFTChart',
				setupChartsConfigsListSettings: {
					configsKey: 'FFTChartsListsConfig',
					chartKey: 'fft',
					joinChartsBy,
					getParamsByIds,
					filterParamsBy: []
				}
			};

			if (this.isRequestTypeEnvelope) {
				settings.setupChartsConfigsListSettings.filterParamsBy.push({
					prop: 'type',
					method: '!=',
					value: 'velocity'
				});
			}

			if (!splitCharts && activeAxis) {
				const {
					ncd_active_vertical_axis,
					// ncd_active_axial_axis,
					is_hidden_ncd_active_vertical_axis
				} = this.sensorData;

				// settings.setupChartsConfigsListSettings.filterParamsBy = [];

				if (is_hidden_ncd_active_vertical_axis) {
					settings.setupChartsConfigsListSettings.filterParamsBy.push({
						prop: 'axis_id',
						method: '!=',
						value: ncd_active_vertical_axis
					});
				}

				if (joinChartsBy.prop) {
					settings.setupChartsConfigsListSettings.filterParamsBy.push({
						prop: 'axis_id',
						value: activeAxis
					});
				}
			}
			// console.log(settings)
			return Object.freeze(settings);
		}
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
			// console.log(this.chartsContainerIdx)
			if (window.location.origin === 'http://localhost:8080') {
				window[`ChartsListInstance_0`] = this.ChartsListInstance;
			}
		}
	},

	watch: {
		buildChartsSettings(settings) {
			this.buildCharts({ settings });
		}
	},

	created() {
		this.buildCharts({ settings: this.buildChartsSettings });
	}
};
</script>
