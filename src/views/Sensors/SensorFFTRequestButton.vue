<template>
	<div :class="{ 'disabled-action-button': isProcessing }">FFT</div>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'SensorFFTRequestButton',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
});

const isProcessing = computed(() => !!props.itemData?.is_fft_processing);
</script>
