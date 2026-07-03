<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemsLoading"
			:isSaving="itemsSaving"
			:itemsName="itemsName.mult"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div class="form-wrapper card-content import-rows-wrapper flex column">
						<Filterbar
							hideCreate
							hideDelete
							hideSearchbar
							:itemsLoading="itemsLoading"
							:filters="filters"
							:itemsName="itemsName"
							@event="handleEvent"
						/>

						<ItemForm
							ref="itemFormRef"
							:itemRows="itemsList"
							:itemsName="itemsName"
							:equipmentTypesList="equipmentTypesList"
							@event="handleEvent"
						/>

						<div class="mt-auto">
							<PaginationContainer
								scrollTo=".import-rows-wrapper"
								:itemsName="itemsName"
								:filters="filters"
								:meta="meta"
								@setFilters="setFilters"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, onBeforeMount, ref, shallowRef, shallowReactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useTestingStore } from '@/stores/TestingStore';
import { useNotify } from '@/composables/useNotify';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Filterbar from '@/components/common/Filterbar.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import ItemForm from './ItemForm.vue';

import { useGlobalStore } from '@/stores/GlobalStore';
const globalStore = useGlobalStore();
const { set_value: set_global_store } = globalStore;

const { tt } = Lang;

defineOptions({ name: 'PlantImportLogErrors' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const testingStore = useTestingStore();
const { filters } = storeToRefs(testingStore);
const { Notify } = useNotify();
const fetchEquipmentTypesRequest = createGetRequest(ENTITIES.EquipmentTypes.apiBase);

const itemFormRef = ref(null);
const itemsList = shallowRef([]);
const equipmentTypesList = shallowRef([]);
const equipmentTypesLoading = ref(false);
const itemsLoading = ref(false);
const itemsSaving = ref(false);
const meta = ref({});


const itemsName = computed(() => Object.freeze({
	one: tt('sidebar_menu.Plant_Import_Log'),
	mult: `${tt('sidebar_menu.Plant_Import_Logs')} ${tt('errors')}`,
	instanceName: 'testing',
}));

const navbarSettings = shallowReactive({
	showFilter: true,
	pageTitle: itemsName.value.mult || ''
});

const itemId = computed(() => route.params?.id || null);

const fetchItems = () => {
	if (!itemId.value) return Promise.resolve();
	itemsLoading.value = true;
	return testingStore.fetch_log_errors({
		itemId: itemId.value,
		params: filters.value,
	})
		.then(({ value, fetchedMeta }) => {
			itemsList.value = value || [];
			meta.value = fetchedMeta || {};
		})
		.catch((error) => {
			localFetchItemsCatch(error);
		})
		.finally(() => {
			itemsLoading.value = false;
		});
};
const setFilters = (newFiltersValues, settings = {}) => {
	const nextFilters = {
		...filters.value,
		...newFiltersValues,
		page: settings.preventResetPage ? filters.value.page : 1,
	};
	testingStore.set_settings_filters(nextFilters);
	fetchItems();
};
const fetchEquipmentTypes = () => {
	equipmentTypesLoading.value = true;
	fetchEquipmentTypesRequest({ params: { max: -1 } })
		.then(({ value }) => {
			equipmentTypesList.value = value || [];
		})
		.finally(() => {
			equipmentTypesLoading.value = false;
		});
};
const refetchItemsList = () => fetchItems();
const handleDeleteRow = ({ id } = {}) => {
	itemsList.value = itemsList.value.filter((row) => row.id !== id);
};
const localFetchItemsCatch = (error) => {
	if (error?.response?.status !== 404) return;

	let path = '';
	if (!authStore.hasAccessTo(['view_dashboard'])) {
		if (authStore.hasAccessTo(['view_oee'])) path = '/processes';
		else if (authStore.hasAccessTo(['view_requisitions'])) path = '/requisitions';
	} else {
		path = '/dashboard';
	}
	router.push(path);
	setTimeout(() => {
		Notify({
			type: 'warning',
			title: 'Redirect',
			message: `${itemsName.value.one} with id "${itemId.value}" not found`,
		});
	}, 200);
};

const { handleEvent } = useEventHandler({
	setFilters,
	refetchItemsList,
	handleDeleteRow,
});

onBeforeMount(() => {
	if (navbarSettings) {
		// console.log('useItemsData beforeMount', options)
		set_global_store('navbarSettings', navbarSettings);
	}
});

onMounted(() => {
	fetchEquipmentTypes();
	fetchItems();
});
</script>
