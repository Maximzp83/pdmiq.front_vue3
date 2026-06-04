<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div v-if="loadContent" class="form-wrapper card-content">
						<component
							:is="formComponent"
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
import { useRoute } from 'vue-router';

import { FAULTS_TYPES } from '@/constants/global';
import { useItemPage } from '@/composables/mixins/useItemPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';
import ItemFormNCD from './ItemFormNCD.vue';

defineOptions({
	name: 'SettingsFaultPage',
});

const route = useRoute();
const itemFormRef = ref(null);

const isNcdRoute = computed(() => route.path.includes('/settings/faults/ncd'));
const listRoute = isNcdRoute.value ? '/settings/faults?type=2' : '/settings/faults?type=1';
const formComponent = computed(() => {
	if (isNcdRoute.value || Number(itemData.value?.type) === FAULTS_TYPES.NCD) return ItemFormNCD;
	return ItemForm;
});

const { itemData, itemLoading, loadContent, itemSaving, itemsName, handleSubmitForm, handleCloseButton } =
	useItemPage({
		entityKey: 'EquipmentFaults',
		itemRoute: listRoute,
		itemFormRef,
		goToListAfterSave: true,
	});
</script>
