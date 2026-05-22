<template>
	<el-upload
		ref="uploadContainer"
		:on-change="onSelectFile"
		action="#"
		:class="[
			'upload-container',
			uploadBlockType,
			{ 'with-rotate': rotate },
			{ inline: inline },
			{ multiple: multiple },
			{ 'has-files': filesList.length },
			blockId ? `upload-container-id-${blockId}` : '',
			className || ''
		]"
		:auto-upload="false"
		:multiple="multiple"
		:accept="accept"
		list-type="picture"
		:show-file-list="false"
		:disabled="disabled"
	>
		<template #tip>
			<div :class="uploadListWapperClass || 'el-upload-list-wrapper'">
				<div
					:class="['el-upload-list el-upload-list--picture', { 'drag-n-drop-list': enableReorder }]"
					ref="uploadList"
				>
					<div
						v-for="(file, idx) in filesList"
						:key="`file-${file.id}`"
						:class="['el-upload-list__item is-success', imgItemClass, { 'drag-n-drop-item': enableReorder }]"
						:data-id="file.id"
					>
						<FileUploadBlockItem
							ref="fileUploadItemsRefs"
							:itemData="file"
							:showDeleteButton="showDeleteButton"
							:multiple="!disabled && multiple"
							:deleteFileId="deleteFileId"
							:rotate="!disabled && rotate"
							:hidePreview="hidePreview"
							:additionalFormData="additionalFormData"
							:keepFilePath="keepFilePath"
							:enableLinkToFile="enableLinkToFile"
							:hideDeleteButton="hideDeleteButton"
							:showLinkToFileButton="showLinkToFileButton"
							:showImageClickOverlay="showImageClickOverlay"
							:showNameOnly="showNameOnly"
							:filePropName="filePropName"
							:deleteButtonType="deleteButtonType"
							:enableReorderFiles="enableReorderFiles"
							:itemIndex="idx"
							@event="handleEventNew"
							@onRemove="(id) => removeFormItem(id, filesList)"
						/>
					</div>
				</div>
			</div>
		</template>

		<el-button :class="[buttonClass]" size="small" type="primary" v-if="!disabled">
			<span>{{ buttonText || 'Upload img' }}</span>
			<i :class="['suffix-icon', buttonIcon || 'el-icon-picture-outline']"></i>
		</el-button>
		<b v-else-if="!filesList.length" class="showJustInfo inherit-color">-</b>
	</el-upload>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue';

import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useDragNdropSortable } from '@/composables/mixins/useDragNdropSortable';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FileUploadBlockItem from './FileUploadBlockItem.vue';

defineOptions({
	name: 'FileUploadBlock',
});

const props = defineProps({
	pictures: { type: Array, default: () => [] },
	accept: {
		type: String,
		default: 'image/jpg, image/jpeg, image/png, image/gif, video/mp4',
	},
	buttonText: String,
	buttonClass: { type: String, default: 'upload-button' },
	uploadListWapperClass: String,
	className: String,
	filePropName: String,
	rotate: Boolean,
	inline: Boolean,
	multiple: Boolean,
	deleteFileId: Boolean,
	hidePreview: Boolean,
	showNameOnly: Boolean,
	showImageClickOverlay: Boolean,
	showDeleteButton: Boolean,
	keepFilePath: Boolean,
	disabled: Boolean,
	showLinkToFileButton: Boolean,
	hideDeleteButton: Boolean,
	imgItemClass: String,
	buttonIcon: String,
	deleteButtonType: String,
	additionalFormData: { type: Object, default: () => ({}) },
	enableLinkToFile: Boolean,
	uploadBlockType: { type: String, default: 'standard-images' },
	enableReorderFiles: { type: Object, default: () => null },
	blockId: null,
});

const emit = defineEmits(['event', 'onSelectFile', 'onImgClick']);

const uploadContainer = ref(null);
const uploadList = ref(null);
const fileUploadItemsRefs = ref([]);

const filesList = ref([]);
const draggingLocked = ref(false);

const { setupFormSubItemsList, addFormItem, removeFormItem } = useSubItemsList();

const enableReorder = computed(() => !!props.enableReorderFiles);
const drag_n_drop_wrapper_selector = computed(() =>
	props.blockId ? `.upload-container-id-${props.blockId}` : '.upload-container'
);

const imgClick = ({ id }) => {
	emit('onImgClick', {
		picturesList: filesList.value,
		pictureId: id,
	});
};

const methodsMap = { imgClick };
const { handleEvent: handleEventNew } = useEventHandler(methodsMap, emit);

const dragStartHandler = (event) => {
	const target = event?.sensorEvent?.data?.target;
	return !!target?.classList?.contains('can-dragging');
};

const reorderHandler = () => {
	// Reorder index is collected in getFormData from DOM order.
};

const { setupDraggable } = useDragNdropSortable({
	wrapperSelector: drag_n_drop_wrapper_selector,
	draggingLockedProp: draggingLocked,
	reorderHandler,
	dragStartHandler,
});

const resetFilesList = () => {
	filesList.value = [];
};

const onSelectFile = (file) => {
	if (!props.multiple) {
		filesList.value = [];
	}

	setTimeout(() => {
		addFormItem(filesList, 'pic-', { formData: file });
	}, 250);

	emit('onSelectFile', file);
};

const getFormData = () => {
	const refsList = Array.isArray(fileUploadItemsRefs.value)
		? fileUploadItemsRefs.value
		: [fileUploadItemsRefs.value].filter(Boolean);

	if (!refsList.length) return [];

	let newOrder = {};
	if (enableReorder.value) {
		const allContainers = document.querySelectorAll(
			`${drag_n_drop_wrapper_selector.value} .drag-n-drop-list > .drag-n-drop-item`
		);
		if (allContainers) {
			allContainers.forEach((node, idx) => {
				newOrder[node.dataset.id] = idx + 1;
			});
		}
	}

	return refsList.map((row) => {
		if (enableReorder.value) {
			return {
				...row.getFormData(),
				[props.enableReorderFiles.formKey]: newOrder[row.itemId?.value || row.itemId],
			};
		}
		return row.getFormData();
	});
};

watch(
	() => props.pictures,
	(pictures) => {
		filesList.value = setupFormSubItemsList(pictures, 'pic-');
	},
	{ immediate: true }
);

watch(
	() => uploadList.value,
	(refEl) => {
		if (enableReorder.value && refEl) {
			draggingLocked.value = false;
			setupDraggable(props.enableReorderFiles || {});
		}
	}
);

onMounted(() => {
	if (enableReorder.value && uploadList.value) {
		nextTick(() => {
			draggingLocked.value = false;
			setupDraggable(props.enableReorderFiles || {});
		});
	}
});

defineExpose({
	getFormData,
	resetFilesList,
	filesList,
	uploadContainer,
});
</script>
