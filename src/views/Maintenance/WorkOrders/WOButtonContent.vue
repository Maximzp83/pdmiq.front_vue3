<template>
	<span class="flex align-center">
		<i class="icomoon icon-maintenance mr-5"></i>
		<span v-text="propsData?.serial_number || propsData?.id || '-'"></span>
	</span>
</template>

<script setup>
defineOptions({
	name: 'WOButtonContent',
});

defineProps({
	propsData: { type: Object, default: () => ({}) },
});
</script>
