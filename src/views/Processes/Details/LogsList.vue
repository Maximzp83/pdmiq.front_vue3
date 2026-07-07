<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						hideDelete
						:hideCreate="!hasAccessToCreate"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
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

import { Lang } from '@/localization';
import { cleanDateString } from '@/helpers';
import { setupLogTypeIcon } from '@/helpers/specialHelpers';
import { standardTableOperations } from '@/constants/table';
import { useAuthStore } from '@/stores/AuthStore';
import { useProcessesStore } from '@/stores/ProcessesStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'ProcessLogsList' });

const props = defineProps({
	processData: { type: Object, default: () => ({}) },
});

const authStore = useAuthStore();
const processesStore = useProcessesStore();
const { downtimes_filters: filters } = storeToRefs(processesStore);
const itemsTableRef = ref(null);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_oee']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_oee']));
const itemsName = computed(() => Object.freeze({
	one: tt('Log'),
	mult: tt('Logs'),
	instanceName: 'processes',
	filtersName: 'downtimes_filters',
}));
const localModalSettings = computed(() => Object.freeze({
	formComponentFileLoader: () => import('./EventLogForm.vue'),
	single: true,
	hideFooter: true,
	settings: {
		processData: props.processData,
		submitActionProp: 'save_process_downtime',
	},
}));
const apiRoute = computed(() =>
	props.processData?.id ? `/plants/conveyor/${props.processData.id}/downtimes` : '',
);
const tableSettings = computed(() => {
	const settings = {
		columns: translate([
			{
				prop: ' ',
				label: ' ',
				skipTranslate: true,
				width: 43,
				meta: {
					cell_class: 'log-type-cell',
					prepareValue: {
						localMethod: setupLogTypeIcon,
						useAllInstanceData: true,
					},
				},
			},
			{
				prop: 'start_time',
				label: 'Date_time',
				sortable: true,
				width: 170,
				meta: {
					prepareValue: {
						localMethod: cleanDateString,
					},
				},
			},
			{ prop: 'machine.name', label: 'Machine', sortable: true },
			{ prop: 'fault.title', label: 'Fault', sortable: true },
			{ prop: 'cause_description', label: 'Description', sortable: true },
		]),
		operations: { actions: [] },
	};

	if (hasAccessToEdit.value) {
		settings.operations.actions.push(standardTableOperations.edit);
	}

	return Object.freeze(settings);
});

const {
	itemsList,
	itemsLoading,
	meta,
	setFilters,
	createItem,
	editItem,
	refetchItemsList,
} = useItemsData({
	apiRoute: apiRoute.value,
	itemStore: processesStore,
	itemFiltersName: 'downtimes_filters',
	filtersStateProp: 'downtimes_filters',
	itemsName,
	options: {
		preventSetNavbar: true,
		tableRef: itemsTableRef,
		editInModal: true,
		formComponentFileLoader: () => import('./EventLogForm.vue'),
		successSubmitOptions: {
			refetchItemsList: true,
			closeModal: true,
		},
		additionalModalSettings: {
			...localModalSettings.value,
		},
	},
});

const methodsMap = {
	setFilters,
	createItem,
	editItem,
};
const { handleEvent } = useEventHandler(methodsMap);
</script>
