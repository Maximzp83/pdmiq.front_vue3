<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div v-if="loadContent" class="form-wrapper card-content">
						<ItemForm
							ref="itemFormRef"
							:itemData="itemData"
							:itemsName="itemsName"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { ENTITIES } from '@/config/entities';
import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { useItemPage } from '@/composables/mixins/useItemPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

const { tt } = Lang;

const itemFormRef = ref(null);
const plantsVendorsEntity = ENTITIES.PlantsVendors;

const itemsName = computed(() => {
	const prefix =
		Lang.currentLangId === LANGUAGE_TYPES.ENGLISH
			? plantsVendorsEntity.itemsName.englishPrefix
			: '';

	return {
		one: `${prefix}${tt(plantsVendorsEntity.itemsName.one)}`,
		mult: `${prefix}${tt(plantsVendorsEntity.itemsName.mult)}`,
		instanceName: plantsVendorsEntity.itemsName.instanceName,
	};
});

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	handleSubmitForm,
	handleCloseButton,
} = useItemPage({
	entityKey: 'PlantsVendors',
	itemsName,
	itemFormRef,
	goToListAfterSave: true,
});
</script>
