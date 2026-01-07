<template>
	<div class="edit-form-container import-form">
		<el-form
			class="item-edit-form relative mrow flex wrap"
			label-width="0"
			ref="itemForm"
			:model="formData"
			:rules="rules"
		>
			<div class="form-item mcol-xs-12 mcol-md-4">
				<el-form-item prop="file">
					<el-upload
						ref="uploadContainer"
						:on-preview="clearValidate"
						:on-change="e => onSelectFile(e, 'file')"
						:on-remove="handleRemove"
						action="#"
						:auto-upload="false"
					>
						<!-- accept=".xml" -->
						<el-button size="small">Click to select file</el-button>
					</el-upload>
				</el-form-item>
			</div>

			<div class="form-item mcol-xs-12 mcol-md-4">
				<el-button
					@click="validateForm"
					type="primary"
					native-type="button"
					class="item-action-button"
					:loading="isUploading"
				>
					<span>UPLOAD</span>
				</el-button>
			</div>

			<div class="form-item mcol-xs-12 mcol-md-4" v-if="showStart">
				<el-button
					@click="handleStart"
					native-type="button"
					class="item-action-button"
					:disabled="disableStart"
					:loading="isImporting"
				>
					<span>START</span>
				</el-button>
			</div>

			<div class="form-item mcol-xs-12 mcol-md-4" v-if="showRevert">
				<el-button
					@click="handleRevert"
					native-type="button"
					class="item-action-button"
					:loading="isProcessingRevert"
				>
					<span>REVERT</span>
				</el-button>
			</div>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

// import { findItemBy } from '@/helpers';
import { required } from '@/constants/validation';
import { itemFormMixin, onSelectFileMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), onSelectFileMixin()],
	components: {
		ElUpload: () =>
			import(/* webpackChunkName: "ElUpload" */ 'element-ui/lib/upload')
		// EmailsFormItem: () => import('./EmailsFormItem.vue')
	},

	props: {
		showStart: Boolean,
		showRevert: Boolean,
		isProcessingRevert: Boolean,
		isUploading: Boolean,
		isImporting: Boolean,
		// isImportSuccess: Boolean,
		submitActionProp: String,
		// uploadSettings: Object,
		disableStart: Boolean
	},

	data() {
		return {
			// isUploadingRevert: false,

			formData: {
				file: null
				// main_zip_file: null,
				// drawing_zip_file: null
			}
		};
	},

	computed: {
		rules: () => ({
			file: required
		}),

		uploadSettings: () => ({
			fileProp: 'file'
		})
	},

	methods: {
		...mapActions({
			save_item: 'testing/import_settings',
			upload_masterDB: 'testing/upload_masterDB',
			upload_motorIQ: 'testing/upload_motorIQ',
			upload_work_order: 'maintenance/upload_work_order'
		}),

		handleRemove() {
			this.onRemoveFile('file');
			this.$emit('event', 'clearImportData');
		},

		clearFiles() {
			this.$refs['uploadContainer'].clearFiles();
		},

		handleStart() {
			this.$emit('event', 'onStart');
		},

		handleRevert() {
			this.$emit('event', 'onRevert');
		}
	}
};
</script>
