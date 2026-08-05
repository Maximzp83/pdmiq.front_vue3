<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						hideCreate
						hideDelete
						searchbarClass="ml-auto"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						@event="handleEvent"
					/>

					<CustomDataListTable
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
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { findItemBy } from '@/helpers';
import { libraryResourceTypesList } from '@/constants/global';
import { Lang } from '@/localization';
import { useLibrary } from '@/composables/useLibrary';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({ name: 'LibraryList' });

const {
	libraryStore,
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
} = useLibrary();
const { filters } = storeToRefs(libraryStore);
const resourceTypesList = libraryResourceTypesList();

const setupEquipmentColumn = ({ resource_type, production_line_type } = {}) => {
	const item = findItemBy('id', resource_type, resourceTypesList);
	if (!item) return '';

	if (production_line_type) {
		return Number(production_line_type) === 1 ? item.name : 'Utility';
	}

	return item.name;
};

const tableSettings = computed(() => ({
	columns: translate([
		{
			prop: 'name',
			label: 'Name',
			sortable: true,
			width: 250,
		},
		{
			label: 'File',
			prop: 'name',
			width: 100,
			meta: {
				action: {
					linkSettings: {
						linkHrefProp: 'full_file_name',
						linkTextValue: 'Link',
						target: '_blank',
					},
					className: 'table-link info-color',
					disablePopover: true,
				},
			},
		},
		{
			label: 'Equipment',
			prop: 'name',
			meta: {
				prepareValue: {
					localMethod: setupEquipmentColumn,
					useAllInstanceData: true,
				},
			},
		},
		{
			label: 'phrases.Equipment_Name',
			prop: 'resource_name',
			sortable: true,
		},
	]),
}));

const { handleEvent } = useEventHandler({ setFilters });
</script>
