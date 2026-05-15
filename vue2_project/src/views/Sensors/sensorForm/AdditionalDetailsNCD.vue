<template>
	<div class="ncd-additional-details-container">
		<div class="flex mrow wrap">
			<div class="mcol-xs-12 mcol-sm-6 relative chart-height-auto">
				<!-- todo maybe chartTitle-->
				<div class="title semi-bold">
					{{ `${tt('phrases.connection_strength_trend')}:` }}
				</div>

				<CommonChartItemWrapper
					ref="CommonChartItemWrapper"
					chartFactoryContainerName="MaintenanceChartFactoryContainer"
					chartFactoryName="RSSIChart"
					configsKey="maintenanceChartListsConfig"
					chartKey="main"
					:additionalProps="chartProps"
				/>
			</div>

			<div class="mcol-xs-12 mcol-sm-3">
				<div class="label">
					{{ `${tt('phrases.connection_strength_average')}:` }}
				</div>
				<div class="value semi-bold common-title">
					{{ itemData.connection_strength_average }}
				</div>
			</div>

			<div class="mcol-xs-12 mcol-sm-3" v-if="isNCDSDT">
				<div class="label">{{ `${tt('phrases.Sensor_Boot_Time')} (s)` }}</div>
				<el-input-number
					class="mini"
					v-if="itemData.is_ncd_config"
					:controls="false"
					v-model="formData.ncd_config_sensor_boot_time_420ma"
				/>
			</div>

			<div class="mcol-xs-12" v-if="isTempVibeSensor">
				<div class="flex mrow wrap">
					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">
									{{ `${tt('phrases.Frequency_Range')} (Hz)` }}
								</div>
								<div
									class="value semi-bold common-title"
									v-show="itemData.is_ncd_config"
								>
									{{ itemData.ncd_low_frequency }} -
									{{ itemData.ncd_high_frequency }} Hz
								</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('RPM')}:` }}</div>
								<div class="value semi-bold common-title">{{ rpmValue.str }}</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('phrases.output_data_rate')}:` }}</div>
								<CustomSelect
									className="mini"
									:optionsList="outputDataRateList"
									:placeholder="`${tt('select')} ${tt('rate')}`"
									v-model="formData.ncd_config_output_data_rate"
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">
									{{ `${tt('phrases.Sample_Duration')} (ms):` }}
								</div>
								<CustomInput
									class="mini"
									v-if="itemData.is_ncd_config"
									v-model="formData.ncd_config_sampling_duration"
									placeholder=" "
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled enable-filtering-ncd-checkbox">
								<div class="label">{{ `${tt('phrases.enable_filtering')}:` }}</div>
								<el-checkbox
									v-if="itemData.is_ncd_config"
									v-model="formData.ncd_config_filter_status"
									:true-label="1"
									:false-label="0"
								></el-checkbox>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">
									{{ `${tt('phrases.low_pass_filter')} (${tt('High_Limit')})` }}
								</div>
								<div
									class="flex align-center"
									v-if="formData.ncd_config_filter_status"
								>
									<CustomSelect
										class="span-block"
										className="mini"
										:optionsList="passFiltersList"
										:placeholder="`${tt('select')} ${tt('rate')}`"
										v-model="formData.ncd_config_low_pass_filter_coefficient"
									/>
									<span
										v-if="itemData.is_ncd_config"
										class="span-block semi-bold no-wrap"
										>{{
											formData.ncd_config_output_data_rate /
												formData.ncd_config_low_pass_filter_coefficient
										}}
										Hz</span
									>
								</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">
									{{ `${tt('phrases.high_pass_filter')} (${tt('Low_Limit')})` }}
								</div>
								<div
									class="flex align-center"
									v-if="formData.ncd_config_filter_status"
								>
									<CustomSelect
										class="span-block"
										className="mini"
										:optionsList="passFiltersList"
										:placeholder="`${tt('select')} ${tt('rate')}`"
										v-model="formData.ncd_config_high_pass_filter_coefficient"
									/>
									<span
										v-if="itemData.is_ncd_config"
										class="span-block semi-bold no-wrap"
										>{{
											formData.ncd_config_output_data_rate /
												formData.ncd_config_high_pass_filter_coefficient
										}}
										Hz</span
									>
								</div>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label">{{ `${tt('Deadband')} (mg)` }}</div>
								<el-input-number
									class="mini"
									v-if="itemData.is_ncd_config"
									:controls="false"
									v-model="formData.ncd_config_deadband"
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label is-required">
									{{ `${tt('acceleration')} ${tt('phrases.low_cut_filter')}` }}
								</div>
								<el-input-number
									class="mini "
									v-if="isTempVibeSensor"
									:controls="false"
									v-model="formData.fft_acceleration_low_cut_filter"
								/>
							</div>
						</div>
					</div>

					<div class="mcol-xs-6 mcol-sm-3">
						<div class="card no-shadow vertical-fluid">
							<div class="card-content filled">
								<div class="label is-required">
									{{ `${tt('acceleration')} ${tt('phrases.high_cut_filter')}` }}
								</div>
								<el-input-number
									class="mini"
									v-if="isTempVibeSensor"
									:controls="false"
									v-model="formData.fft_acceleration_high_cut_filter"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { getRoundedValue, removeObjProps } from '@/helpers';
import { NCD_REQUEST_STATUSES } from '@/constants/global';
import {
	sensorTypeMixin,
	itemFormMixin,
	webSocketMixin,
	fetchItemsHelper
} from '@/mixins';

export default {
	mixins: [sensorTypeMixin(), itemFormMixin(), webSocketMixin(), fetchItemsHelper()],
	// name: 'NCDSensorPage',

	components: {
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		itemData: { type: Object, required: true }
	},

	data: () => ({
		ncd_socket: null,
		ncd_socket_ready: false,
		formData: {
			ncd_config_output_data_rate: null,
			ncd_config_sampling_duration: '',
			ncd_config_filter_status: true,
			ncd_config_high_pass_filter_coefficient: null,
			ncd_config_low_pass_filter_coefficient: null,
			ncd_config_deadband: 0,
			ncd_config_sensor_boot_time_420ma: 0,
			fft_acceleration_low_cut_filter: 0,
			fft_acceleration_high_cut_filter: 0
		}
	}),

	computed: {
		chartProps: that =>
			Object.freeze({
				useSimpleSpinnerAsPreloader: true,
				nodataMock: true,
				chartInstanceContainerPayload: {
					sensorId: that.itemData.id
				}
			}),

		socketChannelFFT() {
			const { authUser } = this;

			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		},

		currentSensorTypeDataKey: () => 'itemData',

		isTempVibeSensor() {
			const { currentSensorType } = this;
			if (currentSensorType) {
				const {
					isNCDTempVibe,
					isNCDWiredTempVibe,
					isNCDTempVibeCurr
				} = currentSensorType;

				return isNCDTempVibe || isNCDWiredTempVibe || isNCDTempVibeCurr;
			}

			return false;
		},

		isNCDSDT: that => that.currentSensorType.isNCDSDT,

		rpmValue() {
			if (this.isTempVibeSensor) {
				return {
					str: `${this.itemData.equipment_rpm} (
						${getRoundedValue(this.itemData.equipment_rpm / 60, 0, 2)}
					 Hz)`,
					value: this.itemData.equipment_rpm
				};
			}
			return {
				str: '',
				value: null
			};
		},

		outputDataRateList: () =>
			Object.freeze([
				{ id: 100, name: '100' },
				{ id: 200, name: '200' },
				{ id: 400, name: '400' },
				{ id: 800, name: '800' },
				{ id: 1600, name: '1600' },
				{ id: 3200, name: '3200' },
				{ id: 6400, name: '6400' },
				{ id: 12800, name: '12800' },
				{ id: 25600, name: '25600' }
			]),

		passFiltersList: () =>
			Object.freeze([
				{ id: 4, name: '4' },
				{ id: 8, name: '8' },
				{ id: 16, name: '16' },
				{ id: 32, name: '32' },
				{ id: 64, name: '64' },
				{ id: 128, name: '128' },
				{ id: 256, name: '256' },
				{ id: 512, name: '512' },
				{ id: 1024, name: '1024' },
				{ id: 2048, name: '2048' }
			])

		/*uploadSettings: () => ({
			fileProp: 'file'
		})*/
	},

	methods: {
		...mapActions({
			save_item: 'sensors/request_ncd_config'
		}),

		localValidationHook() {
			let next = [true];
			const {
				fft_acceleration_low_cut_filter,
				fft_acceleration_high_cut_filter
			} = this.formData;

			if (this.isTempVibeSensor) {
				next.push(
					!!fft_acceleration_low_cut_filter &&
						!!fft_acceleration_high_cut_filter &&
						fft_acceleration_low_cut_filter < fft_acceleration_high_cut_filter
				);
			}

			if (next.every(v => v)) {
				return true;
			} else {
				const { tt } = this;
				let message = `${tt('phrases.check_form_fields')}: `;
				if (!fft_acceleration_low_cut_filter && !fft_acceleration_high_cut_filter) {
					message += `${tt('acceleration')} ${tt('phrases.low_cut_filter')}, ${tt(
						'acceleration'
					)} ${tt('phrases.high_cut_filter')}.`;
				}
				if (fft_acceleration_low_cut_filter > fft_acceleration_high_cut_filter) {
					message += ` ${tt('acceleration')} ${tt('phrases.low_cut_filter')}, ${tt(
						'phrases.should_be_lower_than'
					)} ${tt('acceleration')} ${tt('phrases.high_cut_filter')}.`;
				}
				this.$notify({
					type: 'warning',
					title: tt('phrases.form_isnt_ready'),
					message: message
				});
				return false;
			}
		},

		localPrepareSubmitData(data) {
			let formData = { ...data };
			delete formData.id;

			if (!this.isNCDSDT) {
				delete formData.ncd_config_sensor_boot_time_420ma;
			}
			if (!this.isTempVibeSensor) {
				formData = removeObjProps(formData, [
					'ncd_config_output_data_rate',
					'ncd_config_sampling_duration',
					'ncd_config_filter_status',
					'ncd_config_high_pass_filter_coefficient',
					'ncd_config_low_pass_filter_coefficient',
					'ncd_config_deadband',
					'fft_acceleration_low_cut_filter',
					'fft_acceleration_high_cut_filter'
				]);
			}

			if (!formData.ncd_config_filter_status) {
				formData = removeObjProps(formData, [
					'ncd_config_high_pass_filter_coefficient',
					'ncd_config_low_pass_filter_coefficient'
				]);
			}

			return formData;
		},

		localSubmit(formData) {
			let payload = {
				sensorId: this.itemData.id,
				data: formData,
				itemName: 'Config'
			};
			if (this.localValidationHook()) {
				// console.log(payload)
				this.$emit('event', { eventName: 'toggleSaving', data: true });

				this.save_item(payload)
					.then(response => {
						// console.log(response)
						if (response.value == 'processing') {
							this.handleConfigRequest(response);
						} else if (response.value == 'processed') {
							this.$emit('event', { eventName: 'successModalSubmit', data: null });
							this.$emit('event', { eventName: 'handleCloseEditModal' });
						}
						// setTimeout(() => {
						this.$emit('event', { eventName: 'toggleSaving', data: false });
						// }, 100);
					})
					.catch(() => {
						this.$emit('event', { eventName: 'toggleSaving', data: false });
					});
			}
		},

		handleConfigRequest() {
			try {
				// console.log(response)
				// const fft_request_id = response.value.id;

				this.setupWebSocket({
					socketName: 'ncd_socket',
					socketNameReadyProp: 'ncd_socket_ready',
					socketChannel: this.socketChannelFFT,
					localHandleError: this.configRequestWebsocketErrorHandler,
					socketCallbackName: 'configRequest_socketCallback',
				});

				this.toggleMainPreloader(true, `${this.tt('phrases.working_config')}...`);
			} catch (e) {
				console.log(e);
			}
		},

		configRequest_socketCallback({ type, data }) {
			// console.log(type, data)
			if (type == 'ncd.command' && data.sensor_id === this.itemData.id) {
				if (data.status == NCD_REQUEST_STATUSES.SUCCESS) {
					this.$notify({
						type: 'success',
						title: this.tt('Success'),
						message: this.tt('phrases.ncd_config_saved_successfully')
					});
					this.closeWebSocket({ socketName: 'ncd_socket' });
					this.toggleMainPreloader(false);
					this.$emit('event', { eventName: 'successModalSubmit', data: data });
					this.$emit('event', { eventName: 'handleCloseEditModal' });
				}

				if (data.status == NCD_REQUEST_STATUSES.FAIL) {
					this.$notify({
						type: 'warning',
						title: this.tt('Fail'),
						message: this.tt('phrases.error_check_controller_connectivity'),
						duration: 0
					});
					this.closeWebSocket({ socketName: 'ncd_socket' });
					this.toggleMainPreloader(false);
				}
				// this.pdfReportURL = reportURL;
			}
		},

		configRequestWebsocketErrorHandler(err) {
			console.warn(err);
			this.toggleMainPreloader(false);
			this.$notify({
				type: 'warning',
				title: this.tt('Fail'),
				message: this.tt('phrases.web_socket_error'),
				duration: 0
			});
			this['ncd_socket'].close();
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
		}

		/*successSubmitCallback() {
			this.fetch_global_plants({ params: { max: -1 } });
		}*/
	},

	watch: {
		/*itemData(sensor) {
			if (sensor) {
				this.fetchEquipment(sensor.equipment_id);
			}
		}*/
	},

	beforeMount() {
		const { value } = this.rpmValue;
		const {
			fft_acceleration_low_cut_filter,
			fft_acceleration_high_cut_filter
		} = this.formData;

		if (
			value &&
			(!fft_acceleration_low_cut_filter, !fft_acceleration_high_cut_filter)
		) {
			if (value < 600) {
				this.formData.fft_acceleration_low_cut_filter = 100;
				this.formData.fft_acceleration_high_cut_filter = 280;
			} else if (600 <= value && value <= 3600) {
				this.formData.fft_acceleration_low_cut_filter = 400;
				this.formData.fft_acceleration_high_cut_filter = 1120;
			} else if (value > 3600) {
				this.formData.fft_acceleration_low_cut_filter = 800;
				this.formData.fft_acceleration_high_cut_filter = 2240;
			}
		}
	},

	beforeDestroy() {
		this.closeWebSocket({ socketName: 'ncd_socket' });
	}
};
</script>
