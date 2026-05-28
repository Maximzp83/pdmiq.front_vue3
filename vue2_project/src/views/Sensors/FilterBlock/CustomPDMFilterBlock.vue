<template>
	<div
		class="charts-page-operations popover-content flex wrap justify-end triangle pos-top mcol-xs-12"
	>
		<div class="grouped-buttons-block-wrapper" v-if="enableStatsBlock">
			<div class="grouped-buttons-block">
				<div class="group-title">% Stats:</div>

				<div class="buttons-list">
					<div class="button-item">
						<el-button
							@click="toggleStatsThresholds"
							native-type="button"
							:class="['small', {'is-active': statsThresholdsActive}]"
							icon="icomoon icon-eye"
						/>
					</div>
				</div>
			</div>
		</div>

		<PDFandFFTrequestsBlock
			v-if="enablePDFButton"
			:sensorData="sensorData"
			:equipmentData="equipmentData"
			:enableFFT="enableFFT"			
			:currentSensorType="currentSensorType"
			enableRpmBlock
		/>

		<!-- v-if="sensorData && !sensorData.equipment.has_crash_process" -->
		<div class="button-item history-button">
			<el-button
				@click="event('toggleHistory')"
				type="primary"
				native-type="button"
				:class="['inverted report-button', { active: showHistory }]"
				v-text="`${showHistory ? tt('Hide') : tt('Show')} ${tt('history')}`"
			/>
		</div>

		<div class="button-item ChartsFilterBar" v-if="enableChartFilters">
			<!-- :isLoading="itemsLoading || someChartLoading" -->
			<ChartsFilterBar
				ref="ChartsFilterBar"
				:isLoading="itemsLoading"
				:sensorParametersList="sensorParametersListVFDPressureRPMAmps"
			/>
		</div>
	</div>
</template>

<script>
// import axios from '@/services/api/axiosService';

import { mapActions, mapState } from 'vuex';
// import { prepareRangeParams } from '@/helpers';
import {
	sensorParametersListVFDPressureRPMAmps,
	metricSystemsList
} from '@/modules/charts_factory/controllers/Sensor/enums';

// import { chartsCompareExportMixin } from '@/mixins';

export default {
	// mixins: [chartsCompareExportMixin()],
	components: {
		ChartsFilterBar: () => import('../charts/ChartsFilterBar.vue'),
		PDFandFFTrequestsBlock: () => import('./PDFandFFTrequestsBlock.vue')
		// AcknowledgeForm: () => import('../Dashboard/AcknowledgeForm.vue')
	},
	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},
		statisticsDataList: {
			type: Object,
			default: () => ({})
		},
		sensorLoading: Boolean,
		// pdfReportURL: String,
		showHistory: Boolean,
		joinChartsBy: Object,
		someChartLoading: Boolean,
		itemsLoading: Boolean,
		chartOperationsPopoverShow: Boolean,
		// showReport: Boolean,
		isCompare: Boolean,
		enableFFT: Boolean,
		enableStatsBlock: Boolean,
		statsThresholdsActive: Boolean,
		currentSensorType: { type: Object, required: true },
		enablePDFButton: { type: Boolean, default: () => true },
		enableChartFilters: { type: Boolean, default: () => true },
		equipmentData: Object
	},

	/*data() {
		return {
			pdfReportURL: ''
		};
	},*/

	computed: {
		...mapState({
			filters: state => state.sensors.statistics_filters,
			// sensorLoading: state => state.sensors.isLoading,
			authUser: state => state.auth.authUser
			// levelZonesSaving: state => state.sensors.levelZonesSaving
		}),

		metricSystemsList: () => Object.freeze(metricSystemsList()),
		sensorParametersListVFDPressureRPMAmps: () =>
			Object.freeze(sensorParametersListVFDPressureRPMAmps())
	},

	methods: {
		...mapActions({
			// ping_socket_endpoint: 'sensors/ping_socket_endpoint',
			set_filters: 'sensors/set_statistics_filters'
		}),

		event(name, data) {
			// console.log(name, data)
			this.$emit('event', {
				eventName: name,
				data: data,
				onward: true
			});
		},

		// -----------------
		toggleStatsThresholds() {
			this.event('toggleStatsThresholds');
		},

		switchMetricSystem({ id }) {
			// console.log(id)
			this.set_filters({ ...this.filters, measurement: id });
		}
	},

	watch: {
		chartOperationsPopoverShow(isShow) {
			if (!isShow) {
				if (this.$refs['ChartsFilterBar']) {
					this.$refs['ChartsFilterBar'].chartFiltersPopoverShow = false;
				}
			}
		}
	}
};
</script>
