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
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemForm from './ItemForm.vue';

import { api_request } from '@/api/request_provider';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { Lang } from '@/localization';

const route = useRoute();
const globalStore = useGlobalStore();
const { changeRoute } = useNavigation();

const itemFormRef = ref(null);
const itemData = ref(null);
const itemLoading = ref(false);
const itemSaving = ref(false);
const loadContent = ref(false);

const itemsName = computed(() => ({ one: Lang.tt('Plant'), mult: Lang.tt('Plants') }));

const isCreateMode = computed(() => route.params.id === 'new');

const setupNavbar = () => {
	globalStore.setup_navbar({
		pageTitle: isCreateMode.value
			? `${Lang.tt('New')} ${Lang.tt('Plant')}`
			: itemData.value?.name || Lang.tt('Plant'),
	});
};

const fetchItem = () => {
	if (isCreateMode.value) {
		itemData.value = null;
		loadContent.value = true;
		setupNavbar();
		return Promise.resolve(null);
	}

	itemLoading.value = true;
	return api_request
		.get(`/plants/${route.params.id}`, {
			notNotify: true,
		})
		.then(({ value }) => {
			itemData.value = value;
			loadContent.value = true;
			setupNavbar();
			return value;
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

const handleSubmitForm = (data) => {
	itemSaving.value = true;
	const request = isCreateMode.value
		? api_request.post('/plants', { data, itemName: itemsName.value.one })
		: api_request.put(`/plants/${route.params.id}`, {
				data,
				itemName: itemsName.value.one,
			});
	return request
		.then(() =>
			globalStore.fetch_global_plants({
			params: { max: -1, orderByColumn: 'name', orderByMethod: 'asc' },
			})
		)
		.then(() => {
			changeRoute({ path: '/plants' });
		})
		.finally(() => {
			itemSaving.value = false;
		});
};

const handleCloseButton = () => {
	changeRoute({ history: true, steps: -1 });
};

onMounted(() => {
	fetchItem();
});
</script>
