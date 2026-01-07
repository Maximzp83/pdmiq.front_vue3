<template>
	<div class="chart-height-auto">
		<!-- <button @click="state_socketCallback(statisticsMockData)">update</button> -->
		<!-- <button @click="state_socketCallback(downtimeMockData)">update Downtime</button> -->
		<SimpleSpinner
			v-if="!disablePreloader && useSimpleSpinnerAsPreloader"
			:active="chartLoading"
		/>

		<VueElementLoadingWrapper
			v-else-if="!disablePreloader"
			:isLoading="chartLoading /*|| chartRendering*/"
			:itemsName="tt('chart')"
			:disableText="disablePreloaderText"
		/>

		<div
			v-if="customChartHeader && customChartHeaderFile"
			v-show="hasStatistics"
			class="card-header chart-card-header "
		>
			<component
				v-bind:is="customChartHeaderFile"
				@event="handleEventNew"
				:propsData="additionalProps"
				:ChartInstance="ChartInstance"
				:chartOptionsUpdate="chartOptionsUpdate"
				:chartIsInit="chartRendering"
				:dynamicProps="dynamicProps"
			/>
		</div>

		<div v-show="isShowChart" :class="['chart-container', additionalProps.chartContainerClass || '']">
			<ChartWrapper :chartOptions="chartOptions" :hcInstance="hcInstance" />
		</div>

		<div v-if="customMock" v-show="!isShowChart" class="custom-mock-container">
			<slot name="custom_mock_sub"></slot>
		</div>

		<div
			v-else-if="nodataMock"
			v-show="!isShowChart"
			class="page-title bold gray-color outside-bg-addition"
		>
			{{ $t('phrases.no_data') }}
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		ChartWrapper: () => import('@/components/charts/ChartWrapper.vue')
	},
	props: {
		ChartInstance: {
			type: Object,
			required: true
		},
		rootFilters: { type: Object, default: () => ({}) },
		rootStatisticsData: null,
		additionalProps: { type: Object, default: () => ({}) },
		dynamicProps: { type: Object, default: () => ({}) },
		// chartPointsEventsList: { type: Object, default: () => ({}) },
		// chartPlotOptionsEventsList: { type: Array, default: () => ([]) },
	},
	data() {
		return {
			chartIsInit: false,
			updateChart: 0,
			chartOptionsUpdate: 0,
			chartLoading: false,
			chartRendering: false,
			initialFetch: true,

			hasStatistics: false,
			statisticsResponsesReady: false
		};
	},

	computed: {
		...mapState({
			isSidebarCollapse: state => state.global.isSidebarCollapse
		}),

		disablePreloader: that => that.additionalProps.disablePreloader,
		disablePreloaderText: that => that.additionalProps.disablePreloaderText,
		useSimpleSpinnerAsPreloader: that =>
			that.additionalProps.useSimpleSpinnerAsPreloader,
		nodataMock: that => that.additionalProps.nodataMock,
		customMock: that => that.additionalProps.customMock,
		customChartHeader: that => that.additionalProps.customChartHeader,
		showWithoutStatistics: that => that.additionalProps.showWithoutStatistics,
		hcInstance: that => that.additionalProps.hcInstance,		

		isShowChart: that =>
			that.initialFetch || that.hasStatistics || that.showWithoutStatistics,

		customChartHeaderFile() {
			let { customChartHeader } = this;
			if (customChartHeader) {
				return () => import(`@/${customChartHeader.componentPath}.vue`);
			}
			return null;
		},

		chartOptions: that =>
			that.chartOptionsUpdate
				? Object.freeze(that.ChartInstance.getChartOptions())
				: null,

		chartInstanceEventsList() {
			let list = {
				isLoading: value => (this.chartLoading = value),
				isRendering: value => (this.chartRendering = value),
				isInitiated: () => (this.chartIsInit = true),
				statisticsResponsesReady: ready =>
					this.handleStatisticsResponsesReady(ready),
				hasStatistics: value => (this.hasStatistics = value),
				chartOptionsReady: () => this.chartOptionsUpdate++,
				chartOptionsUpdate: () => this.chartOptionsUpdate++,
				chartLoadEvent: e => this.handleChartOperation('chartLoadEvent', e),
				// plotBandsClickEvent: data => this.handlePlotBandsClick(data)
			};

			if (this.additionalProps.chartInstanceEventsList) {
				list = Object.assign(list, this.additionalProps.chartInstanceEventsList);
			}

			return Object.freeze(list);
		},

		chartEventsList() {
			return Object.freeze(this.additionalProps.chartEventsList);
		},

		chartPointsEventsListFinal() {
			// const chartPointsEventsList = this.additionalProps.chartPointsEventsList || {};
			return Object.freeze(this.additionalProps.chartPointsEventsList);
		},

		chartPlotOptionsEventsListFinal() {
			// const chartPlotOptionsEventsList = this.additionalProps.chartPlotOptionsEventsList || [];

			return Object.freeze(this.additionalProps.chartPlotOptionsEventsList);
		},

		chartSpecificEventsListFinal() {
			// const chartSpecificEventsList = this.additionalProps.chartSpecificEventsList || [];

			return Object.freeze(this.additionalProps.chartSpecificEvents);
		}
	},

	methods: {
		/*fetchChartData(settings = {}) {
			this.ChartInstance.fetchChartData(settings);
		},*/

		handleStatisticsResponsesReady(ready) {
			this.statisticsResponsesReady = ready;

			if (ready) {
				this.initialFetch = false;
			}
		},

		// ------------------
		handleChartOperation(actionName, data) {
			this.$emit('event', {
				eventName: actionName,
				data: data,
				onward: true
			});
		}
	},

	watch: {
		/*rootFilters() {
			this.ChartInstance.fetchChartData();
		},*/
		rootStatisticsData(data) {
			this.ChartInstance.fetchChartData({ rootStatisticsData: data });
		}
	},

	created() {
		this.ChartInstance.injectProps('events', this.chartInstanceEventsList);

		if (this.chartEventsList) {
			this.ChartInstance.assignChartEvents(this.chartEventsList);
		}

		if (this.chartPlotOptionsEventsListFinal) {
			this.ChartInstance.assignPlotOptionsEvents(
				this.chartPlotOptionsEventsListFinal
			);
		}

		if (this.chartSpecificEventsListFinal) {
			this.ChartInstance.assignSpecificOptionsEvents(
				this.chartSpecificEventsListFinal
			);
		}
		if (this.chartPointsEventsListFinal) {
			this.ChartInstance.setValue('seriesEvents', this.chartPointsEventsListFinal);
		}

		this.ChartInstance.fetchChartData({
			rootStatisticsData: this.rootStatisticsData
		});
		// this.fetchChartData(this.rootFilters);
	}
};
</script>
