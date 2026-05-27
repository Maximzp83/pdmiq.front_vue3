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

import { ENTITIES } from '@/config/entities';
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
const maintenanceCategoriesEntity = ENTITIES.MaintenanceCategories;

const hasAccessToCreate = computed(() =>
	authStore.hasAccessTo([maintenanceCategoriesEntity.permissions.create])
);
const hasAccessToEdit = computed(() =>
	authStore.hasAccessTo([maintenanceCategoriesEntity.permissions.edit])
);
const hasAccessToDelete = computed(() =>
	authStore.hasAccessTo([maintenanceCategoriesEntity.permissions.delete])
);

const { itemsList, itemsLoading, itemsName, meta, setFilters, fetchItems } = useItemsData({
	entityKey: 'MaintenanceCategories',
	filters,
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
	};
});

const createItem = () => {
	changeRoute({ path: `${maintenanceCategoriesEntity.routeBase}/create` });
};

const editItem = ({ row }) => {
	if (!row?.id) return;
	changeRoute({ path: `${maintenanceCategoriesEntity.routeBase}/${row.id}` });
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

	await api_request.delete(`${maintenanceCategoriesEntity.apiBase}/${row.id}`, {
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
