<template>
	<component
		:is="componentFile"
		ref="additionalBlock"
		:propsData="propsData"
		:additionalProps="additionalProps"
		:Lang="Lang"
		@event="handleEvent"
	/>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';

defineOptions({
	name: 'DynamicComponentWrapper',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
	componentPath: { type: String, required: true },
	additionalProps: { type: null, default: null },
});

const emit = defineEmits(['event']);

const additionalBlock = ref(null);
const componentModules = import.meta.glob('/src/components/**/*.vue');

const componentFile = computed(() => {
	const modulePath = `/src/${props.componentPath}.vue`;
	return componentModules[modulePath];
});

const handleEvent = (event) => {
	emit('event', event);
};

defineExpose({ additionalBlock });
</script>
