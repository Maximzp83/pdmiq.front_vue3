<template>
	<div class="card stats-table">
		<div class="card-header filled uppercase">{{ title }}</div>
		<div class="card-content small-padding">
			<div class="row-item">
				<span></span>
				<span>Current</span>
				<span>Period</span>
				<span>Diff</span>
				<span>Diff %</span>
			</div>

			<div v-for="(item, index) in tableData" :key="`row-${index}`" class="row-item">
				<span>{{ item.title }}</span>
				<span>{{ item.current }}</span>
				<span>{{ item.period }}</span>
				<span>{{ item.diff }}</span>
				<span>{{ item.percent }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { getRoundedValue, countDecimalOrder } from '@/helpers';

defineOptions({
	name: 'StatsTable',
});

const props = defineProps({
	title: String,
	statsData: { type: Object, default: () => ({}) },
	isShow: Boolean,
	ChartInstance: { type: Object, required: true },
	chartsListWrapperReadyCounter: Number,
});

const calcDiff = (current, period) => {
	if (current && period) {
		let diff = period - current;
		diff = getRoundedValue(diff, 0, countDecimalOrder(diff));
		return diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0';
	}
	return '-';
};

const calcDiffPercent = (current, period) => {
	if (current && period) {
		return `${(((period - current) / current) * 100).toFixed(1)}%`;
	}
	return '-';
};

const tableData = computed(() => {
	if (!props.statsData) return [];

	const {
		actual_alarm_zone,
		actual_warning_zone,
		alarm_level,
		warning_level,
		average_metric_value,
		actual_average_metric_data_value_for_current_period,
	} = props.statsData;

	return Object.freeze([
		{
			title: 'Alarm',
			current: actual_alarm_zone || '-',
			period: alarm_level || '-',
			diff: calcDiff(actual_alarm_zone, alarm_level),
			percent: calcDiffPercent(actual_alarm_zone, alarm_level),
		},
		{
			title: 'Warning',
			current: actual_warning_zone || '-',
			period: warning_level || '-',
			diff: calcDiff(actual_warning_zone, warning_level),
			percent: calcDiffPercent(actual_warning_zone, warning_level),
		},
		{
			title: 'Average',
			current: actual_average_metric_data_value_for_current_period || '-',
			period: average_metric_value || '-',
			diff: calcDiff(actual_average_metric_data_value_for_current_period, average_metric_value),
			percent: calcDiffPercent(actual_average_metric_data_value_for_current_period, average_metric_value),
		},
	]);
});

const setupPeriodStatsData = () => {
	if (!props.statsData || !props.statsData.average_metric_value) {
		props.ChartInstance.setupPeriodStatsData();
	}
};

watch(
	() => props.isShow,
	(isShow) => {
		if (isShow) setupPeriodStatsData();
	},
);

watch(
	() => props.chartsListWrapperReadyCounter,
	() => {
		if (props.isShow) props.ChartInstance.setupPeriodStatsData();
	},
);

onMounted(() => {
	if (props.isShow) setupPeriodStatsData();
});
</script>
