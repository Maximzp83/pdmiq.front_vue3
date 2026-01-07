<template>
	<div class="charts-page-operations flex wrap justify-end mcol-xs-12">
		<div class="grouped-buttons-block-wrapper" v-if="isBannerTempVibe2 || V2_1ViewActive">
			<div class="grouped-buttons-block">
				<div class="group-title">V2.1:</div>

				<div class="buttons-list">
					<div class="button-item">
						<el-button
							@click="toggleV2_1View"
							native-type="button"
							:class="['small', {'is-active': V2_1ViewActive}]"
							icon="icomoon icon-eye"
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="grouped-buttons-block-wrapper">
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
			@event="handleEvent"
			:enableFFT="enableFFT"
			:isCompare="isCompare"
			:sensorData="sensorData"
			:currentSensorType="currentSensorType"
			:sensors="sensors"
			:equipmentData="equipmentData"			
			class=""
			:rootFilters="filters"
			enableRpmBlock
		/>

		<!-- <div :class="['button-item pdf-item relative']" v-else>
			<SimpleSpinner :active="pdf_report_processing || pdf_report_requesting" />

			<el-button
				@click="startPDFCompareReport"
				:disabled="pdf_report_processing || pdf_report_requesting"
				type="primary"
				native-type="button"
				class="inverted report-button"
			>
				<i class="icomoon icon-pdf"></i>
				<span class="text">{{ tt('Export') }}</span>
			</el-button>
		</div> -->

		<!-- v-if="sensorData && !sensorData.equipment.has_crash_process" -->
		<div class="button-item">
			<el-button
				@click="event('toggleHistory')"
				type="primary"
				native-type="button"
				:class="['inverted report-button history-button', { active: showHistory }]"
				v-text="`${showHistory ? tt('Hide') : tt('Show')} ${tt('history')}`"
			/>
		</div>
		<div class="button-item" v-if="!isCompare && !isHumiditySensor && !isBannerV2_1">
			<!-- v-if="sensorData && !sensorData.equipment.has_crash_process" -->
			<!-- :loading="levelZonesSaving || someChartLoading" -->

			<el-button
				v-if="!hideOffAlarm"
				@click="toggleOffAlarm"
				:disabled="sensorData.is_re_baseline_process"
				type="primary"
				native-type="button"
				:loading="levelZonesSaving"
				:class="[
					'inverted report-button primary-color bolded capitalize',
					{ active: hasOffAlarm }
				]"
				v-text="
					`${hasOffAlarm ? tt('Disable') : tt('Enable')} ${tt(
						'constants.OFF_ALARM'
					)}`
				"
			/>
		</div>

		<div
			class="button-item"
			v-if="!isCompare && !isHumiditySensor && !isBannerExtraVibration && !isBannerV2_1 && !isBannerS22UVT"
		>
			<el-button-group>
				<el-button
					v-if="!isNCDEnv"
					@click="handleJoinCharts('axis')"
					type="primary"
					native-type="button"
					:class="['report-button', { active: joinChartsBy.prop == 'axis' }]"
					:icon="`icomoon icon-overlay`"
					class="inverted"
					>{{ tt('Axis') }}
				</el-button>

				<el-button
					v-if="!isNCDEnv"
					@click="handleJoinCharts('type')"
					type="primary"
					native-type="button"
					:class="['report-button', { active: joinChartsBy.prop == 'type' }]"
					:icon="`icomoon icon-overlay`"
					class="inverted"
					>{{ tt('Params') }}
				</el-button>

				<el-button
					v-if="splitChartsButtonEnabled"
					@click="handleSplitNCDCharts"
					type="primary"
					native-type="button"
					:class="['report-button', { active: splitNCDCharts }]"
					:icon="`icomoon icon-overlay`"
					class="inverted"
					>{{ tt('Split') }}
				</el-button>
			</el-button-group>
		</div>

		<div
			class="button-item ChartsFilterBar"
			v-if="
				!isCompare && !isHumiditySensor && !isBannerExtraVibration && !isNCDSensor && !isBannerV2_1 && !isBannerS22UVT
			"
		>
			<!-- :isLoading="itemsLoading || someChartLoading" -->
			<!-- :sensorParametersList="sensorParametersList" -->
			<ChartsFilterBar
				ref="ChartsFilterBar"
				:sensorParametersList="
					sensorParametersList[isBannerCM1L ? 'banner_CM1L' : 'banner']
				"
				:isLoading="itemsLoading"
			/>
		</div>

		<div
			class="button-item"
			v-if="
				!isNCDEnv &&
					!isCompare &&
					!isHumiditySensor &&
					$hasAccessTo(['edit_dashboard'])
			"
		>
			<el-popover
				placement="bottom"
				popper-class="button-popover"
				:title="tt('phrases.thresholds_re_baseline')"
				width="180"
				trigger="hover"
			>
				<el-button
					@click="click_re_baseline"
					slot="reference"
					type="primary"
					native-type="button"
					class="ml-auto inverted re-baseline-button"
					:class="{ loading: rebaselineLoading }"
				>
					<div class="relative img-container">
						<img
							:class="[`suffix-icon`, 'img rebase-wheel-img']"
							:src="rebase_wheel"
						/>
						<img
							:class="[`suffix-icon`, 'img rebase-lines-img']"
							:src="rebase_lines"
						/>
					</div>
				</el-button>
			</el-popover>
		</div>

		<div class="button-item chart-switcher text-right">
			<div class="relative flex">
				<el-button-group>
					<!-- :disabled="itemsLoading" -->
					<!-- :loading="itemsLoading" -->
					<el-button
						v-for="item in metricSystemsList"
						:key="`metricSystem-${item.id}`"
						@click="switchMetricSystem(item)"
						type="primary"
						native-type="button"
						v-text="item.name"
						:class="{ active: filters.measurement === item.id }"
						class="inverted"
					/>
				</el-button-group>
			</div>
		</div>

	</div>
</template>

<script>
// import axios from '@/services/api/axiosService';

import { mapActions, mapState } from 'vuex';
// import { prepareRangeParams } from '@/helpers';
import {
	rebase_lines,
	rebase_wheel,
} from '@/constants/global';

import {
	sensorParametersList,
	SENSOR_PARAMETERS_TYPES,
	metricSystemsList
} from '@/modules/charts_factory/controllers/Sensor/enums';

import { LANGUAGE_TYPES } from '@/localization/utils';

import { actionButtonsMixin, eventHandler, RebaselineRequestMixin } from '@/mixins';

export default {
	mixins: [actionButtonsMixin(), eventHandler(), RebaselineRequestMixin()],
	components: {
		ChartsFilterBar: () => import('../charts/ChartsFilterBar.vue'),
		PDFandFFTrequestsBlock: () => import('./PDFandFFTrequestsBlock.vue')
	},
	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},
		sensors: {
			type: Array,
			default: () => []
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
		splitNCDCharts: Boolean,
		isNCDSensor: Boolean,
		// hasOffAlarm: Boolean,
		chartsWithOffAlarm: Array,
		currentSensorType: { type: Object, required: true },
		equipmentData: Object,
		rootFilters: { type: Object, default: () => ({}) },
		statsThresholdsActive: Boolean,
		V2_1ViewActive: Boolean
	},

	data() {
		return {
			// pdf_socket: null,
			// pdf_socket_ready: false,
			rebaselineLoading: false,
			sendingFFTRequest: false,
			levelZonesSaving: false,
		};
	},

	computed: {
		...mapState({
			sensorJobSaving: state => state.sensors.sensorJobSaving,
			filters: state => state.sensors.statistics_filters,
			// sensorLoading: state => state.sensors.isLoading,
			authUser: state => state.auth.authUser
			// levelZonesSaving: state => state.sensors.levelZonesSaving
		}),

		isHumiditySensor: that => that.currentSensorType.isHumiditySensor,
		isNCDEnv: that => that.currentSensorType.isNCDEnv,
		isBannerCM1L: that => that.currentSensorType.isBannerCM1L,
		isBannerExtraVibration: that => that.currentSensorType.isBannerExtraVibration,
		isBanner: that => that.currentSensorType.isBanner,
		isBannerTempVibe2: that => that.currentSensorType.isBannerTempVibe2,
		isBannerV2_1: that => that.currentSensorType.isBannerV2_1,
		isBannerS22UVT: that => that.currentSensorType.isBannerS22UVT,

		splitChartsButtonEnabled: that =>
			that.currentSensorType.isNCDTempVibe ||
			that.currentSensorType.isNCDWiredTempVibe ||
			that.currentSensorType.isNCDTempVibeCurr ||
			that.isBannerTempVibe2,

		hideOffAlarm: that => that.isNCDSensor,
		LANGUAGE_TYPES: () => LANGUAGE_TYPES,

		offAlarmParameterIds: () =>
			Object.freeze([
				SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION,
				SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION
			]),
		metricSystemsList: () => Object.freeze(metricSystemsList()),


		sensorParametersList() {
			return Object.freeze({
				banner_CM1L: sensorParametersList(),
				banner: sensorParametersList().filter(
					p => p.id !== SENSOR_PARAMETERS_TYPES.AMPS
				)
			});
		},

		chartFilterParametersList() {
			return [];
		},
		// ------------

		hasOffAlarm: that => that.chartsWithOffAlarm.length,

		rebase_wheel: () => rebase_wheel,
		rebase_lines: () => rebase_lines,

		// CONTROLLER_TYPES: () => CONTROLLER_TYPES
	},

	methods: {
		...mapActions({
			sensor_rebase_line: 'sensors/sensor_rebase_line',
			set_filters: 'sensors/set_statistics_filters',
			set_global_state: 'set_global_state'
		}),

		toggleV2_1View() {
			this.event('toggleV2_1View');
		},

		toggleStatsThresholds() {
			this.event('toggleStatsThresholds');
		},

		event(name, data) {
			// console.log(name, data)
			this.$emit('event', {
				eventName: name,
				data: data,
				onward: true
			});
		},

		handleJoinCharts(prop) {
			let payload = {
				prop: prop
			};

			this.event('handleJoinCharts', payload);
		},

		handleSplitNCDCharts() {
			this.event('handleSplitNCDCharts');
		},
		// -----------------

		toggleOffAlarm() {
			if (this.hasOffAlarm) {
				const { tt } = this;
				this.confirmHelper({
					message: `${tt('phrases.Do_you_really_want_to')} ${tt(
						'phrases.disable_off_alarm'
					)}? ${tt('Continue')}?`,
					confirmButtonText: tt('Confirm')
				})
					.then(() => {
						this.$emit('event', { eventName: 'toggleOffAlarm', data: false });
					})
					.catch(() => {
						/**/
					});
			} else {
				this.$emit('event', {
					eventName: 'toggleOffAlarm',
					data: this.offAlarmParameterIds
				});
			}
		},

		switchMetricSystem({ id }) {
			// console.log(id)
			this.set_filters({ ...this.filters, measurement: id });
		},

		/*handleStartCrashProcess() {
			const { equipment } = this.sensorData;

			if (equipment) {
				this.acknowledgeData = equipment.has_breakdown
					? equipment.repairNow
					: equipment;
				this.acknowlaedgeDialogVisible = true;
			}
		}*/
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
