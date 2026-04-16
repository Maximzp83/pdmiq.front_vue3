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

import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

const { changeRoute } = useNavigation();

const itemFormRef = ref(null);

const itemsName = computed(() => ({
	one: Lang.tt('Equipment_Brand'),
	mult: Lang.tt('Equipment_Brands'),
}));

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	handleSubmitForm,
	handleCloseButton,
} = useItemPage({
	apiRoute: '/equipments/brands',
	itemRoute: '/brands',
	itemsName: itemsName.value,
	itemFormRef,
	changeRoute,
});
</script>
