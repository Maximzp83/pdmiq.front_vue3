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
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';

import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { api_request } from '@/api/request_provider';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useMaintenanceCategoriesStore } from '@/stores/MaintenanceCategoriesStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'MaintenanceCategoriesList',
});

const itemsTableRef = ref(null);

const maintenanceCategoriesStore = useMaintenanceCategoriesStore();
const { filters } = storeToRefs(maintenanceCategoriesStore);

const authStore = useAuthStore();
const { changeRoute } = useNavigation();

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_work_order_type']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_work_order_type']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_work_order_type']));

const itemsName = computed(() => ({
	one: tt('Work_Order_Type'),
	mult: tt('Work_Order_Types'),
	instanceName: 'maintenance_categories',
}));

const { itemsList, itemsLoading, meta, setFilters, fetchItems } = useItemsData({
	apiRoute: '/maintenance/categories',
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

const createItem = () => {
	changeRoute({ path: '/maintenance-categories/create' });
};

const editItem = ({ row }) => {
	if (!row?.id) return;
	changeRoute({ path: `/maintenance-categories/${row.id}` });
};

const deleteMaintenanceCategory = async ({ row }) => {
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

	await api_request.delete(`/maintenance/categories/${row.id}`, {
		itemName: itemsName.value.one,
	});

	await fetchItems({ ...filters.value });
};

const handleDeleteItems = async (payload) => {
	if (payload?.row) {
		await deleteMaintenanceCategory(payload);
	}
};

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
