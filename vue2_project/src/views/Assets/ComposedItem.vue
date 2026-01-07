<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container mrow']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="equipment_type_id" class="mcol-xs-8">
			<label v-if="itemIndex == 0">{{ tt('Item_Type') }}</label>
			<CustomSelect
				:optionsLoading="equipmentTypesLoading"
				:optionsList="equipmentTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
				v-model="formData.equipment_type_id"
			/>
		</el-form-item>

		<el-form-item prop="count" class="mcol-xs-4">
			<label v-if="itemIndex == 0">{{ tt('Count') }}</label>
			<CustomInput v-model="formData.count" :placeholder="tt('count')" />
		</el-form-item>

		<div>
			<el-button
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		equipmentTypesLoading: Boolean,
		equipmentTypesList: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			formData: {
				id: null,
				equipment_type_id: null,
				count: ''
			}
		};
	},

	computed: {
		rules: that => ({
			count: that.required ? required : null,
			equipment_type_id: that.required ? required : null
		}),

		// targetPropName: () => 'composed',
		deleteNewId: () => true
	}
};
</script>
