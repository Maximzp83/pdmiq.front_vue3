<template>
	<div class="">
		<highcharts :options="chartOptions" />
	</div>
</template>

<script setup>
import { ref } from 'vue';

const generateData = (count = 100) => {
	const data = [];
	let y = 0;

	for (let i = 0; i < count; i++) {
		y += Math.random() * 10 - 5; // случайные колебания
		data.push([i, y]); // [x, y]
	}

	return data;
};

const chartOptions = ref({
	chart: {
		zoomType: 'x',
	},
	title: { text: 'Highcharts in Browser' },
	boost: {
		enabled: true,
		useGPUTranslations: true,
		usePreallocated: true,
	},

	plotOptions: {
		series: {
			boostThreshold: 500,
			turboThreshold: 0,
		},
	},
	series: [
		{
			name: 'Random data',
			type: 'column',
			data: generateData(100),
		},
	],
});
</script>
