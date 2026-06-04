<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:actionButtons="actionButtons"
						hideCreate
						hideDelete
						searchbarClass="ml-auto"
						@event="handleEvent"
					/>

					<CustomDataListTable
						ref="itemsTableRef"
						disableSelection
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						@event="handleEvent"
					/>

					<PaginationContainer
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
						@setFilters="setFilters"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { ENTITIES } from '@/config/entities';
import { SENSOR_TYPES, dataSetsList } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { findItemBy } from '@/helpers';
import {
	setupBatteryChargeCell,
	setupConnectionStrengthCell,
} from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { useSensorsStore } from '@/stores/SensorsStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'NCDSensorsList',
});

const itemsTableRef = ref(null);
const sensorsStore = useSensorsStore();
const authStore = useAuthStore();
const { filters } = storeToRefs(sensorsStore);
const { changeRoute } = useNavigation();

const predefinedFilters = Object.freeze({
	type: SENSOR_TYPES.NCD,
	orderByColumn: 'port_number',
	orderByMethod: 'asc',
});

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	editItem,
} = useItemsData({
	entityKey: 'Sensors',
	itemStore: sensorsStore,
	options: {
		tableRef: itemsTableRef,
		predefinedFilters,
	},
});

const actionButtons = computed(() =>
	Object.freeze([
		{
			id: 5,
			text: tt('Export'),
			event: 'handleExportToExel',
			without_icon: true,
			className: 'inverted',
		},
	]),
);

const tableSettings = computed(() => {
	const settings = {
		columns: translate([
			{ label: 'Node', prop: 'port_number', width: 65 },
			{ label: 'phrases.Machine_Name', prop: 'equipment.asset.machine.name', min_width: 150 },
			{ label: 'phrases.Asset_Name', prop: 'equipment.asset.name', min_width: 100 },
			{ label: 'Type', prop: 'equipment.equipmentType.name' },
			{ label: 'Location', prop: 'location_in_equipment' },
			{
				label: 'MAC_Address',
				prop: 'mac_address',
				min_width: 180,
				meta: {
					cellComponent: { componentFileLoader: () => import('./SensorTypeTableCell.vue') },
				},
				payload: { isMacAddress: true },
			},
			{
				label: 'Sensor_Type',
				prop: 'type',
				min_width: 140,
				meta: {
					cellComponent: { componentFileLoader: () => import('./SensorTypeTableCell.vue') },
				},
				payload: {
					dataSetsList: dataSetsList(),
					findItemBy,
					isDataset: true,
				},
			},
			{
				label: 'Battery_Charge',
				prop: 'battery_voltage',
				width: 56,
				meta: {
					cell_class: 'text-center',
					prepareValue: { localMethod: setupBatteryChargeCell },
				},
			},
			{
				label: 'Connection_Strength',
				prop: 'rssi',
				width: 76,
				meta: {
					cell_class: 'text-center',
					prepareValue: {
						localMethod: setupConnectionStrengthCell,
						args: {
							noSignalForInactive: 1,
							isArchivedIcon: 1,
							controllerOfflineIcon: 1,
						},
						useAllInstanceData: true,
					},
				},
			},
		]),
		operations: {
			actions: [
				{ name: 'handleShowAdditionalDetails', type: 'success', icon: 'icomoon icon-dots', tooltip_text: 'phrases.additional_details' },
				{ name: 'handleShowStatistics', type: 'success', icon: 'icomoon icon-graphic', tooltip_text: 'Graphs' },
			],
		},
	};

	if (authStore.hasAccessTo(['edit_dashboard'])) {
		settings.operations.actions.push(standardTableOperations.edit);
	}

	settings.operations.actions = translate(settings.operations.actions, { key: 'tooltip_text' });

	return Object.freeze(settings);
});

const handleShowAdditionalDetails = ({ row }) => {
	changeRoute({ path: `${ENTITIES.Sensors.routeBase}/${row.id}` });
};

const handleShowStatistics = ({ row }) => {
	changeRoute({ path: `/equipments/${row.equipment_id}/details/pdm/${row.id}` });
};

const handleExportToExel = () => {
	window.open('/sensors/export', '_blank');
};

const { handleEvent } = useEventHandler({
	editItem,
	handleShowAdditionalDetails,
	handleShowStatistics,
	handleExportToExel,
});
</script>
