<template>
	<component
		v-if="componentFile"
		:is="componentFile"
		ref="additionalBlock"
		:propsData="propsData"
		:additionalProps="additionalProps"
		:Lang="Lang"
		@event="handleEvent"
	/>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue';

import { Lang } from '@/localization';

defineOptions({
	name: 'DynamicComponentWrapper',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
	componentFileLoader: { type: Function, default: null },
	componentPath: { type: String, default: '' },
	additionalProps: { type: null, default: null },
});

const emit = defineEmits(['event']);

const additionalBlock = ref(null);
// const componentModules = {
// 	...import.meta.glob('/src/components/**/*.vue'),
// 	...import.meta.glob('/src/views/**/*.vue'),
// };

const componentFile = computed(() => {
	if (props.componentFileLoader) {
		return defineAsyncComponent(props.componentFileLoader);
	}

	return null;

	/*if (!props.componentPath) {
		return null;
	}

	const modulePath = `/src/${props.componentPath}.vue`;
	return componentModules[modulePath];*/
});

const handleEvent = (event) => {
	emit('event', event);
};

defineExpose({ additionalBlock });
</script>
