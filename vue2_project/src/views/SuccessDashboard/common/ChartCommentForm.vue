<template>
	<div class="">
		<el-form ref="itemForm" class="" :model="formData" :rules="{}">
			<el-form-item prop="description" class="mcol-xs-auto  text-form-item">
				<CustomInput
					v-model="formData.description"
					:placeholder="tt('comment')"
					type="textarea"
				/>
			</el-form-item>
		</el-form>

		<div class="flex justify-center">
			<el-button
				@click="handleSaveComment"
				type="primary"
				native-type="button"
				class="item-action-button"
			>
				<span class="uppercase">{{ tt('SAVE') }}</span>
			</el-button>

			<el-button
				@click="handleCancelComment"
				type="primary"
				native-type="button"
				class="item-action-button inverted"
			>
				<span class="uppercase">{{ tt('Cancel') }}</span>
			</el-button>

			<el-button
				v-if="!!itemData.description"
				@click="handleDeleteComment"
				type="primary"
				native-type="button"
				class="item-action-button inverted"
			>
				<span class="uppercase">{{ tt('Delete') }}</span>
			</el-button>
		</div>
	</div>
</template>

<script>
import { updateFormData } from '@/helpers';

export default {
	props: {
		// showJustInfo: Boolean,
		// itemData: Object,
		ChartInstance: Object
	},

	data() {
		return {
			formData: {
				date_start: '',
				date_finish: '',
				description: ''
			}
		};
	},

	computed: {
		itemData: that => that.ChartInstance.selectionData
	},

	methods: {
		handleSaveComment() {
			this.ChartInstance.handleSaveComment({
				formData: this.formData,
				isNew: !this.itemData.description
			});
		},
		handleCancelComment() {
			this.ChartInstance.handleCancelComment();
		},
		handleDeleteComment() {
			this.ChartInstance.handleDeleteComment({
				formData: this.formData
			});
		}
	},

	created() {
		this.formData = updateFormData(this.itemData, this.formData);
	}
};
</script>
