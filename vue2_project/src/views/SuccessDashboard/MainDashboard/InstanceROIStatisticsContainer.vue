<template>
	<div class="card block-item statistics-block">
		<div
			:class="[
				'card-content relative chart-height-auto instance-roi-chart',
				{ 'label-click-enabled': enableLabelClickEvent },
				`columnsNumber-${selectedColumnsNumber.id}`				
			]"
		>
			<CommonChartItemWrapper
				ref="CommonChartItemWrapper"
				@event="handleEventNew"
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="SuccessDashboardProblemsChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:rootFilters="filters"
				:predefinedFilters="predefinedFilters"
				:additionalProps="chartProps"
				:buildChartsPayloadProps="buildChartsPayload"
			/>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { /*prepareRangeParams,*/ getDateRange } from '@/helpers';

import { eventHandler, navigation } from '@/mixins';

export default {
	mixins: [eventHandler(), navigation()],
	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		// itemData: { type: Object, default: () => ({}) },
		title: String,
		predefinedFilters: { type: Object, default: () => ({}) },
		filters: {
			type: Object,
			default: () => ({})
		},
		fetch_action_url: String,
		instanceIdProp: String,
		enableLabelClickEvent: Boolean,
		selectedColumnsNumber: { type: Object, default: () => ({}) },
	},

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,			
			roi_one_pagers_filters: state => state.roi_one_pagers.filters,
			printHTMLWindowIsOpen: state => state.global.printHTMLWindowIsOpen,
			// plantsList: state => state.global.globalPlantsList
		}),

		chartProps: that =>
			Object.freeze({
				useSimpleSpinnerAsPreloader: true,
				// chartPlotOptionsEventsList: that.chartLegendEvents
				nodataMock: true,
				chartInstanceContainerPayload: {
					fetch_action_url: that.fetch_action_url,
					setupProblemsStatisticsSettings: {
						prop: 'roi_cost'
					}
				},

				/*chartSpecificEvents: [
					{
						accessor: 'xAxis.labels.events.click',
						event: that.labelItemClick
					}
				],*/

				chartPointsEventsList: {
					serieClick: { name: 'click', event: e => that.serieClick(e) }
				},

			}),

		buildChartsPayload() {
			return Object.freeze({
				selectedColumnsNumber: this.selectedColumnsNumber.id
			});
		},

		plantId: that => that.predefinedFilters.plantId,
	},

	methods: {
		...mapActions({
			set_roi_one_pagers_filters: 'roi_one_pagers/set_roi_one_pagers_filters',
			set_global_filters: 'set_global_filters',
			// fetch_items: 'maintenance/fetch_maintenance_statistics',
		}),

		/*labelItemClick(e) {
			console.log(e)
		},*/

		serieClick({point}) {
			// not realized yet
			if (this.plantId) {
				// console.log(e)
				const { instance_id } = point.options;
				const daterange = getDateRange('this_year', { getDateString: true });
				// console.log(instance_id, daterange)
				let newFilters = {
					page: 1,
					max: this.roi_one_pagers_filters.max,
					[this.instanceIdProp]: instance_id,
					daterange: daterange
				};

				this.setGlobalFilters({ id: this.plantId, filterName: 'plantId' });
				this.set_roi_one_pagers_filters(newFilters);

				this.changeRoute({
					path: `/success-dashboard/roi-one-pager`
				});
			}
		},

		setGlobalFilters({ id, filterName }) {
			const newFilters = { ...this.globalFilters, [filterName]: id };
			this.set_global_filters(newFilters);
		},

		callChartMethod(method, data) {
			const CommonChartItemWrapper = this.$refs.CommonChartItemWrapper;
			if (CommonChartItemWrapper) {
				CommonChartItemWrapper.callChartMethod(method, data);
			}
		}
	},

	watch: {
		selectedColumnsNumber(val) {
			this.callChartMethod('handleColumnsNumberChange', {val: val.id});
		},

		'printHTMLWindowIsOpen'(isOpen) {
			// console.log('printHTMLWindowIsOpen', isOpen)
			this.callChartMethod('handleColumnsNumberChange', {
				val: this.selectedColumnsNumber.id,
				isPrintOpen: isOpen
			});
		}
	}
};
</script>
