<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div class="item-page-wrapper">
			<div v-if="loadContent" class="form-wrapper">
				<ItemForm
					ref="itemFormRef"
					:itemData="itemData"
					:itemsName="itemsName"
					:sensorsList="sensorsList"
					:sensorsLoading="sensorsLoading"
					:plantItem="plantItem"
					@submit="handleSubmitForm"
					@onCancel="handleCloseButton"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useItemPage } from '@/composables/mixins/useItemPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

defineOptions({ name: 'ROIOnePagerPage' });

defineProps({
	sensorsLoading: Boolean,
	sensorsList: { type: Array, default: () => [] },
	plantItem: { type: Object, default: () => ({}) },
});

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
	entityKey: 'RoiOnePagers',
	itemFormRef,
	uploadSettings: Object.freeze([{ fileProp: 'pictures', multiple: true }, { fileProp: 'file' }]),
	goToListAfterSave: true,
	additionalNavbarSettings: {
		showSaveButton: true,
		showCloseButton: true,
	},
});
</script>
