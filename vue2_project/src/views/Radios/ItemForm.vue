<template>
	<div
		class="edit-form-container "
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('node')} #`" prop="position">
				<el-input v-model="formData.position" />
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
import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],

	data() {
		return {
			formData: {
				position: ''
			}
		};
	},
	computed: {
		rules: () => ({
			position: required
		})
	}
};
</script>
