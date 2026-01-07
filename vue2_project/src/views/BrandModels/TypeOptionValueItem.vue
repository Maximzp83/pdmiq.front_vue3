<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container type-option-value-item mrow']"
		:model="formData"
	>
		<el-form-item prop="equipment_type_option_id" class="mcol-xs-8 events-none">
			<SimpleSpinner :active="equipmentTypesLoading" />
			<label v-if="itemIndex == 0">{{ `${tt('Item_Type')} ${tt('option')}` }}</label>
			<CustomInput :value="itemData.name" />
		</el-form-item>

		<el-form-item prop="value" class="mcol-xs-4" v-if="!predefinedValuesList.length">
			<label v-if="itemIndex == 0">{{ tt('Value') }}</label>
			<CustomInput v-model="formData.value" :placeholder="tt('value')" />
		</el-form-item>

		<el-form-item
			prop="predefined_value_ids"
			class="select-input outside-form-item mcol-xs-8"
			v-else
		>
			<SimpleSpinner :active="equipmentTypesLoading" />
			<label v-if="itemIndex == 0">{{ tt('Predefined_Values') }}</label>
			<CustomSelect
				multiple
				collapse-tags
				:optionsList="predefinedValuesList"
				:placeholder="`${tt('Select')} ${tt('values')}`"
				v-model="formData.predefined_value_ids"
				labelKey="value"
			/>
		</el-form-item>
	</el-form>
</template>

<script>
import { subItemMixin } from '@/mixins';
import { findItemBy } from '@/helpers';

export default {
	mixins: [subItemMixin()],
	props: {
		equipmentTypesLoading: Boolean,
		brandItemData: Object,
		currentDataList: Array,
	},

	data() {
		return {
			// selectedTypeOption: null,

			formData: {
				id: null,
				equipment_type_option_id: null,
				value: '',
				predefined_value_ids: []
			}
		};
	},

	computed: {
		targetItemIdProp: () => 'equipment_type_option_id',

		predefinedValuesList() {
			if (this.itemData.has_predefined_values) {
				return this.itemData.predefined_values;
			}

			return [];
		}
	},

	methods: {
		localSetupPageHook(itemData) {
			let currentItem = findItemBy('equipment_type_option_id', itemData.id, this.currentDataList);
			return {
				itemForSetup: currentItem,
				next: !!currentItem
			}
		},

		localSetupPageActions(item) {
			this.formData.equipment_type_option_id = item.id;
		},

		localGetFormDataCallback(formData) {
			formData.value = formData.value + '';
			if (!formData.value) {
				delete formData.value;
			}
			if (!formData.id) {
				delete formData.id;
			}
			return formData;
		}
	}
};
</script>
