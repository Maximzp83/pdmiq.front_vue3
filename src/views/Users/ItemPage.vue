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
							:itemsName="itemsName"
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
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { hasAccessTo as hasAccessToUtil } from '@/utils/hasAccessTo';
import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useAuthStore } from '@/stores/AuthStore';

import TabsBar from '@/components/common/TabsBar.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

defineOptions({
	name: 'UsersItemPage',
});

const authStore = useAuthStore();
const { authUser } = storeToRefs(authStore);
const route = useRoute();

const itemFormRef = ref(null);
const activeTab = ref({ title: 'Personal', prop: 'mainTab' });

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	itemsName,
	handleSubmitForm,
	handleCloseButton,
	initialPageSetup,
} = useItemPage({
	// debug: true,
	entityKey: 'Users',
	itemFormRef,
	goToListAfterSave: computed(() => route.path !== '/profile'),
	successSubmitCallback: (answer) => {
		const savedUser = answer?.value || answer?.data?.data || answer?.data;
		if (savedUser?.id === authUser.value?.id) {
			authStore.get_auth_user();
		}
	},
});

const resolveApiTabVisibility = (currentItemData) => {
	const role = currentItemData?.temp_role || currentItemData?.role;
	return !!hasAccessToUtil({ role, permissionKeys: ['view_client_api'] });
};

const tabsList = computed(() => {
	const list = [
		{ title: Lang.tt('Personal'), prop: 'mainTab' },
		{ title: Lang.tt('Notifications'), prop: 'notificationsTab' },
	];

	if (itemData.value) {
		list.push({ title: Lang.tt('Reports'), prop: 'reportsTab' });

		if (
			(authStore.hasAccessTo(['edit_users']) || authUser.value?.id === itemData.value.id) &&
			resolveApiTabVisibility(itemData.value)
		) {
			list.push({ title: 'API', prop: 'apiTab' });
		}
	}

	return Object.freeze(list);
});

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

watch(
	() => route.fullPath,
	() => {
		initialPageSetup(route);
	},
);
</script>
