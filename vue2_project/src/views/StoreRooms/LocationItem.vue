<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container mrow']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="name" class="mcol-xs-10" required>
			<label v-if="itemIndex == 0">{{ tt('name') }}</label>
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
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
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],

	data() {
		return {
			formData: {
				id: null,
				name: ''
			}
		};
	},

	computed: {
		rules: () => ({}),
		deleteNewId: () => true
	}
};
</script>
