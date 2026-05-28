<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="mrow flex align-center">
					<div class="mcol-xs-auto"></div>
					<div
						v-if="showTabsBar"
						v-show="tabsList.length > 1"
						class="mcol-xs-auto"
					>
						<TabsBar
							:activeTab="activeTab"
							:tabsList="tabsList"
							@switchTab="switchTab"
						/>
					</div>
				</div>

				<div class="view-content-card card">
					<div v-if="loadContent" class="form-wrapper card-content">
						<component
							:is="currentFormComponent"
							v-if="currentFormComponent"
							ref="itemFormRef"
							:itemData="itemData"
							:itemsName="itemsName"
							:activeTab="activeTab"
							:tabsList="tabsList"
							:new_item_type="itemType"
							:additionalItemType="additionalItemType"
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
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { CONTROLLER_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';

import TabsBar from '@/components/common/TabsBar.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

defineOptions({
	name: 'ControllerPage',
});

const ItemForm = defineAsyncComponent(() => import('./ItemForm.vue'));
const ItemFormUltraSound = defineAsyncComponent(() => import('./ItemFormUltraSound.vue'));
const ItemFormCounter = defineAsyncComponent(() => import('./ItemFormCounter.vue'));
const ItemFormNCD = defineAsyncComponent(() => import('./ItemFormNCD.vue'));

const route = useRoute();
const itemFormRef = ref(null);
const activeTab = ref({ title: 'main', prop: 'mainTabActive' });
const additionalItemType = ref('');

const preparePayload = (payload) => {
	if (payload?.data?.configure_file || payload?.data?.sb_file) {
		return {
			...payload,
			withFile: true,
		};
	}

	return payload;
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
	entityKey: 'Controllers',
	itemFormRef,
	goToListAfterSave: true,
	preparePayload,
});

const itemType = computed(() => {
	if (itemData.value) {
		return itemData.value.type;
	}

	if (route.query?.type) {
		const queryType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type;
		const numericType = Number(queryType);
		if (!Number.isNaN(numericType)) {
			return numericType;
		}
	}

	const routePathParts = route.path.split('/').filter(Boolean);
	if (routePathParts[routePathParts.length - 1] === 'new') {
		return CONTROLLER_TYPES.BANNER;
	}

	return undefined;
});

const tabsList = computed(() => {
	const list = [{ title: 'main', prop: 'mainTabActive' }];

	if (itemData.value?.type === CONTROLLER_TYPES.BANNER) {
		list.push({ title: 'formulas', prop: 'formulasTabActive' });
	}

	if (itemData.value) {
		list.push({ title: 'commands', prop: 'commandsTabActive' });
	}

	if (itemData.value?.type === CONTROLLER_TYPES.BANNER) {
		list.push({ title: 'devices', prop: 'devicesTabActive' });
	}

	return Object.freeze(Lang.translate(list));
});

const showTabsBar = computed(() =>
	loadContent.value
	&& [CONTROLLER_TYPES.BANNER, CONTROLLER_TYPES.ULTRA_SOUND].includes(itemType.value)
);

const currentFormComponent = computed(() => {
	switch (itemType.value) {
		case CONTROLLER_TYPES.BANNER:
			return ItemForm;
		case CONTROLLER_TYPES.ULTRA_SOUND:
			return ItemFormUltraSound;
		case CONTROLLER_TYPES.ULTRA_SOUND_WHITE_RIVER:
			return ItemFormUltraSound;
		case CONTROLLER_TYPES.COUNTER:
			return ItemFormCounter;
		case CONTROLLER_TYPES.NCD:
			return ItemFormNCD;
		default:
			return null;
	}
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
