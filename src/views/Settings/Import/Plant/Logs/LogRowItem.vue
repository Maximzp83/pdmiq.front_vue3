<template>
	<div class="import-log-row-item">
		<LogRowMainColumnsBlock
			ref="logRowMainColumnsBlockRef"
			:rowData="rowData"
			:logData="logData"
			:errors="rowErrorsList"
		/>

		<div class="card-content">
			<LogRowTypesColumnsBlock
				ref="logRowTypesColumnsBlockRef"
				:rowData="rowData"
				:logData="logData"
				:errors="rowErrorsList"
				:equipmentTypesList="equipmentTypesList"
			/>
		</div>

		<div class="card-content">
			<ul>
				<li
					v-for="item in rowErrorsListFilteredDuplicates"
					:key="`error-row-${item.id}`"
					class="alarm-color"
					v-text="item.error"
				></li>
			</ul>
		</div>

		<div class="card-content">
			<el-button
				native-type="button"
				class="item-action-button"
				type="success"
				:loading="blockIsSaving"
				@click="handleValidateSubItems"
			>
				<span>Apply Change</span>
				<i class="icomoon icon-check"></i>
			</el-button>

			<el-button
				native-type="button"
				class="item-action-button inverted"
				type="primary"
				:loading="blockIsSaving"
				@click="handleDeleteRow"
			>
				<span>Delete Row</span>
				<i class="icomoon icon-plus rotate"></i>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { getObjectVal, removeDuplicatesFromArray } from '@/helpers';
import { Lang } from '@/localization';
import { useTestingStore } from '@/stores/TestingStore';
import { useNotify } from '@/composables/useNotify';

import LogRowMainColumnsBlock from './LogRowMainColumnsBlock.vue';
import LogRowTypesColumnsBlock from './LogRowTypesColumnsBlock.vue';

defineOptions({ name: 'ImportLogRowItem' });

const props = defineProps({
	rowData: { type: Object, required: true },
	equipmentTypesList: { type: Array, default: () => [] },
});
const emit = defineEmits(['event']);
const testingStore = useTestingStore();
const { Notify } = useNotify();
const logRowMainColumnsBlockRef = ref(null);
const logRowTypesColumnsBlockRef = ref(null);
const blockIsSaving = ref(false);

const logData = computed(() => props.rowData.log || {});
const rowErrorsList = computed(() => props.rowData.items || []);
const rowErrorsListFilteredDuplicates = computed(() =>
	removeDuplicatesFromArray(rowErrorsList.value, 'error'),
);
const collectSubItemsData = () => [
	...(logRowMainColumnsBlockRef.value?.getFormData?.() || []),
	...(logRowTypesColumnsBlockRef.value?.getFormData?.() || []),
];
const handleValidateSubItems = () => {
	const collectedData = collectSubItemsData();
	if (collectedData.every((item) => item.isValid)) {
		handleRepeat(collectedData);
		return;
	}

	let message = '';
	for (const item of collectedData) {
		if (!item.isValid) message += getObjectVal(item, 'data.column_name') || '';
	}
	setTimeout(() => {
		Notify({
			type: 'warning',
			title: Lang.tt('phrases.Validation_error'),
			message: message
				? `${message} - is required`
				: Lang.tt('phrases.Please_check_fields_errors_first'),
			duration: 0,
		});
	}, 10);
};
const handleRepeat = (subItemsData) => {
	const { id, import_file_name: importFileName } = logData.value;
	const importColumnsName = { ...(logData.value.import_columns_name || {}) };
	importColumnsName.types = (importColumnsName.types || []).map((item) => {
		const nextItem = { ...item };
		if (!nextItem.equipment_nameplate_column_name) delete nextItem.equipment_nameplate_column_name;
		if (!nextItem.equipment_picture_column_name) delete nextItem.equipment_picture_column_name;
		return nextItem;
	});

	Object.keys(importColumnsName).forEach((key) => {
		if (importColumnsName[key] === null) delete importColumnsName[key];
	});

	const errors = subItemsData.filter((item) => !!item.data.log_item_id);
	const data = {
		log_id: id,
		row_number: props.rowData.row_number,
		...importColumnsName,
		file_name: importFileName,
		errors: errors.map((item) => item.data),
	};

	blockIsSaving.value = true;
	testingStore.import_motorIQ_repeat({ data })
		.then(() => {
			emit('event', {
				eventName: 'refetchItemsList',
				onward: true,
			});
		})
		.finally(() => {
			blockIsSaving.value = false;
		});
};
const handleDeleteRow = () => {
	blockIsSaving.value = true;
	testingStore.delete_import_motorIQ_row({ rowId: props.rowData.id })
		.then(() => {
			emit('event', {
				eventName: 'refetchItemsList',
				onward: true,
			});
		})
		.finally(() => {
			blockIsSaving.value = false;
		});
};
</script>
