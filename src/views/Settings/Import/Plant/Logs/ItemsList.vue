<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideCreate
						hideDelete
						hideSearchbar
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

import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useTestingStore } from '@/stores/TestingStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemsData } from '@/composables/mixins/useItemsData';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'PlantImportLogsList' });

const itemsTableRef = ref(null);
const testingStore = useTestingStore();
const { filters } = storeToRefs(testingStore);

const itemsName = computed(() => Object.freeze({
	one: tt('Import_Log'),
	mult: tt('Import_Logs'),
	instanceName: 'testing',
}));
const setupSuccessCounterColumn = (value) => `<span class="success-color">${value}</span>`;

const { itemsList, itemsLoading, meta, setFilters } = useItemsData({
	apiRoute: '/logs',
	itemStore: testingStore,
	itemsName,
	itemFiltersName: 'settings_filters',
	options: {
		tableRef: itemsTableRef,
		predefinedFilters: {
			type: 1,
			orderByColumn: 'date_end',
			orderByMethod: 'desc',
		},
	},
});

const tableSettings = computed(() => Object.freeze({
	columns: [
		{
			label: 'Created at',
			prop: 'date_end',
			meta: { prepareValue: { localMethod: cleanDateString } },
		},
		{ label: 'Company', prop: 'company_name' },
		{ label: 'Plant', prop: 'plant_name' },
		{ label: 'File', prop: 'import_file_name' },
		{
			label: 'Success',
			prop: 'count_success',
			width: 80,
			meta: { prepareValue: { localMethod: setupSuccessCounterColumn } },
		},
		{
			label: 'Error',
			prop: 'count_error',
			width: 80,
			meta: {
				action: {
					linkSettings: {
						linkRoute: 'plant-import-logs/:id',
						linkTextProp: 'count_error',
					},
					className: 'table-link alarm-color',
					disablePopover: true,
				},
			},
		},
	],
}));

const { handleEvent } = useEventHandler({ setFilters });
</script>
