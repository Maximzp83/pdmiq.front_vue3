<template>
	<div class="section-row view-list-wrapper">
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
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { ENTITIES } from '@/config/entities';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useBannerV2SubtypesStore } from '@/stores/BannerV2SubtypesStore';

import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useItemsData } from '@/composables/mixins/useItemsData';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({
	name: 'SettingsBannerV2SubtypesList',
});

const itemsTableRef = ref(null);
const itemStore = useBannerV2SubtypesStore();

const { filters } = storeToRefs(itemStore);
const authStore = useAuthStore();
const entity = ENTITIES.BannerV2Subtypes;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([entity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([entity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([entity.permissions.delete]));

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'BannerV2Subtypes',
	itemStore,
	options: {
		tableRef: itemsTableRef,
		editInModal: true,
		successSubmitOptions: {
			refetchItemsList: true,
			closeModal: true,
		},
		formComponentFileLoader: () => import('./ItemForm.vue'),
	},
});

const tableSettings = computed(() => {
	const actions = [];
	if (hasAccessToEdit.value) actions.push(standardTableOperations.edit);
	if (hasAccessToDelete.value) actions.push(standardTableOperations.delete);

	return {
		columns: translate([
			{ prop: 'name', label: 'Name', sortable: true },
			{ prop: 'model_number', label: 'Model_number', sortable: true },
			{ prop: 'part_number', label: 'Part_number', sortable: true },
		]),
		operations: { actions: translate(actions, { key: 'tooltip_text' }) },
	};
});

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
});
</script>
