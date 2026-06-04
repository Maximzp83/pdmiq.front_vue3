<template>
	<div class="view-list-wrapper">
		<div v-if="canCreateOrEdit" class="content-row">
			<el-button type="primary" native-type="button" class="item-action-button" @click="createItem">
				<span class="capitalize">{{ tt('add') }}</span>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>

		<div class="content-row">
			<div class="card overflowHidden">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ itemsName.one }}</div>
				</div>

				<div class="card-content">
					<Filterbar
						className="searchbar-first"
						hideCreate
						hideDelete
						searchbarClass="ml-auto"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:perPageItems="perPageItems"
						@event="handleEvent"
					>
						<div class="filter-item ml-auto">
							<el-button
								v-show="showClearFilters"
								class="small"
								type="primary"
								native-type="button"
								@click="setFilters(clearFilters)"
							>
								{{ tt('phrases.clear_filters') }}
							</el-button>
						</div>

						<div class="filter-item mcol-xs-6 mcol-sm-2">
							<CustomSelectV2
								v-model="filters.productionLineId"
								filterable
								clearable
								:optionsLoading="productionLinesLoading"
								:optionsList="productionLinesList"
								:placeholder="tt('production_line')"
								@change="(id) => setFilters({ productionLineId: id, machineId: null, assetId: null })"
							/>
						</div>

						<div class="filter-item mcol-xs-6 mcol-sm-2">
							<CustomSelectV2
								v-model="filters.machineId"
								filterable
								clearable
								:optionsLoading="machinesLoading"
								:optionsList="machinesList"
								:placeholder="tt('machine')"
								@change="(id) => setFilters({ machineId: id, assetId: null })"
							/>
						</div>

						<div class="filter-item">
							<FetchByQuerySelect
								clearable
								enableLoadmore
								:loadmoreIsActive="assetsLoadmoreIsActive"
								:model-value="filters.assetId"
								:optionsLoading="assetsLoading"
								:optionsList="assetsList"
								:settings="assetQueryOptions"
								:placeholder="tt('asset')"
								@update:modelValue="(id) => setFilters({ assetId: id })"
								@change="(id) => setFilters({ assetId: id })"
							/>
						</div>

						<div class="ml-auto mcol-xs-9 mcol-sm-auto filter-item text-right">
							<Datepicker
								setupDaterangeFilter
								enableShortcuts
								:value="filters.daterange"
								type="daterange"
								@input="(range) => setFilters({ daterange: range, daterange_setted_at: Date.now() })"
							/>
						</div>
					</Filterbar>

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
import { computed, onBeforeMount, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { cleanDateString, getDateRange } from '@/helpers';
import { standardTableOperations } from '@/constants/table';
import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useRoiOnePagersStore } from '@/stores/RoiOnePagersStore';
import { useProductionLines } from '@/composables/useProductionLines';
import { useMachines } from '@/composables/useMachines';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useExportListToFile } from '@/composables/mixins/useExportListToFile';
import { useNavigation } from '@/composables/mixins/useNavigation';

import Filterbar from '@/components/common/Filterbar.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'ROIOnePagerItemsList' });

const props = defineProps({
	plantItem: { type: Object, default: () => ({}) },
	perPageItems: { type: Array, default: undefined },
});

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const roiOnePagersStore = useRoiOnePagersStore();
const { filters } = storeToRefs(roiOnePagersStore);
const { globalFilters } = storeToRefs(globalStore);
const { changeRoute } = useNavigation();
const { fetchProductionLines } = useProductionLines();
const { fetchMachines } = useMachines();
const itemsTableRef = ref(null);
const productionLinesLoading = ref(false);
const productionLinesList = shallowRef([]);
const machinesLoading = ref(false);
const machinesList = shallowRef([]);
const assetsList = shallowRef([]);
const assetsLoading = ref(false);

const canCreateOrEdit = computed(() =>
	authStore.hasAccessTo(['create_customer_success', 'edit_customer_success'], 'some'),
);
const canEdit = computed(() => authStore.hasAccessTo(['edit_customer_success']));
const canDelete = computed(() => authStore.hasAccessTo(['delete_customer_success']));
const clearFilters = Object.freeze({ productionLineId: null, machineId: null, assetId: null });
const showClearFilters = computed(() => ['productionLineId', 'machineId', 'assetId'].some((key) => filters.value[key]));
const itemsName = computed(() =>
	Object.freeze({
		one: tt('ROI_One_Pager'),
		mult: tt('ROI_One_Pagers'),
		instanceName: 'roi_one_pagers',
	}),
);
const predefinedFilters = computed(() => Object.freeze({ plantId: props.plantItem?.id }));
const assetQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: (payload) => api_request.get('/assets', payload),
		fetchByIdAction: ({ itemId }) => api_request.get(`/assets/${itemId}`, { itemId, notNotify: true }),
		params: { plantId: globalFilters.value?.plantId || props.plantItem?.id },
		bindTo: [
			{ param: 'productionLineId', getValue: () => filters.value.productionLineId },
			{ param: 'machineId', getValue: () => filters.value.machineId },
		],
	}),
);
const assetsLoadmoreIsActive = computed(() => !filters.value.machineId);
const tableSettings = computed(() => {
	const actions = [
		{
			name: 'openPDF',
			type: 'success',
			icon: 'icomoon icon-pdf',
			tooltip_text: tt('phrases.Open_PDF_file'),
			conditionSettings: { conditions: [{ prop: 'full_file_name', method: 'notEmpty' }] },
		},
		{
			name: 'exportToPDF',
			type: 'success',
			icon: 'icomoon icon-pdf',
			tooltip_text: tt('phrases.export_to_pdf'),
			conditionSettings: { conditions: [{ prop: 'full_file_name', method: 'empty' }] },
		},
		{
			name: 'handleShowDetails',
			type: 'success',
			icon: 'icomoon icon-eye',
			tooltip_text: tt('Details'),
		},
	];
	if (canEdit.value) {
		actions.push({
			name: 'editItem',
			type: 'success',
			icon: 'icomoon icon-pencil',
			query: 'edit=true',
			tooltip_text: tt('Edit'),
		});
	}
	if (canDelete.value) actions.push(standardTableOperations.delete);

	return Object.freeze({
		alwaysShowOperations: canEdit.value,
		columns: [
			{ label: tt('Name'), prop: 'name', min_width: 100 },
			{ label: tt('phrases.Production_Line_name'), prop: 'asset.machine.productionLine.name', min_width: 100 },
			{ label: tt('phrases.Machine_name'), prop: 'asset.machine.name', min_width: 100 },
			{ label: tt('phrases.Asset_name'), prop: 'asset.name', min_width: 100 },
			{
				label: tt('Started_at'),
				prop: 'started_at',
				sortable: true,
				min_width: 120,
				meta: { prepareValue: { localMethod: cleanDateString } },
			},
			{ label: tt('phrases.roi_ca_$'), prop: 'final_roi', width: 120 },
		],
		operations: { actions },
	});
});

const {
	itemsList,
	itemsLoading,
	meta,
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
} = useItemsData({
	entityKey: 'RoiOnePagers',
	itemStore: roiOnePagersStore,
	options: {
		predefinedFilters: predefinedFilters.value,
		tableRef: itemsTableRef,
	},
});
const { handleExportItem, generateDownloadLink } = useExportListToFile();

const fetchProductionLineOptions = async () => {
	if (!props.plantItem?.id) return;
	productionLinesLoading.value = true;
	try {
		const { value } = await fetchProductionLines({ max: -1, plantId: props.plantItem.id });
		productionLinesList.value = value || [];
	} finally {
		productionLinesLoading.value = false;
	}
};
const fetchMachineOptions = async () => {
	if (!props.plantItem?.id) return;
	machinesLoading.value = true;
	try {
		const { value } = await fetchMachines({
			max: -1,
			plantId: props.plantItem.id,
			productionLineId: filters.value.productionLineId,
		});
		machinesList.value = value || [];
	} finally {
		machinesLoading.value = false;
	}
};
const handleShowDetails = ({ row }) => {
	changeRoute({ path: `/success-dashboard/roi-one-pager/${row.id}` });
};
const exportToPDF = ({ row }) => {
	handleExportItem({ url: `plants/roi/one-pagers/${row.id}/report`, filters: filters.value });
};
const openPDF = ({ row }) => {
	if (row.full_file_name) generateDownloadLink(row.full_file_name);
};

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
	handleShowDetails,
	exportToPDF,
	openPDF,
});

watch(() => filters.value.productionLineId, fetchMachineOptions);

onBeforeMount(() => {
	if (!filters.value.daterange) {
		setFilters(
			{ daterange: getDateRange('this_month', { getDateString: true }) },
			{ preventResetPage: true },
		);
	}
	fetchProductionLineOptions();
	fetchMachineOptions();
});
</script>
