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

			<div
				class="row-item"
				v-for="(item, index) in tableData"
				:key="`row-${index}`"
			>
				<span v-text="item.title"></span>
				<span v-text="item.current"></span>
				<span v-text="item.period"></span>
				<span v-text="item.diff"></span>
				<span v-text="item.percent"></span>
			</div>
		</div>
	</div>
</template>

<script>
import { getRoundedValue, countDecimalOrder } from '@/helpers';

export default {
	props: {
		title: String,
		statsData: {
			type: Object,
			default: () => ({})
		},
		isShow: Boolean,
		ChartInstance: { type: Object, required: true },
		// statisticsResponsesReadyCounter: Number,
		chartsListWrapperReadyCounter: Number
	},

	computed: {
		tableData() {
			if (this.statsData) {
				const {
					actual_alarm_zone, actual_warning_zone, /*data_average_line,*/
					alarm_level, warning_level, average_metric_value,
					actual_average_metric_data_value_for_current_period
				} = this.statsData;

				return Object.freeze([
					{
						title: 'Alarm',
						current: actual_alarm_zone || '-',
						period: alarm_level || '-',
						diff: this.calcDiff(actual_alarm_zone, alarm_level),
						percent: this.calcDiffPercent(actual_alarm_zone, alarm_level)
					},
					{
						title: 'Warning',
						current: actual_warning_zone || '-',
						period: warning_level || '-',
						diff: this.calcDiff(actual_warning_zone, warning_level),
						percent: this.calcDiffPercent(actual_warning_zone, warning_level)
					},
					{
						title: 'Average',
						current: actual_average_metric_data_value_for_current_period || '-',
						period: average_metric_value || '-',
						diff: this.calcDiff(actual_average_metric_data_value_for_current_period, average_metric_value),
						percent: this.calcDiffPercent(actual_average_metric_data_value_for_current_period, average_metric_value)
					},
				])
			}
			return []
		},
	},

	methods: {
		calcDiff(current, period) {
			if (current && period) {
				let diff = period - current;
				diff = getRoundedValue(diff, 0, countDecimalOrder(diff));
				return diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0';			
			}
			return '-';
		},
		calcDiffPercent(current, period) {
			if (current && period) {
				// (20-18)/20*100
				// console.log(period, current)
				return (((period - current) / current) * 100).toFixed(1) + '%';
			}
			return '-';
		},

		setupPeriodStatsData() {
			if (!this.statsData || !this.statsData.average_metric_value) {
				this.ChartInstance.setupPeriodStatsData();
			}
		}
	},

	watch: {
		isShow(isShow) {
			// console.log('isShow', isShow)
			if (isShow) {
				this.setupPeriodStatsData();				
			}
		},

		chartsListWrapperReadyCounter() {
			// console.log('chartsListWrapperReadyCounter', this.isShow)
			if (this.isShow) {
				this.ChartInstance.setupPeriodStatsData();
			}
		}
	},

	created() {
		// console.log('created', this.isShow)
		if (this.isShow) {
			this.setupPeriodStatsData();		
		}
	}
};
</script>
