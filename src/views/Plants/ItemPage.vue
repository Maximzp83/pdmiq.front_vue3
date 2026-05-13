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
import { ref } from 'vue';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

import { useItemPage } from '@/composables/mixins/useItemPage';
import { useGlobalStore } from '@/stores/GlobalStore';

const globalStore = useGlobalStore();
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
	// debug: true,
	entityKey: 'Plants',
	itemFormRef,
	goToListAfterSave: true,
	successSubmitCallback: (answer) =>
		globalStore
			.fetch_global_plants({
				params: { max: -1, orderByColumn: 'name', orderByMethod: 'asc' },
			})
			.then(() => answer),
});
</script>
