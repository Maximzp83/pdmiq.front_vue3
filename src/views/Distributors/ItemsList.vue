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
import { scopesList } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useDistributorsStore } from '@/stores/DistributorsStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate, tt } = Lang;

defineOptions({
	name: 'DistributorsList',
});

const itemsTableRef = ref(null);

const distributorsStore = useDistributorsStore();
const { filters } = storeToRefs(distributorsStore);

const authStore = useAuthStore();
const distributorsEntity = ENTITIES.Distributors;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([distributorsEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([distributorsEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([distributorsEntity.permissions.delete]));

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'Distributors',
	itemStore: distributorsStore,
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
				prop: 'company_name',
				label: 'Name',
				sortable: true,
				min_width: 100,
			},
			{
				prop: 'scope',
				label: 'Type',
				min_width: 110,
				meta: {
					getItemValue: { prop: 'label', list: scopesList },
				},
			},
			{
				prop: 'locations',
				label: `${tt('locations')}  (${tt('Cities')})`,
				skipTranslate: true,
				min_width: 110,
				meta: {
					fromArray: { subProp: 'city', delimeter: ', ', inline: true },
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
