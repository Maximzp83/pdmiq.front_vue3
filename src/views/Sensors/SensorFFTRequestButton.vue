<template>
	<div :class="['fft-animation-container', { 'disable-pointer': isFftProcessing }]">
		<div :class="['fft-animation-wrapper', { 'animate-fft': isFftProcessing }]">
			<i class="icomoon icon-fft-wave"></i>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'SensorFFTRequestButton',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
	itemData: { type: Object, default: () => ({}) },
});

const sensorData = computed(() => props.propsData?.id ? props.propsData : props.itemData);
const isFftProcessing = computed(() => !!sensorData.value?.is_fft_processing);
</script>
