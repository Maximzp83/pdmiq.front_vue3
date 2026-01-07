<template>
	<el-form ref="itemForm" :class="['option-item-container mrow']" :model="formData">
		<el-form-item prop="name" class="mcol-xs-7">
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item prop="file" class="mcol-xs-5 upload-form-item">
				<!-- injectDataToRoot -->
				<!-- formPropName="file" -->
			<FileUploadBlock
				ref="FileUploadBlock"
				deleteFileId
				hidePreview
				accept="all"
				:pictures="files"
				@onSelectFile="handleSelectFile"
				:buttonText="tt('phrases.upload_file')"
				buttonIcon="icomoon icon-clip"
			/>
				<!-- @ready="blockReady" -->
			<!-- :replace-selected-file="true" -->
		</el-form-item>

		<div>
			<el-button
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
import { subItemMixin, subItemsListMixin } from '@/mixins';

export default {
	mixins: [subItemMixin(), subItemsListMixin()],
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue')
	},

	props: {},

	data() {
		return {
			formData: {
				id: null,
				name: '',
				// file: undefined,
				file_name: ''
			}
		};
	},

	computed: {
		deleteNewId: () => true,

		files() {
			if (this.itemData && this.itemData.full_file_name) {
				return [{ full_file_name: this.itemData.full_file_name }];
			}
			return [];
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'FileUploadBlock' },
		]),
	},

	methods: {
		handleSelectFile(file) {
			this.formData.name = file.name;
		}
	}
};
</script>
