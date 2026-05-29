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
					?
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
import { ADJUSTMENT_ACTIONS_TYPES, ULTRASOUND_SENSOR_TYPES } from '@/constants/ultrasound';
import { useCallMethod } from '@/composables/mixins/useEmitter';
import { useSensors } from '@/composables/useSensors';
import { useSensorsStore } from '@/stores/SensorsStore';

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
const sensorsStore = useSensorsStore();
const { gainAdjustmentInProcess } = storeToRefs(sensorsStore);

const initiatedLubeCycleDialog = ref(false);
const lubeCycleRequestDialogOpen = ref(false);
const lubeCycleRequestResult = ref(null);
const sendingDXMCommandRequest = ref(false);
const processingDXMCommandRequest = ref(false);

const sensorId = computed(() => props.sensorData.id);
const isSensorOnly = computed(() => props.sensorData.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY);
const actionButtons = computed(() => {
	const buttons = [];

	if (!props.enableLubeTriggerButtonOnly) {
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

	if (!isSensorOnly.value || props.enableLubeTriggerButtonOnly) {
		buttons.push({
			id: 15,
			text: `${tt('Trigger')} ${tt('Lube_Cycle')}`,
			method: 'openLubeCycleDialog',
			className: 'inverted report-button',
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
	sensorsStore.set_sensor_state({ stateProp: 'gainAdjustmentInProcess', value: true });
	gainAdjustment({
		sensorId: sensorId.value,
		data: { action },
	})
		.finally(() => {
			sensorsStore.set_sensor_state({ stateProp: 'gainAdjustmentInProcess', value: false });
		});
};

const openLubeCycleDialog = () => {
	initiatedLubeCycleDialog.value = true;
	lubeCycleRequestDialogOpen.value = true;
	lubeCycleRequestResult.value = null;
};

const triggerLubeCycle = () => {
	if (!props.sensorData.trigger_lube_cycle_url) return;
	sendingDXMCommandRequest.value = true;
	processingDXMCommandRequest.value = true;
	toggleUltrasoundCommand({ url: props.sensorData.trigger_lube_cycle_url })
		.then((response) => {
			lubeCycleRequestResult.value = {
				isSuccess: true,
				message: response?.message || tt('Success'),
			};
		})
		.catch((error) => {
			lubeCycleRequestResult.value = {
				isSuccess: false,
				message: error?.message || tt('Error'),
			};
		})
		.finally(() => {
			sendingDXMCommandRequest.value = false;
			processingDXMCommandRequest.value = false;
		});
};

const handleLubeCycleResult = (result) => {
	if (result.isSuccess) {
		lubeCycleRequestDialogOpen.value = false;
	} else {
		triggerLubeCycle();
	}
};

const { callMethod } = useCallMethod({
	toggleGainAdjustment,
	openLubeCycleDialog,
});
</script>
