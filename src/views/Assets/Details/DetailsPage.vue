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
										type="daterange"
										clearingTo="last_7_days"
										@input="setFilters"
									/>

									<el-button
										v-if="canEdit"
										type=""
										class="ml-auto action-button tertiary vertical-fluid"
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
										:blockTitle="`${tt('Asset')} ${tt('details')}`"
										dotsInText
										:itemData="itemData"
										:settingsList="mainInfoSettingsList"
										:countersSettings="countersSettings"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemImagesBlock
										:itemData="itemData"
										imagesListKey="brandModels"
										imgObjFitContain
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
import { getObjectVal } from '@/helpers';
import { MAINTENANCE_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useAssetsStore } from '@/stores/AssetsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import ItemInfoBlock from '@/components/itemDetails/ItemInfoBlock.vue';
import ItemImagesBlock from '@/components/itemDetails/ItemImagesBlock.vue';
import ItemPDMsStatisticBlock from '@/components/itemDetails/ItemPDMsStatisticBlock.vue';
import ItemWOStatisticBlock from '@/components/itemDetails/ItemWOStatisticBlock.vue';
import MaintenanceListWrapper from '@/components/itemDetails/MaintenanceListWrapper.vue';

const { tt } = Lang;

defineOptions({ name: 'AssetDetailsPage' });

const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const assetsStore = useAssetsStore();
const { statistics_filters: filters } = storeToRefs(assetsStore);
const { changeRoute } = useNavigation();

const itemData = ref({});
const itemLoading = ref(false);
const loadContent = ref(false);
const itemsName = computed(() => ({
	one: tt('Asset'),
	mult: tt('Assets'),
}));
const canEdit = computed(() => authStore.hasAccessTo(['edit_dashboard']));
const canViewMaintenance = computed(() => authStore.hasAccessTo(['view_maintenance']));
const predefinedFilters = computed(() =>
	Object.freeze({
		productionLineId: itemData.value.machine ? itemData.value.machine.production_line_id : null,
		machineId: itemData.value.machine_id,
		assetId: itemData.value.id,
		plantId: itemData.value.plant_id,
		daterange: filters.value?.daterange,
	}),
);
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
		{ prop: 'productionLine.name', label: tt('Production_Line') },
		{ prop: 'machine.name', label: tt('Machine') },
		{ prop: 'location.name', label: tt('Location') },
		{
			label: tt('part_numbers'),
			prop: 'brandModels',
			meta: { fromArray: { subProp: 'name' } },
		},
	]),
);
const countersSettings = computed(() =>
	Object.freeze({
		filter: { key: 'assetId', valueProp: 'id' },
		items: [
			{
				title: tt('Items'),
				count: 'equipments_count',
				iconName: 'equipments',
				sectionClass: '.equipments-list',
			},
		],
	}),
);
const createWOButtonFormSetup = Object.freeze([
	{ formKey: 'production_line_id', valKey: 'machine.production_line_id' },
	{ formKey: 'machine_id', valKey: 'machine_id' },
	{ formKey: 'asset_id', valKey: 'id' },
]);
const chartLegendEvents = Object.freeze({});
const creationWOModalSettings = computed(() =>
	Object.freeze({
		itemName: tt('Work_Order'),
		editModalProp: 'editModalClassic',
		modalClassName: 'fixed-header-footer small-header small-footer',
		className: 'maintenance-modal',
		formComponentFileLoader: () => import('@/views/Maintenance/MaintenanceFormWrapper.vue'),
		additionalModalSettings: {
			switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
			...woFilters.value,
		},
	}),
);

const setFilters = (range) => {
	assetsStore.set_value('statistics_filters', {
		...filters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
	}, {
		toLocalStorage: { prop: 'assets_statistics_filters' },
	});
};
const setupNavbar = () => {
	globalStore.setup_navbar({
		showStandardNavItem: true,
		showCompareButton: true,
		pageTitle: itemData.value?.name || tt('phrases.asset_without_name'),
		showPlantName: itemData.value?.plant
			? { id: itemData.value.plant.id, name: itemData.value.plant.name }
			: undefined,
	});
};
const editItem = () => {
	if (itemData.value?.id) changeRoute({ path: `/assets/${itemData.value.id}` });
};
const setupFormSettings = ({ row, formSetup }) => {
	const settings = {};
	formSetup.forEach((fi) => {
		settings[fi.formKey] = getObjectVal(row, fi.valKey);
	});
	return settings;
};
const handleCreateWorkOrderButton = (payload) => {
	globalStore.show_edit_modal({
		...creationWOModalSettings.value,
		show: true,
		formSettings: setupFormSettings(payload),
	});
};
const fetchItem = () => {
	itemLoading.value = true;
	return api_request.get(`/assets/${route.params.id}`, { notNotify: true })
		.then(({ value }) => {
			itemData.value = value || {};
			loadContent.value = true;
			setupNavbar();
		})
		.finally(() => {
			itemLoading.value = false;
		});
};

const { handleEvent } = useEventHandler({ handleCreateWorkOrderButton }, null);

onMounted(fetchItem);
onBeforeUnmount(() => globalStore.setup_navbar({}));
</script>
