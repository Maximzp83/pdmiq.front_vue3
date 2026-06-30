<template>
	<div class="view-wrapper view-list-wrapper">
		<div :class="[{ mcontainer: !fromCard }]">
			<div :class="['view-content-card1 content-row', { card: !fromCard }]">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="true"
						:hideDelete="true"
						searchbarClass="ml-auto"
						@event="handleEvent"
					>
						<div class="mcol-xs-12 mcol-sm-4 radio-buttons-wrapper">
							<RadioButtonsBlock
								:model-value="filters.type"
								:settings="radioBlockOptions"
								:optionsList="filterButtonsList"
								@update:model-value="handleRadioFilters"
								@onChange="handleRadioFilters"
							/>
						</div>
					</Filterbar>

					<CustomDataListTable
						ref="itemsTableRef"
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

import { RFQS_TYPES, rfqsTypesList } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useRfqsStore } from '@/stores/RfqsStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';

const { translate } = Lang;

defineOptions({ name: 'RFQSItemsList' });

const props = defineProps({
	equipmentData: { type: Object, default: null },
	editInModal: Boolean,
	fromCard: Boolean,
	preventSetNavbar: Boolean,
	additionalModalSettings: { type: Object, default: null },
});

const authStore = useAuthStore();
const rfqsStore = useRfqsStore();
const { filters } = storeToRefs(rfqsStore);
const itemsTableRef = ref(null);

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	handleDeleteItems,
} = useItemsData({
	entityKey: 'Rfqs',
	itemStore: rfqsStore,
	options: {
		tableRef: itemsTableRef,
		editInModal: props.editInModal,
		predefinedFilters: {
			userId: authStore.authUser?.id,
			equipmentId: props.equipmentData?.id || null,
		},
		preventSetNavbar: props.preventSetNavbar,
		additionalModalSettings: props.additionalModalSettings,
	},
});

const tableSettings = computed(() =>
	Object.freeze({
		columns: translate([
			{
				prop: 'type',
				label: 'Type',
				sortable: true,
				meta: {
					getItemValue: { prop: 'name', list: rfqsTypesList() },
				},
			},
			{
				prop: 'vendors',
				label: 'Vendors',
				meta: {
					fromArray: { subProp: 'name', delimeter: ', ', inline: true },
				},
			},
		]),
		operations: {
			actions: translate([standardTableOperations.delete], { key: 'tooltip_text' }),
		},
	}),
);
const radioBlockOptions = Object.freeze({
	hideTitle: true,
	buttonType: 'info',
	className: 'filled inverted small',
	clearable: true,
});
const filterButtonsList = Object.freeze([
	{ id: RFQS_TYPES.FOR_BUY, title: "RFQ's" },
	{ id: RFQS_TYPES.FOR_SERVICE, title: 'Service History' },
]);

const handleRadioFilters = (value) => {
	setFilters({ type: value === filters.value?.type ? null : value });
};

const { handleEvent } = useEventHandler({
	setFilters,
	handleDeleteItems,
	handleRadioFilters,
});
</script>
