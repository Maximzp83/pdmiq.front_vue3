<template>
	<!-- <div class="relative"> -->
	<!-- <ChartsPreloader
			v-if="!additionalProps.disablePreloader"
			:showMock="chartContainerReady && !hasStatistics"
		/> -->
	<!-- :showPreloader="chartsListWrapperLoading && !hasStatistics" -->

	<!-- v-show="!(!!chartContainerReady && !hasStatistics)" -->
	<div :class="['chart-container-wrapper', additionalProps.chartWrapperClass || '']">
		<component
			:class="[additionalProps.chartItemComponentClass || '']"
			v-if="ChartInstance"
			v-bind:is="componentFile"
			:key="updateChartInstance"
			:ref="`chart_item-${ChartInstance.chart_id}`"
			@event="handleEventNew"
			:ChartInstance="ChartInstance"
			:rootFilters="finalFilters"
			:rootStatisticsData="rootStatisticsData"
			:additionalProps="additionalProps"
			:dynamicProps="dynamicProps"
		>
			<template v-slot:custom_mock_sub>
				<slot name="custom_mock"></slot>
			</template>
		</component>
	</div>
	<!-- </div> -->
</template>

<script>
import { executeChartFactoryContainer } from '@/modules/charts_factory/index.js';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		// ChartsPreloader: () => import('@/components/charts/ChartsPreloader.vue'),
		CommonChartItemContainer: () =>
			import('@/components/charts/CommonChartItemContainer.vue')
	},

	props: {
		predefinedFilters: { type: Object, default: () => ({}) },
		additionalProps: { type: Object, default: () => ({}) },
		dynamicProps: { type: Object, default: () => ({}) },
		buildChartsPayloadProps: { type: Object, default: () => ({}) },
		setupChartsConfigsListSettings: { type: Object, default: () => ({}) },

		rootFilters: {
			type: Object,
			default: () => ({})
		},
		chartFactoryContainerName: String,
		chartFactoryName: String,
		configsKey: String,
		chartKey: String,
		chartItemComponentPath: String,
		rootStatisticsData: null,
		chartWrapperIdx: null
	},

	data: () => ({
		hasStatistics: false,
		chartContainerReady: 0,
		chartContainerLoading: false,

		updateChartInstance: 0,
		chartInstanceInitialBuild: true
	}),

	computed: {
		componentFile() {
			let { chartItemComponentPath } = this;
			chartItemComponentPath =
				chartItemComponentPath || 'components/charts/CommonChartItemContainer';
				// console.log(`@/${chartItemComponentPath}.vue`)
			return () => import(`@/${chartItemComponentPath}.vue`);
		},

		chartInstanceContainerEventsList() {
			let { chartInstanceContainerEvents } = this.additionalProps;
			chartInstanceContainerEvents = chartInstanceContainerEvents || {};

			let events = {
				chartContainerReady: this.handleChartContainerReady,
				...chartInstanceContainerEvents
			};
			return Object.freeze(events);
		},

		ChartInstanceContainer() {
			let {
				chartInstanceContainerPayload,
				chartInstanceContainerSettings
			} = this.additionalProps;
			chartInstanceContainerPayload = chartInstanceContainerPayload || {};
			chartInstanceContainerSettings = chartInstanceContainerSettings || {};
			// console.log('ChartInstanceContainer', chartInstanceContainerPayload)
			return executeChartFactoryContainer(this.chartFactoryContainerName, {
				settings: {
					events: this.chartInstanceContainerEventsList,
					...chartInstanceContainerSettings
				},
				payload_1: {
					...chartInstanceContainerPayload
				}
			});
		},

		buildChartsSettings() {
			let settings = {
				chartFactoryName: this.chartFactoryName,
				setupChartsConfigsListSettings: {
					configsKey: this.configsKey,
					chartKey: this.chartKey,
					...this.setupChartsConfigsListSettings
				}
			};

			return Object.freeze(settings);
		},

		ChartInstance: that => {
			if (!!that.updateChartInstance || !!that.chartContainerReady) {
				// console.log('ChartInstance', that.ChartInstanceContainer)
				return that.ChartInstanceContainer.getChart();
			}
			return null;
		},

		finalFilters() {
			let filters = { ...this.rootFilters };
			if (this.predefinedFilters) {
				filters = { ...filters, ...this.predefinedFilters };
			}
			return filters;
		}
	},

	methods: {
		handleChartContainerReady({ hasStatistics, isChartDataReady }) {
			this.hasStatistics = hasStatistics;
			this.chartContainerReady++;
			this.chartContainerLoading = !isChartDataReady;
			this.$emit('event', {
				eventName: 'handleChartContainerReady',
				data: {
					chartContainerReady: this.chartContainerReady,
					hasStatistics: this.hasStatistics,
					resultData: this.ChartInstance.resultData
				},
				onward: true
			});
		},

		buildChart({ settings, payload }) {
			payload = payload || {};

			this.ChartInstanceContainer.buildChart({
				settings,
				payload_1: { ...payload, ...this.buildChartsPayloadProps },
				filters: { ...this.finalFilters },
			});

			if (this.chartInstanceInitialBuild) {
				this.chartInstanceInitialBuild = false;
			}

			this.updateChartInstance++;

			if (window.location.origin === 'http://localhost:8080') {
				window[`ChartInstanceContainer_${this.chartWrapperIdx || 0}`] = this.ChartInstanceContainer;
			}
		},

		callChartMethod(methodName, data) {
			return this.ChartInstance.callChartMethod(methodName, data);
		}
	},

	watch: {
		finalFilters(filters) {
			this.ChartInstanceContainer.setFiltersToChart(filters, { refetchData: true });
		}
	},

	created() {
		this.buildChart({ settings: this.buildChartsSettings });
	}
};
</script>
