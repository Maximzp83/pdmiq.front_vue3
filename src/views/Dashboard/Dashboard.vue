<template>
	<div class="details-page fix-height plant-dashboard">
		<VueElementLoadingWrapper :isLoading="plantsLoading" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div v-if="plantItem?.id" class="mcontainer">
				<div class="content-row nested-view-content-wrapper">
					<RouterView v-slot="{ Component }">
						<transition name="standard-fade" mode="out-in">
							<component
								:is="Component"
								ref="nestedViewContent"
								:key="detailsComponentKey"
								:plantItem="plantItem"
								:plantId="plantId"
								:additionalModalSettings="modalSettingsForItemsLists"
								@event="handleEvent"
							/>
						</transition>
					</RouterView>
				</div>
			</div>

			<div v-else-if="!plantsLoading" class="mcontainer">
				<PageMockImg />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onBeforeMount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useAssetsStore } from '@/stores/AssetsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMachinesStore } from '@/stores/MachinesStore';
import { useProductionLinesStore } from '@/stores/ProductionLinesStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import PageMockImg from '@/components/common/PageMockImg.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({ name: 'PlantDashboard' });

const emit = defineEmits(['event']);

const authStore = useAuthStore();
const assetsStore = useAssetsStore();
const equipmentsStore = useEquipmentsStore();
const globalStore = useGlobalStore();
const machinesStore = useMachinesStore();
const productionLinesStore = useProductionLinesStore();
const { authUser } = storeToRefs(authStore);
const { globalFilters } = storeToRefs(globalStore);

const plantItem = ref(null);
const plantsLoading = ref(false);
const detailsComponentKey = ref(1);

const itemsName = computed(() => ({
	one: tt('Plant'),
	mult: tt('Plants'),
}));
const modalSettingsForItemsLists = computed(() =>
	Object.freeze({
		multiform: true,
		componentFileLoader: () => import('@/views/Dashboard/MultiFormWrapper.vue'),
	}),
);
const plantId = computed(() => {
	const user = authUser.value || {};
	const plantsIds = user.plants_ids || [];
	const userPlantId = user.plant_id;

	if (!userPlantId) return globalFilters.value?.plantId || null;
	if (!plantsIds.length) return userPlantId;
	return globalFilters.value?.plantId || null;
});

const setupNavbar = () => {
	globalStore.setup_navbar({
		showStandardNavItem: true,
		showFilter: true,
		pageTitle: tt('phrases.Plant_Dashboard'),
	});
};
const fetchPlant = (id) => {
	if (!id) {
		plantItem.value = null;
		return Promise.resolve();
	}

	plantsLoading.value = true;
	return api_request.get(`/plants/${id}`, {
		itemId: id,
		notNotify: true,
	})
		.then(({ value }) => {
			plantItem.value = value || null;
			detailsComponentKey.value += 1;
		})
		.finally(() => {
			plantsLoading.value = false;
		});
};
const resetStoreFilters = (store, stateProp, resetKeys) => {
	const currentFilters = store[stateProp] || {};
	const resetValues = resetKeys.reduce((result, key) => {
		result[key] = null;
		return result;
	}, {});

	store.set_value(stateProp, {
		...currentFilters,
		...resetValues,
		page: 1,
	});
};
const resetChildFilters = () => {
	resetStoreFilters(productionLinesStore, 'filters', ['locationId']);
	resetStoreFilters(productionLinesStore, 'utility_filters', ['locationId']);
	resetStoreFilters(machinesStore, 'filters', ['productionLineId', 'locationId', 'applicationId']);
	resetStoreFilters(assetsStore, 'filters', ['productionLineId', 'locationId', 'machineId']);
	resetStoreFilters(equipmentsStore, 'filters', [
		'productionLineId',
		'machineId',
		'assetId',
		'locationId',
		'brandId',
		'brandModelId',
	]);
};

const { handleEvent } = useEventHandler({}, emit);

watch(
	() => globalFilters.value?.plantId,
	() => {
		resetChildFilters();
	},
);

watch(plantId, (id) => {
	plantItem.value = null;
	if (id) fetchPlant(id);
}, { immediate: true });

onBeforeMount(setupNavbar);
onBeforeUnmount(() => globalStore.setup_navbar({}));
</script>
