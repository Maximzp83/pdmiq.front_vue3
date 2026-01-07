<template>
	<div
		class="cell-item item-drop-zone draggable-dropzone--occupied"
		:data-dropzone-name="itemData.name"
	>
		{{ itemData.name }}
		<div
			:class="['drag-n-drop-item', { 'is-common': isCommon }]"
			:data-equipment-type-id="equipmentTypeId"
			:data-option-id="optionId"
			:data-media-id="mediaId"
			:data-item-name="itemData.name"
			:data-item-form-key="itemData.formKey"
		>
			<span v-if="itemData.required" class="alarm-color span-block">
				<sup>*&nbsp;</sup>
			</span>

			{{ itemData.name }}
			<!-- :on-preview="clearValidate" -->
			<el-upload
				v-if="fileUpload"
				ref="uploadContainer"
				:on-change="e => onSelectFile(e, 'zip_file')"
				:on-remove="() => onRemoveFile('zip_file')"
				action="#"
				:auto-upload="false"
			>
				<!-- accept=".xml" -->
				<el-button size="small">ZIP file</el-button>
			</el-upload>
		</div>
	</div>
</template>

<script>
// import { required } from '@/constants/validation';
import { /*dynamicItemFormMixin*/ onSelectFileMixin } from '@/mixins';

export default {
	mixins: [/*dynamicItemFormMixin*/ onSelectFileMixin()],
	components: {
		ElUpload: () =>
			import(/* webpackChunkName: "ElUpload" */ 'element-ui/lib/upload')
	},

	props: {
		itemData: Object,
		fileUpload: Boolean,
		optionId: Number,
		equipmentTypeId: Number,
		mediaId: Number,
		itemName: String,
		isCommon: Boolean
	},

	data() {
		return {
			formData: {
				// id: this.itemData.id,
				optionId: this.optionId,
				mediaId: this.mediaId,
				name: this.itemData.name,
				zip_file: null
			}
		};
	},

	methods: {
		onSelectFile(e, propName) {
			const { raw } = e;
			this.clearValidate();
			this.formData[propName] = raw;

			this.$refs['uploadContainer'].uploadFiles = [e];

			this.selectedFile = { name: raw.name };
		},

		clearValidate() {
			return null;
		}
	}
};
</script>
