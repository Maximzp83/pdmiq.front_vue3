<template>
	<div
		class="edit-form-container"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="name" required>
				<CustomInput
					v-model="formData.name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('image')" prop="file" class="upload-form-item">
				<FileUploadBlock
					ref="FileUploadBlock"
					deleteFileId
					showDeleteButton
					:pictures="itemPictures"
				/>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { required } from '@/constants/validation';
// import { PRODUCTION_LINES_TYPES } from '@/constants/global';

import { itemFormMixin, subItemsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), subItemsListMixin()],
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
	},

	data() {
		return {
			formData: {
				name: '',
				file: null
				// img_rotate: 0,
			}
		};
	},

	computed: {
		itemPictures() {
			const { itemData } = this;
			if (itemData && itemData.file) {
				return [{ file: itemData.file }];
			}

			return [];
		},

		uploadSettings: () => ({
			fileProp: 'file'
		}),

		subItemsSettings: () => Object.freeze([
			{ ref: 'FileUploadBlock', setIfEmpty: { prop:'delete_file', val: 1 },  cleanIfEmpty: { prop:'file', val: null } },
		]),
	},

	methods: {
		...mapActions({
			// fetch_plants: 'plants/fetch_plants',
			save_item: 'industrial_services/save_industrial_service'
		}),

		localPreSubmitHook(payload) {
			let next = true;
			if (!payload.data.file && payload.data.delete_file) {
				next = false;
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.image_is_required`)
				});
			}
			return { next };
		}
	}
};
</script>
