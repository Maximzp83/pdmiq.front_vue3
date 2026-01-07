<template>
	<div class="card-header chart-card-header capitalize">
		<!-- <button @click="zoomYAxis">+</button> -->
		<div class="flex mrow wrap align-center left-part">
			<div class="title-block mcol-xs-12 mcol-sm-auto" v-html="chartTitle"></div>
			<div class="zoom-block-container mcol-xs-9 mcol-sm-auto">
				<!-- v-if="ChartAPI" -->
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

		<!-- <div class="mcol-xs-2 mcol-sm-auto ml-auto" v-if="showDisableChartButton">
			<div class="header-item">
				<el-button
					@click="toggleChart"
					:class="{ active: chartIsHidden }"
					native-type="button"
					type="tertiary"
					class="action-button disable-chart-button is-plain"
					size="mini"
				>
					<i
						:class="['icomoon', chartIsHidden ? 'icon-eye' : 'icon-eye-slash']"
					></i>
				</el-button>
			</div>
		</div> -->


	</div>
</template>

<script>
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		ChartZoom: () => import('../ChartZoom.vue'),
	},
	props: {
		ChartInstance: { type: Object, required: true },
		chartIsInit: Boolean,
		chartOptionsUpdate: Number,
		propsData: { type: Object, default: () => ({}) },
		dynamicProps: { type: Object, default: () => ({}) },
	},

	computed: {
		// multiViewData: that => that.propsData.multiViewData,
		showThresoldsDialog: that => that.dynamicProps.showThresoldsDialog,

		chartTitle() {
			// console.log(this.ChartInstance)
			return this.ChartInstance.chartTitle;
		},

	},

	methods: {
		zoomYAxis(data) {
			if (this.ChartInstance.ChartAPI) {
				this.ChartInstance.ChartAPI.yAxis[0].setExtremes(...data);				
			}
		},

		toggleThresholdsDialog() {
			this.$emit('event', {
				eventName: 'toggleThresholdsDialog',
				data: {
					graphItemData: this.dynamicProps.graphItemData,
					requestsList: this.ChartInstance.requestsList
				},
				onward: true
			});
		},

	}
};
</script>
