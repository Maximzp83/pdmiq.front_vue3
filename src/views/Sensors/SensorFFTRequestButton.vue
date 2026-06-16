<template>
	<div :class="['fft-animation-container', {'disable-pointer': propsData.is_fft_processing.value}]">
		<div :class="['fft-animation-wrapper', {'animate-fft': propsData.is_fft_processing.value}]">
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
});

// const isProcessing = computed(() => !!props.itemData?.is_fft_processing);
</script>
