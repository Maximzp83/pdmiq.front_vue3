<template>
	<span class="flex align-center">
		<i class="icomoon icon-file mr-5"></i>
		<span v-text="filesCount"></span>
	</span>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'MaintenanceLogFileButtonContent',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
});

const filesCount = computed(() => (props.propsData.attachments || props.propsData.files || []).length);
</script>
