<template>
	<div class="section-row view-list-wrapper logs-list-wrapper">
		<div class="view-content-card card content-row connected-card">
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

				<PaginationContainer
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					@setFilters="setFilters"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { LOG_TYPES } from '@/constants/global';
import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useTestingStore } from '@/stores/TestingStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemsData } from '@/composables/mixins/useItemsData';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'SettingsImportHistoryList' });

const itemsTableRef = ref(null);
const testingStore = useTestingStore();
const { filters } = storeToRefs(testingStore);

const itemsName = computed(() => Object.freeze({
	one: tt('Log'),
	mult: tt('Logs'),
	instanceName: 'testing',
}));
const setupLogStatusLabel = (type) => {
	if (type === LOG_TYPES.PLANT) return '<span class="log-type plant">Plant</span>';
	if (type === LOG_TYPES.MASTER) return '<span class="log-type master">Master</span>';
	return 'not </br> allowed';
};
const { itemsList, itemsLoading, meta, setFilters } = useItemsData({
	apiRoute: '/logs',
	itemStore: testingStore,
	itemsName,
	itemFiltersName: 'settings_filters',
	options: { tableRef: itemsTableRef },
});
const tableSettings = computed(() => ({
	columns: [
		{
			prop: 'date_start',
			label: 'Start',
			sortable: true,
			width: 170,
			meta: { prepareValue: { localMethod: cleanDateString } },
		},
		{
			prop: 'date_end',
			label: 'Finish',
			sortable: true,
			width: 170,
			meta: { prepareValue: { localMethod: cleanDateString } },
		},
		{
			label: 'Errors count',
			meta: {
				additionalActions: [{
					className: 'table-link info-color',
					disablePopover: true,
					linkSettings: {
						linkRoute: 'settings/import/:id',
						linkTextProp: 'count_error',
					},
				}],
			},
		},
		{
			label: 'Duplicates',
			meta: {
				additionalActions: [{
					className: 'table-link info-color',
					disablePopover: true,
					linkSettings: {
						linkRoute: 'settings/import/:id',
						linkTextProp: 'count_duplicate',
					},
				}],
			},
		},
		{ prop: 'count_success', label: 'Success count', meta: { emptyText: '0' } },
		{ prop: 'error', label: 'Error text', min_width: 250 },
		{ prop: 'type', label: 'Status', meta: { prepareValue: { localMethod: setupLogStatusLabel } } },
	],
}));

const { handleEvent } = useEventHandler({ setFilters });
</script>
