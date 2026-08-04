<template>
	<div class="card-header chart-card-header capitalize">
		<div class="flex mrow wrap align-center left-part">
			<div
				class="title-block mcol-xs-12 mcol-sm-auto"
				v-text="ChartInstance.chartTitle"
			></div>

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
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ChartZoom from '../ChartZoom.vue';

defineOptions({
	name: 'ManualRouteChartItemHeader',
});

defineProps({
	ChartInstance: { type: Object, required: true },
	chartIsInit: Boolean,
	chartOptionsUpdate: Number,
	propsData: { type: Object, default: () => ({}) },
	dynamicProps: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);
const { handleEvent } = useEventHandler({}, emit);
</script>
