<template>
	<div class="items-grid-container drag-n-drop-wrapper">
		<VueElementLoading
			class="section-block"
			:active="itemsLoading"
			spinner="line-scale"
			:text="`${itemsName.mult} loading...`"
			:background-color="'rgba(255, 255, 255, .7)'"
		/>

		<div :class="['flex mrow wrap', itemsListClassName]" v-if="itemsList.length">
			<div
				:class="['card_item', cardClassName || 'mcol-xs-12 mcol-sm-6 mcol-lg-4']"
				v-for="item in itemsList"
				:key="`card_item-${item.id}`"
				:data-id="item.id"
			>
				<component
					v-if="instanceName || componentPath"
					ref="ItemCardContent"
					:is="componentFile"
					:cardData="item"
					:selectedIds="selectedIds"
					:instanceName="instanceName"
					:componentPath="componentPath"
					:operationsSettings="operationsSettings"
					:additionalProps="additionalProps"
					@event="handleEvent"
				/>
			</div>
		</div>

		<div class="errors-block" v-else-if="!itemsLoading">
			<div class="text-center section-block" v-if="Lang.currentLangId === LANGUAGE_TYPES.ENGLISH">
				{{ `${itemsName.mult} ${tt('phrases.not_found')}` }}...
			</div>
			<div class="text-center section-block" v-else-if="Lang.currentLangId === LANGUAGE_TYPES.SPANISH">
				{{ `${tt('phrases.not_found')} ${itemsName.mult}` }}...
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { useEventHandler } from '@/composables/mixins/useEmitter';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { Lang } from '@/localization';

import VueElementLoading from '@/components/common/VueElementLoading.vue';

const { tt } = Lang;

defineOptions({
	name: 'ItemsGridContainer',
});

const props = defineProps({
	itemsName: { type: Object, required: true },
	itemsList: { type: Array, default: () => [] },
	operationsSettings: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	itemsLoading: Boolean,
	itemsSaving: Boolean,
	canDeleteSettings: null,
	disableSelection: Boolean,
	hideHeader: Boolean,
	disableSort: Boolean,
	emptyText: String,
	instanceName: String,
	componentPath: String,
	cardClassName: String,
	itemsListClassName: String,
});

const emit = defineEmits(['event']);

const selectedIds = ref([]);

const componentFile = computed(() => {
	const path = props.componentPath ? `${props.componentPath}` : `${props.instanceName}/ItemCard`;
	return () => import(`@/views/${path}.vue`);
});

const handleSelectionChange = (id) => {
	if (selectedIds.value.indexOf(id) != -1) {
		selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
	} else {
		selectedIds.value.push(id);
	}
};

const methodsMap = {
	handleSelectionChange,
};

defineExpose({
	selectedIds,
});

const { handleEvent } = useEventHandler(methodsMap, emit);

void Lang;
</script>
