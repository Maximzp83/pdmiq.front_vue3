<template>
	<!-- <div class=""></div> -->
	<!-- <template v-if="hcInstance"> -->
		
	<!-- </template> -->
	<highcharts
		v-if="chartOptions && Object.keys(chartOptions).length"
		class="chart"
		ref="Chart"
		:constructor-type="constructorType"
		:options="chartOptions"
		:updateArgs="updateArgs"
		:deepCopyOnUpdate="false"
		:highcharts="hcInstance"
	/>
</template>

<script>
export default {
	props: {
		hcInstance: Object,
		chartOptions: {
			type: Object
			// required: true
		},
		chartAPI: Object,
		constructorType: { type: String, default: undefined },
		updateArgs: {
			type: Array,
			default: () => [true, true, false]
		}
	},

	/*watch: {
		chartOptions(x) {
			if (x) {
				console.log('chartOptions', x.chart_id, x.series[0].data)				
			}
			// debugger
		}
	}*/
};
</script>
