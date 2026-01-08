<template>
	<VueElementLoading
		class="capitalize"
		:active="isLoading || isSaving"
		:spinner="spinner || 'ring'"
		:text="textValue"
		:background-color="'rgba(255, 255, 255, .7)'"
	/>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { Lang } from '@/localization';

const VueElementLoading = defineAsyncComponent(
	() => import('@/components/common/VueElementLoading.vue')
);

const { tt } = Lang;

const props = defineProps({
	isLoading: { type: Boolean, default: false },
	isSaving: { type: Boolean, default: false },
	disableText: { type: Boolean, default: false },
	itemsName: { type: String, default: '' },
	spinner: { type: String, default: 'ring' },
	text: { type: String, default: '' },
});

const textValue = computed(() => {
	const { isLoading, isSaving, itemsName, disableText, text } = props;

	if (text) return text;

	let result = itemsName || '';
	if (disableText) return '';
	if (isLoading) result += ` ${tt('loading')}...`;
	else if (isSaving) result += `${tt('saving')}...`;
	return result;
});
</script>
