<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container 1mrow relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="name" class="mcol-xs-12">
			<label v-if="itemIndex == 0">{{ tt('name') }}</label>
			<el-input v-model="formData.name" :placeholder="tt('name')" />
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
				plant_id: null
			}
		};
	},

	computed: {
		rules: that => ({
			name: that.required ? required : null
		}),
		// targetPropName: () => 'work_stations',
		deleteNewId: () => true
	}
};
</script>
