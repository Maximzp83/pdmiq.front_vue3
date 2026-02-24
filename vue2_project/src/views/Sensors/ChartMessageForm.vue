<template>
	<div class="edit-form-container">
		<SimpleSpinner :active="isSaving" />
		<!-- <div class="title article-title capitalize">New message note</div> -->
		<el-form
			label-width="80px"
			class="item-edit-form section-row"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			label-position="left"
		>
			<el-form-item prop="message" :label="tt('note')">
				<!-- <el-input type="textarea" v-model.lazy="formData.message" rows="4" /> -->
				<CustomInput type="textarea" v-model="formData.message" rows="4" />
			</el-form-item>

			<el-form-item :label="tt('File')" prop="file" class="upload-form-item">
				<FileUploadBlock
					uploadBlockType="files-list"
					ref="FileUploadBlock"
					enableLinkToFile
					showLinkToFileButton
					showDeleteButton
					rotate
					:buttonText="tt('phrases.upload_file')"
					:pictures="itemPictures"
				/>
			</el-form-item>
		</el-form>

		<div class="dialog-footer section-row text-center">
			<el-button
				type="primary"
				:loading="sensorJobSaving"
				@click="() => validateForm()"
				class="uppercase"
				>{{ tt('SAVE') }}</el-button
			>
			<el-button @click="closeDialog">{{ tt('Cancel') }}</el-button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { required } from '@/constants/validation';

import { itemFormMixin, subItemsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), subItemsListMixin()],
	props: {
		itemData: {
			type: Object,
			default: () => ({})
		},
		parameter_type: Number,
		// sensorId: Number,
		visible: Boolean,
		sensorId: Number
	},

	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue')
	},

	data() {
		return {
			isSaving: false,

			formData: {
				message: '',
				file: null,
				image_angle: 0,
				graph_timestamp: '',
				metric_type: null,
				metric_issue_alert_id: null
			},

			rules: {
				message: required
			}
		};
	},

	computed: {
		...mapState({
			sensorJobSaving: state => state.sensors.sensorJobSaving
		}),

		cleanFormDataAfterClose: () => true,

		itemPictures() {
			const { itemData } = this;
			if (itemData && itemData.attachment_file_url) {
				return [{ 
					full_file_name: itemData && itemData.attachment_file_url,
					name: itemData && itemData.attachment_file_name
				}];
			}

			return [];
		},

		uploadSettings: () => ({
			fileProp: 'file'
		}),

		subItemsSettings: () => Object.freeze([
			{ ref: 'FileUploadBlock', setIfEmpty: { prop:'is_file_deleted', val: 1 }, cleanIfEmpty: { prop:'file', val: null } },
		]),
	},

	methods: {
		...mapActions({
			save_item: 'sensors/save_chart_note'
		}),

		closeDialog() {
			this.$emit('closeDialog', this.itemData.chartId);
		},

		localSubmit(data) {
			const note_id = this.itemData ? this.itemData.id : null;
			const payload = {
				data: {	...data },
				method: note_id ? 'PUT' : 'POST',
				url: note_id
					? `/sensors/${this.sensorId}/graphs/notes/${note_id}`
					: `/sensors/${this.sensorId}/graphs/notes`
			};
			const { fileProp } = this.uploadSettings;
			payload.withFile = !!payload.data[fileProp];

			delete payload.data.id;

			if (payload.data.metric_issue_alert_id) {
				delete payload.data.graph_timestamp;
			}

			/*if (payload) {
				console.log(payload)
				return				
			}*/

			this.isSaving = true;

			this.save_item(payload)
				.then(() => {
					this.$emit('success', this.itemData.chartId);
					this.isSaving = false;
					this.closeDialog();
				})
				.catch(() => {
					this.isSaving = false;
				});
		}
	},
};
</script>
