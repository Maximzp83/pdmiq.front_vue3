<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div v-if="loadContent" class="form-wrapper card-content">
						<ItemFormWrapper
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
import { ref } from 'vue';

import { useItemPage } from '@/composables/mixins/useItemPage';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemFormWrapper from './ItemFormWrapper.vue';

defineOptions({ name: 'EquipmentPage' });

const itemFormRef = ref(null);
const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	itemsName,
	handleSubmitForm,
	handleCloseButton,
} = useItemPage({
	entityKey: 'Equipments',
	itemFormRef,
	uploadSettings: Object.freeze([
		{ fileProp: 'pictures', multiple: true },
		{ fileProp: 'libraries', multiple: true },
	]),
});
</script>
