<template>
	<el-dialog
		v-model="fftRequestDialogOpen"
		append-to-body
		center
		class="small dialog-decorate-header"
		:title="tt('fft')"
	>
		<div class="content-row text-center">
			{{ tt('phrases.Do_you_really_want_to') }} {{ tt('fft') }}?
		</div>

		<template #footer>
			<el-button @click="fftRequestDialogOpen = false">{{ tt('Cancel') }}</el-button>
			<el-button type="primary" :loading="isSending" @click="submitFFTRequest">OK</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Lang } from '@/localization';
import { useSensors } from '@/composables/useSensors';

const { tt } = Lang;

defineOptions({
	name: 'FFTRequestBlock',
});

const props = defineProps({
	sensorData: { type: Object, default: null },
});

const emit = defineEmits(['onSocketSuccess', 'update:isSending']);

const { requestNcdFft } = useSensors();
const fftRequestDialogOpen = ref(false);
const isSending = ref(false);

const confirmFFTRequest = () => {
	fftRequestDialogOpen.value = true;
};

const submitFFTRequest = () => {
	if (!props.sensorData?.id) return;
	isSending.value = true;
	emit('update:isSending', true);

	requestNcdFft({ sensorId: props.sensorData.id })
		.then(() => {
			fftRequestDialogOpen.value = false;
			emit('onSocketSuccess');
		})
		.finally(() => {
			isSending.value = false;
			emit('update:isSending', false);
		});
};

defineExpose({
	confirmFFTRequest,
});
</script>
