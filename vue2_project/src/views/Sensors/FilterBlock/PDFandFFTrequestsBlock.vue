<template>
	<div class="flex relative ">
		<!-- <button	@click="handleFFTSuccess">test</button> -->
		<div class="grouped-buttons-block-wrapper"
			v-if="enableRpmBlock && !currentSensorType.isNCDEnv && !currentSensorType.isHumiditySensor"
		>
			<div class="grouped-buttons-block">
				<div class="icon-part"><i class="icomoon el-icon-odometer primary-color"></i> </div>
				<div class="group-title">RPM:</div>

				<div class="buttons-list">
					<div
						class="button-item"
						v-if="!isCompare && $hasAccessTo(['edit_dashboard'])"
					>
						<el-popover
							:disabled="isRpmParamsSet"
							:placement="'bottom'"
							:popper-class="`standard-popover`"
							:title="tt('phrases.you_need_to_select_rpm_source_first')+'!'"
							trigger="hover"
							width="200"
							:close-delay="0"
						>
							<el-button
								slot="reference"
								@click="toggleRpmOverlay"
								native-type="button"
								:class="['small', {
										'is-active': equipmentData && equipmentData.is_rpm_visible,
										'is-disabled with-pointer-events': !isRpmParamsSet
									}
								]"
								:loading="loadingRPM"
								icon="icomoon icon-eye"
							>
							</el-button>
						</el-popover>
					</div>

					<div class="button-item">
							<!-- :disabled="!hasRpmSourcesOptions" -->
						<el-button
							slot="reference"
							@click="showRpmSettings"
							native-type="button"
							:class="['small']"
							:loading="loadingRPM"
							icon="icomoon icon-testing"
						/>
					</div>
				</div>
			</div>
		</div>
		
		<div class="grouped-buttons-block-wrapper" v-if="enableFFT">
			<div class="grouped-buttons-block">
				<SensorFFTRequestButton class="icon-part" :propsData="sensorData"/>
				<!-- <div class="icon-part"><i class="icomoon icon-fft primary-color"></i> </div> -->
				<div class="group-title">FFT:</div>

				<div class="buttons-list">
					<div
						class="button-item"
						v-if="!isCompare && $hasAccessTo(['edit_dashboard'])"
					>
						<!-- :disabled="isBannerTempVibe2 || remaining_fft_action_time < 1" -->
						<el-popover
							disabled
							:placement="'bottom'"
							:popper-class="`standard-popover`"
							:title="
								`${tt(
									'phrases.fft_locked_out_remaining_time'
								)}: ${remaining_fft_action_time} ${tt('Minutes')}`
							"
							trigger="hover"
							width="200"
							:close-delay="0"
						>
							<el-button
								slot="reference"
								@click="confirmFFTRequest"
								native-type="button"
								:class="['small', {
									'is-disabled': sensorData.is_fft_processing
									}
								]"
								:loading="sendingFFTRequest"
							>
								<span>{{ tt('Request') }}</span>
							</el-button>
						</el-popover>
					</div>

					<div class="button-item">
						<el-button
							@click="handleLastFFT"
							native-type="button"
							class="small"
							:loading="loadingFFT"
						>
							<span>{{ tt('Last') }}</span>
						</el-button>
					</div>

					<div class="button-item" v-if="showUnlockFFTButton">
						<el-button
							@click="handleUnlockFFT"
							native-type="button"
							class="small"
							:loading="loadingFFT"
						>
							<span class="capitalize">{{ tt('Unlock').toLowerCase() }}</span>
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<div :class="['button-item sub-button-item pdf-item relative']">
			<SimpleSpinner
				:active="sensorJobSaving || pdf_report_processing || pdf_report_requesting"
			/>

			<el-button
				v-if="!pdfReportURL"
				@click="startPDFreportRequest"
				:disabled="sensorJobSaving || pdf_report_processing || pdf_report_requesting"
				type="primary"
				native-type="button"
				class="inverted report-button"
			>
				<i
					class="icomoon icon-pdf"
					v-show="
						!pdf_report_processing && !sensorJobSaving && !pdf_report_requesting
					"
				></i>
				<span class="text">{{
					pdf_report_processing ? `${tt('Processing')}...` : tt('Export')
				}}</span>
			</el-button>

			<a
				v-else
				:href="pdfReportURL"
				target="_blank"
				@click="pdfReportURL = ''"
				class="el-button el-button--primary inverted report-button"
			>
				<span>
					<i class="icomoon icon-upload"></i>
					<span class="text">{{ tt('Download') }}</span>
				</span>
			</a>

			<div
				class="process-description"
				v-show="sensorJobSaving || pdf_report_processing"
			>
				{{ tt('phrases.it_will_take_some_time') }}
			</div>
		</div>

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

		<FFTRequestBlock
			@event="handleEventNew"
			@onSocketSuccess="handleFFTSuccess"
			ref="FFTRequestBlock"
			:sensorData="sensorData"
			:isLoading.sync="loadingFFT"
			:isSending.sync="sendingFFTRequest"
		/>

		<el-dialog
			v-if="initiatedRPMDialog"
			append-to-body
			top
			class="tiny dialog-decorate-header title-center rpm-settings-dialog"
			:title="`${tt('Machine')} ${tt('speed')}`"
			:visible.sync="showRpmSettingsDialog"
		>	
			<SimpleSpinner :active="loadingRPM" />
			<RPMSettingsDialog
				:sensorData="sensorData"
				:currentRpmSource="currentRpmSource"
				@save="saveRpmParams"
				@close="showRpmSettingsDialog = false"
				:rootFilters="rootFilters"
			/>
		</el-dialog>
	</div>
</template>

<script>
// import axios from '@/services/api/axiosService';

import { mapActions, mapState } from 'vuex';
import { prepareRangeParams } from '@/helpers';
import {
	itemSpeedOptionsList,
	ITEM_SPEED_OPTIONS,
	FFT_LOCK_STATUSES
} from '@/constants/global';

import { LANGUAGE_TYPES } from '@/localization/utils';

import {
	webSocketMixin,
	actionButtonsMixin,
	chartsCompareExportMixin,
	eventHandler,
	saveRPMParamsMixin
} from '@/mixins';

export default {
	mixins: [webSocketMixin(), actionButtonsMixin(), chartsCompareExportMixin(), eventHandler(), saveRPMParamsMixin()],
	components: {
		RPMSettingsDialog: () => import('./RPMSettingsDialog.vue'),
		FFTRequestBlock: () => import('./FFTRequestBlock.vue'),
		SensorFFTRequestButton: () => import('../SensorFFTRequestButton.vue'),
	},
	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},
		equipmentData: Object,
		isCompare: Boolean,
		enableFFT: Boolean,
		currentSensorType: { type: Object, default: () => ({}) },
		sensor_ids: { type: Array, default: () => [] },
		plantId: null,
		selectedRange: { type: Array, default: () => [] },
		enableRpmBlock: Boolean,
		rootFilters: { type: Object, default: () => ({}) },
	},

	data() {
		return {
			pdf_report_requesting: false,
			pdf_report_processing: false,

			pdf_socket: null,
			pdf_socket_ready: false,

			pdfReportURL: '',

			sendingFFTRequest: false,

			loadingFFT: false,
			loadingRPM: false,

			showRpmSettingsDialog: false,
			initiatedRPMDialog: false,
		};
	},

	computed: {
		...mapState({
			sensorJobSaving: state => state.sensors.sensorJobSaving,
			filters: state => state.sensors.statistics_filters,
			authUser: state => state.auth.authUser
		}),

		isBannerTempVibe2: that =>
			that.currentSensorType && (that.currentSensorType.isBannerTempVibe2 || that.currentSensorType.isBannerV2_1),

		isRpmParamsSet() {
			if (this.enableRpmBlock && this.equipmentData) {
				var { /*is_rpm_params_set,*/ rpm_source_item } = this.equipmentData;

				if (rpm_source_item) {
					return true;
				} else if (this.sensorData.rpmSources) {
					var {
						external_rpm_evaluated,
						line_speed_rpm_evaluated,
						specification_rpm_evaluated
					} = this.sensorData.rpmSources;

					return !!external_rpm_evaluated || 
								 !!line_speed_rpm_evaluated ||
								 !!specification_rpm_evaluated
				}
			}
			return false;
		},

		hasRpmSourcesOptions() {
			if (this.enableRpmBlock) {
				const {rpmSources} = this.sensorData;
				return Object.values(rpmSources).some(value => !!value);				
			}
			return [];
		},

		currentRpmSource: that => that.equipmentData && ({
			id: that.equipmentData.rpm_source_item,
			value: that.equipmentData.rpm_value,
		}),

		LANGUAGE_TYPES: () => LANGUAGE_TYPES,
		itemSpeedOptionsList: () => itemSpeedOptionsList(),

		remaining_fft_action_time() {
			const { lastWorkerFFTRequest } = this.sensorData;
			if (lastWorkerFFTRequest) {
				return lastWorkerFFTRequest.remaining_action_time;
			}
			return 0;
		},

		socketChannel() {
			const { authUser } = this;

			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		},

		// ------------
		defaultRpmSourceItem() {
			if (this.sensorData && this.sensorData.rpmSources) {
				var {
					external_rpm_evaluated,
					line_speed_rpm_evaluated,
					specification_rpm_evaluated
				} = this.sensorData.rpmSources;

				if (external_rpm_evaluated) {
					return ITEM_SPEED_OPTIONS.EXTERNAL;
				} else if (line_speed_rpm_evaluated) {
					return ITEM_SPEED_OPTIONS.LINESPEED_RPM;
				} else if (specification_rpm_evaluated) {
					return ITEM_SPEED_OPTIONS.SPECIFICATION_RPM;
				}
			}
			return null;
		},

		showUnlockFFTButton() {
			const { sensorData } = this;
			if (sensorData && sensorData.last_fft_lock) {
				return sensorData.last_fft_lock.status !==  FFT_LOCK_STATUSES.UNLOCKED
			}
			return false;
		},

		successRpmSaveCallback() {
			return (value) => {
				this.$emit('event', {
					// eventName: 'reloadPage',
					eventName: 'updateEquipment',
					data: value.equipmentItem,
					onward: true
				});
			};
		}
		// CONTROLLER_TYPES: () => CONTROLLER_TYPES
	},

	methods: {
		...mapActions({
			pdf_report_request: 'sensors/pdf_report_request',
			set_global_state: 'set_global_state',
			set_equipment_rpm_params: 'equipments/set_equipment_rpm_params',
		}),

		event(name, data) {
			// console.log(name, data)
			this.$emit('event', {
				eventName: name,
				data: data,
				onward: true
			});
		},

		startPDFreportRequest() {
			if (this.isCompare) {
				this.startPDFCompareReport();
			} else {
				this.sendPDFreportRequest();
			}
		},

		startPDFCompareReport() {
			const { sensors, sensorsProp, plantId, sensor_ids, selectedRange } = this;
			const sensorsList = sensors || sensorsProp;
			const daterange = selectedRange.length
				? selectedRange
				: this.filters.daterange;
			if (sensorsList.length) {
				this.sendComparePDFreport({
					plantId: plantId || sensorsList[0].equipment.plant_id,
					sensor_ids: sensor_ids || sensorsList.map(si => si.id),
					daterange
					// successCallback: this.close
				});
			} else {
				this.$notify({
					type: 'warning',
					message: this.tt('phrases.sensors_should_be_selected')
				});
			}
		},

		sendPDFreportRequest() {
			const rangeParams = prepareRangeParams(this.filters.daterange, {
				dateStartKey: 'date_start',
				dateFinishKey: 'date_end'
			});

			const payload = {
				sensorId: this.sensorData.id,
				params: {
					parameterType: 1,
					measurement: this.filters.measurement,
					...rangeParams
				}
			};

			/*if (payload) {
				this.pdf_report_requesting = true;				
				this.pdf_report_processing = true;
				return;
			}*/
			this.pdf_report_requesting = true;

			this.pdf_report_request(payload)
				.then(() => {
					this.pdf_report_processing = true;

					this.setupWebSocket({
						socketName: 'pdf_socket',
						socketNameReadyProp: 'pdf_socket_ready',
						socketChannel: this.socketChannel,
						socketCallback: (type, data) => this.pdf_socketCallback({ type, data }),
						resources: this.sensorData.id
					});

					this.pdf_report_requesting = false;
				})
				.catch(() => {
					this.pdf_report_requesting = false;
				});
		},

		pdf_socketCallback(response = {}) {
			const { type, data } = response;
			const safeData = data.data || {};
			// console.log(response, data)
			if (type == "REPORT.GRAPHICAL" && safeData) {
				const { report_filename, report_by_sensor_ids } = safeData;
				// console.log(status, message, report_filename)
				if (
					report_by_sensor_ids &&
					report_by_sensor_ids.includes(this.sensorData.id) ||
					report_by_sensor_ids.some(id => this.sensors.some(sId => sId === id) )
				) {
					this.$notify({
						type: 'success',
						// title: this.$t('Success'),
						message: this.$t('phrases.Report_created'),
					});
					this.pdfReportURL = report_filename;
					// console.log(this.pdfReportURL)
				}

				this.pdf_report_processing = false;
				this.closeWebSocket({ socketName: 'pdf_socket' });
			}
		},

		// -----------------
		confirmFFTRequest() {
			if (this.sensorData.is_fft_processing) return;

			const {FFTRequestBlock} = this.$refs;
			if (FFTRequestBlock) {
				FFTRequestBlock.confirmFFTRequest();
			}
		},
		handleLastFFT() {
			const {FFTRequestBlock} = this.$refs;
			if (FFTRequestBlock) {
				FFTRequestBlock.handleLastFFT();
			}
		},
		handleUnlockFFT(payload) {
			const {FFTRequestBlock} = this.$refs;
			if (FFTRequestBlock) {
				FFTRequestBlock.handleUnlockFFT(payload);
			}
		},

		handleFFTSuccess() {
			this.$emit('event', {
				eventName: 'update_sensor',
				data: {
					id: this.sensorData.id,
					sensor: {	...this.sensorData,	is_fft_processing: true	}
				},
				onward: true
			});
		},

		// -----------------
		showRpmSettings() {
			this.initiatedRPMDialog = true;
			this.showRpmSettingsDialog = !this.showRpmSettingsDialog;
		},

		toggleRpmOverlay() {
			if (this.isRpmParamsSet) {
				this.saveRpmParams({
					is_rpm_visible: !this.equipmentData.is_rpm_visible
				});
			}
		},

		/*handleSaveRpmParams(rpm_source_item) {
			this.saveRpmParams({rpm_source_item});
		},*/

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

	created() {

	},

	beforeDestroy() {
		this.closeWebSocket({ socketName: 'pdf_socket' });
		this.closeWebSocket({ socketName: 'compare_pdf_socket' });
	}
};
</script>
