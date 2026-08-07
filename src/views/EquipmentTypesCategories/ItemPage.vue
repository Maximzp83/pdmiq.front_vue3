<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="resolvedItemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div v-if="loadContent" class="form-wrapper card-content">
						<ItemForm
							ref="itemFormRef"
							:itemData="itemData"
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
import { useItemPage } from '@/composables/mixins/useItemPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

const itemFormRef = ref(null);
const equipmentTypesCategoriesEntity = ENTITIES.EquipmentTypesCategories;

const itemsName = computed(() => ({
	one: `${Lang.tt(equipmentTypesCategoriesEntity.itemsName.group)} ${Lang.tt(equipmentTypesCategoriesEntity.itemsName.one)}`,
	mult: `${Lang.tt(equipmentTypesCategoriesEntity.itemsName.group)} ${Lang.tt(equipmentTypesCategoriesEntity.itemsName.mult)}`,
}));

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	itemsName: resolvedItemsName,
	handleSubmitForm,
	handleCloseButton,
} = useItemPage({
	entityKey: 'EquipmentTypesCategories',
	itemsName: itemsName.value,
	itemFormRef,
	goToListAfterSave: true,
});
</script>
