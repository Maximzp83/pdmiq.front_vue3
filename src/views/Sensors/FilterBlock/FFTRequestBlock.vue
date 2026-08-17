<template>
	<el-dialog
		v-if="initiatedFFTDialog"
		v-model="fftRequestDialogOpen"
		append-to-body
		top
		class="small dialog-decorate-header title-center fft-request-dialog"
		:title="tt('phrases.request_fft')"
	>
		<VueElementLoadingWrapper
			:isLoading="processingFFTRequest"
			:text="tt('phrases.sending_fft_request_to_controller')"
		/>

		<div v-if="!fftRequestResult" class="card-content flex justify-center">
			<div>
				<div class="article-title content-row">
					{{ tt('phrases.Do_you_really_want_to') }}
					<b>{{ tt('Request') }} FFT</b>
					{{ Lang.currentLangId === LANGUAGE_TYPES.ENGLISH ? ' Action? Continue?' : '?' }}
				</div>

				<div v-if="!isBannerM25" class="content-row flex align-center">
					<div class=" mcol-xs-4">{{ tt('phrases.request_type') }}</div>
					<div class="mcol-xs-8">
						<el-select
							v-model="bannerRequestType"
							:placeholder="`${tt('Select')} ${tt('type')}`"
						>
							<el-option
								v-for="item in bannerRequestTypes"
								:key="`type_id-${item.id}`"
								:label="item.name"
								:value="item.id"
							>
								<el-tooltip effect="dark" :content="item.tooltip" placement="right">
									<span class="display-block">{{ item.name }}</span>
								</el-tooltip>
							</el-option>
						</el-select>
					</div>
				</div>

				<div class="content-row flex align-center">
					<div class=" mcol-xs-4">{{ tt('phrases.request_fmax') }}</div>
					<CustomSelectV2
						v-model="bannerRequestFmax"
						class="mcol-xs-8"
						:optionsList="bannerRequestFmaxTypes"
						:placeholder="`${tt('Select')} ${tt('fmax')}`"
					/>
				</div>
			</div>
		</div>

		<div v-else class="card-content flex justify-center">
			<div class="vertical-fluid">
				<div class="caption">
					<i
						:class="[
							'span-block',
							fftRequestResult.isSuccess
								? 'el-icon-success success-color'
								: 'el-icon-warning warning-color',
						]"
					></i>
					<span class="span-block text semi-bold" v-text="fftRequestResult.message"></span>
				</div>
			</div>
		</div>

		<template #footer>
			<div class="dialog-footer section-row text-center">
				<el-button
					v-if="!fftRequestResult || !fftRequestResult.isSuccess"
					@click="fftRequestDialogOpen = false"
				>
					{{ tt('Cancel') }}
				</el-button>

				<el-button
					v-if="fftRequestResult"
					type="primary"
					class="capitalize"
					@click="handleFFTResult(fftRequestResult)"
				>
					{{ fftRequestResult.isSuccess ? 'Ok' : tt('Retry') }}
				</el-button>

				<el-button
					v-else
					type="primary"
					class="capitalize"
					@click="setupRequestFFT"
				>
					{{ tt('Confirm') }}
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';

import {
	BANNER_REQUEST_FMAX_TYPES,
	BANNER_REQUEST_TYPES,
	FFT_LOCK_STATUSES,
	FFT_SOURCE_TYPES,
	NCD_REQUEST_STATUSES,
	bannerRequestFmaxTypesList,
	bannerRequestTypesList,
} from '@/constants/global';
import { METRIC_SYSTEM_TYPES } from '@/modules/charts_factory/controllers/Sensor/enums';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { Lang } from '@/localization';
import { useActionButtons } from '@/composables/mixins/useActionButtons';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useNotify } from '@/composables/useNotify';
import { useSensors } from '@/composables/useSensors';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useWebSocket } from '@/composables/mixins/useWebSocket';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({
	name: 'FFTRequestBlock',
});

const props = defineProps({
	sensorData: { type: Object, default: () => ({}) },
	rootFilters: { type: Object, default: () => ({}) },
	currentSensorType: { type: Object, default: null },
});

const emit = defineEmits([
	'event',
	'onSocketSuccess',
	'update:isLoading',
	'update:isSending',
]);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { Notify } = useNotify();
const { confirmHelper } = useActionButtons({ emit });
const { requestNcdFft, fetchNcdFft, unlockFft } = useSensors();
const { setupWebSocket, closeWebSocket } = useWebSocket();
const { currentSensorType: detectedSensorType } = useSensorType({
	currentSensorTypeData: computed(() => props.sensorData),
});

const forController = ref(null);
const processingFFTRequest = ref(false);
const fftRequestResult = ref(null);
const bannerRequestType = ref(null);
const bannerRequestFmax = ref(null);
const fftRequestDialogOpen = ref(false);
const initiatedFFTDialog = ref(false);
const fftRequestId = ref(null);

const currentSensorTypeData = computed(() => props.currentSensorType || detectedSensorType.value || {});
const isBannerTempVibe2 = computed(() =>
	currentSensorTypeData.value?.isBannerTempVibe2 ||
	currentSensorTypeData.value?.isBannerV2_1 ||
	currentSensorTypeData.value?.isBannerV2Generic,
);
const isBannerM25 = computed(() => currentSensorTypeData.value?.isBannerM25);
const socketChannelFFTRequest = computed(() => authStore.authUser ? `user.${authStore.authUser.uuid}` : null);
const bannerRequestTypes = computed(() => Object.freeze(bannerRequestTypesList()));
const bannerRequestFmaxTypes = computed(() => {
	let list = bannerRequestFmaxTypesList();

	if (!isBannerM25.value) {
		list = list.filter((item) => item.id !== BANNER_REQUEST_FMAX_TYPES.HZ_10600);
	}

	if (props.rootFilters?.measurement === METRIC_SYSTEM_TYPES.IMPERIAL) {
		return list.map((type) => ({
			...type,
			name: `${type.value * 60} CPM`,
		}));
	}

	return list;
});

const setSending = (value) => emit('update:isSending', value);
const setLoading = (value) => emit('update:isLoading', value);
const toggleMainPreloader = (open, text = '') => {
	if (open) {
		globalStore.set_global_state({
			stateProp: 'overlay',
			value: {
				text,
				textStyle: { fontSize: '25px' },
			},
		});
		globalStore.set_global_state({ stateProp: 'mainPreloader', value: true });
		return;
	}

	globalStore.set_global_state({ stateProp: 'mainPreloader', value: false });
	globalStore.set_global_state({ stateProp: 'overlay', value: {} });
};

const confirmFFTRequest = (settings = {}) => {
	forController.value = settings.forController || null;
	if (isBannerTempVibe2.value || isBannerM25.value || forController.value) {
		initiatedFFTDialog.value = true;
		fftRequestDialogOpen.value = true;
		return;
	}
	setupRequestFFT();
};

const handleFFTResult = ({ isSuccess }) => {
	if (isSuccess) {
		fftRequestDialogOpen.value = false;
	}
	setTimeout(() => {
		fftRequestResult.value = null;
	}, 200);
};

const setupRequestFFT = () => {
	const payload = { sensorId: props.sensorData.id, data: {} };
	let next = true;

	if (isBannerTempVibe2.value || isBannerM25.value || forController.value) {
		if (isBannerM25.value) {
			bannerRequestType.value = BANNER_REQUEST_TYPES.STANDARD;
		}
		if (bannerRequestType.value != null && bannerRequestFmax.value != null) {
			payload.notNotify = false;
			payload.data.banner_request_type = bannerRequestType.value;
			payload.data.banner_request_fmax = bannerRequestFmax.value;
		} else {
			next = false;
			Notify({
				type: 'error',
				title: tt('Error'),
				message: tt('phrases.please_select_request_type_and_fmax'),
				duration: 0,
			});
		}
	}

	if (!next) return;

	if (forController.value) {
		emit('event', {
			eventName: 'sendMultipleFFT',
			data: {
				controllerData: forController.value,
				data: payload.data,
			},
			onward: true,
		});
		return;
	}

	if (isBannerTempVibe2.value || isBannerM25.value) {
		processingFFTRequest.value = true;
	} else {
		toggleMainPreloader(true, `${tt('Working')} FFT...`);
	}

	setupWebSocket({
		socketName: 'fft_socket',
		socketChannel: socketChannelFFTRequest.value,
		onOpen: () => sendRequestFFT(payload),
		onMessage: (response) => fftRequestSocketCallback(response),
	});
};

const sendRequestFFT = (payload) => {
	fftRequestId.value = null;
	setSending(true);

	requestNcdFft(payload)
		.then((response) => {
			fftRequestId.value = response?.value?.id;
			setSending(false);
		})
		.catch(() => {
			setSending(false);
			processingFFTRequest.value = false;
			toggleMainPreloader(false);
			closeWebSocket({ socketName: 'fft_socket' });
		});
};

const fftRequestSocketCallback = ({ type, data } = {}) => {
	const waitingType = (isBannerTempVibe2.value || isBannerM25.value) ? 'dxm.command' : 'ncd.command';
	const safeData = data?.data || {};

	if (
		type?.toLowerCase() !== waitingType ||
		safeData.fft_request_id !== fftRequestId.value ||
		safeData.sender_id !== authStore.authUser?.id ||
		(safeData.type !== FFT_SOURCE_TYPES.FFT && safeData.command_type !== 'fft')
	) {
		return;
	}

	if (safeData.status === NCD_REQUEST_STATUSES.SUCCESS) {
		emit('onSocketSuccess', true);
		fftRequestResult.value = {
			isSuccess: true,
			message: tt('phrases.controller_received_the_request_properly'),
		};
		closeWebSocket({ socketName: 'fft_socket' });
		toggleMainPreloader(false);
		processingFFTRequest.value = false;
	}

	if (safeData.status === NCD_REQUEST_STATUSES.FAIL) {
		fftRequestResult.value = {
			isSuccess: false,
			message: `${tt('Error')} - ${tt('phrases.check_controller_connectivity')}`,
		};
		closeWebSocket({ socketName: 'fft_socket' });
		toggleMainPreloader(false);
		processingFFTRequest.value = false;
	}
};

const handleLastFFT = () => {
	if (!props.sensorData.id) return;

	setLoading(true);
	fetchNcdFft({
		sensorId: props.sensorData.id,
		urlPostfix: '/last/completed',
	})
		.then(({ value }) => {
			emit('event', {
				eventName: 'openFFTCharts',
				data: { payload: value, sensorType: currentSensorTypeData.value },
				onward: true,
			});
		})
		.finally(() => {
			setLoading(false);
		});
};

const handleUnlockFFT = (data = {}) => {
	confirmHelper({
		insertToMessage: `<b>${tt('unlock')} FFT</b>`,
	})
		.then(() => {
			const sensorId = data.sensorId || props.sensorData.id;
			setLoading(true);

			return unlockFft({ sensorId, notNotify: true })
				.then(({ value }) => {
					if (value?.status === FFT_LOCK_STATUSES.UNLOCKED) {
						Notify({
							type: 'success',
							title: tt('constants.Success'),
							message: tt('phrases.fft_successfully_unlocked'),
						});

						emit('event', {
							eventName: 'handleUnlockFFTSuccess',
							data: { fft_lock_item: value, sensorId },
							onward: true,
						});
					}
				})
				.finally(() => {
					setLoading(false);
				});
		})
		.catch(() => {});
};

onBeforeUnmount(() => {
	closeWebSocket({ socketName: 'fft_socket' });
});

defineExpose({
	confirmFFTRequest,
	handleLastFFT,
	handleUnlockFFT,
});
</script>
