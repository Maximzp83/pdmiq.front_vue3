<template>
	<div class="details-page fix-height success-dashboard">
		<VueElementLoadingWrapper :isLoading="plantsLoading" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper">
			<div v-if="plantItem?.id" class="mcontainer">
				<div class="content-row">
					<ButtonsNavbar card inline bold :itemsList="navbarList" />
				</div>

				<div class="content-row nested-view-content-wrapper">
					<router-view v-slot="{ Component }">
						<transition name="standard-fade" mode="out-in">
							<component
								:is="Component"
								:key="route.fullPath"
								v-bind="childRouteProps"
								@event="handleEvent"
							/>
						</transition>
					</router-view>
				</div>
			</div>

			<div v-else-if="!plantsLoading" class="mcontainer">
				<PageMockImg />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useSensors } from '@/composables/useSensors';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ButtonsNavbar from '@/components/common/ButtonsNavbar.vue';
import PageMockImg from '@/components/common/PageMockImg.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardContainer' });

const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { fetchSensors } = useSensors();

const plantItem = ref(null);
const plantsLoading = ref(false);
const sensorsList = ref([]);
const sensorsLoading = ref(false);

const itemsName = computed(() => Object.freeze({ one: tt('Item'), mult: tt('Items') }));
const plantId = computed(() => {
	if (authStore.authUser?.isCustomer && authStore.authUser?.plant_id) {
		return authStore.authUser.plant_id;
	}
	return globalFilters.value?.plantId;
});
const navbarList = computed(() =>
	Object.freeze([
		{ id: 1, path: '/success-dashboard/main', label: tt('main_dashboard') },
		{ id: 2, path: '/success-dashboard/meeting-tracker', label: tt('Meeting_Tracker') },
		{ id: 4, path: '/success-dashboard/roi-one-pager', label: tt('ROI_One_Pager') },
	]),
);
const navbarSettings = computed(() =>
	Object.freeze({
		showStandardNavItem: true,
		showFilter: true,
		pageTitle: tt('Customer_Success_Dashboard'),
	}),
);
const childRouteProps = computed(() => ({
	plantItem: plantItem.value,
	sensorsList: sensorsList.value,
	sensorsLoading: sensorsLoading.value,
	preventSetNavbar: true,
}));

const methodsMap = {
	fetch_plant: ({ itemId } = {}) => api_request.get(`/plants/${itemId}`, { itemId, notNotify: true }),
	fetch_sensors: ({ params } = {}) => fetchSensors(params, { notNotify: true }),
};

const { doFetchAction } = useRequestsList({ methodsMap });

const fetchPlant = (id) => {
	doFetchAction(methodsMap.fetch_plant, plantItem, plantsLoading, { itemId: id });
};

const fetchPlantSensors = (id) => {
	doFetchAction(methodsMap.fetch_sensors, sensorsList, sensorsLoading, {
		params: { max: -1, plantId: id },
	});
};

const setupPageData = (id) => {
	plantItem.value = null;
	sensorsList.value = [];
	if (!id) return;
	fetchPlant(id);
	fetchPlantSensors(id);
};

const { handleEvent } = useEventHandler({});

watch(plantId, setupPageData);

onBeforeMount(() => {
	globalStore.setup_navbar(navbarSettings.value);
	if (plantId.value) setupPageData(plantId.value);
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
