<template>
	<div class="card content-row">
		<div class="card-content">
			<CustomDataListTable
				ref="itemsTableRef"
				disableSelection
				:itemsLoading="itemsLoading"
				:tableData="itemsList"
				:tableSettings="tableSettings"
				:itemsName="itemsName"
				@event="handleEvent"
			/>
			<PaginationContainer :itemsName="itemsName" :filters="filters" :meta="meta" @setFilters="setFilters" />
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { requisitionCategoriesList } from '@/constants/global';
import { cleanDateString, formatTime } from '@/helpers';
import { Lang } from '@/localization';
import { usePlantRequisitionsStore } from '@/stores/PlantRequisitionsStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({ name: 'RequisitionsRoiItemsList' });

const requisitionsStore = usePlantRequisitionsStore();
const { filters } = storeToRefs(requisitionsStore);
const { changeRoute } = useNavigation();
const itemsTableRef = ref(null);

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
} = useItemsData({
	entityKey: 'Requisitions',
	itemStore: requisitionsStore,
	options: {
		tableRef: itemsTableRef,
	},
});
const tableSettings = computed(() =>
	Object.freeze({
		columns: translate([
			{ prop: 'id', label: 'WO', label_postfix: '#', width: 80 },
			{ prop: 'created_at', label: 'phrases.Date_Sent', meta: { prepareValue: { localMethod: cleanDateString } } },
			{ prop: 'requisitionPlant.name', label: 'Requisition_Plant' },
			{ prop: 'requisition_details', label: 'Details', meta: { cell_class: 'ellipsis' } },
			{ prop: 'execution_total_time', label: 'Hours', width: 90, meta: { prepareValue: { localMethod: formatTime, args: 'h:m' } } },
			{ prop: 'proposed_cost', label: 'Budget' },
			{ prop: 'actual_cost', label: 'Fab_Shop_Budget' },
			{ prop: 'category', label: 'Category', meta: { getItemValue: { prop: 'name', list: requisitionCategoriesList() } } },
		]),
		operations: {
			actions: translate([{ name: 'handleGotoDetails', type: 'success', icon: 'icomoon icon-eye', tooltip_text: 'phrases.Open_Details' }], { key: 'tooltip_text' }),
		},
	}),
);
const handleGotoDetails = ({ row }) => changeRoute({ path: `/requisitions/${row.id}` });
const { handleEvent } = useEventHandler({ handleGotoDetails });
</script>
