<template>
	<div class="view-wrapper view-list-wrapper">
		<div :class="{ mcontainer: !fromDetailsPage }">
			<div :class="['card content-row', { 'view-content-card': !fromDetailsPage }]">
				<div v-if="showCardHeader" class="flex align-center card-header filled_2">
					<h1 class="title page-title outside-bg-addition uppercase">
						{{ tt('Location') }}
					</h1>
				</div>

				<div class="card-content">
					<CustomDataListTable
						ref="itemsTableRef"
						disableSelection
						:itemsLoading="itemsLoading"
						:tableData="storeRoomsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { ENTITIES } from '@/config/entities';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

const { tt } = Lang;
const { changeRoute } = useNavigation();

defineOptions({
	name: 'BrandModelsLocationList',
});

const props = defineProps({
	fromDetailsPage: Boolean,
	showCardHeader: Boolean,
	preventSetNavbar: Boolean,
	propsFilters: { type: Object, default: () => ({}) },
});

const itemsTableRef = ref(null);

const equipmentsStore = useEquipmentsStore();
const equipmentsEntity = ENTITIES.Equipments;

const itemsName = Object.freeze({
	one: tt('Storeroom'),
	mult: tt('Storerooms'),
	instanceName: 'Equipments',
});

const { itemsList, itemsLoading, editItem, handleDeleteItems, refetchItemsList } = useItemsData({
	apiRoute: equipmentsEntity.apiBase,
	itemsName,
	itemStore: equipmentsStore,
	options: {
		tableRef: itemsTableRef,
		acceptedFilters: ['plantId', 'brandModelId'],
		propsFilters: computed(() => props.propsFilters),
		editInModal: true,
		preventSetNavbar: props.preventSetNavbar,
		formComponentFileLoader: () => import('./MoveForm.vue'),
	},
});

const storeRoomsList = computed(() => {
	const list = [];

	(itemsList.value || []).forEach((item) => {
		(item.storeRooms || []).forEach((storeroom) => {
			const equipmentStoreroom = findItemBy(
				'store_room_id',
				storeroom.id,
				item.equipmentStoreRooms || [],
			);

			list.push({
				equipment_id: item.id,
				...storeroom,
				storeroom_location: equipmentStoreroom?.store_room_location || null,
			});
		});
	});

	return Object.freeze(list);
});

const handleShowInfo = ({ row }) => {
	changeRoute({ path: `${equipmentsEntity.routeBase}/${row.equipment_id}/details` });
};

const handleDeleteEquipment = ({ row }) =>
	handleDeleteItems({
		row: { id: row.equipment_id },
	});

const handleMove = ({ row }) =>
	editItem({
		row,
		modal_settings: {
			title: tt('Move_Item'),
			editModalProp: 'editModalClassic',
			modalClassName: 'fixed-header-footer small-header small-footer',
			additionalModalSettings: {
				plantId: row.plant_id,
				equipmentId: row.equipment_id,
			},
			successSubmitCallback: () => {
				refetchItemsList();
				// globalStore.show_edit_modal({ show: false });
			},
		},
	});

const tableSettings = computed(() =>
	Object.freeze({
		columns: [
			{
				label: tt('Storerooms'),
				prop: 'name',
			},
			{
				label: tt('Storeroom_location'),
				prop: 'storeroom_location.name',
			},
			{
				label: 'QNT',
				prop: ' ',
				meta: {
					emptyText: '1',
				},
			},
		],
		operations: {
			actions: [
				{
					name: 'handleShowInfo',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: tt('Details'),
				},
				{
					name: 'handleMove',
					type: 'success',
					button_text: 'Move',
					className: 'width-auto paddings',
					tooltip_text: tt('Move_To_Storeroom'),
				},
				{
					name: 'handleDeleteEquipment',
					type: 'danger',
					icon: 'icomoon icon-cross',
					tooltip_text: tt('Delete'),
				},
			],
		},
	}),
);

const methodsMap = {
	handleShowInfo,
	handleMove,
	handleDeleteEquipment,
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
