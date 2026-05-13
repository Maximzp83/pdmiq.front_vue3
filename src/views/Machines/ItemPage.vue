<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

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
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

import { useItemPage } from '@/composables/mixins/useItemPage';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { Lang } from '@/localization';

defineOptions({
	name: 'MachinePage',
});

const { changeRoute } = useNavigation();
const itemFormRef = ref(null);

const uploadSettings = {
	fileProp: 'pictures',
	multiple: true,
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
	entityKey: 'Machines',
	itemFormRef,
	changeRoute,
	uploadSettings,
});
</script>
