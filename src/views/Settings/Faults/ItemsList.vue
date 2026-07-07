<template>
	<div class="section-row view-list-wrapper">
		<div class="view-content-card card content-row">
			<div class="card-content">
				<Filterbar
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					hidePerPageFilter
					:hideCreate="!hasAccessToCreate"
					:hideDelete="!hasAccessToDelete"
					@event="handleEvent"
				/>

				<CustomDataListTable
					ref="itemsTableRef"
					:disableSelection="!hasAccessToDelete"
					:itemsLoading="itemsLoading"
					:tableData="filteredItemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
					@event="handleEvent"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { ENTITIES } from '@/config/entities';
import { FAULTS_TYPES, alertRulesList } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import {
	sensorParametersList as getSensorParametersList,
	sensorParametersListNCD as getSensorParametersListNCD,
	sensorParametersListNCDOnly as getSensorParametersListNCDOnly,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { Lang } from '@/localization';
import { findItemBy } from '@/helpers';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemsData } from '@/composables/mixins/useItemsData';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

const { translate } = Lang;

defineOptions({
	name: 'SettingsFaultsList',
});

const route = useRoute();
const itemsTableRef = ref(null);
const itemStore = useEquipmentsStore();
const { filters } = storeToRefs(itemStore);
const authStore = useAuthStore();
const entity = ENTITIES.EquipmentFaults;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([entity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([entity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([entity.permissions.delete]));

const faultType = computed(() => Number(route.query.type || FAULTS_TYPES.BASE));
const sensorParametersList = computed(() => Object.freeze(getSensorParametersList()));
const sensorParametersListNCD = computed(() => Object.freeze(getSensorParametersListNCD()));
const sensorParametersListNCDOnly = computed(() => Object.freeze(getSensorParametersListNCDOnly()));

const resolveFaultType = (itemData = null) => Number(itemData?.type || faultType.value);
const resolveFaultFormLoader = (itemData = null) =>
	resolveFaultType(itemData) === FAULTS_TYPES.NCD
		? () => import('./ItemFormNCD.vue')
		: () => import('./ItemForm.vue');

const { itemsList, itemsLoading, itemsName, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'EquipmentFaults',
	itemStore,
	options: {
		tableRef: itemsTableRef,
		editInModal: true,
		formComponentFileLoader: resolveFaultFormLoader(),
		successSubmitOptions: {
			refetchItemsList: true,
			closeModal: true,
		},
		additionalModalSettings: {
			single: true,
		},
		localModalSettingsHook: ({ itemData, modalSettings }) => ({
			...modalSettings,
			formComponentFileLoader: resolveFaultFormLoader(itemData),
		}),
		predefinedFilters: { max: -1 },
		excludeGetParams: [
			'hasSensors',
			'daterange',
			'storeroomId',
			'dataSet',
			'sensorType',
			'assetId',
			'productionLineId',
			'machineId',
			'isAsset',
			'plantId',
		],
	},
});

const filteredItemsList = computed(() =>
	(itemsList.value || []).filter((item) => Number(item.type) === faultType.value),
);

const setupParametersCell = (params = []) => {
	let result = '<ul>';
	let hasValue = false;
	params.forEach((paramId, idx) => {
		const parameterItem =
			findItemBy('id', paramId, sensorParametersList.value) ||
			findItemBy('id', paramId, sensorParametersListNCD.value) ||
			findItemBy('id', paramId, sensorParametersListNCDOnly.value);

		if (parameterItem) {
			hasValue = true;
			const isLast = idx === params.length - 1;
			result += `<li>${parameterItem.name}${isLast ? '' : ','}</li>`;
		}
	});
	return `${result}${hasValue ? '' : '-'}<div>`;
};

const setupTitleCell = (row = {}) => {
	if (Lang.currentLangId === LANGUAGE_TYPES.ENGLISH) return row.title_en || row.title;
	if (Lang.currentLangId === LANGUAGE_TYPES.SPANISH) return row.title_es || row.title;
	return row.title;
};

const tableSettings = computed(() => {
	const actions = [];
	if (hasAccessToEdit.value) actions.push(standardTableOperations.edit);
	if (hasAccessToDelete.value) actions.push(standardTableOperations.delete);

	return {
		columns: translate([
			{
				prop: 'title',
				label: 'Title',
				sortable: true,
				meta: {
					prepareValue: { localMethod: setupTitleCell, useAllInstanceData: true },
				},
			},
			{
				prop: 'equipmentTypes',
				label: 'Type_of_equipment',
				meta: { fromArray: { subProp: 'name', delimeter: ', ', inline: true } },
			},
			{
				prop: 'sensor_parameter_types',
				label: 'Parameters',
				meta: {
					prepareValue: { localMethod: setupParametersCell },
				},
			},
			{
				prop: 'alert_rules',
				label: 'Alert_rule',
				meta: {
					getItemValue: { prop: 'name', list: alertRulesList() },
				},
			},
		]),
		operations: { actions: translate(actions, { key: 'tooltip_text' }) },
	};
});

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
});
</script>
