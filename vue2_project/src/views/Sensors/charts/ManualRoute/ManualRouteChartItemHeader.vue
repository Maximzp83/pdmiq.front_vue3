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
							ref="ChartZoom"
							class="mcol-xs-12 mcol-sm-auto"
							@event="handleEventNew"
							:ChartInstance="ChartInstance"
							:chartOptionsUpdate="chartOptionsUpdate"
							:chartIsInit="chartIsInit"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		ChartZoom: () => import('../ChartZoom.vue')
	},
	props: {
		ChartInstance: { type: Object, required: true },
		chartIsInit: Boolean,
		chartOptionsUpdate: Number
	}
};
</script>
