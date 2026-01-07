<template>
	<div
		:class="[
			'edit-form-container maintenance-form',
			{ 'work-order-details-item card content-row': !fromModal }
		]"
	>
		<SimpleSpinner :active="processing" />

		<div class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
		</div>

		<div :class="['card-content', { 'flex top': !fromModal }]">
			<div class="header-block flex align-center">
				<div class="step-number bold span-block">
					<span>{{ progress }}</span>
				</div>
			</div>

			<el-form
				:class="[
					'item-edit-form relative section-row',
					{ 'half-width': !fromModal }
				]"
				label-width="150px"
				ref="itemForm"
				:model="formData"
				:label-position="isMobile || !fromModal ? 'top' : 'left'"
			>
				<el-form-item
					:label="`${tt('Shipping')} ${tt('method')}`"
					prop="shipping_method"
					required
				>
					<el-input v-model="formData.shipping_method" />
				</el-form-item>

				<el-form-item
					:label="`${tt('Tracking')} #`"
					prop="shipping_tracking"
					required
				>
					<el-input v-model="formData.shipping_tracking" />
				</el-form-item>

				<el-form-item :label="tt('Due_Date')" prop="shipping_receive_date" required>
					<div class="mcol-xs-6">
						<Datepicker
							className=" "
							v-model="formData.shipping_receive_date"
							:placeholder="`${tt('Select')} ${tt('date')}`"
							:picker-options="pickerOptions"
						/>
					</div>
				</el-form-item>

				<div :class="[{ 'dialog-decorate-footer ': fromModal }, 'no-left-margin']">
					<FormOperationsButtons @onCancel="handleCancel" @onSave="validateForm" />
				</div>
			</el-form>
		</div>
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
			import('@/components/form/FormOperationsButtons.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		progress: Number,
		title: String
	},

	data() {
		return {
			processing: false,

			formData: {
				shipping_method: '',
				shipping_tracking: '',
				shipping_receive_date: ''
			}
		};
	},

	computed: {
		pickerOptions: () =>
			Object.freeze({
				disabledDate(date) {
					const start = new Date();
					const today = start.getTime() - 3600000 * 24;
					const dateMs = date.getTime();

					return dateMs < today;
				}
			})
	},

	methods: {
		...mapActions({
			save_item: 'plant_requisitions/conclude_requisition'
		}),

		localSubmit(data) {
			let payload = {
				itemId: this.itemData.id,
				data: data,
				method: 'PUT'
			};

			// delete payload.data.id;

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
