<template>
	<div class="card-content no-paddings">
		<div class="cells-list drag-n-drop-list">
			<div class="cell-item el-form-item relative">
				<CustomSelectV2
					v-model="equipmentTypeId"
					filterable
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('select')} ${tt('item')} ${tt('type')}`"
				/>
			</div>

			<div class="cell-item item-drop-zone bold">Options:</div>

			<DragDropCellItem ref="dragDropCellItemRefs" :itemData="{ name: 'Brand' }" />
			<DragDropCellItem ref="dragDropCellItemRefs" :itemData="{ name: 'Part Number' }" />

			<div v-if="selectedItemType" class="cells-block">
				<DragDropCellItem
					v-for="(item, idx) in selectedItemType.type_options"
					ref="dragDropCellItemRefs"
					:key="`type-option-${item.id}-${idx}`"
					:itemData="item"
					:optionId="item.id"
				/>
			</div>

			<div class="cell-item">
				<div>
					<el-button
						:disabled="!selectedItemType"
						class="action-button create-button with-text"
						size="small"
						type="success"
						@click="addOption"
					>
						<span>{{ `${tt('add')} ${tt('option')}` }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</div>

			<div class="cell-item item-drop-zone bold">Medias:</div>

			<div v-if="selectedItemType" class="cells-block">
				<DragDropCellItem
					v-for="(item, idx) in selectedItemType.type_medias"
					ref="dragDropCellItemRefs"
					fileUpload
					:key="`type-media-${item.id}-${idx}`"
					:itemData="item"
					:mediaId="item.id"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useTestingStore } from '@/stores/TestingStore';
import { useNotify } from '@/composables/useNotify';

import DragDropCellItem from '@/components/Import/DragDropCellItem.vue';

const { tt } = Lang;

defineOptions({ name: 'SettingsImportOptionsContainer' });

const props = defineProps({
	uploadedFileName: String,
});
const emit = defineEmits(['event']);

const testingStore = useTestingStore();
const globalStore = useGlobalStore();
const { Notify } = useNotify();
const fetchEquipmentTypes = createGetRequest(ENTITIES.EquipmentTypes.apiBase);

const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);
const equipmentTypeId = ref(null);
const dragDropCellItemRefs = ref([]);

const selectedItemType = computed(() =>
	equipmentTypeId.value && equipmentTypesList.value.length
		? findItemBy('id', equipmentTypeId.value, equipmentTypesList.value)
		: null,
);

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
const addOption = () => {
	globalStore.show_edit_modal({
		show: true,
		instanceName: 'EquipmentTypes',
		formComponentFileLoader: () => import('@/views/EquipmentTypes/ItemForm.vue'),
		instanceData: selectedItemType.value,
		title: 'Add new Type options',
		activeSpinner: true,
		spinnerText: `${tt('loading')}...`,
		settings: { createNewOptionsOnly: true },
		successSubmitCallback: updateEquipmentTypes,
	});
};
const updateEquipmentTypes = () => {
	loadEquipmentTypes();
	emit('event', 'refreshDropContainers');
	globalStore.show_edit_modal({});
};
const onStart = () => {
	const droppedItems = document.querySelectorAll('.headings-list .drag-n-drop-item');
	const allItemsRefs = dragDropCellItemRefs.value || [];
	const data = {
		file_name: props.uploadedFileName,
		type_id: equipmentTypeId.value,
		brand_column_name: '',
		brand_model_column_name: '',
		options: [],
		medias: [],
	};

	for (const nodeItem of droppedItems) {
		const { itemName, optionId, mediaId } = nodeItem.dataset;
		const columnName = nodeItem.parentElement.parentElement.querySelector('[data-column-name]')?.dataset.columnName;

		if (itemName === 'Brand') {
			data.brand_column_name = columnName;
		} else if (itemName === 'Part Number') {
			data.brand_model_column_name = columnName;
		} else if (optionId) {
			data.options.push({ id: +optionId, column_name: columnName });
		} else if (mediaId) {
			const refItem = findItemBy('mediaId', +mediaId, allItemsRefs.map((item) => item.formData));
			const zipFile = refItem?.zip_file;
			const mediaItem = { id: +mediaId, column_name: columnName };
			if (zipFile) mediaItem.zip_file = zipFile;
			data.medias.push(mediaItem);
		}
	}

	let mediasHasFiles = false;
	let optionsHasValue = true;
	const isValid = Object.keys(data).every((key) => {
		const value = data[key];
		if (key === 'medias') {
			if (value?.length) mediasHasFiles = value.some((item) => item.zip_file);
			return true;
		}
		optionsHasValue = Array.isArray(value) ? value.length > 0 : !!value;
		return optionsHasValue;
	});

	if (!data.medias.length) delete data.medias;

	if (!isValid) {
		Notify({
			type: 'warning',
			title: "Data isn't ready",
			message: 'Item type, Brand, Part Number and some of type options should be assigned...',
		});
		return;
	}

	globalStore.set_value('overlay', {
		text: 'Dont close this window until import in process!',
		textStyle: { fontSize: '25px' },
	});
	globalStore.set_value('mainPreloader', true);
	testingStore.import_masterDB({ data, withFile: mediasHasFiles })
		.then(() => {
			equipmentTypeId.value = null;
			emit('event', { eventName: 'handleImportSuccess', data: {} });
		})
		.finally(() => {
			globalStore.set_value('mainPreloader', false);
			globalStore.set_value('overlay', {});
		});
};

onMounted(loadEquipmentTypes);

defineExpose({ onStart });
</script>
