<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container part-option-item', { mrow: !showJustInfo }]"
		:model="formData"
	>
		<el-form-item
			prop="part_id"
			required
			:class="[showJustInfo ? 'mcol-xs-5' : 'mcol-xs-8']"
		>
			<label v-if="!showJustInfo && itemIndex == 0">{{
				`${tt('Part')} ${tt('name')}`
			}}</label>
			<CustomSelect
				:optionsLoading="partsLoading"
				:optionsList="partsList"
				:placeholder="`${tt('select')} ${tt('part')}`"
				labelKey="part_number"
				v-model="formData.part_id"
			/>
		</el-form-item>

		<el-form-item class="mcol-xs-4" prop="quantity" required>
			<label v-if="!showJustInfo && itemIndex == 0">{{ tt('Quantity') }}</label>
			<el-input v-model.number="formData.quantity" :placeholder="tt('quantity')" />
		</el-form-item>

		<div v-if="!showJustInfo">
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
// import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		partsLoading: Boolean,
		partsList: {
			type: Array,
			default: () => []
		},
		showJustInfo: Boolean,
		isLast: Boolean
	},

	data() {
		return {
			formData: {
				id: null,
				part_id: null,
				quantity: 0
			}
		};
	},

	computed: {
		deleteNewId: () => true
	}
};
</script>
