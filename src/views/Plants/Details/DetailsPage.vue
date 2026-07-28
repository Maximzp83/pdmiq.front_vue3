<template>
	<div class="plant-details details-page fix-height main-instance-item">
		<VueElementLoadingWrapper
			v-if="!plantItem"
			:isLoading="plantLoading"
			:itemsName="itemsName.one"
		/>

		<div v-if="currentPlant?.id" class="view-content-card">
			<div class="section-row">
				<div class="mrow flex wrap big-padding">
					<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
						<ItemPDMsStatisticBlock
							:title="tt('phrases.overall_asset_health')"
							:itemData="currentPlant"
							:filters="filters"
							:predefinedFilters="predefinedFilters"
							:chartLegendEvents="chartLegendEvents"
							@event="handleEvent"
						/>
					</div>

					<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
						<Counters
							:plantId="currentPlant.id"
							@event="handleEvent"
						/>
					</div>

					<div class="mcol-xs-12">
						<EquipmentsLayout
							ref="equipmentsLayoutRef"
							hideDropdownFilterbar
							hideDatepicker
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="equipmentsListFilters"
							:plantId="predefinedFilters.plantId"
							@event="handleEvent"
						/>
					</div>

					<div class="mcol-xs-12">
						<AssetsList
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
							@event="handleEvent"
						/>
					</div>

					<div class="mcol-xs-12">
						<MachinesList
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
							@event="handleEvent"
						/>
					</div>

					<div class="mcol-xs-12">
						<ProductionLinesList
							:productionLineType="PRODUCTION_LINES_TYPES.PRODUCTION_LINE"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
							@event="handleEvent"
						/>
					</div>

					<div class="mcol-xs-12">
						<ProductionLinesList
							:productionLineType="PRODUCTION_LINES_TYPES.UTILITY"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
							@event="handleEvent"
						/>
					</div>

					<MaintenanceListWrapper
						v-if="canViewMaintenance"
						ref="maintenanceListWrapperRef"
						:woFilters="woFilters"
						:logFilters="logFilters"
						hideDatepicker
						fromPlantDashboard
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, onBeforeMount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import { api_request } from '@/api/request_provider';
import { PRODUCTION_LINES_TYPES } from '@/constants/global';
import { scrollToElement, waitForElement } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';

import { useGlobalStore } from '@/stores/GlobalStore';
import { useAssetsStore } from '@/stores/AssetsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useMachinesStore } from '@/stores/MachinesStore';
import { usePlantsStore } from '@/stores/PlantsStore';
import { useProductionLinesStore } from '@/stores/ProductionLinesStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useMainInstanceDetailsPage } from '@/composables/mixins/useMainInstanceDetailsPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ItemPDMsStatisticBlock from '@/components/itemDetails/ItemPDMsStatisticBlock.vue';
import MaintenanceListWrapper from '@/components/itemDetails/MaintenanceListWrapper.vue';
import AssetsList from '@/views/Assets/ItemsList.vue';
import MachinesList from '@/views/Machines/ItemsList.vue';
import ProductionLinesList from '@/views/ProductionLines/ItemsList.vue';
import Counters from './Counters.vue';
import EquipmentsLayout from '@/views/Equipments/EquipmentsLayout.vue';

const { tt } = Lang;

defineOptions({ name: 'PlantDetails' });

const props = defineProps({
	plantItem: { type: Object, default: null },
	plantId: { type: [Number, String], default: null },
	additionalModalSettings: { type: Object, default: null },
});
const emit = defineEmits(['event']);

const route = useRoute();
const globalStore = useGlobalStore();
const { set_value: set_global_store } = globalStore;
const assetsStore = useAssetsStore();
const authStore = useAuthStore();
const equipmentsStore = useEquipmentsStore();
const machinesStore = useMachinesStore();
const plantsStore = usePlantsStore();
const productionLinesStore = useProductionLinesStore();
const { statistics_filters: filters } = storeToRefs(plantsStore);

const fallbackPlant = ref(null);
const plantLoading = ref(false);
const maintenanceListWrapperRef = ref(null);
const equipmentsLayoutRef = ref(null);

const navbarSettings = computed(() =>
	Object.freeze({
		showFilter: true,
		showCompareButton: true,
		datepickerSettings: {
			label: `${tt('phrases.statistics_for_period')}:`,
			storeSettings: {
				storeName: 'PlantsStore',
				stateKey: 'statistics_filters'
			},
		}
	}),
);

const currentPlant = computed(() => props.plantItem || fallbackPlant.value);
const itemsName = computed(() => ({
	one: tt('Plant'),
	mult: tt('Plants'),
}));
const canViewMaintenance = computed(() => authStore.hasAccessTo(['view_maintenance']));
const predefinedFilters = computed(() =>
	Object.freeze({
		plantId: currentPlant.value?.id,
		daterange: filters.value?.daterange,
	}),
);
const itemsListsFilters = computed(() =>
	Object.freeze({
		plantId: currentPlant.value?.id,
	}),
);
const equipmentsListFilters = computed(() =>
	Object.freeze({
		plantId: currentPlant.value?.id,
		daterange: filters.value?.daterange,
	}),
);

const {
	woFilters,
	logFilters,
	chartLegendEvents,
	showItemsWithSensors,
	handleCreateWorkOrderButton,
} = useMainInstanceDetailsPage({
	itemData: currentPlant,
	instanceDataKey: 'plantItem',
	instanceViewName: 'Plants',
	itemsName,
	predefinedFilters,
	filters,
	maintenanceListWrapperRef,
	equipmentsLayoutRef,
	initialPageSetup: () => fetchFallbackPlant(),
});

const fetchFallbackPlant = () => {
	if (props.plantItem) return Promise.resolve();

	const id = props.plantId || route.params?.id;
	if (!id) {
		fallbackPlant.value = null;
		return Promise.resolve();
	}

	plantLoading.value = true;
	return api_request.get(`/plants/${id}`, {
		itemId: id,
		notNotify: true,
	})
		.then(({ value }) => {
			fallbackPlant.value = value || null;
		})
		.finally(() => {
			plantLoading.value = false;
		});
};
const setListVisible = (store, stateProp = 'filters') => {
	const currentFilters = store[stateProp] || {};
	store.set_value(stateProp, {
		...currentFilters,
		isShowList: true,
		page: 1,
	});
};
const viewTable = ({ iconName }) => {
	if (iconName === 'equipments') {
		setListVisible(equipmentsStore);
		setTimeout(() => scrollToElement('.equipments-layout'), 270);
		return;
	}
	if (iconName === 'assets') {
		setListVisible(assetsStore);
		setTimeout(() => scrollToElement('.assets-list'), 270);
		return;
	}
	if (iconName === 'machines') {
		setListVisible(machinesStore);
		setTimeout(() => scrollToElement('.machines-list'), 270);
		return;
	}
	if (iconName === 'production_lines') {
		setListVisible(productionLinesStore);
		setListVisible(productionLinesStore, 'utility_filters');
		setTimeout(() => scrollToElement('.production_lines-list'), 270);
	}
};
const handleScrollTo = () => {
	const scrollTo = route.query?.scrollTo;
	if (scrollTo) {
		waitForElement(scrollTo, () => {
			scrollToElement(scrollTo);
		});
	}
};

const { handleEvent } = useEventHandler({
	viewTable,
	showItemsWithSensors,
	handleCreateWorkOrderButton,
}, emit);

watch(
	() => [props.plantItem, props.plantId, route.params?.id],
	() => fetchFallbackPlant(),
	{ immediate: true },
);

onBeforeMount(() => {
	set_global_store('navbarSettings', navbarSettings.value);
});

onMounted(handleScrollTo);
</script>
