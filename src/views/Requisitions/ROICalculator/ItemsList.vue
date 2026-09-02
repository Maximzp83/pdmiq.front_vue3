<template>
	<div class="view-content-card card content-row">
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
		</div>
	</div>
</template>

<script setup>
import { computed, ref, toRef } from 'vue';

import { cleanDateString, formatTime } from '@/helpers';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'RequisitionsRoiItemsList' });

const props = defineProps({
	filters: { type: Object, default: () => ({}) },
	preventSetNavbar: Boolean,
});

const { changeRoute } = useNavigation();
const itemsTableRef = ref(null);

const {
	itemsList,
	itemsLoading,
	itemsName,
} = useItemsData({
	entityKey: 'Requisitions',
	options: {
		tableRef: itemsTableRef,
		propsFilters: toRef(props, 'filters'),
		watchPropsFiltersOnly: true,
		preventSetNavbar: props.preventSetNavbar,
	},
});
const tableSettings = computed(() =>
	Object.freeze({
		columns: translate([
			{ prop: 'id', label: 'WO', label_postfix: '#', width: 60 },
			{
				prop: 'created_at',
				label: 'Date_Sent',
				width: 105,
				sortable: true,
				meta: { prepareValue: { localMethod: cleanDateString, args: { withoutTime: true } } },
			},
			{
				prop: 'complete_at',
				label: 'Requested_Date',
				width: 105,
				sortable: true,
				meta: { prepareValue: { localMethod: cleanDateString } },
			},
			{
				prop: 'estimated_started_at',
				label: 'Estimated_Start_Date',
				width: 105,
				sortable: true,
				meta: { prepareValue: { localMethod: cleanDateString } },
			},
			{
				prop: 'estimated_finished_at',
				label: 'Estimated_Completion_Date',
				width: 105,
				sortable: true,
				meta: { prepareValue: { localMethod: cleanDateString } },
			},
			{ prop: 'requisitionPlant.name', label: 'Requisition_Plant', width: 160, sortable: true },
			{
				prop: 'requisition_details',
				label: 'Details',
				min_width: 150,
				meta: { cell_class: 'ellipsis' },
			},
			{
				prop: 'technicians',
				label: 'Assigned',
				min_width: 200,
				meta: { fromArray: { subProp: 'full_name', delimeter: ', ' } },
			},
			{ prop: 'po_number', label: 'PO', label_postfix: '#' },
			{
				prop: 'execution_total_time',
				label: 'Hours',
				width: 90,
				meta: { prepareValue: { localMethod: formatTime, args: 'h:m' } },
			},
			{ prop: 'proposed_cost', label: 'Budget', width: 70 },
			{ prop: 'actual_cost', label: 'Fab_Shop_Budget', width: 82 },
			{ prop: 'execution_cost', label: 'Running_Total', width: 70 },
		]),
		operations: {
			actions: [{
				name: 'handleShowDetails',
				type: 'success',
				icon: 'icomoon icon-eye',
				tooltip_text: tt('Info'),
			}],
		},
	}),
);
const handleShowDetails = ({ row }) => changeRoute({ path: `/requisitions/${row.id}` });
const { handleEvent } = useEventHandler({ handleShowDetails });
</script>
