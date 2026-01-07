<template>
	<el-form
		ref="itemForm"
		class="special-decorated-form-item"
		:model="formData"
		:rules="{}"
	>
		<div :class="['form-items']">
			<el-form-item prop="description" class="mcol-xs-auto text-form-item">
				<CustomInput
					v-model="formData.description"
					:placeholder="tt('notes')"
					type="textarea"
					elastic
				/>
			</el-form-item>

			<div class="el-form-item flex mrow wrap check-boxes" v-if="!showJustInfo">
				<el-form-item
					prop="is_add_to_recommended_actions"
					class="mcol-xs-12 mcol-sm-4"
				>
					<el-checkbox
						v-model="formData.is_add_to_recommended_actions"
						:true-label="1"
						:false-label="0"
					>
						{{ tt('phrases.Add_to_Recommended_Actions') }}
					</el-checkbox>
				</el-form-item>

				<el-form-item prop="is_add_to_next_activities" class="mcol-xs-12 mcol-sm-5">
					<el-checkbox
						v-model="formData.is_add_to_next_activities"
						:true-label="1"
						:false-label="0"
					>
						{{ tt('phrases.add_to_activities_planned_for_next_week_period') }}
					</el-checkbox>
				</el-form-item>

				<el-form-item
					prop="is_add_to_current_activities"
					class="mcol-xs-12 mcol-sm-3"
				>
					<el-checkbox
						v-model="formData.is_add_to_current_activities"
						:true-label="1"
						:false-label="0"
					>
						{{ tt('phrases.Add_to_Completed_this_week') }}
					</el-checkbox>
				</el-form-item>
			</div>
		</div>

		<div class="button-container" v-if="!showJustInfo">
			<el-button
				v-if="isLast"
				class="action-button create-button inverted"
				size="mini"
				type="primary"
				icon="icomoon icon-plus"
				@click="handleCreate"
			/>

			<el-button
				v-else
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-plus"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
// import { required } from '@/constants/validation';
// import { dynamicItemFormMixin } from '@/mixins';
import { updateFormData } from '@/helpers';

export default {
	// mixins: [dynamicItemFormMixin()],
	props: {
		itemIndex: Number,
		itemData: { type: Object, required: true },

		isLast: Boolean,
		showJustInfo: Boolean
	},

	data() {
		return {
			isInitialSetup: true,

			new: false,
			itemId: null,
			isValidMain: false,

			formData: {
				id: null,
				description: '',
				is_add_to_recommended_actions: false,
				is_add_to_next_activities: false,
				is_add_to_current_activities: false,

				is_add_to_recommended_actions_initial: false,
				is_add_to_next_activities_initial: false,
				is_add_to_current_activities_initial: false
			}
		};
	},

	computed: {
		deleteId: () => true
	},

	methods: {
		setupForm(itemData, formData) {
			if (this.localSetupFormActions) {
				this.localSetupFormActions(itemData);
			}
			return updateFormData(itemData, formData);
		},

		setupPage(item) {
			// console.log(item)
			this.new = item.new || this.isNew || false;
			this.itemId = item.id;
			this.formData = this.setupForm(item, this.formData);

			if (this.localSetupPageActions) {
				this.localSetupPageActions(item);
			}

			/*if (this.formData.operator) {
				this.formData.operator = Number(this.formData.operator);
			}*/
			setTimeout(() => {
				this.isInitialSetup = false;
			}, 0);
		},

		handleCreate() {
			this.$emit('onCreate');
		},

		removeItem() {
			this.$emit('onRemove', this.itemId);
			// this.$emit('onRemove', { id: this.itemId, listName: 'statesItemsList' });
		},

		localSetupPageActions(itemData) {
			if (itemData) {
				this.formData.is_add_to_recommended_actions_initial = !itemData.is_add_to_recommended_actions;
				this.formData.is_add_to_next_activities_initial = !itemData.is_add_to_next_activities;
				this.formData.is_add_to_current_activities_initial = !itemData.is_add_to_current_activities;
			}
		},

		getFormData() {
			let formData = false;

			this.$refs['itemForm'].validate(valid => {
				if (valid) {
					formData = { ...this.formData };
					delete formData.id;
				}
			});

			return formData;
		}
	},

	created() {
		this.setupPage(this.itemData);
	}
};
</script>
