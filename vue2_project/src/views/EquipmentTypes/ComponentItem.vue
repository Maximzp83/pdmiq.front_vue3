<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container type-option-item ']"
		:model="formData"
	>
		<div class="flex content-container content-row component-item">
			<el-form-item prop="name" class="mcol-xs-4" required>
				<label>{{ tt('Name') }}</label>
				<CustomInput v-model="formData.name" :placeholder="tt('name')"/>
			</el-form-item>

			<el-form-item
				prop="child_type_ids"
				class="mcol-xs-6"
			>
				<label>{{ `${tt('Child')} ${tt('Item_type')}` }}</label>
				<CustomSelect
					clearable
					filterable
					multiple
					collapse-tags
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.child_type_ids"
				/>
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
		</div>
	</el-form>
</template>

<script>
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		equipmentTypesList: Array,
		equipmentTypesLoading: Boolean,
	},
	data() {
		return {
			formData: {
				id: null,
				name: '',
				child_type_ids: []
			}
		};
	},

	computed: {
		deleteNewId: () => true
	}
};
</script>
