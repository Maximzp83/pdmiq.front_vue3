<template>
	<div :class="['circular-progress', classList]">
		<svg viewBox="0 0 36 36" class="circular-chart">
			<path
				class="circle-bg"
				d="M18 2.0845
				a 15.9155 15.9155 0 0 1 0 31.831
				a 15.9155 15.9155 0 0 1 0 -31.831"
			/>
			<path
				class="circle"
				:stroke-dasharray="`${progress}, 100`"
				d="M18 2.0845
				a 15.9155 15.9155 0 0 1 0 31.831
				a 15.9155 15.9155 0 0 1 0 -31.831"
			/>
			<text x="19" y="22" class="percentage">{{ progress }}%</text>
		</svg>
	</div>
</template>

<script setup>
defineProps({
	progress: {
		type: Number,
		default: 0,
	},
	classList: {
		type: String,
		default: '',
	},
});
</script>

<style lang="scss" scoped>
.circular-progress {
	.circular-chart {
		display: block;
	}

	.circle-bg {
		fill: none;
		stroke: #dee2e6;
		stroke-width: 3;
	}

	.percentage {
		fill: #191919;
		font-family: sans-serif;
		font-weight: bold;
		font-size: 10px;
		text-anchor: middle;
	}

	.circle {
		fill: none;
		stroke-width: 3;
		stroke: #bf1e2e;
		transform-origin: 50% 50%;
		transition: all 0.5s ease-out;
	}
}
</style>
