<template>
	<div class="edit-form-container ">
		<SimpleSpinner :active="processing" />
		<!-- :validate="" -->
		<el-form
			class="item-edit-form "
			label-width="150px"
			ref="itemForm"
			:model="formData"
			label-position="top"
		>
			<el-form-item
				:label="`${tt('phrases.reason_denied')}:`"
				prop="rejection_reason_details"
				required
			>
				<el-input
					v-model="formData.rejection_reason_details"
					type="textarea"
					rows="5"
				/>
			</el-form-item>

			<div class="dialog-decorate-footer">
				<FormOperationsButtons @onCancel="handleCancel" @onSave="validateForm" />
			</div>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],
	components: {
		FormOperationsButtons: () =>
			import('@/components/form/FormOperationsButtons.vue')
	},

	data() {
		return {
			processing: false,

			formData: {
				rejection_reason_details: ''
			}
		};
	},

	computed: {},

	methods: {
		...mapActions({
			save_item: 'plant_requisitions/deny_requisition'
		}),

		localSubmit(data) {
			let payload = {
				itemId: this.itemData.id,
				data: data,
				method: 'PUT'
			};

			delete payload.data.id;

			/*if (payload) {
				console.log(2, payload)
				return
			}*/
			this.processing = true;

			this.save_item(payload)
				.then(() => {
					this.$emit('event', 'reloadPage');
					this.handleCancel();
					this.processing = false;
				})
				.catch(() => {
					this.processing = false;
				});
		}
	}
};
</script>
