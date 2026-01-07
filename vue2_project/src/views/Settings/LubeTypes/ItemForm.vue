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
			<el-form-item :label="tt('Name')" prop="name" class="">
				<el-input v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item label="Density" prop="density">
				<el-input-number v-model="formData.density" :min="0" />
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
import { /*mapState,*/ mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';

import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],

	data() {
		return {
			formData: {
				name: '',
				density: 0
			}
		};
	},

	computed: {
		rules: () => ({
			name: required,
			density: required
		})
	},

	methods: {
		...mapActions({
			save_item: 'lube_types/save_lube_type'
		})
	}
};
</script>
