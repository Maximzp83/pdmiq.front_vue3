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
				ref="CommonChartItemWrapper"
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="SuccessGaugeChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:rootStatisticsData="statisticsData"
				:additionalProps="chartProps"
				:buildChartsPayloadProps="buildChartsPayload"
			/>
		</div>
	</div>
</template>

<script>
export default {
	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		plantItem: Object,
		plantsList: {type:Array, required:false},
		selectedColumnsNumber: { type: Object, default: () => ({}) },
		showStatisticsOutsideChart: Boolean
	},

	computed: {
		printHTMLWindowIsOpen() {
			return this.$store.state.global.printHTMLWindowIsOpen;
		},

		chartProps() {
			return Object.freeze({
				nodataMock: true,
				// disablePreloader: true,
				showWithoutStatistics: true,
				useSimpleSpinnerAsPreloader: true
			});
		},

		buildChartsPayload() {
			return Object.freeze({
				selectedColumnsNumber: this.selectedColumnsNumber.id
			});
		},

		hasStatistics: that =>
			that.statisticsData &&
			!!(that.statisticsData.yMax || that.statisticsData.currentValue),

		statisticsData() {
			const { plantItem, plantsList } = this;
			let billing_plan_cost = 0, roi_cost = 0;
			let list = plantsList || [plantItem];

			if (list) {
				list.forEach(plant => {
					billing_plan_cost += plant.billing_plan_cost;
					roi_cost += plant.roi_cost;
				})
			}
			/* else {
				billing_plan_cost = plantItem.billing_plan_cost;
				roi_cost = plantItem.roi_cost;
			}*/

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
		}
	},

	methods: {
		callChartMethod(method, data) {
			const CommonChartItemWrapper = this.$refs.CommonChartItemWrapper;
			if (CommonChartItemWrapper) {
				CommonChartItemWrapper.callChartMethod(method, data);
			}
		}
	},

	watch: {
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
};
</script>
