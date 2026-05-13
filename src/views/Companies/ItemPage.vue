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

import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useAuthStore } from '@/stores/AuthStore';

import TabsBar from '@/components/common/TabsBar.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

const authStore = useAuthStore();

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
	entityKey: 'Companies',
	additionalNavbarSettings: Object.freeze({
		showStandardNavItem: true,
	}),
	uploadSettings: {
		fileProp: 'saml2_idp_base64_certificate',
	},
	itemFormRef,
	goToListAfterSave: true,
	// debug: true
});

const tabsList = computed(() => {
	const list = [{ title: 'Main', prop: 'mainTab' }];

	if (authStore.isIndustrialMatrix) {
		list.push({ title: 'Menu', prop: 'menuTab' });
	}

	if (itemData.value) {
		if (itemData.value.can_update) {
			list.push({ title: 'SSO', prop: 'SSOTab' });
		}
	} else {
		list.push({ title: 'SSO', prop: 'SSOTab' });
	}

	return Lang.translate(list);
});

const switchTab = (tab) => {
	activeTab.value = tab;
};

watch(
	tabsList,
	(list) => {
		if (!list.length) return;

		const currentTabExists = list.some((tab) => tab.prop === activeTab.value?.prop);
		if (!currentTabExists) {
			activeTab.value = list[0];
		}
	},
	{ immediate: true }
);
</script>
