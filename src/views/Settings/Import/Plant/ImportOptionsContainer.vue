<template>
	<div class="card-content no-paddings">
		<div class="cells-list drag-n-drop-list">
			<DragDropCellItem
				v-for="(item, idx) in predefinedTypeOptions"
				ref="dragDropCellItemRefs"
				isCommon
				:key="`predefined-type-option-${item.id}-${idx}`"
				:itemData="item"
			/>

			<div class="cell-item item-drop-zone bold">Select type:</div>

			<div class="cell-item el-form-item relative">
				<CustomSelectV2
					v-model="equipmentTypeIds"
					filterable
					multiple
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('select')} ${tt('item')} ${tt('types')}`"
				/>
			</div>

			<ImportTypeOptionsContainer
				v-for="itemType in selectedItemTypes"
				ref="importTypeOptionsContainerRefs"
				:key="`item-type-${itemType.id}`"
				:itemType="itemType"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useTestingStore } from '@/stores/TestingStore';
import { useNotify } from '@/composables/useNotify';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useImport } from '@/composables/mixins/useImport';

import DragDropCellItem from '@/components/Import/DragDropCellItem.vue';
import ImportTypeOptionsContainer from './ImportTypeOptionsContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'PlantImportOptionsContainer' });

const props = defineProps({
	uploadedFileName: String,
	currentLogId: null,
});
const emit = defineEmits(['event']);

const testingStore = useTestingStore();
const { Notify } = useNotify();
const fetchEquipmentTypes = createGetRequest(ENTITIES.EquipmentTypes.apiBase);

const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);
const equipmentTypeIds = ref([]);
const importTypeOptionsContainerRefs = ref([]);

const predefinedTypeOptions = Object.freeze([
	{ id: 1, name: 'Company', formKey: 'company_column_name', required: true },
	{ id: 2, name: 'Plant', formKey: 'plant_column_name', required: true },
	{ id: 3, name: 'Storeroom', formKey: 'storeroom_column_name' },
	{ id: 4, name: 'Storeroom location', formKey: 'storeroom_location_column_name' },
	{ id: 5, name: 'Location', formKey: 'location_column_name', required: true },
	{ id: 6, name: 'Production Line', formKey: 'production_line_column_name' },
	{ id: 13, name: 'Utility', formKey: 'utility_column_name' },
	{ id: 7, name: 'Machine', formKey: 'machine_column_name', required: true },
	{ id: 8, name: 'Machine image', formKey: 'machine_picture_name' },
	{ id: 9, name: 'Loc on Machine', formKey: 'loc_on_machine_column_name' },
	{ id: 10, name: 'Application', formKey: 'application_column_name', required: true },
	{ id: 11, name: 'IM Asset #', formKey: 'asset_column_name', required: true },
	{ id: 12, name: 'item_types', formKey: 'types_column_name', required: true },
]);

const selectedItemTypes = computed(() =>
	equipmentTypeIds.value.length && equipmentTypesList.value.length
		? equipmentTypeIds.value.map((id) => findItemBy('id', id, equipmentTypesList.value)).filter(Boolean)
		: [],
);

const successImportCallback = ({ logId }) => {
	Notify({
		type: 'success',
		title: 'Import Complete',
		dangerouslyUseHTMLString: true,
		message: `<a href="${window.location.origin}/plant-import-logs/${logId}" target="_blank" class="primary-color semi-bold standard">Master Data Dashboard</a>`,
	});
};
const { getImportProgress, resetProgressInterval } = useImport({
	emit,
	currentLogId: computed(() => props.currentLogId),
	successImportCallback,
});

const loadEquipmentTypes = () => {
	equipmentTypesLoading.value = true;
	fetchEquipmentTypes({ params: { max: -1 } })
		.then(({ value }) => {
			equipmentTypesList.value = value || [];
		})
		.finally(() => {
			equipmentTypesLoading.value = false;
		});
};
const collectTypeOptions = () => importTypeOptionsContainerRefs.value.map((item) => item.getFormData());
const validateTypeOptions = () => importTypeOptionsContainerRefs.value.every((item) => item.validateItemForm());
const updateEquipmentTypes = () => {
	loadEquipmentTypes();
	emit('event', 'refreshDropContainers');
};
const handleSubmit = (typesData = []) => {
	const droppedItems = document.querySelectorAll('.headings-list .drag-n-drop-item.is-common');
	const data = {
		file_name: props.uploadedFileName,
		company_column_name: '',
		plant_column_name: '',
		storeroom_column_name: '',
		storeroom_location_column_name: '',
		location_column_name: '',
		production_line_column_name: '',
		utility_column_name: '',
		application_column_name: '',
		machine_column_name: '',
		machine_picture_name: '',
		asset_column_name: '',
		loc_on_machine_column_name: '',
		types_column_name: '',
		types: typesData || [],
	};

	for (const nodeItem of droppedItems) {
		const { itemFormKey } = nodeItem.dataset;
		const columnName = nodeItem.parentElement.parentElement.querySelector('[data-column-name]')?.dataset.columnName;
		data[itemFormKey] = columnName;
	}

	const requiredOptions = predefinedTypeOptions.filter((item) => item.required);
	const isValid = requiredOptions.every((item) => !!data[item.formKey]);
	if (!isValid) {
		Notify({
			type: 'warning',
			title: "Data isn't ready",
			message: 'Required options and some of Item Types should be assigned...',
		});
		return;
	}

	Object.keys(data).forEach((key) => {
		if (!data[key]) delete data[key];
	});

	emit('event', { eventName: 'handleImportProcessing', data: true });
	testingStore.import_motorIQ({ data, notNotify: true })
		.then(({ value }) => {
			const { log } = value || {};
			if (log?.id) {
				getImportProgress({
					logId: log.id,
					progressAction: testingStore.get_import_plant_progress,
				});
			}
		})
		.catch((error) => {
			console.warn(error);
			emit('event', { eventName: 'handleImportProcessing', data: false });
		});
};
const onStart = () => {
	if (validateTypeOptions()) {
		handleSubmit(collectTypeOptions());
		return;
	}

	Notify({
		type: 'warning',
		title: "Data isn't ready",
		message: 'Required Item Type options should be assigned...',
	});
};

const { handleEvent } = useEventHandler({ updateEquipmentTypes });

onMounted(loadEquipmentTypes);
onBeforeUnmount(resetProgressInterval);

defineExpose({ onStart });
</script>
