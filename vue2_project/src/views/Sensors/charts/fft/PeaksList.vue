<template functional>
	<div class="card fft-peaks-table">
		<div class="card-header filled uppercase">{{ props.title }}</div>
		<div class="card-content small-padding">
			<div class="row-item" v-for="(row, idx) in props.data" :key="`row-${idx}`">
				<span v-text="row.title"></span>
				<span v-text="`${row[`x_value`]} ${props.xAxisTitle}`"></span>
				<span v-text="`${row[`y_value`]} ${props.yAxisTitle}`"></span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	functional: true,
	props: {
		title: String,
		data: { type: Array, default: () => [] },
		xAxisTitle: String,
		yAxisTitle: String,
		// metric: Number
	}
};
</script>
