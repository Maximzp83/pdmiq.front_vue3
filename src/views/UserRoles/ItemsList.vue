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
import { userRolesTypesList } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useAuthStore } from '@/stores/AuthStore';
import { useUserRolesStore } from '@/stores/UserRolesStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({
	name: 'UserRolesList',
});

const itemsTableRef = ref(null);

const userRolesStore = useUserRolesStore();
const { filters } = storeToRefs(userRolesStore);

const authStore = useAuthStore();
const userRolesEntity = ENTITIES.UserRoles;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([userRolesEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([userRolesEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([userRolesEntity.permissions.delete]));

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'UserRoles',
	itemStore: userRolesStore,
	options: {
		tableRef: itemsTableRef,
	},
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
				label: 'Name',
				prop: 'name',
				sortable: true,
			},
			{
				label: 'type',
				prop: 'type',
				sortable: true,
				meta: {
					getItemValue: { prop: 'name', list: userRolesTypesList() },
				},
			},
		]),
		operations: {
			actions: translate(actions, { key: 'tooltip_text' }),
		},
	};
});

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
