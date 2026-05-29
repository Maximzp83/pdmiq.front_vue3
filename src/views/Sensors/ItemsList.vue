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
						@event="handleEvent"
					/>

					<CustomDataListTable
						ref="itemsTableRef"
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
import {
	not_wifi_icon,
	rebase_wheel,
	rebase_lines,
	sensor_broken_icon,
	lube_level_low,
	lube_level_normal,
	SENSOR_TYPES,
} from '@/constants/global';
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
	name: 'SensorsList',
});

const itemsTableRef = ref(null);
const authStore = useAuthStore();
const sensorsStore = useSensorsStore();
const { filters } = storeToRefs(sensorsStore);
const { changeRoute } = useNavigation();
const sensorsEntity = ENTITIES.Sensors;

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	createItem,
	editItem,
	deleteItem,
	handleDeleteItems,
} = useItemsData({
	entityKey: 'Sensors',
	itemStore: sensorsStore,
	options: {
		tableRef: itemsTableRef,
		localCreateItem: ({ path } = {}) => {
			changeRoute({ path: `${sensorsEntity.routeBase}${path || '/new'}` });
		},
	},
});

const actionButtons = computed(() => {
	const buttons = [
		{
			id: 1,
			text: 'Banner',
			event: 'createItem',
			args: { path: '/new' },
			permissions: [sensorsEntity.permissions.create],
		},
		{
			id: 2,
			text: 'UltraSound',
			event: 'createItem',
			args: { path: '/new?type=ultra_sound' },
			permissions: [sensorsEntity.permissions.create],
		},
		{
			id: 4,
			text: 'Delete',
			event: 'handleDeleteItems',
			isDelete: true,
			permissions: [sensorsEntity.permissions.delete],
		},
	];

	return translate(
		buttons.filter((button) => !button.permissions || authStore.hasAccessTo(button.permissions)),
		{ key: 'text' },
	);
});

const tableSettings = computed(() =>
	Object.freeze({
		columns: translate([
			{
				min_width: '100px',
				prop: 'equipment.machine_name',
				label: 'Machine_name',
				sortable: true,
				additionalData: {
					prop: 'lube_method',
					type: 'tags',
					condition_options: {
						condition_1: {
							prop: 'type',
							value: SENSOR_TYPES.ULTRA_SOUND,
							condition: '==',
						},
					},
					meta: {
						getItemValue: { prop: 'table_label', listName: 'lubeMethodsList' },
					},
				},
				meta: {
					sortBy: 'machine_name',
					emptyText: tt('no_name'),
					imgs: [
						{ src: not_wifi_icon, conditionProp: 'is_inactive' },
						{
							src: lube_level_low,
							conditionProp: 'is_lube_low_level',
							condition_options: {
								condition_1: {
									prop: 'type',
									value: SENSOR_TYPES.ULTRA_SOUND,
									condition: '==',
								},
							},
						},
						{
							src: lube_level_normal,
							conditionProp: 'is_lube_low_level',
							condition_options: {
								condition_1: {
									prop: 'type',
									value: SENSOR_TYPES.ULTRA_SOUND,
									condition: '==',
								},
								invert_primary_result: true,
							},
						},
						{ src: rebase_wheel, conditionProp: 'is_re_baseline_process', class: 'rebase-wheel' },
						{ src: rebase_lines, conditionProp: 'is_re_baseline_process', class: 'rebase-lines' },
						{ src: sensor_broken_icon, conditionProp: 'has_anomaly' },
					],
				},
			},
			{ prop: 'equipment.asset_number', label: 'Asset_Number', sortable: true, meta: { sortBy: 'asset_number' } },
			{ prop: 'equipment.location_name', label: 'Location', sortable: true, meta: { sortBy: 'location_name' } },
			{ prop: 'equipment.loc_in_machine', label: 'Location_on_machine', sortable: true, meta: { sortBy: 'loc_in_machine', emptyText: '-' } },
			{ prop: 'equipment.production_line_name', label: 'Production_line', sortable: true, meta: { sortBy: 'production_line_name', emptyText: '-' } },
			{ min_width: '100px', prop: 'controller.name', label: 'Controller', sortable: true, meta: { sortBy: 'controllerName' } },
			{ width: '80px', prop: 'pump.radio.position', props: ['port_number'], label: 'Node', sortable: true, meta: { emptyText: ' - ' } },
		]),
		operations: {
			actions: translate(
				[
					{ name: 'handleShowStatistics', type: 'success', icon: 'icomoon icon-graphic', tooltip_text: 'Graphs' },
					{ name: 'editItem', type: 'success', icon: 'icomoon icon-pencil', tooltip_text: 'Edit' },
					{ name: 'handleDeleteItems', type: 'danger', icon: 'icomoon icon-cross', tooltip_text: 'Delete' },
				],
				{ key: 'tooltip_text' },
			),
		},
	}),
);

const handleShowStatistics = ({ row }) => {
	changeRoute({ path: `${sensorsEntity.routeBase}/${row.id}/stats` });
};

const { handleEvent } = useEventHandler({
	createItem,
	editItem,
	deleteItem,
	handleDeleteItems,
	handleShowStatistics,
});
</script>
