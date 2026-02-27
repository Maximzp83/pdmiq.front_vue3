<template>
	<div class="item-container">
		<div
			:class="[
				'ellipsis',
				{ 'img-container': fileType == 'image' || fileType == 'video' },
				{ 'without-footer': !multiple }
			]"
		>
			<div v-if="!hidePreview && fileType == 'video'">
				<video autoplay playsinline muted loop class="el-upload-list__item-thumbnail">
					<source :src="file.url" type="video/mp4" />
				</video>
			</div>

			<div v-else-if="!hidePreview && fileType == 'image'">
				<div class="relative imgWrapper">
					<div class="reorder-button can-dragging" v-if="enableReorderFiles">
						<img class="can-dragging" :src="icon_drag" alt="" />
					</div>

					<div
						class="images-part-overlay dark-overlay pointer"
						v-if="showImageClickOverlay"
						@click="imgClick"
						:style="image_styles"
					>
						<div class="caption">
							<i class="icomoon icon-zoom-in"></i>
						</div>
					</div>

					<img
						class="el-upload-list__item-thumbnail"
						:src="imgSrc"
						alt="img not found"
						:style="image_styles"
					/>
				</div>

				<i class="icomoon icon-rotate" v-if="rotate" @click="rotateImg"></i>
			</div>

			<div class="file-name ellipsis" v-if="!fileType && !hidePreview">
				<span v-if="fileName">
					<a
						v-if="enableLinkToFile && !formData.raw"
						class="link linkToFile"
						:href="itemData.file_path || itemData.full_file_name || formData.name || '#'"
						target="_blank"
					>
						<i class="el-icon-document"></i> {{ fileName }}
					</a>
					<span v-else>{{ fileName }}</span>
				</span>
				<span v-else>{{ tt('phrases.no_file_loaded') }}</span>
			</div>
		</div>

		<div v-if="multiple || showDeleteButton || showLinkToFileButton" class="footer-block">
			<div class="remove-button-container flex">
				<a
					v-if="showLinkToFileButton"
					class="span-block"
					:href="itemData.full_file_name || itemData.url || '#'"
					target="_blank"
				>
					<el-button class="uppercase action-button link-button" size="mini" type="success">
						{{ tt('VIEW') }}
					</el-button>
				</a>

				<el-button
					v-if="(multiple || showDeleteButton) && deleteButtonType == 'mini-red-button'"
					class="action-button remove-button span-block"
					type="primary"
					size="mini"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>

				<span
					v-if="(multiple || showDeleteButton) && deleteButtonType == 'mini-cross'"
					class="icomoon icon-cross mini-cross"
					@click="removeItem"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { icon_drag } from '@/constants/global';
import { getFileType, getFileName } from '@/helpers';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'FileUploadBlockItem',
});

const props = defineProps({
	options: { type: Object, default: () => ({}) },
	replaceSelectedFile: Boolean,
	showDeleteButton: Boolean,
	mainFile: Boolean,
	filePropName: { type: String, default: 'file' },
	mergeArrayValues: Boolean,
	hidePreview: Boolean,
	multiple: Boolean,
	showImageClickOverlay: Boolean,
	rotate: Boolean,
	deleteFileId: Boolean,
	deleteButtonType: { type: String, default: 'mini-red-button' },
	keepFilePath: Boolean,
	enableLinkToFile: Boolean,
	showLinkToFileButton: Boolean,
	additionalFormData: Object,
	enableReorderFiles: { type: Object, default: () => null },
	itemIndex: Number,
	itemData: { type: Object, required: true },
});

const emit = defineEmits(['event', 'onRemove', 'onCreate']);

const itemForm = ref(null);
const formData = ref({
	id: null,
	img_rotate: 0,
	name: '',
	raw: null,
	file_path: '',
});

const file = computed(() => props.itemData || {});

const fileType = computed(() => {
	const item = props.itemData || {};
	return getFileType(
		item.name ||
			item.url ||
			item.full_file_name ||
			item.file_path ||
			item.attachment_file_name ||
			item.file
	);
});

const fileName = computed(() => {
	return getFileName(formData.value.name || props.itemData.full_file_name || props.itemData.file_path);
});

const imgSrc = computed(() => {
	const { itemData } = props;
	const localForm = formData.value;
	let url = itemData.url || itemData.full_file_name || itemData.file_path || itemData.file;
	if (!localForm.raw) {
		url += `?${Date.now()}`;
	}
	return url;
});

const image_styles = computed(() => ({
	transform: `rotate(${formData.value.img_rotate * -1}deg)`,
}));

const rotateImg = () => {
	const { img_rotate } = formData.value;
	const currentAngle = img_rotate ? img_rotate * -1 : img_rotate;
	formData.value.img_rotate = currentAngle == 270 ? 0 : (currentAngle + 90) * -1;
};

const imgClick = () => {
	const { file_path, id } = formData.value;
	emit('event', {
		eventName: 'imgClick',
		data: { id: id || file_path },
	});
};

const localGetFormDataCallback = (data) => {
	const { raw } = props.itemData;
	let result = { ...data };

	if (raw) {
		result[props.filePropName] = raw;
	}

	if (props.deleteFileId) {
		delete result.id;
	}

	delete result.name;
	delete result.raw;

	if (!props.rotate) {
		delete result.img_rotate;
	}

	if (raw || !props.keepFilePath) {
		delete result.file_path;
	}

	if (props.additionalFormData) {
		result = { ...result, ...props.additionalFormData };
	}

	return result;
};

const { removeItem, getFormData, itemId } = useSubItem({
	itemData: props.itemData,
	formData,
	itemFormRef: itemForm,
	updateFormDataSettings: Object.freeze({ skipDeepCopy: true }),
	localGetFormDataCallback,
	deleteNewId: true,
	emit,
});

defineExpose({
	getFormData,
	itemId,
});
</script>
