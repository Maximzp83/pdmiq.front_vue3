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
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

const route = useRoute();
const globalStore = useGlobalStore();
const { changeRoute } = useNavigation();

const itemFormRef = ref(null);
const itemData = ref(null);
const itemLoading = ref(false);
const itemSaving = ref(false);
const loadContent = ref(false);

const itemsName = computed(() => ({
	one: Lang.tt('Application'),
	mult: Lang.tt('Applications'),
}));

const isCreateMode = computed(() => route.name === 'ApplicationCreate');

const setupNavbar = () => {
	globalStore.setup_navbar({
		pageTitle: isCreateMode.value
			? `${Lang.tt('New')} ${Lang.tt('Application')}`
			: itemData.value?.name || Lang.tt('Application'),
	});
};

const fetchItem = async () => {
	if (isCreateMode.value) {
		loadContent.value = true;
		setupNavbar();
		return;
	}

	itemLoading.value = true;
	try {
		const { value } = await api_request.get(`/applications/${route.params.id}`, {
			notNotify: true,
		});
		itemData.value = value;
		loadContent.value = true;
		setupNavbar();
	} finally {
		itemLoading.value = false;
	}
};

const handleSubmitForm = async (data) => {
	itemSaving.value = true;
	try {
		if (isCreateMode.value) {
			await api_request.post('/applications', {
				data,
				itemName: itemsName.value.one,
			});
		} else {
			await api_request.put(`/applications/${route.params.id}`, {
				data,
				itemName: itemsName.value.one,
			});
		}

		changeRoute({ path: '/applications' });
	} finally {
		itemSaving.value = false;
	}
};

const handleCloseButton = () => {
	changeRoute({ history: true, steps: -1 });
};

onMounted(() => {
	fetchItem();
});
</script>
