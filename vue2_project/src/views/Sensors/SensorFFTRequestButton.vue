<template>
	<div :class="['fft-animation-container', {'disable-pointer': propsData.is_fft_processing}]">
		<div :class="['fft-animation-wrapper', {'animate-fft': propsData.is_fft_processing}]">
			<i class="icomoon icon-fft-wave"></i>
		</div>
	</div>
</template>

<script>
export default {
	// functional: true,
	props: {
		propsData: { type: Object, required: true },
	},
};
</script>
