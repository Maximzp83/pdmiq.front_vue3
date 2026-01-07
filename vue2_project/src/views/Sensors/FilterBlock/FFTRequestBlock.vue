<template>	
	<el-dialog
		v-if="initiatedFFTDialog"
		append-to-body
		top
		class="small dialog-decorate-header title-center fft-request-dialog"
		:title="tt('phrases.request_fft')"
		:visible.sync="fftRequestDialogOpen"
	>
		<VueElementLoadingWrapper
			:isLoading="processingFFTRequest"
			:text="tt('phrases.Sending_FFT_request_to_Controller')"
		/>

		<div class="card-content flex justify-center" v-if="!fft_request_result">
			<div class="">
				<div class="article-title content-row">
					{{ `${tt('phrases.Do_you_really_want_to')}` }}
					<b>{{ tt('Request') }} FFT</b>
					{{
						$Lang.currentLangId == LANGUAGE_TYPES.ENGLISH
							? ' Action? Continue?'
							: '?'
					}}
				</div>

				<div class="content-row flex align-center" v-if="!isBannerS22UVT">
					<div class="div-block">{{ tt('phrases.request_type') }}</div>
					<div class="div-block">
						<el-select
							v-model="banner_request_type"
							:placeholder="`${tt('Select')} ${tt('type')}`"
						>
							<el-option
								v-for="item in bannerRequestTypesList"
								:key="'type_id-' + item.id"
								:label="item.name"
								:value="item.id"
							>
								<el-tooltip
									class="item"
									effect="dark"
									:content="item.tooltip"
									placement="right"
								>
									<span class="display-block">{{ item.name }}</span>
								</el-tooltip>
							</el-option>
						</el-select>
					</div>
				</div>

				<div class="content-row flex align-center">
					<div class="div-block">{{ tt('phrases.request_fmax') }}</div>
					<CustomSelect
						class="div-block"
						:optionsList="bannerRequestFmaxTypesList"
						:placeholder="`${tt('Select')} ${tt('fmax')}`"
						v-model="banner_request_fmax"
					/>
				</div>
			</div>
		</div>

		<div class="card-content flex justify-center" v-else>
			<div class="vertical-fluid">
				<div class="caption">
					<i
						:class="[
							'span-block',
							fft_request_result.isSuccess
								? 'el-icon-success success-color'
								: 'el-icon-warning warning-color'
						]"
					></i>
					<span
						class="span-block text semi-bold"
						v-text="fft_request_result.message"
					></span>
				</div>
			</div>
		</div>

		<div slot="footer" class="dialog-footer section-row text-center ">
			<!-- :loading="sensorJobSaving" -->
			<el-button
				v-if="!fft_request_result || !fft_request_result.isSuccess"
				@click="fftRequestDialogOpen = false"
				>{{ tt('Cancel') }}</el-button
			>

			<el-button
				v-if="fft_request_result"
				type="primary"
				@click="handleFFTResult(fft_request_result)"
				class="capitalize"
				>{{ fft_request_result.isSuccess ? `Ok` : `${tt('Retry')}` }}</el-button
			>

			<el-button
				v-else
				type="primary"
				@click="sendRequestFFT"
				class="capitalize"
				>{{ tt('Confirm') }}</el-button
			>
		</div>
	</el-dialog>		
</template>

<script>
import { mapActions, mapState } from 'vuex';
// import { findItemBy } from '@/helpers';
import {
	NCD_REQUEST_STATUSES,
	bannerRequestTypesList,
	bannerRequestFmaxTypesList,
	FFT_SOURCE_TYPES,
	BANNER_REQUEST_FMAX_TYPES,
	BANNER_REQUEST_TYPES
} from '@/constants/global';
import { METRIC_SYSTEM_TYPES } from '@/modules/charts_factory/controllers/Sensor/enums';

import { LANGUAGE_TYPES } from '@/localization/utils';

import {
	webSocketMixin,
	sensorTypeMixin
} from '@/mixins';

export default {
	mixins: [webSocketMixin(), sensorTypeMixin()],

	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},
		rootFilters: { type: Object, default: () => ({}) },

		isLoading: Boolean,
		isSending: Boolean,
		// forController: Boolean
	},

	data() {
		return {
			forController: null,

			fft_socket: null,
			fft_socket_ready: false,

			processingFFTRequest: false,
			fft_request_result: null,

			banner_request_type: null,
			banner_request_fmax: null,

			fftRequestDialogOpen: false,
			initiatedFFTDialog: false,
		};
	},

	computed: {
		...mapState({
			// sensorJobSaving: state => state.sensors.sensorJobSaving,
			// filters: state => state.sensors.statistics_filters,
			authUser: state => state.auth.authUser
		}),

		currentSensorTypeDataKey: () => 'sensorData',

		isBannerTempVibe2: that =>
			that.currentSensorType && (that.currentSensorType.isBannerTempVibe2 || that.currentSensorType.isBannerV2_1),
		isBannerS22UVT: that =>	that.currentSensorType && that.currentSensorType.isBannerS22UVT,

		LANGUAGE_TYPES: () => LANGUAGE_TYPES,

		remaining_fft_action_time() {
			const { lastWorkerFFTRequest } = this.sensorData;
			if (lastWorkerFFTRequest) {
				return lastWorkerFFTRequest.remaining_action_time;
			}
			return 0;
		},

		socketChannelFFTRequest() {
			const { authUser } = this;

			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		},

		// ------------
		bannerRequestTypesList: () => bannerRequestTypesList(),
		bannerRequestFmaxTypesList() {
			let list = bannerRequestFmaxTypesList();
			
			if (!this.isBannerS22UVT) {
				list = list.filter(li => li.id !== BANNER_REQUEST_FMAX_TYPES.HZ_10600);
			}

			if (this.rootFilters.measurement === METRIC_SYSTEM_TYPES.IMPERIAL) {
				return list.map(type => ({
					...type,
					name: `${type.value * 60} CPM`
				}))
			}
			
			return list;
		},
	},

	methods: {
		...mapActions({
			set_global_state: 'set_global_state',
			fetch_ncd_fft: 'sensors/fetch_ncd_fft',
			request_ncd_fft: 'sensors/request_ncd_fft',
		}),
		// -----------------

		confirmFFTRequest(settings = {}) {
			const { forController } = settings;
			// console.log('confirmFFTRequest', this.sensorData)
			if (this.isBannerTempVibe2 || this.isBannerS22UVT || forController) {
				this.forController = forController;
				this.initiatedFFTDialog = true;
				this.fftRequestDialogOpen = true;
			} else {
				this.sendRequestFFT();
			}
		},

		handleFFTResult({ isSuccess }) {
			if (isSuccess) {
				this.fftRequestDialogOpen = false;
			}
			setTimeout(() => {
				this.fft_request_result = null;
			}, 200);
		},

		sendRequestFFT() {
			const { isBannerTempVibe2, isBannerS22UVT, forController } = this;

			const payload = { sensorId: this.sensorData.id, data: {} };
			let next = true;

			if (isBannerTempVibe2 || isBannerS22UVT || forController) {
				if (isBannerS22UVT) {
					this.banner_request_type = BANNER_REQUEST_TYPES.STANDARD;
				}
				if (this.banner_request_type != null && this.banner_request_fmax != null) {
					payload.notNotify = false;
					payload.data.banner_request_type = this.banner_request_type;
					payload.data.banner_request_fmax = this.banner_request_fmax;
					next = true;
				} else {
					next = false;
					this.$notify({
						type: 'error',
						title: this.tt('Error'),
						message: this.tt('phrases.Please_select_request_type_and_fmax'),
						duration: 0
					});
				}
			}

			/*if (payload) {
				console.log(next, payload)
				return
			}*/
			if (next) {
				if (forController) {
					this.$emit('event', {
						eventName: 'sendMultipleFFT',
						data: {
							controllerData: forController,
							data: payload.data
						}
					});
				} else {
					this.$emit('update:isSending', true);
					// console.log(payload)
					this.request_ncd_fft(payload)
						.then(response => {
							this.handleFFTRequest(response);

							setTimeout(() => {
								this.$emit('update:isSending', false);
							}, 100);
						})
						.catch(() => {
							this.$emit('update:isSending', false);
						});
				}
			}			
		},

		handleFFTRequest(response) {
			if (this.isBannerTempVibe2 || this.isBannerS22UVT) {
				this.processingFFTRequest = true;
			} else {
				this.toggleMainPreloader(true, `${this.tt('Working')} FFT...`);
			}

			const fft_request_id = response.value.id;

			this.setupWebSocket({
				socketName: 'fft_socket',
				socketNameReadyProp: 'fft_socket_ready',
				socketChannel: this.socketChannelFFTRequest
				// socketCallbackName: 'fftRequest_socketCallback',
			});

			this['fft_socket'].onmessage = e => {
				this['fftRequest_socketCallback'](JSON.parse(e.data), {
					fft_request_id
				});
			};
		},

		fftRequest_socketCallback({ type, data }, settings = {}) {
			const { fft_request_id } = settings;
			const { tt, isBannerTempVibe2, isBannerS22UVT } = this;
			const waitingType = (isBannerTempVibe2 || isBannerS22UVT) ? 'dxm.command' : 'ncd.command';

			// console.log(fft_request_id, type, data, waitingType)
			if (
				type.toLowerCase() == waitingType &&
				data.fft_request_id === fft_request_id &&
				(data.type === FFT_SOURCE_TYPES.FFT || data.command_type == 'fft')
			) {
				if (data.status == NCD_REQUEST_STATUSES.SUCCESS) {
					/*this.$notify({
						type: 'success',
						title: tt('constants.Success'),
						message: `FFT ${tt('requesting')} ${tt('Successfully')}`
					});*/
					this.$emit('onSocketSuccess', true);				

					this.fft_request_result = {
						isSuccess: true,
						message: `${tt('phrases.controller_received_the_request_properly')}`
					};
					this.closeWebSocket({ socketName: 'fft_socket' });
					this.toggleMainPreloader(false);
					this.processingFFTRequest = false;
				}

				if (data.status == NCD_REQUEST_STATUSES.FAIL) {
					/*this.$notify({
						type: 'warning',
						title: tt('constants.Fail'),
						message: `${tt('Error')} - ${tt(
							'phrases.check_controller_connectivity'
						)}`,
						duration: 0
					});*/
					this.fft_request_result = {
						isSuccess: false,
						message: `${tt('Error')} - ${tt(
							'phrases.check_controller_connectivity'
						)}`
					};

					this.closeWebSocket({ socketName: 'fft_socket' });
					this.toggleMainPreloader(false);
					this.processingFFTRequest = false;
				}
				// this.pdfReportURL = reportURL;
			}
		},

		handleLastFFT() {
			const payload = {
				sensorId: this.sensorData.id,
				urlPostfix: '/last/completed'
			};
			this.$emit('update:isLoading', true);

			this.fetch_ncd_fft(payload)
				.then(({ value }) => {
					this.$emit('update:isLoading', false);

					this.$emit('event', {
						eventName: 'openFFTCharts',
						data: { payload: value, sensorType: this.currentSensorType },
						onward: true
					});
				})
				.catch(() => {
					this.$emit('update:isLoading', false);
				});
		},

		toggleMainPreloader(open, text) {
			if (open) {
				this.set_global_state({
					stateProp: 'overlay',
					value: {
						text: text || '',
						textStyle: { fontSize: '25px' }
					}
				});
				this.set_global_state({ stateProp: 'mainPreloader', value: true });
			} else {
				this.set_global_state({ stateProp: 'mainPreloader', value: false });
				this.set_global_state({ stateProp: 'overlay', value: {} });
				this.sensorSaving = false;
			}
		},
	},

	beforeDestroy() {
		// console.log('destroy')
		this.closeWebSocket({ socketName: 'fft_socket' });
	}
};
</script>
