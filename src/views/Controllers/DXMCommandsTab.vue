<template>
	<div class="dxm-controllers-commands-form">
		<div class="mrow flex wrap">
			<div class="mcol-xs-12 mcol-sm-5 main-part">
				<div class="custom-form-item el-form-item">
					<div class="el-form-item__label">{{ tt('Controller') }} id</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="controllerData.id"
					></div>
				</div>

				<div class="custom-form-item el-form-item content-row">
					<div class="el-form-item__label">UUID</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="controllerData.uuid"
					></div>
				</div>

				<CommandItem
					v-for="item in commandsList"
					:key="`command_item-${item.id}`"
					class="content-row"
					:itemData="item"
					:isProcessing="sendingDXMCommandRequest || processingDXMCommandRequest"
					@onSend="handleSendDXMCommand"
				/>
			</div>

			<div class="mcol-xs-12 mcol-sm-7 history-part">
				<div class="card">
					<div class="card-header filled uppercase bold">{{ tt('History') }}</div>
				</div>

				<div class="card-content">
					<SimpleSpinner :active="commandsHistoryListLoading" />

					<CommandsHistoryItem
						v-for="item in commandsHistoryList"
						:key="`history_item-${item.id}`"
						:itemData="item"
					/>

					<div v-if="!commandsHistoryList.length" class="text-center">
						{{ `${tt('History')} ${tt('is_empty')}` }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { CONTROLLER_TOPIC_TYPES, DXM_COMMANDS_REQUEST_STATUSES } from '@/constants/global';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useNotify } from '@/composables/useNotify';
import { useWebSocket } from '@/composables/mixins/useWebSocket';
import { useAuthStore } from '@/stores/AuthStore';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const CommandItem = defineAsyncComponent(() => import('./CommandItem.vue'));
const CommandsHistoryItem = defineAsyncComponent(() => import('./CommandsHistoryItem.vue'));

const { tt } = Lang;
const { Notify } = useNotify();

defineOptions({
	name: 'DXMCommandsTab',
});

const props = defineProps({
	controllerData: { type: Object, required: true },
	topicType: Number,
});

const authStore = useAuthStore();
const { setupWebSocket, closeWebSocket } = useWebSocket();

const sendingDXMCommandRequest = ref(false);
const processingDXMCommandRequest = ref(false);
const commandsHistoryListLoading = ref(false);
const commandsHistoryList = ref([]);
const dxmCommandSocketReady = ref(false);

const commandsList = reactive([
	{
		id: 1,
		isPreInstalled: true,
		title: `${tt('Reboot')} DXM`,
		message_body: 'CMD0200',
	},
	{
		id: 2,
		isPreInstalled: true,
		title: `${tt('Reboot')} ${tt('RADIO')}`,
		message_body: '',
		dxm_response: '',
	},
	{
		id: 3,
		title: tt('Command'),
		message_body: '',
		dxm_response: '',
	},
]);
const skipWebSocketList = Object.freeze(['CMD0200']);

const socketChannelDXMCommandRequest = computed(() =>
	authStore.authUser ? `user.${authStore.authUser.uuid}` : null
);

const fetchCommandsHistory = () => {
	if (!props.controllerData?.id) return;

	commandsHistoryListLoading.value = true;

	api_request
		.get(`/controllers/${props.controllerData.id}/commands`, {
			notNotify: true,
		})
		.then(({ value }) => {
			commandsHistoryList.value = value || [];
		})
		.finally(() => {
			commandsHistoryListLoading.value = false;
		});
};

const sendRequestDXMCommand = (payload) => {
	sendingDXMCommandRequest.value = true;

	api_request
		.post(`/controllers/${payload.controllerId}/commands`, {
			notNotify: true,
			data: payload.data,
		})
		.finally(() => {
			sendingDXMCommandRequest.value = false;
		});
};

const handleSubscriptionSucceded = (payload) => {
	sendRequestDXMCommand(payload);
};

const dxmCommandSocketCallback = (response = {}) => {
	const { data, type } = response;
	const safeData = data?.data || data || {};

	if (
		type?.toLowerCase() === 'dxm.command'
		&& safeData.controller_id === props.controllerData.id
		&& safeData.sender_id === authStore.authUser?.id
	) {
		if (safeData.status === DXM_COMMANDS_REQUEST_STATUSES.SUCCESS) {
			Notify({
				type: 'success',
				title: tt('constants.Success'),
				message: `DXM ${tt('requesting')} ${tt('Successfull')}`,
			});
		}

		if (safeData.status === DXM_COMMANDS_REQUEST_STATUSES.FAIL) {
			Notify({
				type: 'warning',
				title: tt('constants.Fail'),
				message: `${tt('Error')} - ${tt('phrases.check_controller_connectivity')}`,
				duration: 0,
			});
		}

		if (safeData.status !== DXM_COMMANDS_REQUEST_STATUSES.PENDING) {
			const commandItem = findItemBy('message_body', safeData.message_body, commandsList);

			if (commandItem) {
				commandItem.dxm_response = safeData.message_response;
			}

			commandsHistoryList.value.unshift(safeData);
			closeWebSocket({ socketName: 'dxm_command_socket' });
			processingDXMCommandRequest.value = false;
		}
	}
};

const handleSendDXMCommand = (messageBody) => {
	if (!messageBody) {
		Notify({
			type: 'warning',
			message: tt('phrases.command_should_be_filled'),
		});
		return;
	}

	const payload = {
		controllerId: props.controllerData.id,
		data: { message_body: messageBody },
	};

	if (skipWebSocketList.includes(messageBody)) {
		handleSubscriptionSucceded(payload);
		return;
	}

	try {
		processingDXMCommandRequest.value = true;

		setupWebSocket({
			socketName: 'dxm_command_socket',
			socketReadyRef: dxmCommandSocketReady,
			socketChannel: socketChannelDXMCommandRequest.value,
			onOpen: () => {
				dxmCommandSocketReady.value = true;
				handleSubscriptionSucceded(payload);
			},
			onMessage: dxmCommandSocketCallback,
		});
	} catch (e) {
		console.warn(e);
		processingDXMCommandRequest.value = false;
	}
};

const setupMessageBody = (type) => {
	const commandItem = findItemBy('id', 2, commandsList);
	if (!commandItem) return;

	if (type === CONTROLLER_TOPIC_TYPES.PDM) {
		commandItem.message_body = 'CMD0004 15,1,1,0,0,256';
	} else if (type === CONTROLLER_TOPIC_TYPES.PDM_V2) {
		commandItem.message_body = 'CMD0004 4151,1,51,0,0,10';
	}
};

watch(
	() => props.topicType,
	(type) => {
		setupMessageBody(type);
	}
);

onMounted(() => {
	setupMessageBody(props.topicType);
	fetchCommandsHistory();
});

onBeforeUnmount(() => {
	closeWebSocket({ socketName: 'dxm_command_socket' });
});
</script>
