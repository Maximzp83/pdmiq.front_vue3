<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container mrow relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="name" class="mcol-xs-6">
			<label v-if="itemIndex == 0">{{ tt('name') }}</label>
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item prop="machines_ids" class="mcol-xs-6">
			<SimpleSpinner :active="machinesLoading" />
			<label v-if="itemIndex == 0">{{ tt('Machines') }}</label>
			<el-select
				class="not-tags-align "
				filterable
				multiple
				collapse-tags
				:disabled="!machinesList.length"
				v-model="formData.machines_ids"
				:placeholder="`${tt('Select')} ${tt('machines')}`"
			>
				<el-option
					v-for="item in machinesList"
					:key="'machine_id-' + item.id"
					:label="item.name"
					:value="item.id"
				/>
			</el-select>
		</el-form-item>

		<div class="action-buttons-container absolute">
			<el-button
				class="action-button remove-button "
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
		machinesList: { type: Array, default: () => [] },
		machinesLoading: Boolean
	},
	data() {
		return {
			formData: {
				id: null,
				name: '',
				machines_ids: []
			}
		};
	},

	computed: {
		rules: that => ({
			name: that.required ? required : null,
			machines_ids: that.required ? required : null
		}),
		// targetPropName: () => 'conveyor_processes',
		deleteNewId: () => true
	}
};
</script>
