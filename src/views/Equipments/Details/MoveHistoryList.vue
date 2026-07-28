<template>
	<CustomDataListTable
		disableSelection
		:tableData="itemsList"
		:tableSettings="tableSettings"
		:itemsName="itemsName"
		@event="handleEvent"
	/>
</template>

<script setup>
import { computed } from 'vue';

import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'EquipmentMoveHistoryList' });

defineProps({
	itemsList: { type: Array, default: () => [] },
});

const itemsName = computed(() => ({
	one: `${tt('Move')} ${tt('History')}`,
	mult: `${tt('Move')} ${tt('History')}`,
}));
const setupActionsCell = ({ asset_name, storeroom }, ...args) => {
	const idx = args[1];
	if (idx === 0) return tt('Created');
	if (asset_name) return `${tt('Asset')}: ${asset_name}`;
	if (storeroom) return `${tt('Storeroom')}: ${storeroom.name}`;
	return '-';
};
const tableSettings = computed(() =>
	Object.freeze({
		columns: translate([
			{
				label: 'Date',
				prop: 'created_at',
				min_width: 120,
				meta: { prepareValue: { localMethod: cleanDateString } },
			},
			{ label: 'User', prop: 'user.full_name' },
			{
				label: 'Actions',
				prop: ' ',
				meta: {
					prepareValue: {
						localMethod: setupActionsCell,
						useAllInstanceData: true,
					},
				},
			},
		]),
	}),
);

const { handleEvent } = useEventHandler({}, null);
</script>
