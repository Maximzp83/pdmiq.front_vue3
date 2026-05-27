<template>
	<div class="view-wrapper view-list-wrapper">
		<div :class="{ mcontainer: !insideOtherPage }">
			<div :class="{ 'view-content-card card content-row': !insideOtherPage }">
				<div :class="{ 'card-content': !insideOtherPage }">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideDelete
						@event="handleEvent"
					/>

					<CustomDataListTable
						ref="itemsTableRef"
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
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';

import { api_request } from '@/api/request_provider';
import { weekdays } from '@/constants/date_time';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useUsersStore } from '@/stores/UsersStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'UserReportsList',
});

const props = defineProps({
	insideOtherPage: Boolean,
	userId: Number,
	isCSM: Boolean,
	enableBaselineReport: Boolean,
	sensorsListProps: { type: Array, default: () => [] },
	plantsListProps: { type: Array, default: () => [] },
	sensorsLoadingProps: Boolean,
});

const itemsTableRef = ref(null);

const usersStore = useUsersStore();
const { reports_filters: filters } = storeToRefs(usersStore);

const itemsName = Object.freeze({
	one: tt('Report'),
	mult: tt('Reports'),
	instanceName: 'users',
});

const { itemsList, itemsLoading, meta, setFilters, createItem, editItem, refetchItemsList } = useItemsData({
	apiRoute: `/users/${props.userId}/scheduled-reports`,
	itemsName,
	itemStore: usersStore,
	itemFiltersName: 'users_reports_filters',
	options: {
		filtersStateProp: 'reports_filters',
		tableRef: itemsTableRef,
		editInModal: true,
		formComponentFileLoader: () => import('./ItemForm.vue'),
		additionalModalSettings: {
			userId: props.userId,
			isCSM: props.isCSM,
			enableBaselineReport: props.enableBaselineReport,
			sensorsListProps: props.sensorsListProps,
			plantsListProps: props.plantsListProps,
			sensorsLoadingProps: props.sensorsLoadingProps,
		},
		localModalSettingsHook: ({ modalSettings }) => ({
			...modalSettings,
			// hideFooter: true,
			callback: () => {
				refetchItemsList();
			},
		}),
		localDeleteItem: ({ ids }) =>
			api_request
				.delete(`/users/${props.userId}/scheduled-reports`, {
					data: { id: ids?.[0] },
				})
				.then(() => refetchItemsList()),
	},
});

const translatedWeekdays = computed(() => weekdays());

const setupWeekdaysCell = (days) => {
	if (!days?.length) return '';
	return days.map((day) => translatedWeekdays.value[day]).join(', ');
};

const manualStartReport = ({ row }) =>
	ElMessageBox.confirm(
		`${tt('Start')} ${tt('Report')} "${row?.name}" - ${tt('manually')}?`,
		{
			confirmButtonText: tt('Start'),
			cancelButtonText: tt('CANCEL'),
			type: 'warning',
		},
	).then(() =>
		api_request.post(`/users/${props.userId}/scheduled-reports/${row?.id}/start`, {
			notNotify: true,
		}),
	);

const tableSettings = computed(() => {
	const actions = [
		{
			name: 'manualStartReport',
			type: 'success',
			icon: 'el-icon-caret-right',
			tooltip_text: 'phrases.Start_Report_manually',
		},
		standardTableOperations.edit,
		standardTableOperations.delete,
	];

	return Object.freeze({
		columns: translate([
			{ prop: 'name', label: 'Name', sortable: true },
			{ prop: 'launch_time', label: 'Launch_Time', max_width: 150 },
			{ prop: 'report_for_range_days', label: 'days_range', max_width: 130 },
			{
				prop: 'launch_on_weekdays',
				label: 'days',
				meta: {
					prepareValue: { localMethod: setupWeekdaysCell },
				},
			},
		]),
		operations: {
			actions: translate(actions, { key: 'tooltip_text' }),
		},
	});
});

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleDeleteItems: ({ row }) =>
		api_request
			.delete(`/users/${props.userId}/scheduled-reports`, {
				data: { id: row?.id },
			})
			.then(() => refetchItemsList()),
	manualStartReport,
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
