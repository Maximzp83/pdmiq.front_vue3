<template>
	<el-form ref="itemForm" :class="['option-item-container mrow']" :model="formData">
		<el-form-item prop="key" class="mcol-xs-6">
			<label v-if="itemIndex == 0">{{ tt('Title') }}</label>
			<CustomInput v-model="formData.key" :placeholder="tt('key')" />
		</el-form-item>

		<el-form-item prop="value" class="mcol-xs-6">
			<label v-if="itemIndex == 0">{{ tt('Value') }}</label>
			<CustomInput v-model="formData.value" :placeholder="tt('value')" />
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
	props: {},

	data() {
		return {
			formData: {
				key: '',
				value: ''
			}
		};
	},

	computed: {
		// targetPropName: () => 'characters',
		deleteNewId: () => true
	}
};
</script>
