<template>
	<div class="edit-form-container">
		<SimpleSpinner :active="isSaving" />
		<!-- <div class="title article-title capitalize">New message note</div> -->
		<el-form
			label-width="120px"
			class="item-edit-form section-row flex justify-center"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			label-position="left"
		>
			<el-form-item prop="value" :label="tt('phrases.Amount_Cycles')">
				<el-input-number v-model="formData.value" :min="0" />
			</el-form-item>
		</el-form>

		<div class="dialog-footer section-row text-center">
			<el-button
				type="primary"
				:loading="isSaving"
				@click="() => validateForm()"
				class="uppercase"
				>{{ tt('SAVE') }}</el-button
			>
			<el-button @click="closeDialog" class="uppercase">{{
				tt('Cancel')
			}}</el-button>
		</div>
	</div>
</template>

<script>
import { mapActions /*mapState*/ } from 'vuex';
// import { required } from '@/constants/validation';

import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],
	props: {
		shotsCounterData: {
			type: Object,
			required: true
		},
		// sensorId: Number,
		visible: Boolean
	},

	data() {
		return {
			isSaving: false,

			formData: {
				value: 0
			},

			rules: {
				// message: required
			}
		};
	},

	computed: {},

	methods: {
		...mapActions({
			save_item: 'sensors/toggle_ultrasound_command'
		}),

		closeDialog() {
			this.$emit('closeDialog');
		},

		setupFormData(isVisible) {
			if (isVisible) {
				if (this.shotsCounterData.pump) {
					const {
						lube_cycle_max_count,
						lube_cycle_spent_count
					} = this.shotsCounterData.pump;

					this.formData.value = lube_cycle_max_count - lube_cycle_spent_count;
				}
			} else {
				this.formData.value = 0;
			}
		},

		submitForm() {
			const payload = {
				url: `/ultrasound/commands/${this.shotsCounterData.id}/shots-count`,
				method: 'PUT',
				data: {
					...this.formData
				}
			};
			// this.$emit('success', this.pointData.chartId);

			/*if (payload) {
				console.log(payload)
				return				
			}*/

			// this.isSaving = true;

			this.save_item(payload)
				.then(({ value }) => {
					this.$emit('success', value);
					this.isSaving = false;
					this.closeDialog();
				})
				.catch(() => {
					this.isSaving = false;
				});
		}
	},

	watch: {
		visible(isVisible) {
			this.setupFormData(isVisible);
		}
	},

	beforeMount() {
		this.setupFormData(true);
	}
};
</script>
