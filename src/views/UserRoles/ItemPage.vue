<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="content-row">
					<TabsBar
						:activeTab="activeTab"
						:tabsList="tabsList"
						@switchTab="switchTab"
					/>
				</div>

				<div class="content-row view-content-card card">
					<div v-if="loadContent" class="form-wrapper card-content">
						<ItemForm
							ref="itemFormRef"
							:itemData="itemData"
							:activeTab="activeTab"
							:tabsList="tabsList"
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
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useAuthStore } from '@/stores/AuthStore';

import TabsBar from '@/components/common/TabsBar.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

defineOptions({
	name: 'UserRolesItemPage',
});

const authStore = useAuthStore();
const { authUser } = storeToRefs(authStore);

const itemFormRef = ref(null);
const activeTab = ref({ title: 'Main', prop: 'mainTab' });

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	itemsName,
	handleSubmitForm,
	handleCloseButton,
} = useItemPage({
	entityKey: 'UserRoles',
	itemFormRef,
	goToListAfterSave: true,
	successSubmitCallback: (answer) => {
		const savedItem = answer?.data?.data || answer?.data;
		if (savedItem?.id === authUser.value?.role?.id) {
			authStore.get_auth_user();
		}
	},
});

const tabsList = computed(() =>
	Object.freeze(
		Lang.translate([
			{ title: 'Main', prop: 'mainTab' },
			{ title: 'Requisition', prop: 'requisitionTab' },
			{ title: 'Sections', prop: 'permissionsTab' },
		]),
	),
);

const switchTab = (tab) => {
	activeTab.value = tab;
};

watch(
	tabsList,
	(list) => {
		if (!list.length) return;
		if (!list.some((tab) => tab.prop === activeTab.value?.prop)) {
			activeTab.value = list[0];
		}
	},
	{ immediate: true },
);
</script>
