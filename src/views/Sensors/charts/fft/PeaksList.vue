<template>
	<div class="card fft-peaks-table">
		<div class="card-header filled uppercase">{{ title }}</div>
		<div class="card-content small-padding">
			<div v-for="(row, idx) in data" :key="`row-${idx}`" class="row-item">
				<span>{{ row.title }}</span>
				<span>{{ `${row.x_value} ${xAxisTitle}` }}</span>
				<span>{{ `${row.y_value} ${yAxisTitle}` }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
defineOptions({
	name: 'PeaksList',
});

defineProps({
	title: String,
	data: { type: Array, default: () => [] },
	xAxisTitle: String,
	yAxisTitle: String,
});
</script>
