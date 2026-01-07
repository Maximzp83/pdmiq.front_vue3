<template>
	<div class="edit-form-container equipment-types">
		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<el-form
			class="item-edit-form "
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="'top'"
		>
			<el-form-item
				:label="`${tt('Category')} ${tt('name')}`"
				prop="name"
				:class="{
					'half-width': !fromAnotherInstance && !isMobile && !fromModal
				}"
			>
				<el-input v-model.lazy="formData.name" />
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
import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],
	components: {},

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
			save_item: 'equipment_types/save_equipment_type'
		})
	}
};
</script>
