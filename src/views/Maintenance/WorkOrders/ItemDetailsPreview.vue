<template>
	<div class="details-preview-content maintenance-details-preview">
		<div class="section-row flex mrow wrap">
			<div class="mcol-xs-12 mcol-sm-6">
				<div
					v-for="item in column1Settings"
					:key="`item-${item.label}`"
					:class="['details-row', item.rowClassName]"
				>
					<InfoCell
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
				<SimpleSpinner :active="equipmentLoading || machineLoading" />

				<div
					v-for="item in column2Settings"
					:key="`item-${item.label}`"
					class="details-row"
				>
					<InfoCell
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
import { computed, nextTick, ref } from 'vue';

import {
	MAINTENANCE_TYPES,
	PERIOD_TYPES,
	periodsTypesList,
	workOrdersStatusesList,
} from '@/constants/global';
import { ENTITIES } from '@/config/entities';
import { createGetByIdRequest } from '@/api/request_factories';
import {
	cleanDateString,
	getFileName,
	setupLabel,
} from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useMaintenance } from '@/composables/useMaintenance';

import InfoCell from '@/components/itemDetails/InfoItem.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import TaskProcedureInfo from './TaskProcedureInfo.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'WorkOrderItemDetailsPreview',
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
const { unlockWorkOrder } = useMaintenance();
const itemData = computed(() => props.itemData || props.propsData || {});
const equipmentItem = ref(null);
const equipmentLoading = ref(false);
const taskProcedureItem = ref(null);
const taskProceduresLoading = ref(false);
const machineItem = ref(itemData.value.machine || null);
const machineLoading = ref(false);

const equipmentLabelOptions = Object.freeze({
	accessors: ['brand_name', 'machine_name', 'production_line_name', 'location_name'],
	delimeter: ',',
});
const translatedPeriodsTypesList = computed(() =>
	Object.freeze(translate(periodsTypesList, { key: 'name' })),
);
const frequenciesList = computed(() => {
	const list = [];
	const every = tt('every');
	const week = tt('week');
	const month = tt('month');
	const year = tt('year');

	for (let i = 1; i < 13; i += 1) {
		const postfix = i === 1 ? '' : 's';
		const idx = i === 1 ? '' : i;
		list.push({
			id: i,
			name: i,
			[PERIOD_TYPES.WEEKLY]: `${every} ${idx} ${week} ${postfix}`,
			[PERIOD_TYPES.MONTHLY]: `${every} ${idx} ${month} ${postfix}`,
			[PERIOD_TYPES.YEARLY]: `${every} ${idx} ${year} ${postfix}`,
		});
	}

	return Object.freeze(list);
});

const setupParts = (parts = []) => {
	let html = '';
	parts.forEach((partItem) => {
		if (partItem.stock) {
			html += `<div class="flex ">
				<span>${partItem.stock.part_number}</span>
				<span class="ml-auto">${partItem.quantity}</span>
			</div>`;
		}
	});
	return html || '-';
};

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

const column1Settings = computed(() => {
	const settings = [
		{
			label: 'phrases.Work_Order_Name',
			prop: 'title',
		},
		{
			label: 'Status',
			prop: 'status',
			meta: {
				getItemValue: { prop: 'name', list: workOrdersStatusesList() },
			},
		},
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
	];

	if (itemData.value.is_periodic) {
		if (itemData.value.period_type) {
			settings.push(
				{
					label: 'Period',
					prop: 'period_type',
					meta: {
						getItemValue: { prop: 'name', list: translatedPeriodsTypesList.value },
					},
				},
				{
					label: 'Frequency',
					prop: 'period_frequency',
					meta: {
						getItemValue: { prop: 'name', list: frequenciesList.value },
					},
				},
				{
					label: 'Period_Range',
					props: ['period_started_at', 'period_finished_at'],
					delimeter: ' - ',
					prefix_icon: 'el-icon-date',
				},
			);
		} else if (itemData.value.period_dates) {
			settings.push({
				label: 'Period Dates',
				prop: 'period_dates',
				prefix_icon: 'el-icon-date',
				meta: {
					fromArray: { justValue: true },
				},
			});
		}
	} else if (itemData.value.snooze_alert) {
		settings.push({
			label: 'Snooze',
			props: ['snooze_alert.date_start', 'snooze_alert.date_finish'],
			delimeter: ' - ',
			prefix_icon: 'el-icon-date',
			meta: {
				prepareValue: {
					localMethod: cleanDateString,
					args: { withoutTime: true, splitBy: ' ' },
				},
			},
		});
	}

	settings.push(
		{
			label: 'Description',
			prop: 'description',
		},
		{
			label: 'Parts',
			prop: 'parts',
			valueClassName: 'mcol-xs-5',
			meta: {
				emptyText: '-',
				prepareValue: {
					localMethod: setupParts,
				},
			},
		},
	);

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
				value: { machine: machineItem.value || itemData.value.machine },
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
		]),
	)
);

const methodsMap = {
	fetch_equipment: createGetByIdRequest(ENTITIES.Equipments.apiBase),
	fetch_task_procedure: createGetByIdRequest(ENTITIES.TaskProcedures.apiBase),
	fetch_machine: createGetByIdRequest(ENTITIES.Machines.apiBase),
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
		if (itemData.value.machine_id && !itemData.value.machine) {
			list.push({
				actionName: 'fetch_machine',
				payload: { itemId: itemData.value.machine_id },
				localProp: machineItem,
				localLoadProp: machineLoading,
			});
		}
		return Object.freeze(list);
	}),
});

const { handleEvent } = useEventHandler(methodsMap, emit);

const printHTML = (querySelector) => {
	const printContentsElement = document.querySelector(querySelector);
	if (!printContentsElement) return;

	const clone = printContentsElement.cloneNode(true);
	document.body.classList.add('enable-print');
	clone.classList.add('section-to-print');
	document.body.appendChild(clone);
	window.print();
	document.body.classList.remove('enable-print');
	document.body.removeChild(clone);
};

const handlePrintWO = () => {
	nextTick(() => printHTML('.maintenance-details-preview'));
};

const editItem = () => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: itemData.value,
		formComponentFileLoader: () => import('../MaintenanceFormWrapper.vue'),
		itemName: tt('Work_Order'),
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		additionalModalSettings: {
			switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
			plantId: itemData.value?.plant_id,
		},
		successSubmitCallbacks: props.editModal?.successSubmitCallbacks,
	});
};

const editWOFromLogsList = editItem;

const handleUnlockWorkOrder = () => {
	if (!itemData.value?.id) return;
	unlockWorkOrder({ itemId: itemData.value.id }).then(() => {
		props.editModal?.successSubmitCallback?.();
		globalStore.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
	});
};

defineExpose({
	editItem,
	editWOFromLogsList,
	handlePrintWO,
	handleUnlockWorkOrder,
});
</script>
