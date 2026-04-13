<template>
	<highcharts
		v-if="chartOptions && Object.keys(chartOptions).length"
		ref="chartRef"
		class="chart"
		:constructor-type="constructorType"
		:options="chartOptions"
		:updateArgs="updateArgs"
		:deepCopyOnUpdate="false"
		:highcharts="hcInstance"
	/>
</template>

<script setup>
defineOptions({
	name: 'ChartWrapper',
});

defineProps({
	hcInstance: { type: Object, default: null },
	chartOptions: { type: Object, default: null },
	chartAPI: { type: Object, default: null },
	constructorType: { type: String, default: undefined },
	updateArgs: { type: Array, default: () => [true, true, false] },
});
</script>
