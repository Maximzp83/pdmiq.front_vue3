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
								:plantItem="plantItem"
								:sensorsList="sensorsList"
								:sensorsLoading="sensorsLoading"
								preventSetNavbar
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

const fetchPlant = async (id) => {
	plantItem.value = null;
	if (!id) return;
	plantsLoading.value = true;
	try {
		const { value } = await api_request.get(`/plants/${id}`, { itemId: id, notNotify: true });
		plantItem.value = value;
	} finally {
		plantsLoading.value = false;
	}
};

const fetchPlantSensors = async (id) => {
	sensorsList.value = [];
	if (!id) return;
	sensorsLoading.value = true;
	try {
		const { value } = await fetchSensors({ max: -1, plantId: id }, { notNotify: true });
		sensorsList.value = value || [];
	} finally {
		sensorsLoading.value = false;
	}
};

const setupPageData = (id) => {
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
