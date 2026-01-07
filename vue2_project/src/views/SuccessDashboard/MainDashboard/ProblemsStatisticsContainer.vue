<template>
	<div class="card block-item statistics-block vertical-fluid">
		<div class="card-header filled_2">
			<div class="title semi-bold">{{ title }}</div>
		</div>

		<div class="card-content relative small-padding chart-height-auto">
			<SimpleSpinner :active="statisticsLoading" />

			<div class="" v-if="hasStatistics">
				<CommonChartItemWrapper
					ref="CommonChartItemWrapper"
					chartFactoryContainerName="MaintenanceChartFactoryContainer"
					chartFactoryName="SuccessDashboardProblemsChart"
					configsKey="maintenanceChartListsConfig"
					chartKey="main"
					:rootStatisticsData="statisticsData"
					:additionalProps="chartProps"
				/>

				<div class="charts-hr">
					<span>{{ $t('Time') }}</span>
				</div>

				<CommonChartItemWrapper
					ref="CommonChartItemWrapper"
					chartFactoryContainerName="MaintenanceChartFactoryContainer"
					chartFactoryName="SuccessDashboardProblemsChart"
					configsKey="maintenanceChartListsConfig"
					chartKey="main"
					:rootStatisticsData="statisticsData"
					:additionalProps="chartPropsForTime"
				/>
			</div>

			<div
				class="page-title bold gray-color outside-bg-addition"
				v-else-if="!statisticsLoading"
			>
				{{ $t('phrases.no_data') }}
			</div>
		</div>
	</div>
</template>

<script>
import { cloneDeep } from '@/helpers';

export default {
	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		// itemData: { type: Object, default: () => ({}) },
		title: String,
		statisticsData: Array,
		setupProblemsStatisticsProp: String,
		setupProblemsTimeStatisticsProp: String,
		statisticsLoading: Boolean
	},

	computed: {
		hasStatistics: that => that.statisticsData.length,

		chartPropsBase() {
			return Object.freeze({
				// nodataMock: true,
				disablePreloader: true,
				chartInstanceContainerPayload: {
					setupProblemsStatisticsSettings: {
						prop: this.setupProblemsStatisticsProp
					}
				},
				chartPointsEventsList: {
					serieClick: { name: 'click', event: e => this.handleChartSerieClick(e) }
				}
			});
		},

		chartProps() {
			return Object.freeze(this.chartPropsBase);
		},
		chartPropsForTime() {
			let props = cloneDeep(this.chartPropsBase);
			props.chartInstanceContainerPayload.setupProblemsStatisticsSettings.prop = this.setupProblemsTimeStatisticsProp;
			props.chartInstanceContainerPayload.setupProblemsStatisticsSettings.is_duration = true;

			return Object.freeze(props);
		}
	},

	methods: {
		handleChartSerieClick(e) {
			e.preventDefault();
			console.log(e);
		}
	}
};
</script>
