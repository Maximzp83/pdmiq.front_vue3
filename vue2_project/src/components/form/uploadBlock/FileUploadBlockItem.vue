<template>
	<div class="item-container">
		<div
			:class="[
				'ellipsis',
				{ 'img-container': fileType == 'image' || fileType == 'video' },
				{ 'without-footer': !multiple }
			]"
		>
			<div class="" v-if="!hidePreview && fileType == 'video'">
				<video
					autoplay
					playsinline
					muted
					loop
					class="el-upload-list__item-thumbnail"
				>
					<source :src="file.url" type="video/mp4" />
				</video>
			</div>

			<div v-else-if="!hidePreview && fileType == 'image'">
				<!-- v-else-if="!hidePreview && fileType == 'image'" -->
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
						:href="
							itemData.file_path || itemData.full_file_name || formData.name || '#'
						"
						target="_blank"
						><i class="el-icon-document"></i> {{ fileName }}</a
					>
					<span v-else>{{ fileName }}</span>
				</span>
				<span v-else>{{ tt('phrases.no_file_loaded') }}</span>
			</div>
		</div>

		<!-- <div class="file-name" v-else>{{ file.name }}</div> -->

		<div
			v-if="multiple || showDeleteButton || showLinkToFileButton"
			class="footer-block"
		>
			<!-- <div class="customRadioContainer">
				<input
					type="radio"
					name="is_main_group"
					class=""
					:checked="file.is_main ? `checked` : ''"
					@click="handleMainImgChange(file)"
					:id="`is_main_radio-${file.uid}`"
				/>
				<label :for="`is_main_radio-${file.uid}`"
					><span><b>Главное</b></span></label
				>
			</div> -->

			<div class="remove-button-container flex">
				<a
					v-if="showLinkToFileButton"
					class="span-block"
					:href="itemData.full_file_name || itemData.url || '#'"
					target="_blank"
				>
					<!-- <i class="el-icon-document"></i> -->
					<el-button class="uppercase action-button link-button" size="mini" type="success"
						>{{tt('VIEW')}}</el-button
					>
				</a>

				<el-button
					v-if="
						(multiple || showDeleteButton) && deleteButtonType == 'mini-red-button'
					"
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

<script>
import {icon_drag } from '@/constants/global';
import { getFileType, getFileName } from '@/helpers';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],

	props: {
		options: {
			type: Object,
			default: () => ({})
		},

		replaceSelectedFile: Boolean,
		showDeleteButton: Boolean,
		mainFile: Boolean,
		// uid: String,
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
		// uploadBlockType: String,

		itemData: {
			type: Object,
			required: true
		},
	},

	data() {
		return {
			selectedFile: null,

			formData: {
				id: null,
				img_rotate: 0,

				name: '',
				raw: null,
				file_path: ''
				// full_file_name: ''
				// size: 0,
				// uid: null
				// percentage: '',
				// status: '',
				// url
			}
		};
	},

	computed: {
		icon_drag: () => icon_drag,

		updateFormDataSettings: () => Object.freeze({ skipDeepCopy: true }),
		// getFileType: () => getFileType,
		fileType() {
			const { itemData } = this;
			return getFileType(
				itemData.name ||
					itemData.url ||
					itemData.full_file_name ||
					itemData.file_path ||
					itemData.attachment_file_name ||
					itemData.file
			);
		},

		fileName() {
			return getFileName(this.formData.name || this.itemData.full_file_name || this.itemData.file_path);
		},

		imgSrc() {
			const { itemData, formData } = this;
			let url =
				itemData.url ||
				itemData.full_file_name ||
				itemData.file_path ||
				itemData.file;

			if (!formData.raw) {
				url += `?${Date.now()}`;
			}

			return url;
		},

		image_styles() {
			return {
				transform: `rotate(${this.formData.img_rotate * -1}deg)`
			};
		},

		deleteNewId: () => true
	},

	methods: {
		rotateImg() {
			const { img_rotate } = this.formData;
			let currentAngle = img_rotate ? img_rotate * -1 : img_rotate;

			this.formData.img_rotate = currentAngle == 270 ? 0 : (currentAngle + 90) * -1;
		},

		imgClick() {
			const { file_path, id } = this.formData;

			const payload = {
				eventName: 'imgClick',
				data: {
					id: id || file_path
				}
			};
			this.$emit('event', payload);
		},

		localGetFormDataCallback(formData) {
			const { raw } = this.itemData;
			// let formData = { ...this.formData };

			if (raw) {
				formData[this.filePropName] = raw;
				// formData.file = raw;
			}

			if (this.deleteFileId) {
				delete formData.id;
			}

			delete formData.name;
			delete formData.raw;

			if (!this.rotate) {
				delete formData.img_rotate;
			}

			if (raw || !this.keepFilePath) {
				delete formData.file_path;
			}

			if (this.additionalFormData) {
				formData = { ...formData, ...this.additionalFormData };
			}

			// console.log('prepareFormData', this, formData)
			return formData;
		},

	},
};
</script>
