<template>
	<div class="plant-details details-page main-instance-item">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div v-if="loadContent && itemData" class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="nested-view-content-wrapper">
					<div class="view-content-card">
						<div class="section-row">
							<div class="mrow flex wrap big-padding">
								<div class="mcol-xs-12 mcol-lg-6">
									<ItemInfoBlock
										:blockTitle="`${tt('Plant')} ${tt('details')}`"
										dotsInText
										:itemData="itemData"
										:settingsList="mainInfoSettingsList"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemImagesBlock
										title="Logo"
										:itemData="itemData"
										showMockSrc="/static/img/plant_logo_mock.jpg"
										@event="handleEvent"
									/>
								</div>

								<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
									<ItemPDMsStatisticBlock
										:title="tt('phrases.overall_asset_health')"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
										:chartLegendEvents="chartLegendEvents"
										@event="handleEvent"
									/>
								</div>

								<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
									<Counters
										disableViewAll
										standardIconBlock
										:plantId="itemData.id"
										@event="handleEvent"
									/>
								</div>

								<div
									v-if="canViewMaintenance"
									class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6"
								>
									<ItemWOStatisticBlock
										:createWOButtonFormSetup="createWOButtonFormSetup"
										:itemData="itemData"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
										@event="handleEvent"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import { api_request } from '@/api/request_provider';
import { scrollToElement, waitForElement } from '@/helpers/specialHelpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useMainInstanceDetailsPage } from '@/composables/mixins/useMainInstanceDetailsPage';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { usePlantsStore } from '@/stores/PlantsStore';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemImagesBlock from '@/components/itemDetails/ItemImagesBlock.vue';
import ItemInfoBlock from '@/components/itemDetails/ItemInfoBlock.vue';
import ItemPDMsStatisticBlock from '@/components/itemDetails/ItemPDMsStatisticBlock.vue';
import ItemWOStatisticBlock from '@/components/itemDetails/ItemWOStatisticBlock.vue';
import Counters from './Counters.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'PlantDetailsPage',
});

const emit = defineEmits(['event']);

const authStore = useAuthStore();
const route = useRoute();
const globalStore = useGlobalStore();
const plantsStore = usePlantsStore();
const { statistics_filters: filters } = storeToRefs(plantsStore);
const { globalFilters } = storeToRefs(globalStore);

const itemData = ref(null);
const itemLoading = ref(false);
const loadContent = ref(false);

const itemsName = Object.freeze({
	one: tt('Plant'),
	mult: tt('Plants'),
});

const mainInfoSettingsList = computed(() =>
	Object.freeze(
		translate([
			{ label: 'Company', prop: 'company.name' },
			{ label: 'Region', prop: 'region' },
			{ label: 'Address', prop: 'address' },
			{ label: 'Billing_Plan_Cost', prop: 'billing_plan_cost' },
		]),
	),
);

const additionalNavbarSettings = computed(() =>
	Object.freeze({
		showFilter: true,
		showCompareButton: true,
		datepickerSettings: {
			label: `${tt('phrases.statistics_for_period')}:`,
			storeSettings: {
				storeName: 'PlantsStore',
				stateKey: 'statistics_filters',
			},
		},
	}),
);

const effectivePlantId = computed(() => route.params?.id || globalFilters.value?.plantId || null);

const predefinedFilters = computed(() =>
	Object.freeze({
		plantId: itemData.value?.id,
		daterange: filters.value?.daterange,
	}),
);

const canViewMaintenance = computed(() => authStore.hasAccessTo(['view_maintenance']));
const createWOButtonFormSetup = computed(() =>
	Object.freeze([{ formKey: 'plant_id', valKey: 'id' }]),
);

const setupNavbar = () => {
	globalStore.setup_navbar({
		pageTitle:
			itemData.value?.name ||
			(route.name === 'PlantDetails' ? tt('phrases.Plant_Dashboard') : tt('Plant')),
		...additionalNavbarSettings.value,
		showPlantName: itemData.value?.name
			? { id: itemData.value.id, name: itemData.value.name }
			: undefined,
	});
};

const fetchPlant = async (plantId) => {
	if (!plantId) {
		itemData.value = null;
		loadContent.value = false;
		setupNavbar();
		return;
	}

	itemLoading.value = true;
	try {
		const { value } = await api_request.get(`/plants/${plantId}`, {
			notNotify: true,
			itemId: plantId,
		});
		itemData.value = value;
		loadContent.value = true;
		setupNavbar();
	} catch (error) {
		console.warn(error);
		itemData.value = null;
		loadContent.value = false;
	} finally {
		itemLoading.value = false;
	}
};

const initialPageSetup = () => fetchPlant(effectivePlantId.value);

const { chartLegendEvents, showItemsWithSensors, handleCreateWorkOrderButton } =
	useMainInstanceDetailsPage({
	itemData,
	instanceViewName: 'Plants',
	itemsName,
	predefinedFilters,
	filters,
	initialPageSetup,
});

const handleScrollTo = () => {
	const query = window.location.search ? new URLSearchParams(window.location.search) : null;
	const scrollTo = query?.get('scrollTo');
	if (scrollTo) {
		waitForElement(scrollTo, () => {
			scrollToElement(scrollTo);
		});
	}
};

const methodsMap = {
	showItemsWithSensors,
	handleCreateWorkOrderButton,
};

const { handleEvent } = useEventHandler(methodsMap, emit);

watch(effectivePlantId, () => {
	initialPageSetup();
}, { immediate: true });

onMounted(() => {
	setupNavbar();
	handleScrollTo();
});
</script>
