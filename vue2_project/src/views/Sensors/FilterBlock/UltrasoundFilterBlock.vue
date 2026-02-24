<template>
	<div
		class="popover-content flex mrow wrap justify-end triangle pos-top charts-page-operations"
	>
		<!-- v-if="currentSensorType.isUltrasound" -->
		<PDFandFFTrequestsBlock
			class="p-0"
			:sensorData="sensorData"
			:currentSensorType="currentSensorType"
			v-if="!enableLubeTriggerButtonOnly"
		/>

		<div
			class="button-item relative"
			v-for="item in actionButtons"
			:key="`action_button-${item.id}`"
		>
			<SimpleSpinner
				v-if="item.loadingProp == 'adjustmentLoading'"
				:active="gainAdjustmentInProcess"
			/>
			<SimpleSpinner
				v-else-if="item.loadingProp == 'purgeLoading'"
				:active="sendingDXMCommandRequest || processingDXMCommandRequest"
			/>

			<el-button
				@click="
					() => {
						item.method
							? callMethod(item.method, item.args)
							: event(item.event, item.args);
					}
				"
				type="primary"
				native-type="button"
				:class="item.className"
				v-text="item.text"
			/>
		</div>

		<el-dialog
			v-if="initiatedLubeCycleDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-request-dialog"
			:title="`${tt('Trigger')} ${tt('Lube_Cycle')}`"
			:visible.sync="lubeCycleRequestDialogOpen"
		>
			<VueElementLoadingWrapper
				:isLoading="processingDXMCommandRequest"
				:text="tt('phrases.Sending_Lube_Cycle_Request')"
			/>

			<div class="card-content flex justify-center" v-if="!lube_cycle_request_result">
				<div class="">
					<div class="article-title content-row">
						{{ `${tt('phrases.Do_you_really_want_to')}` }}
						<b>{{ `${tt('start')} ${tt('lubrication')} ${tt('cycle')}` }}</b>
						{{
							$Lang.currentLangId == LANGUAGE_TYPES.ENGLISH
								? ' Action? Continue?'
								: '?'
						}}
					</div>
				</div>
			</div>

			<div class="card-content flex justify-center" v-else>
				<div class="vertical-fluid">
					<div class="caption">
						<i
							:class="[
								'span-block',
								lube_cycle_request_result.isSuccess
									? 'el-icon-success success-color'
									: 'el-icon-warning warning-color'
							]"
						></i>
						<span
							class="span-block text semi-bold"
							v-text="lube_cycle_request_result.message"
						></span>
					</div>
				</div>
			</div>

			<div slot="footer" class="dialog-footer section-row text-center ">
				<el-button
					v-if="!lube_cycle_request_result || !lube_cycle_request_result.isSuccess"
					@click="lubeCycleRequestDialogOpen = false"
					>{{ tt('Cancel') }}</el-button
				>

				<el-button
					v-if="lube_cycle_request_result"
					type="primary"
					@click="handleLubeCycleResult(lube_cycle_request_result)"
					class="capitalize"
				>{{ lube_cycle_request_result.isSuccess ? `Ok` : `${tt('Retry')}` }}</el-button>

				<el-button
					v-else
					:loading="sendingDXMCommandRequest"
					type="primary"
					@click="triggerLubeCycle"
					class="capitalize"
					>{{ tt('Confirm') }}</el-button
				>
			</div>
		</el-dialog>

		<!-- <div class="button-item" v-if="sensorData.type === SENSOR_TYPES.ULTRA_SOUND">
			<el-button
				@click="handleAction('stop', 'lubrication')"
				type="primary"
				native-type="button"
				class="inverted report-button"
				v-text="'Lubrication Off'"
			/>
		</div> -->
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
// import { cleanObjValues } from '@/helpers';
import { rebase_lines, rebase_wheel, SENSOR_TYPES, DXM_COMMANDS_REQUEST_STATUSES } from '@/constants/global';
import { LANGUAGE_TYPES } from '@/localization/utils';

import {
	ADJUSTMENT_ACTIONS_TYPES, /*, gainAdjustmentActionsList*/
	ULTRASOUND_SENSOR_TYPES
} from '@/constants/ultrasound';

import { actionButtonsMixin, webSocketMixin } from '@/mixins';

export default {
	mixins: [actionButtonsMixin(), webSocketMixin()],
	components: {
		PDFandFFTrequestsBlock: () => import('./PDFandFFTrequestsBlock.vue')
	},
	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},
		currentSensorType: Object,
		showHistory: Boolean,
		isLubeMatrixV3: Boolean,
		enableLubeTriggerButtonOnly: Boolean
	},

	data() {
		return {
			isPurgeOn: false,
			loadingProps: {
				adjustmentLoading: false
			},

			initiatedLubeCycleDialog: false,
			lubeCycleRequestDialogOpen: false,
			lube_cycle_request_result: null,

			lubeShotDataFromSocket: {},			
			lube_shot_id: null,
			sendingDXMCommandRequest: false,
			processingDXMCommandRequest: false,
			dxm_command_socket: null,
			dxm_command_socket_ready: false,
		};
	},

	computed: {
		...mapState({
			// levelZonesSaving: state => state.sensors.levelZonesSaving,
			authUser: state => state.auth.authUser,
			gainAdjustmentInProcess: state => state.sensors.gainAdjustmentInProcess
		}),
		rebase_wheel: () => rebase_wheel,
		rebase_lines: () => rebase_lines,
		SENSOR_TYPES: () => SENSOR_TYPES,
		LANGUAGE_TYPES: () => LANGUAGE_TYPES,

		sensorId: that => that.sensorData.id,
		isSensorOnly: that => that.sensorData.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY,

		socketChannelDXMCommandRequest() {
			const { authUser } = this;

			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		},

		actionButtons() {
			const { currentSensorType, tt, isSensorOnly, isLubeMatrixV3 } = this;

			let buttons = [];

			if (!this.enableLubeTriggerButtonOnly) {
				if (this.$hasAccessTo(['edit_dashboard'])) {
					buttons.push(
					{
						id: 13,
						text: `${tt('Gain')} +`,
						method: 'toggleGainAdjustment',
						args: ADJUSTMENT_ACTIONS_TYPES.INCREASE,
						loadingProp: 'adjustmentLoading'
					},
					{
						id: 14,
						text: `${tt('Gain')} -`,
						method: 'toggleGainAdjustment',
						args: ADJUSTMENT_ACTIONS_TYPES.DECREASE,
						loadingProp: 'adjustmentLoading'
					}
					);
				}

				buttons.push(
					{
						id: 3,
						text: `${tt('Toggle')} ${tt('History')}`,
						event: 'toggleHistory'
					},
					{
						id: 4,
						text: `${tt('High_speed')} ${tt('On')}`,
						method: 'toggleHighSpeed',
						args: true
					},
					{
						id: 5,
						text: `${tt('High_speed')} ${tt('Off')}`,
						method: 'toggleHighSpeed',
						args: false
					}
				);

				if ((currentSensorType.isUltrasound || isLubeMatrixV3) && !isSensorOnly) {
					buttons.push(
						{
							id: 1,
							text: `${tt('Purge_Mode')} ${tt('On')}`,
							method: 'togglePurgeMode',
							args: true,
							loadingProp: 'purgeLoading'
						},
						{
							id: 2,
							text: `${tt('Purge_Mode')} ${tt('Off')}`,
							method: 'togglePurgeMode',
							args: false
						},
						{
							id: 6,
							text: `${tt('Trigger')} ${tt('Lube_Cycle')}`,
							method: 'handleLubeCycle',
							loadingProp: 'purgeLoading'
						}
					);
				}
			} else {
				buttons.push(
					{
						id: 6,
						text: `${tt('Trigger')} ${tt('Lube_Cycle')}`,
						method: 'handleLubeCycle',
						loadingProp: 'purgeLoading'
					}	
				)
			}

			return Object.freeze(buttons);
		}
	},

	methods: {
		...mapActions({
			toggle_ultrasound_command: 'sensors/toggle_ultrasound_command',
			gain_adjustment: 'sensors/gain_adjustment',
			set_sensor_state: 'sensors/set_sensor_state'
		}),

		togglePurgeMode(val) {
			const action = val ? 'start' : 'stop';
			const { tt } = this;
			this.lube_shot_id = null;

			this.confirmHelper({
				insertToMessage: `<b>${tt(action)} ${tt('lubrication')}</b>`
			})
				.then(() => {
					const payload = {
						url: `/ultrasound/commands/${this.sensorId}/${action}/lubrication${
							val ? '?autoStop=0' : ''
						}`,
						resultMessage: {
							text: `${tt('phrases.Purge_Mode_is')} ${val ? tt('On') : tt('Off')}`
						}
					};

					this.sendingDXMCommandRequest = true;

					// console.log('togglePurgeMode', payload)
					this.toggle_ultrasound_command(payload)
						.then(response => {
							// this.lube_shot_id = response.data.lube_shot_id;
							this.sendingDXMCommandRequest = false;
							this.handleDXMCommandResponse(response);
						})
						.catch((response) => {
							this.sendingDXMCommandRequest = false;
							const responseData = response.data || response;
							if (responseData.status) {
								this.$notify({
									type: 'error',
									title: tt('Error'),
									message: responseData.status
								});
							}
						});

					/*this.toggle_ultrasound_command(payload).then(() => {
						this.isPurgeOn = val;
					});*/
				})
				.catch(() => {});
		},

		toggleHighSpeed(val) {
			const action = val ? 'start' : 'stop';
			const { tt } = this;

			this.confirmHelper({
				insertToMessage: `<b>${tt(action)} ${tt('High_speed')}</b>`
			})
				.then(() => {
					const payload = {
						url: `/ultrasound/commands/${this.sensorId}/${action}/high-speed`,
						resultMessage: {
							text: `${tt('High_speed')} ${tt('has')} ${
								val ? tt('started') : tt('stopped')
							}`
						}
					};

					// console.log('toggleHighSpeed', payload)

					this.toggle_ultrasound_command(payload).then(() => {
						/*this.event('update_sensor', {
							id: this.sensorData.id,
							sensor: { ...this.sensorData, lube_cycle_high_speed: val }
						});*/

						this.$emit('event', {
							eventName: 'update_sensor',
							data: {
								id: this.sensorData.id,
								sensor: { ...this.sensorData, lube_cycle_high_speed: val }
							}
						});
					});
				})
				.catch(() => {});
		},

		handleLubeCycle() {
			this.initiatedLubeCycleDialog = true;
			this.lubeCycleRequestDialogOpen = true;
		},

		triggerLubeCycle() {
			const { tt } = this;

			this.lube_shot_id = null;
			this.lubeShotDataFromSocket = null;
			this.lube_cycle_request_result = null;

			const payload = {
				url: `/ultrasound/commands/${this.sensorId}/start/lubrication`,
				resultMessage: { text: tt(`phrases.manual_lubrication_command_sent`) },
			};

			// console.log('triggerLubeCycle', payload)
			this.sendingDXMCommandRequest = true;

			/*if (payload) {
				console.log(payload)
				this.processingDXMCommandRequest = true;
				return
			}*/

			this.toggle_ultrasound_command(payload)
				.then(({value}) => {
					this.lube_shot_id = value.id;
					this.lubeShotDataFromSocket = value;
					this.sendingDXMCommandRequest = false;
					this.handleDXMCommandResponse(value);
				})
				.catch(() => {
					// console.log('catch', response)
					this.sendingDXMCommandRequest = false;
				});
		},

		handleLubeCycleResult({ isSuccess }) {
			if (isSuccess) {
				this.lubeCycleRequestDialogOpen = false;
			}
			setTimeout(() => {
				this.lube_cycle_request_result = null;
			}, 200);
		},

		toggleGainAdjustment(val) {
			const { tt } = this;
			if (this.sensorData.is_inactive) {
				this.$notify({
					type: 'warning',
					title: tt('Error'),
					message: `${tt('Sensor')} ${tt('Offline')}`
				});
			} else {
				const gainText =
					val == ADJUSTMENT_ACTIONS_TYPES.INCREASE ? tt('Increase') : tt('Decrease');

				this.confirmHelper({
					message: `${tt('phrases.do_you_really_want_to')} <b>${gainText}</b> ${tt(
						'phrases.the_Sensor_Gain'
					)}?`
				})
					.then(() => {
						this.set_sensor_state({
							stateProp: 'gainAdjustmentInProcess',
							value: true
						});
						// console.log('toggleGainAdjustment')
						this.gain_adjustment({
							sensorId: this.sensorData.id,
							data: { action: val }
						})
							.then((/*response*/) => {
								// console.log(response);
							})
							.catch(() => {
								this.set_sensor_state({
									stateProp: 'gainAdjustmentInProcess',
									value: false
								});
							});
					})
					.catch(() => {});
			}
		},

		handleDXMCommandResponse() {
			try {
				this.processingDXMCommandRequest = true;
				this.setupWebSocket({
					socketName: 'dxm_command_socket',
					socketNameReadyProp: 'dxm_command_socket_ready',
					socketChannel: this.socketChannelDXMCommandRequest,
					socketCallbackName: 'dxmCommand_socketCallback',
				});

				// this.toggleMainPreloader(true, `${this.tt('phrases.working_config')}...`);
			} catch (e) {
				console.log(e);
			}
		},

		dxmCommand_socketCallback(response = {}) {
			const { type, data } = response;
			// console.log('dxmCommand_socketCallback', response)

			const { tt } = this;

			/*if (type === 'LUBRICATION.SHOT') {
				this.lubeShotDataFromSocket[data.id] = data;
			} else*/
			if (type === 'DXM.COMMAND' && data.controller_id === this.sensorData.controller_id) {
				let isSuccess = false;
				let message = '';

				if (data.status == DXM_COMMANDS_REQUEST_STATUSES.SUCCESS) {
					// const lubeShotData = this.lubeShotDataFromSocket[data.lube_shot_id];
					if ((data.lube_shot_id === this.lube_shot_id) && data.type === 3) {
						this.$emit('event', {
							eventName: 'handleUltrasoundWebSocketSuccess',
							data: this.lubeShotDataFromSocket,
							onward: true
						});
					}

					message = `DXM ${tt('requesting')} ${tt('Successfull')}`;
					isSuccess = true;
					this.handleLubeCycleSocketFinish({ isSuccess, message });
				}

				if (data.status == DXM_COMMANDS_REQUEST_STATUSES.FAIL) {
					message = `${tt('Error')} - ${tt('phrases.check_controller_connectivity')}`;

					this.handleLubeCycleSocketFinish({ isSuccess, message });
				}
			}

			/*if (type === 3 && data.lube_shot_id === this.lube_shot_id) {
				this.closeWebSocket({ socketName: 'dxm_command_socket' });
				this.processingDXMCommandRequest = false;
			}*/
		},

		handleLubeCycleSocketFinish(result) {
			this.lube_cycle_request_result = result;

			this.lubeShotDataFromSocket = null;
			this.processingDXMCommandRequest = false;
		},
	}
};
</script>
