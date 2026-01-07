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
			<el-form-item
				:label="`${tt('Work_Order')} ${tt('Type')} ${tt('name')}`"
				prop="name"
			>
				<el-input v-model="formData.name" :placeholder="tt('name')" />
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
import { mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],
	components: {
		FormOperationsButtons: () =>
			import('@/components/form/FormOperationsButtons.vue')
	},

	data() {
		return {
			formData: {
				name: ''
			},

			rules: {
				name: required
			}
		};
	},

	computed: {},

	methods: {
		...mapActions({
			save_item: 'maintenance_categories/save_maintenance_category'
		})
	}
};
</script>
