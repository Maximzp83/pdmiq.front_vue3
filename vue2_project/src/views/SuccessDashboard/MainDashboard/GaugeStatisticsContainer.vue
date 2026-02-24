<template>
	<div :class="['block-item gauge-chart statistics-block',
		`columnsNumber-${selectedColumnsNumber.id}`
	]">

		<div class="statistics-outside flex space-between"
			v-if="showStatisticsOutsideChart"
		>
			<div class="semi-bold alarm-color">${{statisticsData.redArea}}</div>
			<div class="semi-bold green-color">${{statisticsData.currentValue}}</div>
		</div>
		<!-- <div class="testing">sdfsdfsdf</div> -->
		<div class="relative chart-height-auto">
			<CommonChartItemWrapper
				@event="handleEventNew"
				ref="CommonChartItemWrapper"
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="SuccessGaugeChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:additionalProps="chartProps"
				:rootFilters="rootFilters"
				:buildChartsPayloadProps="buildChartsPayload"
				chartWrapperIdx="9"
				:rootStatisticsData="allreadyStatisticsData"
			/>
		</div>
	</div>
</template>

<script>
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		plantItem: Object,
		plantsList: {type:Array, required:false},
		selectedColumnsNumber: { type: Object, default: () => ({}) },
		showStatisticsOutsideChart: Boolean,
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		allPlantsRoiStatistics: null,
		// skipEmitStatisticsReady: Boolean
	},

	data() {
		return {
			statisticsData: {},
			allreadyStatisticsData: null
		};
	},

	computed: {
		printHTMLWindowIsOpen() {
			return this.$store.state.global.printHTMLWindowIsOpen;
		},

		chartProps() {
			let chartInstanceContainerPayload = {};

			if (this.plantItem) {
				chartInstanceContainerPayload = {
					fetch_action_url: this.plantItem ? `plants/${this.plantItem.id}/roi-cost` : null,
					billing_plan_cost: this.plantItem.billing_plan_cost,
				}
			}
			return Object.freeze({
				nodataMock: true,
				// disablePreloader: true,
				showWithoutStatistics: true,
				chartInstanceContainerPayload,
				useSimpleSpinnerAsPreloader: true
			});
		},

		buildChartsPayload() {
			return Object.freeze({
				selectedColumnsNumber: this.selectedColumnsNumber.id
			});
		},

		/*hasStatistics: that =>
			that.statisticsData &&
			!!(that.statisticsData.yMax || that.statisticsData.currentValue),*/

		/*statisticsData() {
			const { plantsList } = this;
			let billing_plan_cost = 0, roi_cost = 0;
			let list = plantsList;

			if (list) {
				list.forEach(plant => {
					billing_plan_cost += plant.billing_plan_cost;
					roi_cost += plant.roi_cost;
				})
			}
			//  else {
			// 	billing_plan_cost = plantItem.billing_plan_cost;
			// 	roi_cost = plantItem.roi_cost;
			// }

			// this.billing_plan_cost = billing_plan_cost;
			// this.roi_cost = roi_cost;

			if (billing_plan_cost) {
				let yMax = billing_plan_cost * 4;
				return Object.freeze({
					redArea: billing_plan_cost,
					yMax: roi_cost > yMax ? roi_cost : yMax, //|| 500,
					currentValue: roi_cost // || 300
				});
			}
			return Object.freeze({
				redArea: 150,
				yMax: 500,
				currentValue: 0
			});
		}*/
	},

	methods: {
		callChartMethod(method, data) {
			const CommonChartItemWrapper = this.$refs.CommonChartItemWrapper;
			if (CommonChartItemWrapper) {
				CommonChartItemWrapper.callChartMethod(method, data);
			}
		},

		handleChartContainerReady(data) {
			// console.log('handleChartContainerReady', data);
			if (data && data.hasStatistics) {
				const { base, redArea } = data.resultData.statistics_result.main.pointsData;
				this.statisticsData = {
					redArea,
					currentValue: base[0]
				};

				if (this.allPlantsRoiCurrentValueSum === undefined) {
					this.$emit('event', {
						eventName: 'plantRoiStatisticsReady',
						data: this.statisticsData,
						onward: true
					});
				}
			}
		},

		setupStatisticsData(plantsList) {
			let billing_plan_cost = 0, roi_cost = 0;
			// let list = plantsList;

			if (plantsList) {
				plantsList.forEach(plant => {
			// console.log('plant', plant.billing_plan_cost, plant.roi_cost);
					billing_plan_cost += plant.billing_plan_cost;
					roi_cost += plant.roi_cost;
				})
			}
			return Object.freeze({
				billing_plan_cost,
				roi_cost // || 300
			});
		}
	},

	watch: {
		allPlantsRoiStatistics(val) {
			this.allreadyStatisticsData = val;
			this.allreadyStatisticsData = {
				billing_plan_cost: val.redArea,
				roi_cost: val.currentValue
			};

			this.callChartMethod('handleResponse', this.allreadyStatisticsData);
		},

		/*selectedColumnsNumber(val) {
			this.callChartMethod('handleColumnsNumberChange', {val: val.id});
		},*/

		/*'printHTMLWindowIsOpen'(isOpen) {
			// console.log('printHTMLWindowIsOpen', isOpen)
			this.callChartMethod('handleColumnsNumberChange', {
				val: this.selectedColumnsNumber.id,
				isPrintOpen: isOpen
			});
		}*/
	},

	created() {
		if (this.plantsList) {
			// this.allreadyStatisticsData = this.setupStatisticsData(this.plantsList);
			this.allreadyStatisticsData = {
				billing_plan_cost: 0,
				roi_cost: 0
			};
		}
	}
};
</script>
