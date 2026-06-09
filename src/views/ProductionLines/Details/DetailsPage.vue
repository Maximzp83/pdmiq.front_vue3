<template>
	<div class="details-page fix-height main-instance-item">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div v-if="loadContent" class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="nested-view-content-wrapper">
					<div class="view-content-card">
						<div class="section-row header-block">
							<div class="card">
								<div class="card-content flex">
									<Datepicker
										setupDaterangeFilter
										enableShortcuts
										:value="filters.daterange"
										clearingTo="last_7_days"
										type="daterange"
										@input="setFilters"
									/>

									<el-button
										v-if="canEdit"
										type=""
										class="ml-auto action-button tertiary"
										@click="editItem"
									>
										<i class="icomoon icon-pencil"></i>
									</el-button>
								</div>
							</div>
						</div>

						<div class="section-row">
							<div class="mrow flex wrap big-padding">
								<div class="mcol-xs-12 mcol-lg-6">
									<ItemInfoBlock
										:blockTitle="tt('phrases.Production_Line_details')"
										dotsInText
										:itemData="itemData"
										:settingsList="mainInfoSettingsList"
										:countersSettings="countersSettings"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemImagesBlock
										:itemData="itemData"
										showMockSrc="/static/img/prod_line_mock.jpg"
										mockClass="prod-line"
										@event="handleEvent"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemPDMsStatisticBlock
										:itemData="itemData"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
										:chartLegendEvents="chartLegendEvents"
										@event="handleEvent"
									/>
								</div>

								<div v-if="canViewMaintenance" class="mcol-xs-12 mcol-lg-6">
									<ItemWOStatisticBlock
										:createWOButtonFormSetup="createWOButtonFormSetup"
										:itemData="itemData"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
										@event="handleEvent"
									/>
								</div>

								<div class="mcol-xs-12">
									<MachinesList
										preventSetNavbar
										hideDropdownFilterbar
										disableDraggingFeature
										fromDashboard
										fromDetailsPage
										showCardHeader
										:propsFilters="itemsListsFilters"
										:plantId="predefinedFilters.plantId"
										@event="handleEvent"
									/>
								</div>

								<MaintenanceListWrapper
									v-if="canViewMaintenance"
									hideDatepicker
									:woFilters="woFilters"
									:logFilters="logFilters"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { MAINTENANCE_TYPES } from '@/constants/global';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useProductionLinesStore } from '@/stores/ProductionLinesStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import ItemInfoBlock from '@/components/itemDetails/ItemInfoBlock.vue';
import ItemImagesBlock from '@/components/itemDetails/ItemImagesBlock.vue';
import ItemPDMsStatisticBlock from '@/components/itemDetails/ItemPDMsStatisticBlock.vue';
import ItemWOStatisticBlock from '@/components/itemDetails/ItemWOStatisticBlock.vue';
import MaintenanceListWrapper from '@/components/itemDetails/MaintenanceListWrapper.vue';
import MachinesList from '@/views/Machines/ItemsList.vue';

const { tt } = Lang;

defineOptions({ name: 'ProductionLineDetailsPage' });

const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const productionLinesStore = useProductionLinesStore();
const { statistics_filters: filters } = storeToRefs(productionLinesStore);
const { changeRoute } = useNavigation();

const itemData = ref({});
const itemLoading = ref(false);
const loadContent = ref(false);
const itemsName = computed(() => ({
	one: tt('Production_Line'),
	mult: tt('Production_Lines'),
}));
const canEdit = computed(() => authStore.hasAccessTo(['edit_dashboard']));
const canViewMaintenance = computed(() => authStore.hasAccessTo(['view_maintenance']));
const predefinedFilters = computed(() =>
	Object.freeze({
		productionLineId: itemData.value.id,
		plantId: itemData.value.plant_id,
		daterange: filters.value?.daterange,
	}),
);
const itemsListsFilters = computed(() => Object.freeze({ productionLineId: itemData.value.id }));
const woFilters = computed(() =>
	Object.freeze({
		...predefinedFilters.value,
		type: MAINTENANCE_TYPES.WORK_ORDER,
	}),
);
const logFilters = computed(() =>
	Object.freeze({
		...predefinedFilters.value,
		type: MAINTENANCE_TYPES.LOG,
	}),
);
const mainInfoSettingsList = computed(() =>
	Object.freeze([
		{
			prop: 'locations',
			label: tt('Locations'),
			meta: { fromArray: { subProp: 'name' } },
		},
	]),
);
const countersSettings = computed(() =>
	Object.freeze({
		filter: { key: 'productionLineId', valueProp: 'id' },
		items: [
			{ title: tt('Machines'), count: 'machines_count', iconName: 'machines', sectionClass: '.machines-list' },
			{ title: tt('Assets'), count: 'assets_count', iconName: 'assets', sectionClass: '.assets-list' },
			{ title: tt('Items'), count: 'equipments_count', iconName: 'equipments', sectionClass: '.equipments-list' },
		],
	}),
);
const createWOButtonFormSetup = Object.freeze([{ formKey: 'production_line_id', valKey: 'id' }]);
const chartLegendEvents = Object.freeze({});

const setFilters = (range) => {
	productionLinesStore.set_value('statistics_filters', {
		...filters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
	}, {
		toLocalStorage: { prop: 'production_lines_statistics_filters' },
	});
};
const setupNavbar = () => {
	globalStore.setup_navbar({
		showStandardNavItem: true,
		showCompareButton: true,
		pageTitle: itemData.value?.name || tt('phrases.production_line_without_name'),
		showPlantName: itemData.value?.plant ? { name: itemData.value.plant.name } : undefined,
	});
};
const editItem = () => {
	if (itemData.value?.id) changeRoute({ path: `/production-lines/${itemData.value.id}` });
};
const fetchItem = () => {
	itemLoading.value = true;
	return api_request.get(`/production-lines/${route.params.id}`, { notNotify: true })
		.then(({ value }) => {
			itemData.value = value || {};
			loadContent.value = true;
			setupNavbar();
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

const { handleEvent } = useEventHandler({}, null);

onMounted(fetchItem);
onBeforeUnmount(() => globalStore.setup_navbar({}));
</script>
