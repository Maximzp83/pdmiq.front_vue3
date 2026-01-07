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
			<el-form-item :label="`${tt('Brand')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item
				:label="tt('phrases.crossover_exluded')"
				prop="is_crossover_excluded"
				class="half-width"
			>
				<el-switch v-model="formData.is_crossover_excluded" />
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
// import { mapState, mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],

	data() {
		return {
			formData: {
				name: '',
				is_crossover_excluded: false
			},

			rules: {
				name: required
			}
		};
	}
};
</script>
