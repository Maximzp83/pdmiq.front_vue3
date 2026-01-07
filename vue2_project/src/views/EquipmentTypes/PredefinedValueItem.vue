<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container mrow sub-row']"
		:model="formData"
	>
		<el-form-item prop="value" :label="tt('Predefined_value')" required>
			<CustomInput v-model="formData.value" :placeholder="tt('value')"/>
		</el-form-item>

		<div class="el-form-item upload-wrapper">
			<el-form-item prop="file_name" class="upload-form-item">
				<FileUploadBlock
					ref="FileUploadBlock"
					rotate
					deleteFileId
					:pictures="picture"
				/>
			</el-form-item>
		</div>

		<el-form-item prop="is_crossover_excluded">
			<label>{{ tt('phrases.Crossover_exluded') }}</label>
			<el-switch
				class="without-margin"
				v-model="formData.is_crossover_excluded"
				:active-value="1"
				:inactive-value="0"
			/>
		</el-form-item>

		<el-button
			class="action-button remove-button"
			size="mini"
			type="danger"
			icon="icomoon icon-cross"
			@click="removeItem"
		/>
	</el-form>
</template>

<script>
import { subItemMixin, eventHandler } from '@/mixins';

export default {
	mixins: [subItemMixin(), eventHandler()],
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
	},

	data() {
		return {
			formData: {
				id: null,
				value: '',
				img_rotate: 0,
				is_crossover_excluded: false
			}
		};
	},

	computed: {
		deleteNewId: () => true,

		picture() {
			const { itemData } = this;
			if (itemData && itemData.full_file_name) {
				return [{ full_file_name: itemData.full_file_name }];
			} else {
				return [];
			}
		}
	},

	methods: {
		localGetFormDataCallback(formData) {
			const files = this.$refs.FileUploadBlock.getFormData();
				// console.log('formData.file', files)
			if (files && files.length) {
				if (files[0].file) {
					formData.file = files[0].file;					
				}
				formData.img_rotate = files[0].img_rotate;
			}
			return formData;
		}
	}
};
</script>
