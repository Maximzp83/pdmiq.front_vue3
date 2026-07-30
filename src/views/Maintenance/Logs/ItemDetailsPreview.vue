<template>
	<div class="details-preview-content maintenance-details-preview">
		<div class="section-row flex mrow wrap">
			<div class="mcol-xs-12 mcol-sm-6">
				<div
					v-for="(item, idx) in column1Settings"
					:key="`item-${item.label}`"
					:class="[{ 'details-row': idx }, item.rowClassName]"
				>
					<InfoItem
						:class="item.cellClassName"
						tag="div"
						labelPosition="top"
						:valueClassName="item.valueClassName"
						:itemData="itemData"
						:settingItem="item"
						@event="handleEvent"
					/>
				</div>
			</div>

			<div class="mcol-xs-12 mcol-sm-6 relative">
				<SimpleSpinner :active="equipmentLoading" />

				<div
					v-for="item in column2Settings"
					:key="`item-${item.label}`"
					class="details-row"
				>
					<InfoItem
						tag="div"
						labelPosition="top"
						:valueClassName="item.valueClassName"
						:itemData="itemData"
						:settingItem="item"
					/>
				</div>
			</div>
		</div>

		<div v-if="itemData.task_procedure_id" class="section-row relative">
			<SimpleSpinner :active="taskProceduresLoading" />
			<TaskProcedureInfo
				v-if="taskProcedureItem"
				:taskProcedure="taskProcedureItem"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { MAINTENANCE_TYPES } from '@/constants/global';
import { ENTITIES } from '@/config/entities';
import { createGetByIdRequest } from '@/api/request_factories';
import {
	convertMsToHours,
	getFileName,
	getTimeDifference,
	setupLabel,
} from '@/helpers';
import { Lang } from '@/localization';
import { api_request } from '@/api/request_provider';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import InfoItem from '@/components/itemDetails/InfoItem.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import TaskProcedureInfo from '../WorkOrders/TaskProcedureInfo.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'MaintenanceLogItemDetailsPreview',
});

const props = defineProps({
	editModal: { type: Object, default: null },
	itemData: { type: Object, default: () => ({}) },
	propsData: { type: Object, default: () => ({}) },
	settings: { type: Object, default: () => ({}) },
	additionalSettings: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const globalStore = useGlobalStore();
const itemData = computed(() => props.itemData || props.propsData || {});
const equipmentItem = ref(itemData.value.equipment || null);
const equipmentLoading = ref(false);
const taskProcedureItem = ref(null);
const taskProceduresLoading = ref(false);

const equipmentLabelOptions = Object.freeze({
	accessors: ['brand_name', 'machine_name', 'production_line_name', 'location_name'],
	delimeter: ',',
});
const shiftValues = computed(() =>
	Object.freeze(
		translate([
			{ id: 'Day', label: 'Day' },
			{ id: 'Afternoon', label: 'Afternoon' },
			{ id: 'Night', label: 'Night' },
		], { key: 'label' }),
	),
);

const totalTime = computed(() => {
	const { start_time: startTime, finish_time: finishTime, total_time: totalTimeValue } = itemData.value;

	if (totalTimeValue) {
		const { total_hours: totalHours, total_mins: totalMins } = convertMsToHours(totalTimeValue * 1000);
		return `${totalHours} hr ${totalMins} minutes`;
	}

	if (startTime && finishTime) {
		const { hours, minutes } = getTimeDifference({
			from: startTime,
			to: finishTime,
			timeOnly: true,
			nextDayWhenLessZero: true,
		});
		if (hours) return `${hours}h ${minutes}min`;
		return `${minutes} minutes`;
	}

	return 0;
});

const setupAttachments = (list = []) => {
	let html = '';
	list.forEach((item) => {
		html += `<a class="display-inline-block info-color" href="${item.file_path}" target="_blank">${getFileName(item.file_path)}</a>`;
	});
	return html || '-';
};

const setupImages = (list = []) => {
	let html = '';
	if (list.length) {
		html += '<div class="flex mrow wrap">';
		list.forEach((img) => {
			html += `<div class="mcol-xs-6">
				<div class="relative imgWrapper" data-img-id="${img.id}">
					<div class="images-part-overlay dark-overlay pointer">
						<div class="caption">
							<i class="icomoon icon-zoom-in"></i>
						</div>
					</div>
					<img src="${img.file_path}" alt="img error"/>
				</div>
			</div>`;
		});
		html += '</div>';
	}
	return html || '-';
};

const setupParentWO = () =>
	`${props.additionalSettings.parentWO?.serial_number || itemData.value.parent?.serial_number || ''} (${props.additionalSettings.parentWO?.title || itemData.value.parent?.title || '-'})`;

const column1Settings = computed(() => {
	let settings = [
		{
			label: 'Attachments',
			prop: 'attachments',
			rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
			cellClassName: 'link under',
			meta: {
				prepareValue: { localMethod: setupAttachments },
			},
		},
		{
			label: 'Images',
			prop: 'images',
			rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
			meta: {
				prepareValue: { localMethod: setupImages },
			},
			event: { name: 'previewImage' },
		},
		{
			label: 'phrases.Problem_Solved',
			prop: 'is_problem_solved',
			rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
			meta: {
				boolean: { trueVal: tt('Yes'), falseVal: tt('No') },
			},
		},
		{
			label: 'Reason',
			prop: 'reason_type',
			rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
			meta: {
				getItemValue: {
					prop: 'name',
					list: props.additionalSettings.maintenanceReasonTypesList || [],
				},
			},
		},
		{
			label: 'phrases.Sanitization_of_Tools',
			prop: 'is_sanitization_equipment',
			rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
			meta: {
				boolean: { trueVal: tt('Yes'), falseVal: tt('No') },
			},
		},
		{
			label: 'phrases.Acknowledge_by_supervisor',
			prop: 'is_acknowledge_by_supervisor',
			rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
			meta: {
				boolean: { trueVal: tt('Yes'), falseVal: tt('No') },
			},
		},
		{
			label: 'phrases.Supervisor_notes',
			prop: 'supervisor_notes',
		},
		{
			label: 'Shift',
			prop: 'shift',
			meta: {
				getItemValue: { prop: 'label', list: shiftValues.value },
			},
		},
	];

	if (itemData.value.parent_id && (props.additionalSettings.parentWO || itemData.value.parent)) {
		settings.unshift({
			label: 'Work_Order',
			label_postfix: ' #',
			prop: 'parent_id',
			valueClassName: 'info-color link',
			event: { name: 'showParentOrder' },
			meta: {
				prepareValue: { localMethod: setupParentWO },
			},
		});
	}

	if (itemData.value.start_time && itemData.value.finish_time) {
		settings = [
			{
				label: 'phrases.Total_Time',
				prop: 'totalTime',
				rowClassName: 'xs-show-inline mcol-xs-6 vertical-top semi-bold',
				value: { totalTime: totalTime.value },
				prefix_icon: 'el-icon-time',
			},
			{
				label: 'Time',
				props: ['start_time', 'finish_time'],
				rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
				delimeter: ' - ',
				prefix_icon: 'el-icon-time',
			},
			...settings,
		];
	} else {
		settings = [
			{
				label: 'phrases.Total_Time',
				prop: 'totalTime',
				rowClassName: 'xs-show-inline mcol-xs-12 vertical-top details-row',
				value: { totalTime: totalTime.value },
				prefix_icon: 'el-icon-time',
			},
			...settings,
		];
	}

	return Object.freeze(translate(settings));
});

const column2Settings = computed(() =>
	Object.freeze(
		translate([
			{
				label: 'Production_Line',
				prop: 'productionLine.name',
				/*meta: {
					getItemValue: {
						prop: 'name',
						list: props.additionalSettings.productionLinesList || [],
					},
				},*/
			},
			{
				label: 'Machine',
				prop: 'machine.name',
			},
			{
				label: 'Asset',
				prop: 'asset.name',
			},
			{
				label: 'Item',
				prop: 'equipment',
				value: { equipment: equipmentItem.value || itemData.value.equipment },
				meta: {
					prepareValue: {
						localMethod: setupLabel,
						args: equipmentLabelOptions,
					},
				},
			},
			{
				label: 'phrases.equipment_breakdown_maintenance_log',
				prop: 'description',
			},
		]),
	),
);

const showParentWorkOrderModal = (order) => {
	if (!order) return;

	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassicSecond',
		instanceData: order,
		formComponentFileLoader: () => import('../WorkOrders/ItemDetailsPreview.vue'),
		title: tt('phrases.See_Parent_Work_Order'),
		itemName: tt('Work_Order'),
		hideSubmitButtons: true,
		hideFooter: true,
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		additionalModalSettings: {
			productionLinesList: props.additionalSettings.productionLinesList || [],
		},
		headerActions: [
			{
				name: 'handlePrintWO',
				type: 'transparent',
				icon: 'icomoon icon-printer',
				tooltip_text: tt('Print'),
			},
		],
		footerActions: [],
	});
};

const methodsMap = {
	fetch_equipment: createGetByIdRequest(ENTITIES.Equipments.apiBase),
	fetch_task_procedure: createGetByIdRequest(ENTITIES.TaskProcedures.apiBase),
	previewImage: ({ native_event: nativeEvent, row }) => {
		const container = nativeEvent?.target?.closest('.imgWrapper');
		if (!container) return;

		emit('event', {
			eventName: 'togglePreviewModal',
			data: {
				pictureId: Number(container.dataset.imgId),
				picturesList: row.images,
			},
			onward: true,
		});
	},
	showParentOrder: () => showParentWorkOrderModal(props.additionalSettings.parentWO || itemData.value.parent),
};

useRequestsList({
	methodsMap,
	requestsToDoList: computed(() => {
		const list = [];
		if (itemData.value.task_procedure_id) {
			list.push({
				actionName: 'fetch_task_procedure',
				payload: { itemId: itemData.value.task_procedure_id },
				localProp: taskProcedureItem,
				localLoadProp: taskProceduresLoading,
			});
		}
		if (itemData.value.equipment_id) {
			list.push({
				actionName: 'fetch_equipment',
				payload: { itemId: itemData.value.equipment_id },
				localProp: equipmentItem,
				localLoadProp: equipmentLoading,
			});
		}
		return Object.freeze(list);
	}),
});

const { handleEvent } = useEventHandler(methodsMap, emit);

const editItem = () => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: props.editModal?.editModalProp || 'editModalClassic',
		instanceData: itemData.value,
		formComponentFileLoader: () => import('../MaintenanceFormWrapper.vue'),
		itemName: tt('Maintenance_Log'),
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		successSubmitCallbacks: props.editModal?.successSubmitCallbacks,
		additionalModalSettings: {
			switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG },
			plantId: itemData.value?.plant_id,
		},
	});
};

const editLogFromWOList = editItem;

const editWOFromLogsList = () => {
	showParentWorkOrderModal(itemData.value.parent || props.additionalSettings.parentWO);
};

const exportLog = () => {
	api_request.get('/maintenance/export/pdf', {
		params: { ids: itemData.value.id },
		resultMessage: tt('phrases.File_was_sent_on_your_email'),
	});
};

const handleCreateRequest = ({ parentLog } = {}) => {
	const log = parentLog || itemData.value;
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassicSecond',
		title: tt('phrases.create_work_order_request'),
		instanceName: 'WorkOrderRequests',
		instanceData: {
			...log,
			id: null,
			parent_id: log.id,
			description: '',
		},
		formComponentFileLoader: () => import('@/views/WorkOrderRequests/ItemForm.vue'),
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		additionalModalSettings: {
			plantId: log.plant_id,
		},
		successSubmitCallback: () => {
			globalStore.show_edit_modal({
				show: false,
				editModalProp: 'editModalClassicSecond',
			});
		},
	});
};

defineExpose({
	editItem,
	editLogFromWOList,
	editWOFromLogsList,
	exportLog,
	handleCreateRequest,
});
</script>
