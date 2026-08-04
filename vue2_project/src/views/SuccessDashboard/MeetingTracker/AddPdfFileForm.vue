<template>
	<div class="">
		<div class="section-row card-content">
			<div class="el-form-item">
				<div class="flex mrow">
					<div class="">
						<div class="">{{ tt('last') }}</div>
						<Datepicker
							class="mini"
							:placeholder="tt('date')"
							v-model="formData.last_tracker_created_at"
						/>
					</div>

					<div class="">
						<div class="">{{ tt('current') }}</div>
						<Datepicker
							class="mini"
							:placeholder="tt('date')"
							v-model="formData.current_created_at"
						/>
					</div>
				</div>
			</div>

			<div class="el-form-item upload-form-item">
				<FileUploadBlock
					ref="FileUploadBlock"
					@onSelectFile="handleSelectFile"					
					accept=".pdf"
					:buttonText="tt('phrases.upload_file')"
					buttonIcon="icomoon icon-clip"
				/>
			</div>
		</div>

		<div class="section-row dialog-footer section-row text-center">
			<el-button class="capitalize" @click="close">{{ tt('Cancel') }}</el-button>

			<el-button
				type="primary"
				@click="handleSubmit"
				class="capitalize"
				:disabled="processing"
				:loading="processing"
				>{{ tt('Submit') }}</el-button
			>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { cleanDateString } from '@/helpers';

export default {
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		plantId: Number,
		visible: Boolean
	},

	data() {
		return {
			processing: false,

			formData: {
				plant_id: this.plantId,
				pdf_file: null,
				last_tracker_created_at: '',
				current_created_at: ''
			}
		};
	},

	methods: {
		...mapActions({
			save_item: 'meeting_trackers/save_meeting_tracker'
		}),

		close() {
			this.$emit('close');
		},

		handleSelectFile({ raw }) {
			this.formData.pdf_file = raw;
		},

		handleSubmit() {
			if (this.formData.pdf_file) {
				this.submitFile(this.formData);
			} else {
				this.$notify({
					type: 'warning',
					message: `${this.tt('file')} ${this.tt('phrases.should_be_selected')}`
				});
			}
		},

		submitFile(formData) {
			if (formData.current_created_at) {
				formData.current_created_at = cleanDateString(formData.current_created_at);
			}
			if (formData.last_tracker_created_at) {
				formData.last_tracker_created_at = cleanDateString(
					formData.last_tracker_created_at
				);
			}

			this.processing = true;

			const payload = {
				withFile: true,
				data: formData
			};

			/*if (payload) {
				console.log('payload', payload);
				return;
			}*/

			this.save_item(payload)
				.then(() => {
					this.processing = false;
					this.$emit('success');
				})
				.catch(() => {
					this.processing = false;
				});
		}
	},

	watch: {
		visible(visible) {
			if (visible) {
				this.formData.plant_id = this.plantId;				
			} else {
				// console.log(this.$refs)
				this.$refs.FileUploadBlock.resetFilesList();
				this.processing = false;

				this.formData = {
					plant_id: null,
					pdf_file: null,
					last_tracker_created_at: '',
					current_created_at: ''
				}
			}
		}
	},
};
</script>
