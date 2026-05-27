<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper equipment-types-page">
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
import { ref } from 'vue';

import { useItemPage } from '@/composables/mixins/useItemPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

defineOptions({
	name: 'EquipmentTypePage',
});

const itemFormRef = ref(null);

const preparePayload = (payload) => {
	if (!payload.withFile && payload.data?.type_options) {
		payload.withFile = payload.data.type_options.some((option) =>
			option.predefined_values?.some((value) => !!value.file)
		);
	}

	return payload;
};

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	itemsName,
	handleSubmitForm,
	handleCloseButton,
} = useItemPage({
	entityKey: 'EquipmentTypes',
	uploadSettings: {
		fileProp: 'file',
	},
	preparePayload,
	itemFormRef,
	goToListAfterSave: true,
});
</script>
