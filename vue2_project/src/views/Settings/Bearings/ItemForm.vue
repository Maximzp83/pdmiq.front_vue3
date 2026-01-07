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
			<el-form-item :label="tt('phrases.outside_diameter')" prop="outside_diameter">
				<el-input-number v-model="formData.outside_diameter" :min="0" />
			</el-form-item>

			<el-form-item :label="tt('Number')" prop="number" class="mcol-xs-12">
				<el-input v-model="formData.number" :placeholder="tt('number')" />
			</el-form-item>

			<el-form-item :label="tt('Width')" prop="width">
				<el-input-number v-model="formData.width" :min="0" />
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
				number: '',
				width: 0,
				outside_diameter: 0
			}
		};
	},

	computed: {
		rules: () => ({
			number: required,
			width: required,
			outside_diameter: required
		})
	},

	methods: {
		...mapActions({
			// fetch_equipment_types: 'equipment_types/fetch_equipment_types'
			save_item: 'bearings/save_bearing'
		})
	}
};
</script>
