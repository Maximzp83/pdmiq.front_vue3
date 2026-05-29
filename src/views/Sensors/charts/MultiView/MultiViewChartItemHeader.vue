<template>
	<div class="card-header chart-card-header capitalize">
		<div class="flex mrow wrap align-center left-part">
			<div class="title-block mcol-xs-12 mcol-sm-auto" v-html="chartTitle"></div>
			<div class="zoom-block-container mcol-xs-9 mcol-sm-auto">
				<div class="chart-actions-block">
					<div class="flex wrap mrow">
						<ChartZoom
							class="mcol-xs-12 mcol-sm-auto"
							:ChartInstance="ChartInstance"
							:chartOptionsUpdate="chartOptionsUpdate"
							:chartIsInit="chartIsInit"
							@event="handleEvent"
						/>

						<div class="thresholds-edit-block block-item">
							<span class="small-desc">{{ tt('Thresholds') }}</span>
							<el-button
								size="small"
								type="primary"
								:class="{ active: showThresoldsDialog }"
								@click="toggleThresholdsDialog"
							>
								<i class="icomoon icon-graph"></i>
							</el-button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ChartZoom from '../ChartZoom.vue';

const { tt } = Lang;

defineOptions({
	name: 'MultiViewChartItemHeader',
});

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	chartIsInit: Boolean,
	chartOptionsUpdate: Number,
	propsData: { type: Object, default: () => ({}) },
	dynamicProps: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);

const showThresoldsDialog = computed(() => props.dynamicProps.showThresoldsDialog);
const chartTitle = computed(() => props.ChartInstance.chartTitle);

const zoomYAxis = (data) => {
	if (props.ChartInstance.ChartAPI) {
		props.ChartInstance.ChartAPI.yAxis[0].setExtremes(...data);
	}
};

const toggleThresholdsDialog = () => {
	emit('event', {
		eventName: 'toggleThresholdsDialog',
		data: {
			graphItemData: props.dynamicProps.graphItemData,
			requestsList: props.ChartInstance.requestsList,
		},
		onward: true,
	});
};

const { handleEvent } = useEventHandler({ zoomYAxis }, emit);
</script>
