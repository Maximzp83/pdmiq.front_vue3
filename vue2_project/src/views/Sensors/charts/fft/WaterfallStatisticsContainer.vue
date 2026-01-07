<template>
	<div class="block-item waterfall-chart statistics-block">
		<div class="flex mrow justify-center align-center charts-number-selector">
			<div class="label semi-bold">{{ tt('phrases.number_of_graphs') }}</div>
			<CustomSelect
				@change="handleChartsDisplayQuantityChange"
				:optionsList="chartsDisplayNumbersListFiltered"
				:value="chartsDisplayQuantity"
			/>
		</div>

		<div class="waterfall-chart-container flex wrap ">
			<div class="slider-container vertical">
				<!-- <div class="mrow flex column"> -->
					<div class="sliders-labels ">
						<div><span>{{ tt('Rotate') }}</span></div>
						<div><span>{{ tt('Zoom') }}</span></div>
						<div><span>{{ tt('Drag') }}</span></div>
					</div>

					<div class="flex">
						<el-slider
							@input="e => handleSliderChange(e, 'alpha')"
							:value="alpha"
							vertical
							:show-tooltip="false"
							:disabled="!rotationIsReady"
						/>

							<!-- :max="99" -->
						<el-slider
							@input="e => handleSliderChange(e, 'zoom_y')"
							:value="zoom_y"
							vertical
							:min="10"
							:max="110"
							:show-tooltip="false"
							:disabled="!rotationIsReady"
						/>

						<el-slider
							@input="e => handleSliderChange(e, 'drag_y')"
							:value="drag_y"
							vertical
							:disabled="!rotationIsReady || zoom_y == 10"
							:min="drag_min_y"
							:max="drag_max_y"
							:show-tooltip="false"
						/>
					</div>
				<!-- </div> -->
			</div>

			<div
				:class="[
					'chart-wrapper relative chart-height-auto',
					`number-of-graphs-${chartsDisplayQuantity}`
				]"
			>
				<!-- @event="handleEventNew" -->
				<CommonChartItemWrapper
					@event="handleEventNew"
					ref="CommonChartItemWrapper"
					chartFactoryContainerName="3DChartFactoryContainer"
					chartFactoryName="FFTWaterfall3DChart"
					configsKey="FFTChartsListsConfig"
					chartKey="waterfall3d"
					:rootFilters="rootFilters"
					:rootStatisticsData="currentFFTChartStatistics"
					:additionalProps="chartProps"
				/>
			</div>

			<div class="slider-container horizontal mcol-xs-12">
				<div class="mrow flex">
					<div class="sliders-labels mcol-xs-1">
						<div>{{ tt('Rotate') }}</div>
						<div>{{ tt('Zoom') }}</div>
						<div>{{ tt('Drag') }}</div>
					</div>

					<div class="mcol-xs-11">	
						<!-- <div class="mrow flex big-padding"> -->
							<!-- <div class="mcol-xs-12 mcol-sm-6"> -->
								<!-- <div class="bold article-title uppercase">{{ tt('Horizontal')}}</div> -->

								<el-slider
									@input="e => handleSliderChange(e, 'beta')"
									:value="beta"
									:show-tooltip="false"
									:disabled="!rotationIsReady"
								/>

								<el-slider
									@input="e => handleSliderChange(e, 'zoom_x')"
									:value="zoom_x"
									:min="10"
									:max="110"
									:show-tooltip="false"
									:disabled="!rotationIsReady"
								/>

								<el-slider
									@input="e => handleSliderChange(e, 'drag_x')"
									:disabled="!rotationIsReady || zoom_x == 10"
									:value="drag_x"
									:min="drag_min_x"
									:max="drag_max_x"
									:show-tooltip="false"
								/>
							<!-- </div> -->
							
							<!-- <div class="mcol-xs-12 mcol-sm-6">
								<div class="bold article-title uppercase">{{ tt('Vertical')}}</div>
								<el-slider
									@input="e => handleSliderChange(e, 'alpha')"
									:value="alpha"
									:show-tooltip="false"
									:disabled="!rotationIsReady"
								/>

								<el-slider
									@input="e => handleSliderChange(e, 'zoom_y')"
									:value="zoom_y"
									:min="10"
									:max="110"
									:show-tooltip="false"
									:disabled="!rotationIsReady"
								/>

								<el-slider
									@input="e => handleSliderChange(e, 'drag_y')"
									:value="drag_y"
									:disabled="!rotationIsReady || zoom_y == 10"
									:min="drag_min_y"
									:max="drag_max_y"
									:show-tooltip="false"
								/>
							</div> -->							
						<!-- </div> -->
					</div>
				</div>
			</div>

			<div class="mcol-xs-12 flex justify-center relative">
				<el-button
					@click="resetSliders"
					type="primary"
					class="small"
					:disabled="!rotationIsReady"
					>{{ `${tt('reset')}` }}</el-button
				>

				<!-- <div class="sliders-switcher">
					<el-switch
						v-model="isZoomEnabled"
						active-color="#13ce66"
						inactive-color="#ff4949"
						:inactive-text="tt('Rotate')"
						:active-text="tt('Zoom')"
					/>
				</div> -->
			</div>
		</div>
	</div>
</template>

<script>
import 'element-ui/lib/theme-chalk/slider.css';
import Highcharts from 'highcharts';
import highcharts3d from 'highcharts/highcharts-3d';
highcharts3d(Highcharts);

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		ElSlider: () => import('element-ui/lib/slider'),
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		currentFFTChartStatistics: Object,
		prevFFTItems: Array,
		chartMainData: Object,
		rootFilters: Object
	},

	data: () => ({
		chartsDisplayQuantity: 5,

		chartsDisplayNumbersListFiltered: [],

		rotationIsReady: false,
		initialAplpha: 0,
		initialBeta: 0,

		alpha: 0,
		beta: 0,
		isZoomEnabled: true,

		initialZoom_x: 10,
		initialZoom_y: 10,
		initialDrag_x: 0,
		initialDrag_y: 0,

		zoom_x: 10,
		zoom_y: 10,
		drag_x: 0,
		drag_y: 0,

		drag_min_y: 0,
		drag_max_y: 100,
		drag_min_x: 0,
		drag_max_x: 100,
	}),

	computed: {
		chartProps() {
			return Object.freeze({
				chartInstanceContainerPayload: {
					prevFFTItems: this.prevFFTItems,
					chartsDisplayQuantity: 5,
					...this.chartMainData
				},
				chartInstanceContainerSettings: {
					enableSlidersZoom: true,
					// enableWheelZoom: true
					// enable3Drotation: true,
				},
				chartInstanceContainerEvents: {
					chartContainerReady: this.handleChartContainerReady
				},

				chartInstanceEventsList: {
					dragLimitsChange: this.handleDragLimitsChange
				},
				useSimpleSpinnerAsPreloader: true,
				// hcInstance: Highcharts
			});
		},

		chartsDisplayNumbersList() {
			let result = [];
			for (let i = 2; i <= 10; i++) {
				result.push({ id: i, name: i.toString(), value: i });
			}
			return result;
		}
	},

	methods: {
		chartLoadEvent() {
			const { zoom_x, zoom_y, drag_x, drag_y } = this;
			const { alpha, beta } = this.$refs.CommonChartItemWrapper.callChartMethod(
				'getChartRotationValues'
			);
			this.alpha = alpha;
			this.beta = beta;
			this.initialAplpha = alpha;
			this.initialBeta = beta;
			this.initialZoom_x = zoom_x;
			this.initialZoom_y = zoom_y;
			this.initialDrag_x = drag_x;
			this.initialDrag_y = drag_y;

			/*this.$refs.CommonChartItemWrapper.callChartMethod('injectProps', {
				key: 'initialZoomData',
				value: {
					init_drag_min_y: drag_min_y,
					init_drag_max_y: drag_max_y,
					init_drag_min_x: drag_min_x,
					init_drag_max_x: drag_max_x,
					actual_drag_min_y: drag_min_y,
					actual_drag_max_y: drag_max_y,
					actual_drag_min_x: drag_min_x,
					actual_drag_max_x: drag_max_x,					
				}
			});*/
			this.rotationIsReady = true;
		},

		handleDragLimitsChange(data) {
			const { axis_key,	new_drag_pos_max } = data;
			if (new_drag_pos_max) {
				this[`drag_max_${axis_key}`] = new_drag_pos_max;

				if (this[`drag_${axis_key}`] > this[`drag_max_${axis_key}`]) {
					// console.log('out of range')
					this[`drag_${axis_key}`] = this[`drag_max_${axis_key}`];
				}
			} else {
				this[`drag_max_${axis_key}`] = 100;
				this[`drag_${axis_key}`] = this[`initialDrag_${axis_key}`];
			}
		},

		/*resetSliders() {
			this.resetRotation();			
		},*/

		/*resetZoom() {
			console.log('reset zoom')
		},*/

		handleSliderChange(val, key, redraw = true, isReset) {
			if (this.rotationIsReady) {
				// console.log('handleSliderChange', key, val)
				this.$refs.CommonChartItemWrapper.callChartMethod('handleSliderChange', {key, val, redraw, isReset});
				this[key] = val;
			}
		},

		resetSliders() {
			// this.drag_x = this.initialDrag_x;
			// this.drag_y = this.initialDrag_y;

			this.handleSliderChange(this.initialAplpha, 'alpha', false, true);
			this.handleSliderChange(this.initialBeta, 'beta', false, true);
			this.handleSliderChange(this.initialZoom_x, 'zoom_x', false, true);
			this.handleSliderChange(this.initialZoom_y, 'zoom_y', true, true);
		},

		handleChartsDisplayQuantityChange(n) {
			this.chartsDisplayQuantity = n;
			this.$refs.CommonChartItemWrapper.callChartMethod(
				'handleChartsDisplayQuantityChange',
				n
			);
			this.resetSliders();
		},

		handleChartContainerReady({ isChartDataReady }) {
			if (isChartDataReady) {
				// console.log('3')
				const statistics_length = this.$refs.CommonChartItemWrapper.ChartInstance
					.requestsList.length;

				// console.log(this.chartsDisplayNumbersListFiltered)
				this.chartsDisplayNumbersListFiltered = this.chartsDisplayNumbersList.slice(
					0,
					statistics_length - 1
				);

				if (statistics_length < this.chartsDisplayQuantity) {
					this.chartsDisplayQuantity = statistics_length;
				}
			}
		}
	},

	beforeDestroy() {
		// console.log('destroy')
		this.$refs.CommonChartItemWrapper.callChartMethod('setupChartRotation', false);
	}
};
</script>
