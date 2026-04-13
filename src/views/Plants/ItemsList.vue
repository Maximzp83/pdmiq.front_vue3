<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="!hasAccessToCreate"
						:hideDelete="!hasAccessToDelete"
						@event="handleEvent"
					>
						<template v-if="canSeeArchivedToggle">
							<div class="filter-item checkbox-item">
								<el-checkbox v-model="archivedChecked">
									<span class="semi-bold">{{ tt('phrases.Show_Archived') }}</span>
								</el-checkbox>
							</div>
						</template>
					</Filterbar>

					<CustomDataListTable
						ref="itemsTableRef"
						:disableSelection="!hasAccessToDelete"
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

import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { usePlantsStore } from '@/stores/PlantsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'PlantsList',
});

const itemsTableRef = ref(null);

const plantsStore = usePlantsStore();
const { filters } = storeToRefs(plantsStore);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_plants']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_plants']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_plants']));
const hasAccessToView = computed(() => authStore.hasAccessTo(['view_plants']));
const canSeeArchivedToggle = computed(() =>
	authStore.hasAccessTo(['archive_companies', 'archive_plants'], 'some')
);

const itemsName = computed(() => ({
	one: tt('Plant'),
	mult: tt('Plants'),
	instanceName: 'plants',
}));

const { changeRoute } = useNavigation();

const { itemsList, itemsLoading, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	apiRoute: '/plants',
	itemRoute: '/plants',
	itemFiltersName: 'plants_filters',
	itemStore: plantsStore,
	itemsName,
	options: {
		excludeGetParams: ['plantId'],
		tableRef: itemsTableRef,
	},
});

const archivedChecked = computed({
	get: () => {
		const archived = filters.value?.archived;
		return archived === true || archived === 1 || archived === '1' || archived === 'true';
	},
	set: (checked) => {
		setFilters({ archived: checked ? 1 : null });
	},
});


const tableSettings = computed(() => {
	const actions = [];

	if (hasAccessToView.value) {
		actions.push({
			name: 'goToDashboard',
			type: 'success',
			icon: 'icomoon icon-eye',
			tooltip_text: 'Details',
		});
	}
	if (hasAccessToEdit.value) {
		actions.push(standardTableOperations.edit);
	}
	if (hasAccessToDelete.value) {
		actions.push(standardTableOperations.delete);
	}

	return {
		columns: translate([
			{
				prop: 'name',
				label: 'Name',
				sortable: true,
				min_width: 150,
				meta: {
					prepareValue: {
						localMethod: setupPlantName,
						useAllInstanceData: true,
					},
				},
			},
			{ prop: 'address', label: 'Address', sortable: true, min_width: 120 },
			{
				prop: 'company.name',
				label: 'Company',
				sortable: true,
				min_width: 130,
				meta: { sortBy: 'company' },
			},
		]),
		operations: {
			actions: translate(actions, { key: 'tooltip_text' }),
		},
		activeSortingFilters: {
			orderByColumn: filters.value?.orderByColumn,
			orderByMethod: filters.value?.orderByMethod,
		},
	};
});

const setupPlantName = (plant) => {
	let result = `<span class="div-block">${plant.name}</span>`;
	if (plant?.company?.is_archived || plant?.is_archived) {
		result += `<span class="archived-label div-block">${tt('Archived')}</span>`;
	}
	return result;
};

const goToDashboard = ({ row }) => {
	if (!row?.id) return;
	globalStore.set_global_filters({ ...globalFilters.value, plantId: row.id });
	changeRoute({ path: '/dashboard/plant' });
};

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	goToDashboard,
	handleDeleteItems,
};

const { handleEvent } = useEventHandler(methodsMap);

</script>
