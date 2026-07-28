<template>
	<div class="block-item waterfall-chart statistics-block">
		<div class="flex mrow justify-center align-center charts-number-selector">
			<div class="label semi-bold">{{ tt('phrases.number_of_graphs') }}</div>
			<CustomSelectV2
				:model-value="chartsDisplayQuantity"
				:optionsList="chartsDisplayNumbersListFiltered"
				@update:modelValue="handleChartsDisplayQuantityChange"
			/>
		</div>

		<div class="waterfall-chart-container flex wrap">
			<div class="slider-container vertical">
				<div class="sliders-labels">
					<div><span>{{ tt('Rotate') }}</span></div>
					<div><span>{{ tt('Zoom') }}</span></div>
					<div><span>{{ tt('Drag') }}</span></div>
				</div>

				<div class="flex">
					<el-slider
						:model-value="alpha"
						vertical
						:show-tooltip="false"
						:disabled="!rotationIsReady"
						@input="(value) => handleSliderChange(value, 'alpha')"
					/>

					<el-slider
						:model-value="zoom_y"
						vertical
						:min="10"
						:max="110"
						:show-tooltip="false"
						:disabled="!rotationIsReady"
						@input="(value) => handleSliderChange(value, 'zoom_y')"
					/>

					<el-slider
						:model-value="drag_y"
						vertical
						:min="drag_min_y"
						:max="drag_max_y"
						:show-tooltip="false"
						:disabled="!rotationIsReady || zoom_y === 10"
						@input="(value) => handleSliderChange(value, 'drag_y')"
					/>
				</div>
			</div>

			<div
				:class="[
					'chart-wrapper relative chart-height-auto',
					`number-of-graphs-${chartsDisplayQuantity}`,
				]"
			>
				<CommonChartItemWrapper
					ref="commonChartItemWrapperRef"
					chartFactoryContainerName="3DChartFactoryContainer"
					chartFactoryName="FFTWaterfall3DChart"
					configsKey="FFTChartsListsConfig"
					chartKey="waterfall3d"
					:rootFilters="rootFilters"
					:rootStatisticsData="currentFFTChartStatistics"
					:additionalProps="chartProps"
					@event="handleEvent"
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
						<el-slider
							:model-value="beta"
							:show-tooltip="false"
							:disabled="!rotationIsReady"
							@input="(value) => handleSliderChange(value, 'beta')"
						/>

						<el-slider
							:model-value="zoom_x"
							:min="10"
							:max="110"
							:show-tooltip="false"
							:disabled="!rotationIsReady"
							@input="(value) => handleSliderChange(value, 'zoom_x')"
						/>

						<el-slider
							:model-value="drag_x"
							:min="drag_min_x"
							:max="drag_max_x"
							:show-tooltip="false"
							:disabled="!rotationIsReady || zoom_x === 10"
							@input="(value) => handleSliderChange(value, 'drag_x')"
						/>
					</div>
				</div>
			</div>

			<div class="mcol-xs-12 flex justify-center relative">
				<el-button
					type="primary"
					class="small"
					:disabled="!rotationIsReady"
					@click="resetSliders"
				>
					{{ tt('reset') }}
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import Highcharts from '@/config/highcharts';
import highcharts3d from 'highcharts/highcharts-3d';

import { initHighchartsModule } from '@/helpers/charts';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

initHighchartsModule(highcharts3d, Highcharts);

defineOptions({
	name: 'WaterfallStatisticsContainer',
});

const props = defineProps({
	currentFFTChartStatistics: { type: Object, default: () => ({}) },
	prevFFTItems: { type: Array, default: () => [] },
	chartMainData: { type: Object, default: () => ({}) },
	rootFilters: { type: Object, default: () => ({}) },
});

const { tt } = Lang;
const commonChartItemWrapperRef = ref(null);
const chartsDisplayQuantity = ref(5);
const chartsDisplayNumbersListFiltered = ref([]);
const rotationIsReady = ref(false);
const initialAplpha = ref(0);
const initialBeta = ref(0);
const alpha = ref(0);
const beta = ref(0);
const initialZoom_x = ref(10);
const initialZoom_y = ref(10);
const initialDrag_x = ref(0);
const initialDrag_y = ref(0);
const zoom_x = ref(10);
const zoom_y = ref(10);
const drag_x = ref(0);
const drag_y = ref(0);
const drag_min_y = ref(0);
const drag_max_y = ref(100);
const drag_min_x = ref(0);
const drag_max_x = ref(100);

const chartsDisplayNumbersList = computed(() => {
	const result = [];
	for (let i = 2; i <= 10; i += 1) {
		result.push({ id: i, name: i.toString(), value: i });
	}
	return result;
});
const chartProps = computed(() => Object.freeze({
	chartInstanceContainerPayload: {
		prevFFTItems: props.prevFFTItems,
		chartsDisplayQuantity: 5,
		...props.chartMainData,
	},
	chartInstanceContainerSettings: {
		enableSlidersZoom: true,
	},
	chartInstanceContainerEvents: {
		chartContainerReady: handleChartContainerReady,
	},
	chartInstanceEventsList: {
		dragLimitsChange: handleDragLimitsChange,
	},
	useSimpleSpinnerAsPreloader: true,
	hcInstance: Highcharts,
}));

const chartLoadEvent = () => {
	const rotationValues = commonChartItemWrapperRef.value?.callChartMethod?.('getChartRotationValues') || {};
	alpha.value = rotationValues.alpha || 0;
	beta.value = rotationValues.beta || 0;
	initialAplpha.value = alpha.value;
	initialBeta.value = beta.value;
	initialZoom_x.value = zoom_x.value;
	initialZoom_y.value = zoom_y.value;
	initialDrag_x.value = drag_x.value;
	initialDrag_y.value = drag_y.value;
	rotationIsReady.value = true;
};
const handleDragLimitsChange = ({ axis_key: axisKey, new_drag_pos_max: newDragPosMax } = {}) => {
	if (!axisKey) return;

	if (newDragPosMax) {
		if (axisKey === 'x') {
			drag_max_x.value = newDragPosMax;
			if (drag_x.value > drag_max_x.value) drag_x.value = drag_max_x.value;
		} else if (axisKey === 'y') {
			drag_max_y.value = newDragPosMax;
			if (drag_y.value > drag_max_y.value) drag_y.value = drag_max_y.value;
		}
	} else if (axisKey === 'x') {
		drag_max_x.value = 100;
		drag_x.value = initialDrag_x.value;
	} else if (axisKey === 'y') {
		drag_max_y.value = 100;
		drag_y.value = initialDrag_y.value;
	}
};
const setLocalSliderValue = (key, value) => {
	const map = {
		alpha,
		beta,
		zoom_x,
		zoom_y,
		drag_x,
		drag_y,
	};
	if (map[key]) map[key].value = value;
};
const handleSliderChange = (value, key, redraw = true, isReset) => {
	if (!rotationIsReady.value) return;

	commonChartItemWrapperRef.value?.callChartMethod?.('handleSliderChange', {
		key,
		val: value,
		redraw,
		isReset,
	});
	setLocalSliderValue(key, value);
};
const resetSliders = () => {
	handleSliderChange(initialAplpha.value, 'alpha', false, true);
	handleSliderChange(initialBeta.value, 'beta', false, true);
	handleSliderChange(initialZoom_x.value, 'zoom_x', false, true);
	handleSliderChange(initialZoom_y.value, 'zoom_y', true, true);
};
const handleChartsDisplayQuantityChange = (quantity) => {
	chartsDisplayQuantity.value = quantity;
	commonChartItemWrapperRef.value?.callChartMethod?.(
		'handleChartsDisplayQuantityChange',
		quantity,
	);
	resetSliders();
};
const handleChartContainerReady = ({ isChartDataReady } = {}) => {
	if (!isChartDataReady) return;

	const statisticsLength = commonChartItemWrapperRef.value?.ChartInstance?.requestsList?.length || 0;
	chartsDisplayNumbersListFiltered.value = chartsDisplayNumbersList.value.slice(
		0,
		statisticsLength - 1,
	);

	if (statisticsLength < chartsDisplayQuantity.value) {
		chartsDisplayQuantity.value = statisticsLength;
	}

	chartLoadEvent();
};

const { handleEvent } = useEventHandler({
	handleChartContainerReady,
}, null);

onBeforeUnmount(() => {
	commonChartItemWrapperRef.value?.callChartMethod?.('setupChartRotation', false);
});
</script>
