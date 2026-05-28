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
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useTaskProceduresStore } from '@/stores/TaskProceduresStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({
	name: 'TaskProceduresList',
});

const itemsTableRef = ref(null);

const taskProceduresStore = useTaskProceduresStore();
const { filters } = storeToRefs(taskProceduresStore);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalPlantsList } = storeToRefs(globalStore);
const taskProceduresEntity = ENTITIES.TaskProcedures;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([taskProceduresEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([taskProceduresEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([taskProceduresEntity.permissions.delete]));

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'TaskProcedures',
	itemStore: taskProceduresStore,
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
				min_width: 110,
			},
			{
				prop: 'plant_id',
				label: 'Plant',
				sortable: true,
				min_width: 110,
				meta: {
					sortBy: 'plant_name',
					getItemValue: { prop: 'name', list: globalPlantsList.value || [] },
				},
			},
			{
				label: 'Processes',
				prop: 'processes',
				min_width: 110,
				meta: {
					fromArray: { subProp: 'name', delimeter: ', ' },
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
