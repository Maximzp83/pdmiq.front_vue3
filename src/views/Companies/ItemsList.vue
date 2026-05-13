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

import { ENTITIES } from '@/config/entities';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useNavigation } from '@/composables/mixins/useNavigation';
const { changeRoute } = useNavigation();

import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useCompaniesStore } from '@/stores/CompaniesStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({
	name: 'CompaniesList',
});

const itemsTableRef = ref(null);

const companiesStore = useCompaniesStore();
const { filters } = storeToRefs(companiesStore);

const authStore = useAuthStore();
const companiesEntity = ENTITIES.Companies;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([companiesEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([companiesEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([companiesEntity.permissions.delete]));

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'Companies',
	itemStore: companiesStore,
	options: {
		tableRef: itemsTableRef,
	},
});

const tableSettings = computed(() => {
	const actions = [{
		name: 'handleShowInfo',
		type: 'success',
		icon: 'icomoon icon-eye',
		tooltip_text: 'Info'
	}];

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
				min_width: 130,
			},
			{
				prop: 'address',
				label: 'Address',
				sortable: true,
				min_width: 150,
			},
			{
				prop: 'phone_number',
				label: 'Phone',
				width: 135,
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

const handleShowInfo = ({ row }) => {
	changeRoute({ path: `/${row.id}/info`, addToCurrent: true });
	// console.log(rowData)
};

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
	handleShowInfo
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
