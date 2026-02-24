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
			blockId ? `upload-container-id-${blockId}`: '',
			className || ''
		]"
		:auto-upload="false"
		:multiple="multiple"
		:accept="accept"
		list-type="picture"
		:show-file-list="false"
		:disabled="disabled"
	>
		<!-- :file-list="filesList" -->

		<!-- <i class="el-icon-upload"></i>
		<div class="el-upload__text">
			Перетащите изображение сюда или <em>кликните для загрузки</em>
		</div> -->

		<!-- <div slot="tip" class="el-upload__tip">jpg/png не более 5000kb</div> -->
		<div slot="tip" :class="uploadListWapperClass || 'el-upload-list-wrapper'" >
			<div :class="['el-upload-list el-upload-list--picture', {'drag-n-drop-list': enableReorder}]" ref="uploadList">
				<div
					:class="['el-upload-list__item is-success', imgItemClass, {'drag-n-drop-item': enableReorder}]"
					v-for="(file, idx) in filesList"
					:key="`file-${file.id}`"
					:data-id="file.id"
				>
					<!-- :data-set="reorderDataSet" -->
					<!-- :replaceSelectedFile="replaceSelectedFile" -->
					<FileUploadBlockItem
						ref="FileUploadBlockItem"
						@event="handleEventNew"
						:itemData="file"
						:showDeleteButton="showDeleteButton"
						:multiple="!disabled && multiple"
						:deleteFileId="deleteFileId"
						:rotate="!disabled && rotate"
						:hidePreview="hidePreview"
						:additionalFormData="additionalFormData"
						:keepFilePath="keepFilePath"
						:enableLinkToFile="enableLinkToFile"
						:showLinkToFileButton="showLinkToFileButton"
						:showImageClickOverlay="showImageClickOverlay"
						:filePropName="filePropName"
						:deleteButtonType="deleteButtonType"
						:enableReorderFiles="enableReorderFiles"
						@onRemove="id => removeFormItem(id, 'filesList')"
						:itemIndex="idx"
					/>
						<!-- :uploadBlockType="uploadBlockType" -->
						<!-- @ready="blockReady" -->
				</div>
			</div>
			<!-- <transition-group
				name="component-scale"
				mode="out-in"
				tag="ul"
				class="el-upload-list el-upload-list--picture "
				ref="uploadList"
			>	 -->
				
			<!-- </transition-group> -->
		</div>

		<el-button :class="[buttonClass]" size="small" type="primary" v-if="!disabled">
			<span>{{ buttonText || 'Upload img' }}</span>
			<i :class="['suffix-icon', buttonIcon || 'el-icon-picture-outline']"></i>
		</el-button>
		<b v-else-if="!filesList.length" class="showJustInfo inherit-color">-</b>
	</el-upload>
</template>

<script>
// import { required } from '@/constants/validation';

import {
	eventHandler,
	createFormItemMixin,
	dragNdropSortableMixin,
} from '@/mixins';

export default {
	mixins: [
		eventHandler(),
		createFormItemMixin(),
		dragNdropSortableMixin(),
	],

	components: {
		ElUpload: () =>
			import(/* webpackChunkName: "ElUpload" */ 'element-ui/lib/upload'),
		FileUploadBlockItem: () => import('./FileUploadBlockItem.vue')
	},

	props: {
		pictures: {
			type: Array,
			default: () => []
		},
		// mainFile: Boolean,
		// mergeArrayValues: Boolean,
		accept: {
			type: String,
			default: 'image/jpg, image/jpeg, image/png, image/gif, video/mp4'
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
		// saveNewOnly: Boolean,
		showImageClickOverlay: Boolean,
		showDeleteButton: Boolean,
		// deleteFileProp: String,
		keepFilePath: Boolean,
		disabled: Boolean,
		// uploadButtonToRight: Boolean,
		showLinkToFileButton: Boolean,
		imgItemClass: String,
		buttonIcon: String,
		deleteButtonType: String,
		additionalFormData: {
			type: Object,
			default: () => ({})
		},
		enableLinkToFile: Boolean,
		uploadBlockType: { type: String, default: 'standard-images' },
		enableReorderFiles: { type: Object, default: () => null },
		blockId: null,
	},

	data() {
		return {
			draggingLocked: false,
			refsUpdate: 0,

			filesList: [],
		};
	},

	computed: {
		enableReorder: that => that.enableReorderFiles /*&& that.filesList.length > 1*/,
		drag_n_drop_wrapper_selector: that => that.blockId ? `.upload-container-id-${that.blockId}` : '.upload-container',

		UploadListRef() {
			if (this.refsUpdate) {
				return this.$refs['uploadList'];
			}
			return null;
		},

		/*reorderDataSet(fileItem) {
			if (this.enableReorderFiles && this.enableReorderFiles.formKey) {
				return this.enableReorderFiles.dataSet;
			}
			return '';
		}*/
	},

	methods: {
		resetFilesList() {
			this.filesList = [];
		},

		onSelectFile(file) {
			// console.log(file)
			if (!this.multiple) {
				this.filesList = [];
				// console.log('filesList 1', this.filesList)
			}

			setTimeout(() => {
				this.addFormItem('filesList', 'pic-', { formData: file });
				// console.log('filesList 2', this.filesList)

			}, 250);

			this.$emit('onSelectFile', file);
		},

		imgClick({ id }) {
			// console.log(id, this.pictures, this.filesList);
			this.$emit('onImgClick', {
				picturesList: this.filesList,
				pictureId: id
			});
		},

		// ----------------------
		dragStartHandler(event) {
			const { target } = event.sensorEvent.data;

			return target.classList.contains('can-dragging');
		},
		// ---------------

		getFormData() {
			// console.log(this.$refs['FileUploadBlockItem'])
			if (this.$refs['FileUploadBlockItem']) {
				let newOrder = {};
				if (this.enableReorder) {
					const allContainers = document.querySelectorAll(
						`${this.drag_n_drop_wrapper_selector} .drag-n-drop-list > .drag-n-drop-item`
					);
					if (allContainers) {
						allContainers.forEach((fileUploadBlockNode, idx) => {
							newOrder[fileUploadBlockNode.dataset.id] = idx+1;
							// console.log(newOrder, fileUploadBlockNode.dataset.id)
						});
					}
				}

				return this.$refs['FileUploadBlockItem'].map(row => {
					if (this.enableReorder) {
						return {
							...row.getFormData(),
							[this.enableReorderFiles.formKey]: newOrder[row.itemId]
						};					
					}
					// console.log('newOrder', row.itemId, newOrder[row.itemId])
					return row.getFormData()
				});
			}
			return [];
		}
	},

	watch: {
		pictures(pictures) {
			// console.log('pictures', pictures)
			this.filesList = this.setupFormSubItemsList(pictures, 'pic-');
		},

		UploadListRef(ref) {
			if (this.enableReorder && ref) {
				this.draggingLocked = false;				
				this.setupDraggable(this.enableReorderFiles);
			}
		}
	},

	created() {
		this.filesList = this.setupFormSubItemsList(this.pictures, 'pic-');
	},

	mounted() {
		if (this.enableReorder && !this.refsUpdate && this.$refs['uploadList']) {
			this.refsUpdate++;
		}
	},

	updated() {
		if (this.enableReorder && !this.refsUpdate && this.$refs['uploadList']) {
			this.refsUpdate++;
		}
	},
};
</script>
