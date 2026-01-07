<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container type-media-value-item mrow']"
		:model="formData"
	>
		<el-form-item prop="equipment_type_option_id" class="mcol-xs-3 events-none">
			<SimpleSpinner :active="equipmentTypesLoading" />
			<label v-if="itemIndex == 0">{{ `${tt('Item_Type')} ${tt('Media')}` }}</label>
			<el-input :value="itemData.name" class="" />
		</el-form-item>

		<el-form-item prop="value" class="mcol-xs-3 ImgUploadBlockWrapper">
			<label v-if="itemIndex == 0">{{ tt('File') }}</label>

			<el-upload
				ref="uploadContainer"
				:multiple="false"
				:on-change="e => onSelectFile(e, 'file')"
				:on-remove="() => onRemoveFile('file')"
				action="#"
				class="upload-container"
				:auto-upload="false"
				:show-file-list="false"
			>
				<!-- accept=".xml" -->

				<div slot="tip">
					<div class="file-name">
						<span v-if="selectedFile">{{ selectedFile.name }}</span>
						<span v-else>{{ tt('phrases.no_file_loaded') }}</span>
					</div>
				</div>

				<div slot="trigger">
					<el-button size="small" type="primary">{{
						tt('phrases.click_to_upload')
					}}</el-button>
				</div>

				<a
					v-if="formData.full_file_name"
					target="_blank"
					:href="formData.full_file_name"
					class="view-file-button info-color link underline"
					>{{ tt('phrases.View_File') }}</a
				>
			</el-upload>
		</el-form-item>
	</el-form>
</template>

<script>
// import 'element-ui/lib/theme-chalk/upload.css';
import { subItemMixin, onSelectFileMixin } from '@/mixins';
import { findItemBy } from '@/helpers';


export default {
	mixins: [subItemMixin(), onSelectFileMixin()],
	components: {
		ElUpload: () =>
			import(/* webpackChunkName: "ElUpload" */ 'element-ui/lib/upload')
	},

	props: {
		equipmentTypesLoading: Boolean,
		brandItemData: Object,
		currentDataList: Array,
	},

	data() {
		return {
			selectedFile: null,

			formData: {
				id: null,
				equipment_type_media_id: null,
				file: null,
				img_rotate: 0,
				full_file_name: '',
				file_name: ''
			}
		};
	},

	computed: {
		deleteNewId: () => true
	},

	methods: {
		localSetupPageHook(itemData) {
			let currentItem = findItemBy('equipment_type_media_id', itemData.id, this.currentDataList);
			return {
				itemForSetup: currentItem,
				next: !!currentItem
			}
		},

		localSetupPageActions(item) {
			this.formData.equipment_type_media_id = item.id;

			if (this.formData.file_name) {
				this.selectedFile = { name: this.formData.file_name };
			}
		},

		localGetFormDataCallback(formData) {
			delete formData.full_file_name;
			delete formData.file_name;
			if (!formData.id) {
				delete formData.id;
			}
			if (!formData.file) {
				delete formData.file;
			}
			return formData;
		},

		clearValidate(props = []) {
			if (this.$refs['itemForm']) {
				this.$refs['itemForm'].clearValidate(props);
			}
		}
	}
};
</script>
