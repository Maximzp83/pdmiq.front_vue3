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
					/>

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
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';

import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { api_request } from '@/api/request_provider';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useApplicationsStore } from '@/stores/ApplicationsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'ApplicationsList',
});

const itemsTableRef = ref(null);

const applicationsStore = useApplicationsStore();
const { filters } = storeToRefs(applicationsStore);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalPlantsList } = storeToRefs(globalStore);
const { changeRoute } = useNavigation();

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_applications']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_applications']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_applications']));

const itemsName = computed(() => ({
	one: tt('Application'),
	mult: tt('Applications'),
	instanceName: 'applications',
}));

const { itemsList, itemsLoading, meta, setFilters, fetchItems } = useItemsData({
	apiRoute: '/applications',
	filters,
	itemsName,
});

const tableSettings = computed(() => {
	const actions = [];

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
			},
			{
				prop: 'plant_id',
				label: 'Plant',
				meta: {
					getItemValue: { prop: 'name', list: globalPlantsList.value || [] },
				},
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

const ensurePlantsList = async () => {
	if (globalPlantsList.value?.length) return;
	await globalStore.fetch_global_plants({
		params: { max: -1, orderByColumn: 'name', orderByMethod: 'asc' },
	});
};

const createItem = () => {
	changeRoute({ path: '/applications/create' });
};

const editItem = ({ row }) => {
	if (!row?.id) return;
	changeRoute({ path: `/applications/${row.id}` });
};

const deleteApplication = async ({ row }) => {
	if (!row?.id) return;

	await ElMessageBox.confirm(
		tt('phrases.delete_confirmation') || 'Delete this item?',
		tt('Delete') || 'Delete',
		{
			confirmButtonText: tt('Delete') || 'Delete',
			cancelButtonText: tt('CANCEL') || 'Cancel',
			type: 'warning',
		},
	);

	await api_request.delete(`/applications/${row.id}`, {
		itemName: itemsName.value.one,
	});

	await fetchItems({ ...filters.value });
};

const handleDeleteItems = async (payload) => {
	if (payload?.row) {
		await deleteApplication(payload);
	}
};

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
};

const { handleEvent } = useEventHandler(methodsMap);

onMounted(() => {
	ensurePlantsList();
});
</script>
