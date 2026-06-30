<template>
	<CustomDataListTable
		class="analogues-table"
		disableSelection
		:tableData="itemsList"
		:tableSettings="tableSettings"
		:itemsName="itemsName"
		@event="handleEvent"
	/>
</template>

<script setup>
import { computed } from 'vue';

import { setupTableCellImage } from '@/helpers';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'EquipmentAnaloguesList' });

defineProps({
	itemsList: { type: Array, default: () => [] },
});

const itemsName = computed(() => ({
	one: tt('phrases.Request_for_quotation'),
	mult: tt('phrases.Request_for_quotations'),
	instanceName: 'analogues',
}));
const tableSettings = computed(() =>
	Object.freeze({
		columns: translate([
			{
				prop: 'pictures',
				label: 'Image',
				width: 110,
				meta: {
					cell_class: 'table-cell-image',
					prepareValue: { localMethod: setupTableCellImage },
				},
			},
			{ prop: 'asset.name', label: 'Asset' },
			{ prop: 'brand.name', label: 'Brand' },
			{ prop: 'model.name', label: 'Part_number' },
		]),
		expandedRowSettings: {
			componentFileLoader: () => import('@/views/Equipments/Details/AnaloguesSubTypesList.vue')
		},
		operations: {
			actions: [
				{
					linkSettings: { linkRoute: 'equipments/:id/details/main' },
					className: 'el-button action-button el-button--mini el-button--success',
					icon: 'icomoon icon-eye',
					forceRerender: 'viewContentComponentKey',
					tooltip_text: tt('Details'),
				},
			],
		},
	}),
);

const { handleEvent } = useEventHandler({}, null);
</script>
