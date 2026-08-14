<template>
	<div class="popover-content flex mrow wrap justify-end triangle pos-top charts-page-operations">
		<PDFandFFTrequestsBlock
			v-if="!enableLubeTriggerButtonOnly"
			class="p-0"
			:sensorData="sensorData"
			:currentSensorType="currentSensorType"
		/>

		<div
			v-for="item in actionButtons"
			:key="`action_button-${item.id}`"
			class="button-item relative"
		>
			<SimpleSpinner v-if="item.loadingProp === 'adjustmentLoading'" :active="gainAdjustmentInProcess" />
			<SimpleSpinner v-else-if="item.loadingProp === 'purgeLoading'" :active="sendingDXMCommandRequest || processingDXMCommandRequest" />

			<el-button
				type="primary"
				native-type="button"
				:class="item.className"
				@click="item.method ? callMethod(item.method, item.args) : event(item.event, item.args)"
			>
				{{ item.text }}
			</el-button>
		</div>

		<el-dialog
			v-if="initiatedLubeCycleDialog"
			v-model="lubeCycleRequestDialogOpen"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-request-dialog"
			:title="`${tt('Trigger')} ${tt('Lube_Cycle')}`"
		>
			<VueElementLoadingWrapper
				:isLoading="processingDXMCommandRequest"
				:text="tt('phrases.Sending_Lube_Cycle_Request')"
			/>

			<div v-if="!lubeCycleRequestResult" class="card-content flex justify-center">
				<div class="article-title content-row">
					{{ tt('phrases.Do_you_really_want_to') }}
					<b>{{ `${tt('start')} ${tt('lubrication')} ${tt('cycle')}` }}</b>
					{{ lubeCycleConfirmPostfix }}
				</div>
			</div>

			<div v-else class="card-content flex justify-center">
				<div class="vertical-fluid">
					<div class="caption">
						<i :class="['span-block', lubeCycleRequestResult.isSuccess ? 'el-icon-success success-color' : 'el-icon-warning warning-color']"></i>
						<span class="span-block text semi-bold" v-text="lubeCycleRequestResult.message"></span>
					</div>
				</div>
			</div>

			<template #footer>
				<div class="dialog-footer section-row text-center">
					<el-button v-if="!lubeCycleRequestResult || !lubeCycleRequestResult.isSuccess" @click="lubeCycleRequestDialogOpen = false">
						{{ tt('Cancel') }}
					</el-button>

					<el-button
						v-if="lubeCycleRequestResult"
						type="primary"
						class="capitalize"
						@click="handleLubeCycleResult(lubeCycleRequestResult)"
					>
						{{ lubeCycleRequestResult.isSuccess ? 'Ok' : tt('Retry') }}
					</el-button>

					<el-button
						v-else
						:loading="sendingDXMCommandRequest"
						type="primary"
						class="capitalize"
						@click="triggerLubeCycle"
					>
						{{ tt('Confirm') }}
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { ADJUSTMENT_ACTIONS_TYPES, ULTRASOUND_SENSOR_TYPES } from '@/constants/ultrasound';
import { DXM_COMMANDS_REQUEST_STATUSES } from '@/constants/global';
import { useActionButtons } from '@/composables/mixins/useActionButtons';
import { useCallMethod } from '@/composables/mixins/useEmitter';
import { useWebSocket } from '@/composables/mixins/useWebSocket';
import { useSensors } from '@/composables/useSensors';
import { useNotify } from '@/composables/useNotify';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useAuthStore } from '@/stores/AuthStore';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import PDFandFFTrequestsBlock from './PDFandFFTrequestsBlock.vue';

const { tt } = Lang;
const { gainAdjustment, toggleUltrasoundCommand } = useSensors();

defineOptions({
	name: 'UltrasoundFilterBlock',
});

const props = defineProps({
	sensorData: { type: Object, default: () => ({}) },
	currentSensorType: { type: Object, default: () => ({}) },
	showHistory: Boolean,
	isLubeMatrixV3: Boolean,
	enableLubeTriggerButtonOnly: Boolean,
});

const emit = defineEmits(['event']);
const { confirmHelper } = useActionButtons({ emit });
const { Notify } = useNotify();
const sensorsStore = useSensorsStore();
const authStore = useAuthStore();
const { gainAdjustmentInProcess } = storeToRefs(sensorsStore);
const { setupWebSocket, closeWebSocket } = useWebSocket();

const initiatedLubeCycleDialog = ref(false);
const lubeCycleRequestDialogOpen = ref(false);
const lubeCycleRequestResult = ref(null);
const sendingDXMCommandRequest = ref(false);
const processingDXMCommandRequest = ref(false);
const lubeShotDataFromSocket = ref({});
const lubeShotId = ref(null);
const dxmCommandSocketReady = ref(false);

const DXM_COMMAND_SOCKET_NAME = 'dxm_command_socket';

const sensorId = computed(() => props.sensorData.id);
const socketChannelDXMCommandRequest = computed(() =>
	authStore.authUser?.uuid ? `user.${authStore.authUser.uuid}` : '',
);
const isSensorOnly = computed(() => props.sensorData.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY);
const lubeCycleConfirmPostfix = computed(() =>
	Lang.currentLangId === LANGUAGE_TYPES.ENGLISH ? ' Action? Continue?' : '?',
);
const actionButtons = computed(() => {
	const buttons = [];

	if (!props.enableLubeTriggerButtonOnly) {
		if (authStore.hasAccessTo(['edit_dashboard'])) {
			buttons.push(
				{
					id: 13,
					text: `${tt('Gain')} +`,
					method: 'toggleGainAdjustment',
					args: ADJUSTMENT_ACTIONS_TYPES.INCREASE,
					loadingProp: 'adjustmentLoading',
					className: 'inverted report-button',
				},
				{
					id: 14,
					text: `${tt('Gain')} -`,
					method: 'toggleGainAdjustment',
					args: ADJUSTMENT_ACTIONS_TYPES.DECREASE,
					loadingProp: 'adjustmentLoading',
					className: 'inverted report-button',
				},
			);
		}

		buttons.push(
			{
				id: 3,
				text: `${tt('Toggle')} ${tt('History')}`,
				event: 'toggleHistory',
			},
			{
				id: 4,
				text: `${tt('High_speed')} ${tt('On')}`,
				method: 'toggleHighSpeed',
				args: true,
			},
			{
				id: 5,
				text: `${tt('High_speed')} ${tt('Off')}`,
				method: 'toggleHighSpeed',
				args: false,
			},
		);

		if (
			(props.currentSensorType.isUltrasound || props.isLubeMatrixV3) &&
			!isSensorOnly.value
		) {
			buttons.push(
				{
					id: 1,
					text: `${tt('Purge_Mode')} ${tt('On')}`,
					method: 'togglePurgeMode',
					args: true,
					loadingProp: 'purgeLoading',
				},
				{
					id: 2,
					text: `${tt('Purge_Mode')} ${tt('Off')}`,
					method: 'togglePurgeMode',
					args: false,
				},
				{
					id: 6,
					text: `${tt('Trigger')} ${tt('Lube_Cycle')}`,
					method: 'handleLubeCycle',
					loadingProp: 'purgeLoading',
				},
			);
		}
	} else {
		buttons.push({
			id: 6,
			text: `${tt('Trigger')} ${tt('Lube_Cycle')}`,
			method: 'handleLubeCycle',
			loadingProp: 'purgeLoading',
		});
	}

	return buttons;
});

const event = (name, data) => {
	emit('event', {
		eventName: name,
		data,
		onward: true,
	});
};

const toggleGainAdjustment = (action) => {
	if (!sensorId.value) return;
	if (props.sensorData.is_inactive) {
		Notify({
			type: 'warning',
			title: tt('Error'),
			message: `${tt('Sensor')} ${tt('Offline')}`,
		});
		return;
	}

	const gainText = action === ADJUSTMENT_ACTIONS_TYPES.INCREASE
		? tt('Increase')
		: tt('Decrease');

	confirmHelper({
		message: `${tt('phrases.do_you_really_want_to')} <b>${gainText}</b> ${tt('phrases.the_Sensor_Gain')}?`,
	})
		.then(() => {
			sensorsStore.set_sensor_state({ stateProp: 'gainAdjustmentInProcess', value: true });
			return gainAdjustment({
				sensorId: sensorId.value,
				data: { action },
			});
		})
		.catch(() => {})
		.finally(() => {
			sensorsStore.set_sensor_state({ stateProp: 'gainAdjustmentInProcess', value: false });
		});
};

const toggleHighSpeed = (enabled) => {
	if (!sensorId.value) return;
	const action = enabled ? 'start' : 'stop';

	confirmHelper({
		insertToMessage: `<b>${tt(action)} ${tt('High_speed')}</b>`,
	})
		.then(() => toggleUltrasoundCommand({
			url: `/ultrasound/commands/${sensorId.value}/${action}/high-speed`,
			resultMessage: {
				text: `${tt('High_speed')} ${tt('has')} ${
					enabled ? tt('started') : tt('stopped')
				}`,
			},
		}))
		.then(() => {
			event('update_sensor', {
				id: sensorId.value,
				sensor: { ...props.sensorData, lube_cycle_high_speed: enabled },
			});
		})
		.catch(() => {});
};

const handleLubeCycle = () => {
	initiatedLubeCycleDialog.value = true;
	lubeCycleRequestDialogOpen.value = true;
	lubeCycleRequestResult.value = null;
};

const handleLubeCycleSocketFinish = (result) => {
	lubeCycleRequestResult.value = result;
	lubeShotDataFromSocket.value = {};
	processingDXMCommandRequest.value = false;
	closeWebSocket({ socketName: DXM_COMMAND_SOCKET_NAME });
};

const dxmCommandSocketCallback = (payload, eventType) => {
	const socketMessage = eventType ? { type: eventType, data: payload } : payload || {};
	const { type, data = {} } = socketMessage;
	const safeData = data.data || data || {};

	if (type === 'LUBRICATION.SHOT') {
		if (
			safeData.id !== undefined &&
			safeData.id !== null &&
			String(safeData.id) === String(lubeShotId.value)
		) {
			lubeShotDataFromSocket.value = safeData;
		}
		return;
	}

	const shotMatches = String(safeData.lube_shot_id) === String(lubeShotId.value);
	const status = String(safeData.status);

	if (type === 'DXM.COMMAND' && safeData.controller_id === props.sensorData.controller_id) {
		if (status === String(DXM_COMMANDS_REQUEST_STATUSES.SUCCESS)) {
			if (shotMatches && safeData.type === 3) {
				event('handleUltrasoundWebSocketSuccess', lubeShotDataFromSocket.value);
			}
			handleLubeCycleSocketFinish({
				isSuccess: true,
				message: `DXM ${tt('requesting')} ${tt('Successfull')}`,
			});
		} else if (status === String(DXM_COMMANDS_REQUEST_STATUSES.FAIL)) {
			handleLubeCycleSocketFinish({
				isSuccess: false,
				message: `${tt('Error')} - ${tt('phrases.check_controller_connectivity')}`,
			});
		}
		return;
	}

	if (String(type) === '3' && String(data.lube_shot_id) === String(lubeShotId.value)) {
		event('handleUltrasoundWebSocketSuccess', data);
		handleLubeCycleSocketFinish({
			isSuccess: true,
			message: `DXM ${tt('requesting')} ${tt('Successfull')}`,
		});
	}
};

const sendRequestDXMCommand = (payload, settings = {}) => {
	sendingDXMCommandRequest.value = true;
	processingDXMCommandRequest.value = true;

	return toggleUltrasoundCommand(payload)
		.then((response) => {
			const responseData = response?.data || response || {};
			const value = responseData.value || response?.value || responseData.data || {};

			if (settings.isLubeShotRequest) {
				lubeShotId.value = value?.id ?? responseData.id ?? null;
				lubeShotDataFromSocket.value =
					value && typeof value === 'object' ? value : {};
			}

			if (responseData.status === false) {
				throw new Error(responseData.message || tt('Error'));
			}
		})
		.catch((error) => {
			const responseData = error?.response?.data || error?.data || error || {};
			const message = responseData.status || responseData.message || error?.message || tt('Error');
			Notify({
				type: 'error',
				title: tt('Error'),
				message,
			});
			handleLubeCycleSocketFinish({
				isSuccess: false,
				message,
			});
		})
		.finally(() => {
			sendingDXMCommandRequest.value = false;
		});
};

const initiateSetupWebSocket = (payload, settings = {}) => {
	processingDXMCommandRequest.value = true;

	const socket = setupWebSocket({
		socketName: DXM_COMMAND_SOCKET_NAME,
		socketReadyRef: dxmCommandSocketReady,
		socketChannel: socketChannelDXMCommandRequest.value,
		onMessage: dxmCommandSocketCallback,
		subscriptionSuccededCallback: () => sendRequestDXMCommand(payload, settings),
	});

	if (!socket) {
		handleLubeCycleSocketFinish({
			isSuccess: false,
			message: tt('phrases.web_socket_error'),
		});
	}
};

const triggerLubeCycle = () => {
	lubeShotId.value = null;
	lubeShotDataFromSocket.value = {};
	lubeCycleRequestResult.value = null;

	const payload = {
		url: `/ultrasound/commands/${sensorId.value}/start/lubrication`,
		resultMessage: { text: tt(`phrases.manual_lubrication_command_sent`) },
	};

	initiateSetupWebSocket(payload, { isLubeShotRequest: true });
};

const togglePurgeMode = (enabled) => {
	if (!sensorId.value) return;
	const action = enabled ? 'start' : 'stop';
	lubeShotId.value = null;

	confirmHelper({
		insertToMessage: `<b>${tt(action)} ${tt('lubrication')}</b>`,
	})
		.then(() => {
			initiateSetupWebSocket({
				url: `/ultrasound/commands/${sensorId.value}/${action}/lubrication${
					enabled ? '?autoStop=0' : ''
				}`,
				resultMessage: {
					text: `${tt('phrases.Purge_Mode_is')} ${enabled ? tt('On') : tt('Off')}`,
				},
			});
		})
		.catch(() => {});
};

const handleLubeCycleResult = ({ isSuccess }) => {
	if (isSuccess) {
		lubeCycleRequestDialogOpen.value = false;
	}
	setTimeout(() => {
		lubeCycleRequestResult.value = null;
	}, 200);
};

const { callMethod } = useCallMethod({
	toggleGainAdjustment,
	toggleHighSpeed,
	togglePurgeMode,
	handleLubeCycle,
});
</script>
