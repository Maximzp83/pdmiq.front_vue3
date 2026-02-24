<template>
	<div class="">
		<el-button
			size="small"
			:type="buttonType || 'primary inverted'"
			class="block-item"
			@click="zoomYAxis(0)"
			>{{ tt('reset') }}</el-button
		>
		<i class="block-item icomoon icon-zoom-out" @click="zoomYAxis(1)"></i>
		<i class="block-item icomoon icon-zoom-in" @click="zoomYAxis(-1)"></i>
	</div>
</template>

<script>
import { getRoundedValue } from '@/helpers';

export default {
	props: {
		// ChartAPI: Object,
		ChartInstance: {
			type: Object,
			required: true
		},
		chartIsInit: Boolean,
		chartOptionsUpdate: Number,
		showHistory: Boolean,
		buttonType: String
	},

	data: () => ({
		initialChartYAxisMax: null,
		currentChartYAxisMax: null,
		initialChartYAxisMin: null,
		currentChartYAxisMin: null
	}),

	/*computed: {
		// access_token: state => state.auth.access_token
	},*/

	methods: {
		zoomYAxis(multiplier) {
			try {
				// const yAxis = this.ChartAPI.yAxis[0];
				// debugger
				// const { min } = yAxis.getExtremes();
				this.initialChartYAxisMin = this.initialChartYAxisMin || 0;

				let newMin = this.currentChartYAxisMin;
				let newMax = this.currentChartYAxisMax;

				// console.log('min', min)
				if (multiplier == 0) {
					newMax = this.initialChartYAxisMax;
					newMin = this.initialChartYAxisMin;
				} else {
					// console.log('newMax 1', multiplier, newMax)
					newMax = newMax || this.initialChartYAxisMax;
					// console.log('newMax 2', multiplier, newMax)
					newMin = newMin || this.initialChartYAxisMin;
					let q;
					if (newMax > 30) {
						q = 3.5;
					} else if (newMax > 20) {
						q = 4;
					}
					// else if (newMax > 10) { q = 5 }
					else if (newMax > 1) {
						q = 5;
					}
					// else if (newMax > 0.1) { q = 5 }
					else q = 5.5;
					const step = (newMax / q) * multiplier;
					newMax += step;
					// console.log('newMax 3', newMax)

					if (newMin < 0) {
						newMin = -newMax;
					} else {
						newMin = this.calcMin(newMin, step);
					}
					// console.log('newMax 4', newMax)

					newMax = getRoundedValue(newMax, multiplier);
					newMin = getRoundedValue(newMin, multiplier);
					if (newMax < newMin || newMax == 0) return;
					// console.log('init', this.initialChartYAxisMax, 'step', step, 'newMin', newMin, 'newMax', newMax );
				}

				this.currentChartYAxisMax = newMax;
				this.currentChartYAxisMin = newMin;

				// console.log('yAxis', this.ChartAPI.yAxis[0].getExtremes())
				this.$emit('event', {
					eventName: 'zoomYAxis',
					data: [newMin, newMax],
					onward: true
				});
			} catch (e) {
				console.error(e);
			}
		},

		resetInitialValues() {
			if (this.ChartInstance) {
				const {
					chart_all_data_max_value,
					chart_points_max_value,
					chart_all_data_min_value
				} = this.ChartInstance.getTransformedStatistics();
				// const { min, max, dataMax } = this.ChartAPI.yAxis[0].getExtremes();
				// console.log(this.showHistory)
				// this.initialChartYAxisMax = dataMax > max ? dataMax : max;
				this.initialChartYAxisMax = this.showHistory ? chart_all_data_max_value : chart_points_max_value;
				this.initialChartYAxisMin = chart_all_data_min_value < 0 ?
					chart_all_data_min_value : 0;
			}
		},

		calcMin(val, step) {
			let newVal = val;

			if (newVal < 0) {
				newVal = newVal - step >= 0 ? newVal : newVal - step;
			}

			return newVal;
		}
	},

	watch: {
		chartOptionsUpdate() {
			this.resetInitialValues();
			this.zoomYAxis(0);
		}
	},

	created() {
		if (this.chartOptionsUpdate) {
			this.resetInitialValues();
			this.zoomYAxis(0);
		}
	}
};
</script>
