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

import { ENTITIES } from '@/config/entities';
import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

const { changeRoute } = useNavigation();

const itemFormRef = ref(null);
const applicationsEntity = ENTITIES.Applications;

const itemsName = computed(() => ({
	one: Lang.tt(applicationsEntity.itemsName.one),
	mult: Lang.tt(applicationsEntity.itemsName.mult),
}));

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	handleSubmitForm,
	handleCloseButton,
} = useItemPage({
	apiRoute: applicationsEntity.apiBase,
	itemRoute: applicationsEntity.routeBase,
	itemsName: itemsName.value,
	itemFormRef,
	changeRoute,
});
</script>
