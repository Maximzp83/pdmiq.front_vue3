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
	additionalProps: { type: null, default: null },
});

const emit = defineEmits(['event']);

const additionalBlock = ref(null);

const componentFile = computed(() => {
	if (props.componentFileLoader) {
		return defineAsyncComponent(props.componentFileLoader);
	}

	return null;
});

const handleEvent = (event) => {
	emit('event', event);
};

defineExpose({ additionalBlock });
</script>
