<template>
	<div class="card-content no-paddings">
		<div class="cells-list drag-n-drop-list">
			<div class="cells-block">
				<DragDropCellItem
					v-for="(item, idx) in optionsList"
					ref="dragDropCellItemRefs"
					:key="`option-${item.id}-${idx}`"
					:itemData="item"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';

import { Lang } from '@/localization';
import { useMaintenance } from '@/composables/useMaintenance';
import { useNotify } from '@/composables/useNotify';
import { useImport } from '@/composables/mixins/useImport';

import DragDropCellItem from '@/components/Import/DragDropCellItem.vue';

const { tt } = Lang;

defineOptions({ name: 'WorkOrdersImportOptionsContainer' });

const props = defineProps({
	uploadedFileName: String,
	plantId: { type: [Number, String], required: true },
	currentLogId: null,
});
const emit = defineEmits(['event']);

const { Notify } = useNotify();
const { importWorkOrder, getImportWorkOrderProgress } = useMaintenance();
const dragDropCellItemRefs = ref([]);

const optionsList = Object.freeze([
	{ id: 1, name: 'Name', formKey: 'title' },
	{ id: 2, name: 'Created Date', formKey: 'created_date', required: true },
	{ id: 3, name: 'Description', formKey: 'description', required: true },
	{ id: 4, name: 'Machine Name', formKey: 'machine_name', required: true },
	{ id: 5, name: 'Production Line Name', formKey: 'production_line_name' },
	{ id: 6, name: 'Asset Name', formKey: 'asset_name' },
	{ id: 7, name: 'Work Order Type', formKey: 'category_name' },
	{ id: 8, name: 'Due Date', formKey: 'finish_date', required: true },
	{ id: 9, name: 'Equipment Type Name', formKey: 'equipment_type_name' },
	{ id: 10, name: 'Brand Name', formKey: 'brand_name' },
	{ id: 11, name: 'Part Number Name', formKey: 'brand_model_name' },
]);

const { getImportProgress, onRevert, resetProgressInterval } = useImport({
	emit,
	currentLogId: computed(() => props.currentLogId),
});

const findItemRef = (itemName) =>
	dragDropCellItemRefs.value.find((item) => item.formData?.name === itemName);

const onStart = () => {
	const droppedItems = document.querySelectorAll('.headings-list .drag-n-drop-item');
	const data = {
		file_name: props.uploadedFileName,
		plant_id: props.plantId,
		images: [],
		attachments: [],
	};

	for (const nodeItem of droppedItems) {
		const { itemName, itemFormKey } = nodeItem.dataset;
		const columnName =
			nodeItem.parentElement.parentElement.querySelector('[data-column-name]')
				?.dataset.columnName;

		if (itemName === 'Attachment' || itemName === 'Image') {
			const zipFile = findItemRef(itemName)?.formData?.zip_file;
			const target = itemName === 'Attachment' ? data.attachments : data.images;
			target.push({ column_name: columnName, zip_file: zipFile });
		} else if (itemFormKey) {
			data[itemFormKey] = columnName;
		}
	}

	const attachmentsValid = data.attachments.length
		? data.attachments.every((item) => item.zip_file)
		: true;
	const imagesValid = data.images.length
		? data.images.every((item) => item.zip_file)
		: true;
	const requiredOptions = optionsList.filter((item) => item.required);
	const optionsHaveValues = requiredOptions.every((item) => !!data[item.formKey]);

	if (!attachmentsValid || !imagesValid || !optionsHaveValues) {
		const missingData = [];
		if (!optionsHaveValues) missingData.push('Required options');
		if (!attachmentsValid) missingData.push('ZIP files for attachments');
		if (!imagesValid) missingData.push('ZIP files for images');

		Notify({
			type: 'warning',
			title: tt('phrases.data_isn_t_ready'),
			message: `${missingData.join(', ')} ${tt('phrases.should_be_assigned')}...`,
		});
		return false;
	}

	const payload = {
		data,
		withFile: data.attachments.length > 0 || data.images.length > 0,
	};

	emit('event', { eventName: 'handleImportProcessing', data: true });
	return importWorkOrder(payload)
		.then(({ value }) => {
			const logId = value?.log?.id;
			if (!logId) return;

			getImportProgress({
				logId,
				progressAction: getImportWorkOrderProgress,
			});
			emit('event', { eventName: 'setCurrentLog', data: logId });
		})
		.catch((error) => {
			console.warn(error);
			emit('event', { eventName: 'handleImportProcessing', data: false });
		});
};

onBeforeUnmount(resetProgressInterval);

defineExpose({ onStart, onRevert });
</script>
