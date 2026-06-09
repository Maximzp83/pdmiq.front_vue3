<template>
	<div :class="['equipments-layout card content-row', { 'view-content-card': !fromDetailsPage }]">
		<div v-if="showCardHeader" class="flex align-center card-header filled_2 relative">
			<h1 class="title page-title outside-bg-addition uppercase">{{ tt('Items') }}</h1>
			<div
				v-if="showToggleListButton"
				:class="['ml-auto toggle-list-button', { active: !filters.isShowList }]"
			>
				<span>{{ !filters.isShowList ? tt('Show') : tt('Hide') }}</span>
				<i class="icomoon icon-path_2"></i>
				<div class="absolute stretch pointer" @click="setFilters({ isShowList: !filters.isShowList })"></div>
			</div>
		</div>

		<div v-if="showToggleListButton ? filters.isShowList : true" class="card-content">
			<DropdownFilterbar
				ref="dropdownFilterbarRef"
				hideToggleButton
				:showCreateActions="hasAccessToCreate || hasAccessToDelete"
				:hideCreate="!hasAccessToCreate"
				:hideDelete="!hasAccessToDelete"
				:itemsName="itemsName"
				filterbarDropdownId="equipmentsDropdownFilterbar"
				@event="handleEvent"
			>
				<template #prefixFilters>
					<div class="mcol-xs-12 mcol-sm-8 fluid">
						<div class="radio-buttons-wrapper mrow flex wrap align-center">
							<RadioButtonsBlock
								:model-value="activeRadioFilter"
								:settings="radioBlockOptions"
								:optionsList="filterButtonsList"
								@update:model-value="handleRadioFilters"
								@onChange="handleRadioFilters"
							/>

							<div v-if="showStoreRoomFilter" class="filter-item">
								<CustomSelectV2
									:model-value="filters.storeroomId"
									filterable
									clearable
									:optionsLoading="storeRoomsLoading"
									:optionsList="storeRoomsList"
									:placeholder="tt('phrases.All_storerooms')"
									@update:model-value="(id) => setFilters({ storeroomId: id })"
								/>
							</div>

							<div v-if="showStoreRoomFilter" class="filter-item">
								<CustomSelectV2
									:model-value="filters.storeroomLocationId"
									filterable
									clearable
									:optionsLoading="storeRoomsLoading"
									:optionsList="storeRoomLocationsList"
									:placeholder="tt('phrases.all_storeroom_locations')"
									@update:model-value="(id) => setFilters({ storeroomLocationId: id })"
								/>
							</div>

							<div v-if="showClearFilters" class="filter-item ml-auto">
								<el-button class="small" type="primary" native-type="button" @click="handleClearFilters">
									{{ tt('phrases.Clear_filters') }}
								</el-button>
							</div>

							<div class="ml-auto filter-item equipment-type-selector">
								<CustomSelectV2
									:model-value="filters.typeId"
									className="capitalize"
									:disabled="isStoreRoomTab"
									filterable
									clearable
									:optionsLoading="equipmentTypesLoading"
									:optionsList="equipmentTypesList"
									:placeholder="tt('Item_type')"
									@update:model-value="(id) => setFilters({ typeId: id })"
								/>
							</div>

							<div class="ml-auto filter-item toggle-additional-filters">
								<el-button
									type="primary"
									:disabled="isStoreRoomTab"
									native-type="button"
									:class="['action-button inverted', { active: showFilterbar }]"
									@click="toggleFilterbar"
								>
									<i :class="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"></i>
								</el-button>
							</div>
						</div>
					</div>
				</template>

				<div class="mrow filter-items-list relative">
					<div v-show="!globalFilters.plantId" class="disable-filters-ovelay">
						<div class="caption">{{ tt('phrases.Select_plant_first') }}</div>
					</div>

					<div class="filter-item">
						<CustomSelectV2
							:model-value="filters.locationId"
							filterable
							clearable
							:optionsLoading="locationsLoading"
							:optionsList="locationsList"
							:placeholder="tt('Location')"
							@update:model-value="(id) => setFilters({ locationId: id }, ['machineId', 'assetId', 'productionLineId', 'brandId', 'brandModelId'])"
						/>
					</div>

					<div class="filter-item">
						<CustomSelectV2
							:model-value="filters.productionLineId"
							filterable
							clearable
							:optionsLoading="productionLinesLoading"
							:optionsList="productionLinesList"
							:placeholder="tt('Production_line')"
							@update:model-value="(id) => setFilters({ productionLineId: id }, ['machineId', 'assetId', 'brandId', 'brandModelId'])"
						/>
					</div>

					<div class="filter-item">
						<CustomSelectV2
							:model-value="filters.machineId"
							filterable
							clearable
							:optionsLoading="machinesLoading"
							:optionsList="machinesList"
							:placeholder="tt('Machine')"
							@update:model-value="(id) => setFilters({ machineId: id }, ['assetId', 'brandId', 'brandModelId'])"
						/>
					</div>

					<div class="filter-item">
						<CustomSelectV2
							:model-value="filters.assetId"
							filterable
							clearable
							:optionsLoading="assetsLoading"
							:optionsList="assetsList"
							:placeholder="tt('Asset')"
							@update:model-value="(id) => setFilters({ assetId: id }, ['brandId', 'brandModelId'])"
						/>
					</div>

					<div class="filter-item">
						<CustomSelectV2
							:model-value="filters.brandId"
							filterable
							clearable
							:optionsLoading="brandsLoading"
							:optionsList="brandsList"
							:placeholder="tt('Brand')"
							@update:model-value="(id) => setFilters({ brandId: id }, ['brandModelId'])"
						/>
					</div>

					<div class="filter-item">
						<CustomSelectV2
							:model-value="filters.brandModelId"
							filterable
							clearable
							:optionsLoading="brandModelsLoading"
							:optionsList="brandModelsList"
							:placeholder="tt('Part_number')"
							@update:model-value="(id) => setFilters({ brandModelId: id })"
						/>
					</div>
				</div>
			</DropdownFilterbar>

			<Filterbar
				hideCreate
				hideDelete
				:itemsLoading="false"
				:filters="filters"
				:itemsName="itemsName"
				:perPageItems="perPageItems"
				searchbarClass="mcol-sm-5 mcol-lg-auto"
				perPageClassName="lg-ml-not-auto"
				@event="handleEvent"
			>
				<template #middle>
					<div class="filter-item checkbox-item ml-auto">
						<el-checkbox
							:model-value="filters.favorites"
							:false-label="null"
							@change="(favorites) => setFilters({ favorites })"
						>
							{{ tt('Favorites') }}
						</el-checkbox>
					</div>

					<div class="filter-item checkbox-item ml-auto">
						<el-checkbox
							:model-value="filters.hasSensors"
							:false-label="null"
							@change="(hasSensors) => setFilters({ hasSensors })"
						>
							{{ tt('PDM') }}
						</el-checkbox>
					</div>

					<div v-show="filters.hasSensors" class="filter-item checkbox-item">
						<el-checkbox
							:model-value="filters.archivedNodes"
							:false-label="null"
							@change="(archivedNodes) => setFilters({ archivedNodes })"
						>
							{{ tt('phrases.Display_Archived_Sensors') }}
						</el-checkbox>
					</div>

					<div class="filter-item mcol-xs-auto mcol-sm-5 mcol-lg-auto">
						<el-select
							:disabled="isStoreRoomTab"
							collapse-tags
							multiple
							:placeholder="tt('phrases.Select_alert_types')"
							:model-value="alertTypesFilters"
							@change="handleAlertTypesFilter"
						>
							<el-option
								v-for="item in alertTypesList"
								:key="`alert-type-${item.id}`"
								:label="item.name"
								:value="item.id"
							/>
						</el-select>
					</div>

					<div v-if="!hideDatepicker" class="filter-item text-right mcol-xs-auto">
						<Datepicker
							setupDaterangeFilter
							enableShortcuts
							:model-value="filters.daterange"
							type="daterange"
							@update:model-value="handleDateRange"
							@input="handleDateRange"
						/>
					</div>
				</template>

				<template #last>
					<div :class="['filter-item grid-buttons flex', { wider: !disableDraggingFeature }]">
						<RadioButtonsBlock
							:model-value="activeGrid"
							:settings="gridSwitcherOptions"
							:optionsList="gridTypesList"
							@update:model-value="toggleItemsGrid"
							@onChange="toggleItemsGrid"
						/>

						<span v-if="!disableDraggingFeature">
							<el-button
								:disabled="isStoreRoomTab"
								:class="['drag_n_drop-locker', { active: !draggingLocked }]"
								native-type="button"
								@click="globalFilters.plantId ? (draggingLocked = !draggingLocked) : null"
							>
								<i :class="['icomoon', draggingLocked ? 'icon-lock2' : 'icon-unlock']"></i>
							</el-button>
						</span>
					</div>

					<div v-show="filters.hasSensors && !isStoreRoomTab" class="filter-item mcol-xs-12">
						<RadioButtonsBlock
							:model-value="filters.sensor_class"
							:settings="radioSensorTypeSettings"
							:optionsList="sensorTypesButtonsList"
							@update:model-value="handleSensorTypeFilter"
							@onChange="handleSensorTypeFilter"
						/>
					</div>
				</template>
			</Filterbar>

			<EquipmentsList
				ref="itemsListContainerRef"
				:hideDatepicker="hideDatepicker"
				:fromDashboard="fromDashboard"
				:fromDetailsPage="fromDetailsPage"
				:preventSetNavbar="preventSetNavbar"
				:additionalModalSettings="additionalModalSettings"
				:propsFilters="finalEquipmentsFilters"
				:plantId="plantId"
				fromLayout
				watchPropsFiltersOnly
				:perPageItems="perPageItems"
				:draggingLockedProp="draggingLocked"
				:activeGrid="activeGrid"
				:equipmentTypesList="equipmentTypesList"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ALERT_TYPES, alertTypesList as getAlertTypesList, sensorClassesList } from '@/constants/global';
import { getDateRange, getYmdDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSwitchGridView } from '@/composables/mixins/useSwitchGridView';
import { ENTITIES } from '@/config/entities';

import Datepicker from '@/components/common/Datepicker.vue';
import DropdownFilterbar from '@/components/common/DropdownFilterbar.vue';
import Filterbar from '@/components/common/Filterbar.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import EquipmentsList from './ItemsList.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentsLayout' });

const props = defineProps({
	additionalModalSettings: Object,
	plantId: null,
	hideDatepicker: Boolean,
	fromDashboard: Boolean,
	fromDetailsPage: Boolean,
	showCardHeader: Boolean,
	showToggleListButton: Boolean,
	preventSetNavbar: Boolean,
	disableDraggingFeature: Boolean,
	propsFilters: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const equipmentsStore = useEquipmentsStore();
const sensorsStore = useSensorsStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters } = storeToRefs(equipmentsStore);
const { statistics_filters: sensorsStatisticsFilters } = storeToRefs(sensorsStore);

const dropdownFilterbarRef = ref(null);
const itemsListContainerRef = ref(null);
const showFilterbar = ref(false);
const draggingLocked = ref(true);
const activeRadioFilter = ref('isAsset');
const alertTypesFilters = ref([]);
const showStoreRoomFilter = ref(false);
const locationsList = shallowRef([]);
const locationsLoading = ref(false);
const productionLinesList = shallowRef([]);
const productionLinesLoading = ref(false);
const machinesList = shallowRef([]);
const machinesLoading = ref(false);
const assetsList = shallowRef([]);
const assetsLoading = ref(false);
const brandsList = shallowRef([]);
const brandsLoading = ref(false);
const brandModelsList = shallowRef([]);
const brandModelsLoading = ref(false);
const equipmentTypesList = shallowRef([]);
const equipmentTypesLoading = ref(false);
const storeRoomsList = shallowRef([]);
const storeRoomsLoading = ref(false);

const fetchLocationsRequest = createGetRequest(ENTITIES.Locations.apiBase);
const fetchProductionLinesRequest = createGetRequest(ENTITIES.ProductionLines.apiBase);
const fetchMachinesRequest = createGetRequest(ENTITIES.Machines.apiBase);
const fetchAssetsRequest = createGetRequest(ENTITIES.Assets.apiBase);
const fetchBrandsRequest = createGetRequest(ENTITIES.Brands.apiBase);
const fetchBrandModelsRequest = createGetRequest(ENTITIES.BrandModels.apiBase);
const fetchEquipmentTypesRequest = createGetRequest(ENTITIES.EquipmentTypes.apiBase);
const fetchStoreRoomsRequest = createGetRequest(ENTITIES.StoreRooms.apiBase);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_dashboard']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_dashboard']));
const isStoreRoomTab = computed(() => activeRadioFilter.value === 'isStoreRoom');
const itemsName = computed(() => Object.freeze({ one: tt('Item'), mult: tt('Items'), instanceName: 'Equipments' }));
const finalFilters = computed(() => ({ ...filters.value }));
const finalEquipmentsFilters = computed(() => ({ ...finalFilters.value, ...props.propsFilters }));
const clearableFiltersList = Object.freeze([
	'locationId',
	'productionLineId',
	'machineId',
	'assetId',
	'storeroomId',
	'brandId',
	'brandModelId',
	'typeId',
	'q',
	'hasSensors',
	'sensorType',
	'dataSet',
	'alert_types',
	'offlineNodes',
	'sensor_class',
	'flat_metric_data_anomaly',
]);
const showClearFilters = computed(() =>
	clearableFiltersList.some((key) =>
		Array.isArray(filters.value?.[key]) ? filters.value[key].length : !!filters.value?.[key],
	),
);
const alertTypesList = computed(() => {
	const list = getAlertTypesList().filter((item) =>
		[ALERT_TYPES.ALARM, ALERT_TYPES.WARNING, ALERT_TYPES.LUBE].includes(item.id),
	);
	list.push({ id: 'offline', name: tt('Offline') }, { id: 'anomaly', name: tt('phrases.Flat_Data_Anomaly') });
	return list;
});
const sensorTypesButtonsList = computed(() => Object.freeze(sensorClassesList()));
const radioSensorTypeSettings = Object.freeze({ hideTitle: true, inline: true, clearable: true, buttonType: 'primary' });
const radioBlockOptions = Object.freeze({ hideTitle: true, buttonType: 'primary' });
const filterButtonsList = computed(() =>
	Object.freeze([
		{ id: 'isAsset', title: tt('Asset') },
		{ id: 'isStoreRoom', title: tt('Storeroom') },
	]),
);
const selectedStoreroom = computed(() => storeRoomsList.value.find((item) => item.id === filters.value?.storeroomId) || null);
const storeRoomLocationsList = computed(() => selectedStoreroom.value?.locations || []);
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: fetchLocationsRequest,
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [{ getValue: () => globalFilters.value?.plantId, param: 'plantId' }],
			localProp: locationsList,
			localLoadProp: locationsLoading,
		},
		{
			action: fetchProductionLinesRequest,
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [
				{ getValue: () => globalFilters.value?.plantId, param: 'plantId' },
				{ getValue: () => filters.value?.locationId, param: 'locationId' },
			],
			localProp: productionLinesList,
			localLoadProp: productionLinesLoading,
		},
		{
			action: fetchMachinesRequest,
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [
				{ getValue: () => globalFilters.value?.plantId, param: 'plantId' },
				{ getValue: () => filters.value?.locationId, param: 'locationId' },
				{ getValue: () => filters.value?.productionLineId, param: 'productionLineId' },
			],
			localProp: machinesList,
			localLoadProp: machinesLoading,
		},
		{
			action: fetchAssetsRequest,
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [
				{ getValue: () => globalFilters.value?.plantId, param: 'plantId', noFetch: true },
				{ getValue: () => filters.value?.locationId, param: 'locationId' },
				{ getValue: () => filters.value?.productionLineId, param: 'productionLineId' },
				{ getValue: () => filters.value?.machineId, param: 'machineId' },
			],
			localProp: assetsList,
			localLoadProp: assetsLoading,
		},
		{
			action: fetchBrandsRequest,
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [
				{ getValue: () => globalFilters.value?.plantId, param: 'plantId', noFetch: true },
				{ getValue: () => filters.value?.locationId, param: 'locationId' },
				{ getValue: () => filters.value?.productionLineId, param: 'productionLineId' },
				{ getValue: () => filters.value?.machineId, param: 'machineId' },
			],
			localProp: brandsList,
			localLoadProp: brandsLoading,
		},
		{
			action: fetchBrandModelsRequest,
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [
				{ getValue: () => globalFilters.value?.plantId, param: 'plantId', noFetch: true },
				{ getValue: () => filters.value?.locationId, param: 'locationId' },
				{ getValue: () => filters.value?.productionLineId, param: 'productionLineId' },
				{ getValue: () => filters.value?.machineId, param: 'machineId' },
				{ getValue: () => filters.value?.brandId, param: 'brandId' },
			],
			localProp: brandModelsList,
			localLoadProp: brandModelsLoading,
		},
	]),
);
const { initiateRequestsToDoList, doFetchAction } = useRequestsList({ requestsToDoList });
initiateRequestsToDoList.value = false;

const setFilters = (value, bindedFilters = [], settings = {}) => {
	const nextValues = { ...value };
	bindedFilters.forEach((prop) => {
		if (!Object.prototype.hasOwnProperty.call(nextValues, prop) && finalFilters.value[prop]) {
			nextValues[prop] = null;
		}
	});
	equipmentsStore.set_equipments_filters({
		...finalFilters.value,
		...nextValues,
		...(settings.preventResetPage ? {} : { page: 1 }),
	});
};
const {
	perPageItems,
	activeGrid,
	gridTypesList,
	gridSwitcherOptions,
	toggleItemsGrid,
	gridViewBeforeMount,
} = useSwitchGridView({ filters, setFilters });

const fetchEquipmentTypes = () => {
	doFetchAction(fetchEquipmentTypesRequest, equipmentTypesList, equipmentTypesLoading, {
		params: { orderByColumn: 'name', orderByMethod: 'asc', max: -1 },
	});
};
const fetchStoreRooms = () => {
	doFetchAction(fetchStoreRoomsRequest, storeRoomsList, storeRoomsLoading, {
		params: { max: -1, plantId: globalFilters.value?.plantId },
	});
};
const toggleStoreroomFilter = (show) => {
	showStoreRoomFilter.value = show;
	if (showStoreRoomFilter.value) {
		setFilters({ isAsset: null, isStoreroom: true, page: 1 });
		if (!storeRoomsList.value.length) fetchStoreRooms();
	} else {
		setFilters({ isAsset: true, isStoreroom: null, storeroomId: null, storeroomLocationId: null, page: 1 });
	}
};
const handleRadioFilters = (selectedId) => {
	toggleStoreroomFilter(selectedId === 'isStoreRoom');
	if (selectedId !== activeRadioFilter.value) activeRadioFilter.value = selectedId;
};
const toggleFilterbar = (event) => {
	dropdownFilterbarRef.value?.toggleFilterbar?.(event);
	initiateRequestsToDoList.value = true;
	showFilterbar.value = !showFilterbar.value;
};
const handleClearFilters = () => {
	alertTypesFilters.value = [];
	setFilters({}, clearableFiltersList);
};
const handleAlertTypesFilter = (ids = []) => {
	alertTypesFilters.value = ids;
	const hasOffline = ids.some((id) => id === 'offline');
	const hasAnomaly = ids.some((id) => id === 'anomaly');
	setFilters({
		alert_types: ids.filter((id) => id !== 'offline' && id !== 'anomaly'),
		offlineNodes: hasOffline || null,
		flat_metric_data_anomaly: hasAnomaly || null,
	});
};
const handleSensorTypeFilter = (value) => {
	setFilters({ sensor_class: value });
};
const handleDateRange = (range) => {
	if (!range) return;
	equipmentsStore.set_equipments_filters({
		...filters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
	});
	sensorsStore.set_statistics_filters({
		...(sensorsStatisticsFilters.value || {}),
		daterange: [
			getYmdDateString({ ms: `${range[0]} 00:00:00`, withTime: true }),
			getYmdDateString({ ms: `${range[1]} 23:59:59`, withTime: true }),
		],
		daterange_setted_at: Date.now(),
	});
};
const createItem = (payload) => {
	itemsListContainerRef.value?.createItem?.(payload);
};
const handleDeleteItems = (payload) => {
	itemsListContainerRef.value?.handleDeleteItems?.(payload);
};
const refetchItemsList = () => {
	itemsListContainerRef.value?.refetchItemsList?.();
};

watch(
	() => props.propsFilters?.daterange,
	(range) => {
		if (range) handleDateRange(range);
	},
);
watch(
	() => filters.value?.isShowList,
	(show) => {
		if (show && !equipmentTypesList.value.length) fetchEquipmentTypes();
	},
);
watch(
	() => filters.value?.storeroomId,
	(id) => {
		if (!id) setFilters({ storeroomLocationId: null });
	},
);
watch(
	() => filters.value?.hasSensors,
	(has) => {
		if (!has) setFilters({ archivedNodes: null, sensor_class: null });
	},
);

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	handleDeleteItems,
	handleRadioFilters,
	handleClearFilters,
	handleAlertTypesFilter,
	handleSensorTypeFilter,
	handleDateRange,
}, emit);

onBeforeMount(() => {
	if (!filters.value.isShowList && !filters.value.isShowListRefreshed2) {
		setFilters({ isShowList: true }, [], { preventResetPage: true });
	}
	setFilters({ isShowListRefreshed2: true }, [], { preventResetPage: true });
	gridViewBeforeMount();
	if (filters.value.isStoreroom) {
		handleRadioFilters('isStoreRoom');
	} else {
		setFilters({ isAsset: true }, [], { preventResetPage: true });
	}
	alertTypesFilters.value = filters.value.alert_types ? [...filters.value.alert_types] : [];
	if (filters.value.offlineNodes) alertTypesFilters.value.push('offline');
	if (filters.value.flat_metric_data_anomaly) alertTypesFilters.value.push('anomaly');
	if (!filters.value.daterange) {
		handleDateRange(getDateRange('today', { getDateString: true }));
	}
	if (props.propsFilters.daterange) {
		handleDateRange(props.propsFilters.daterange);
	}
	if (!props.fromDashboard || filters.value.isShowList) {
		fetchEquipmentTypes();
	}
});

defineExpose({
	alertTypesFilters,
	createItem,
	handleDeleteItems,
	refetchItemsList,
	handleAlertTypesFilter,
});

</script>
