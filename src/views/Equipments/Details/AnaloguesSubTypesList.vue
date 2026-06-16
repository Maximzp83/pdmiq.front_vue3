<template>
	<CustomDataListTable
		v-if="brand"
		class="analogues-subtype-row-table"
		hideHeader
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

defineOptions({ name: 'EquipmentAnaloguesSubTypesList' });

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
});

const itemsName = computed(() => ({
	one: tt('phrases.Request_for_quotation'),
	mult: tt('phrases.Request_for_quotations'),
	instanceName: 'analogues',
}));
const brand = computed(() => props.propsData.subTypeBrand);
const itemsList = computed(() =>
	Object.freeze([
		{
			asset: props.propsData.asset,
			brand: brand.value,
			model: props.propsData.subTypeModel,
		},
	]),
);
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
			{ label: 'Asset', prop: 'asset.name' },
			{ label: 'Brand', prop: 'brand.name' },
			{ label: 'Part_number', prop: 'model.name' },
		]),
		operations: { actions: [] },
	}),
);

const { handleEvent } = useEventHandler({}, null);
</script>
