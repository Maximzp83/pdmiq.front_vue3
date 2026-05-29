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

import { useItemPage } from '@/composables/mixins/useItemPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

defineOptions({
	name: 'MaintenanceLogDetails',
});

const itemFormRef = ref(null);

const preparePayload = (payload) => {
	const nextPayload = {
		...payload,
		data: {
			...payload.data,
			attachments: payload.data.attachments || [],
			images: payload.data.images || [],
			production_line_id: payload.data.production_line_id || null,
			machine_id: payload.data.machine_id || null,
			asset_id: payload.data.asset_id || null,
			equipment_id: payload.data.equipment_id || null,
		},
	};

	const hasNewAttach = nextPayload.data.attachments.some((item) => !!item.file);
	const hasNewImg = nextPayload.data.images.some((item) => !!item.file);

	if (hasNewAttach || hasNewImg) {
		nextPayload.withFile = true;
	}

	return nextPayload;
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
	entityKey: 'MaintenanceLogs',
	itemFormRef,
	goToListAfterSave: true,
	preparePayload,
});
</script>
