<template>
	<div>
		<el-button
			size="small"
			:type="buttonType || 'primary'"
			:class="['block-item', buttonClass]"
			@click="zoomYAxis(0)"
		>
			{{ tt('reset') }}
		</el-button>
		<i class="block-item icomoon icon-zoom-out" @click="zoomYAxis(1)"></i>
		<i class="block-item icomoon icon-zoom-in" @click="zoomYAxis(-1)"></i>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { getRoundedValue } from '@/helpers';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'ChartZoom',
});

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	chartIsInit: Boolean,
	chartOptionsUpdate: Number,
	showHistory: Boolean,
	buttonType: String,
	buttonClass: String,
});

const emit = defineEmits(['event']);

const initialChartYAxisMax = ref(null);
const currentChartYAxisMax = ref(null);
const initialChartYAxisMin = ref(null);
const currentChartYAxisMin = ref(null);

const calcMin = (val, step) => {
	let newVal = val;
	if (newVal < 0) {
		newVal = newVal - step >= 0 ? newVal : newVal - step;
	}
	return newVal;
};

const resetInitialValues = () => {
	if (!props.ChartInstance) return;

	const {
		chart_all_data_max_value,
		chart_points_max_value,
		chart_all_data_min_value,
	} = props.ChartInstance.getTransformedStatistics();

	const { yAxis } = props.ChartInstance.options;
	const { min } = yAxis[0];
	initialChartYAxisMax.value = props.showHistory ? chart_all_data_max_value : chart_points_max_value;
	initialChartYAxisMin.value = chart_all_data_min_value < 0 ? chart_all_data_min_value : min;
};

const zoomYAxis = (multiplier) => {
	try {
		initialChartYAxisMin.value = initialChartYAxisMin.value || 0;
		let newMin = currentChartYAxisMin.value;
		let newMax = currentChartYAxisMax.value;

		if (multiplier === 0) {
			newMax = initialChartYAxisMax.value;
			newMin = initialChartYAxisMin.value;
		} else {
			newMax = newMax || initialChartYAxisMax.value;
			newMin = newMin || initialChartYAxisMin.value;
			const maxMinDiff = newMax - newMin;
			let q;

			if (newMax > 30 || maxMinDiff > 30) q = 3.5;
			else if (newMax > 20 || maxMinDiff > 20) q = 4;
			else if (newMax > 1 || maxMinDiff > 1) q = 5;
			else q = 5.5;

			const step = newMax < 2 && maxMinDiff > 1
				? (maxMinDiff / q) * multiplier
				: (newMax / q) * multiplier;

			newMax += step;

			if (newMin < 0) {
				const preMin = -newMax;
				const chartPointsMinValue = props.ChartInstance.getTransformedStatistics({
					accessor: 'chart_points_min_value',
				});
				newMin = preMin < chartPointsMinValue ? preMin : newMin;
			} else {
				newMin = calcMin(newMin, step);
			}

			newMax = getRoundedValue(newMax, multiplier);
			newMin = getRoundedValue(newMin, multiplier);
			if (newMax <= newMin) return;
		}

		currentChartYAxisMax.value = newMax;
		currentChartYAxisMin.value = newMin;

		emit('event', {
			eventName: 'zoomYAxis',
			data: [newMin, newMax],
			onward: true,
		});
	} catch (error) {
		console.error(error);
	}
};

watch(
	() => props.chartOptionsUpdate,
	() => {
		resetInitialValues();
		zoomYAxis(0);
	},
);

onMounted(() => {
	if (props.chartOptionsUpdate) {
		resetInitialValues();
		zoomYAxis(0);
	}
});
</script>
