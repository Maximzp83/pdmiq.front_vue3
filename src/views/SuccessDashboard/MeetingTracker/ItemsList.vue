<template>
	<div class="view-list-wrapper">
		<div v-if="canCreateOrEdit" class="content-row">
			<el-button type="primary" native-type="button" class="item-action-button" @click="createItem">
				<span class="capitalize">{{ tt('Add') }}</span>
				<i class="icomoon icon-plus"></i>
			</el-button>

			<el-button type="primary" native-type="button" class="item-action-button" @click="addPdfDialogOpen = true">
				<span class="capitalize">{{ tt('Add') }} {{ tt('file') }}</span>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>

		<div class="content-row">
			<div class="card overflowHidden">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('MEETING_TRACKER') }}</div>
				</div>

				<div class="card-content">
					<Filterbar
						hideCreate
						hideDelete
						hideSearchbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:perPageItems="perPageItems"
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

		<el-dialog
			v-model="addPdfDialogOpen"
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="`${tt('add')} PDF ${tt('file')}`"
		>
			<AddPdfFileForm
				:visible="addPdfDialogOpen"
				:plantId="plantItem?.id"
				@success="handlePDFSuccess"
				@close="addPdfDialogOpen = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { cleanDateString } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useMeetingTrackersStore } from '@/stores/MeetingTrackersStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useExportListToFile } from '@/composables/mixins/useExportListToFile';
import { useNavigation } from '@/composables/mixins/useNavigation';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import AddPdfFileForm from './AddPdfFileForm.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessMeetingTrackerItemsList' });

const props = defineProps({
	plantItem: { type: Object, default: () => ({}) },
	perPageItems: { type: Array, default: undefined },
});

const authStore = useAuthStore();
const meetingTrackersStore = useMeetingTrackersStore();
const { filters } = storeToRefs(meetingTrackersStore);
const { changeRoute } = useNavigation();
const addPdfDialogOpen = ref(false);
const itemsTableRef = ref(null);

const canCreateOrEdit = computed(() =>
	authStore.hasAccessTo(['create_customer_success', 'edit_customer_success'], 'some'),
);
const canEdit = computed(() => authStore.hasAccessTo(['edit_customer_success']));
const itemsName = computed(() =>
	Object.freeze({
		one: tt('Meeting_Tracker'),
		mult: tt('Meeting_Trackers'),
		instanceName: 'meeting_trackers',
	}),
);
const predefinedFilters = computed(() => Object.freeze({ plantId: props.plantItem?.id }));
const tableSettings = computed(() => {
	const actions = [];
	if (canEdit.value) {
		actions.push({
			name: 'editItem',
			type: 'success',
			icon: 'icomoon icon-pencil',
			query: 'edit=true',
			tooltip_text: tt('Edit'),
			conditionSettings: { conditions: [{ prop: 'pdf_file_url', method: 'empty' }] },
		});
	}
	actions.push(
		{
			name: 'exportToPDF',
			type: 'success',
			icon: 'icomoon icon-pdf',
			tooltip_text: tt('phrases.Export_to_PDF'),
		},
		{
			name: 'handleShowDetails',
			type: 'success',
			icon: 'icomoon icon-eye',
			tooltip_text: tt('Details'),
			conditionSettings: { conditions: [{ prop: 'pdf_file_url', method: 'empty' }] },
		},
	);

	return Object.freeze({
		columns: [
			{
				label: tt('phrases.Created_at'),
				prop: 'created_at',
				sortable: true,
				width: 120,
				meta: { prepareValue: { localMethod: cleanDateString } },
			},
			{
				label: tt('Period'),
				prop: 'mock',
				meta: { prepareValue: { localMethod: setupTrackerPeriod, useAllInstanceData: true } },
			},
			{ label: tt('Creator'), prop: 'creator.full_name' },
			{ label: tt('phrases.next_launch_date'), prop: 'next_launch_date' },
		],
		operations: { actions },
	});
});

const setupTrackerPeriod = (tracker) => {
	const last = cleanDateString(tracker.last_tracker_created_at, { withoutTime: true });
	const current = cleanDateString(tracker.current_created_at, { withoutTime: true });
	const delimeter = last && current ? '-' : '/';
	return `${last || '-'} ${delimeter} ${current || '-'}`;
};

const {
	itemsList,
	itemsLoading,
	meta,
	setFilters,
	createItem,
	editItem,
	refetchItemsList,
} = useItemsData({
	entityKey: 'MeetingTrackers',
	itemStore: meetingTrackersStore,
	options: {
		predefinedFilters: predefinedFilters.value,
		tableRef: itemsTableRef,
		preventSetNavbar: true
	},
});
const { handleExportItem } = useExportListToFile();

const handlePDFSuccess = () => {
	addPdfDialogOpen.value = false;
	refetchItemsList();
};
const handleShowDetails = ({ row }) => {
	changeRoute({ path: `/success-dashboard/meeting-tracker/${row.id}` });
};
const exportToPDF = ({ row }) => {
	handleExportItem({ url: `plants/meeting-trackers/${row.id}/report`, skipDaterange: true });
};

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleShowDetails,
	exportToPDF,
});
</script>
