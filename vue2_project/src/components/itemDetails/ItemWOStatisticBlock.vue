<template>
	<div class="card block-item statistics-block work-order-statistics">
		<div :class="['card-header flex align-center', { filled: !roundedIcon }]">
			<div class="round-icon-container" v-if="roundedIcon">
				<i class="icomoon icon-docs"></i>
			</div>
			<i v-else class="icomoon icon-docs"></i>

			<div class="title semi-bold">{{ $t('WORK_ORDERS') }}</div>

			<TableAction
				class="ml-auto"
				v-if="createWOButtonFormSetup"
				@event="handleEventNew"
				:rowData="itemData"
				:action="createWOAction"
			/>

			<!-- <CreateWOButton
				class="ml-auto"
				@event="handleEventNew"
			/> -->
		</div>

		<div class="card-content relative ">
			<CommonChartItemWrapper
				ref="CommonChartItemWrapper"
				@event="handleEventNew"
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="WObarChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:rootFilters="finalFilters"
				:additionalProps="chartProps"
			/>

			<div
				class="additional-group"
				v-if="hasStatistics && statisticsData.breakdown_total_time"
			>
				<ul>
					<li>
						<span class="label">{{ `${tt('Downtime')} ${tt('lost')}` }}</span>
						<i class="icomoon icon-dashboard"></i>
						<span class="value"
							><b>${{ statisticsData.downtime_total_cost }}</b></span
						>
					</li>
					<li>
						<span class="label">{{ tt('Downtime') }}</span>
						<i class="icomoon icon-chronic"></i>
						<span class="value">{{ downTime }}</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
// import { /*mapState,*/ mapActions } from 'vuex';

import { /*prepareRangeParams,*/ getTimeDifference } from '@/helpers';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		TableAction: () => import('@/components/table/TableAction.vue'),
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		predefinedFilters: { type: Object, default: () => ({}) },
		filters: {
			type: Object,
			default: () => ({})
		},
		createWOButtonFormSetup: Array,
		roundedIcon: Boolean,
		itemData: Object
	},

	data: () => ({
		hasStatistics: false,
		chartContainerReady: 0
	}),

	computed: {
		chartProps: that =>
			Object.freeze({
				useSimpleSpinnerAsPreloader: true,
				nodataMock: true,
				chartSpecificEvents: that.chartLegendEvents
			}),

		statisticsData() {
			if (this.chartContainerReady && this.hasStatistics) {
				const { resultData } = this.$refs.CommonChartItemWrapper.ChartInstance;
				const {
					downtime_total_cost,
					breakdown_total_time
				} = resultData.statistics_result.main.pointsData;
				return Object.freeze({ downtime_total_cost, breakdown_total_time });
			}
			return {};
		},

		downTime() {
			const { breakdown_total_time } = this.statisticsData;

			if (breakdown_total_time) {
				const { days, hours, minutes } = getTimeDifference({
					from: '00:00:00',
					to: breakdown_total_time,
					timeOnly: true
				});
				if (days) return `${days}d ${hours}h ${minutes}m`;
				if (hours) return `${hours}h ${minutes}m`;

				return `${minutes} ${this.$t('minutes')}`;
			}
			return 0;
		},

		finalFilters() {
			let filters = { ...this.filters };
			if (this.predefinedFilters) {
				filters = { ...filters, ...this.predefinedFilters };
			}
			return filters;
		},

		// -------------------
		createWOAction: that =>
			Object.freeze({
				name: 'handleCreateWorkOrderButton',
				formSetup: that.createWOButtonFormSetup,
				tooltip_text: that.$t('phrases.Create_Work_Order'),
				className: 'create-wo-button',
				type: 'primary inverted',
				buttonContent: {
					component: {
						componentPath: 'components/itemDetails/CreateWOButton'
					}
				}
			})
	},

	methods: {
		handleChartContainerReady({ chartContainerReady, hasStatistics }) {
			this.hasStatistics = hasStatistics;
			this.chartContainerReady = chartContainerReady;
		}
	}
};
</script>
