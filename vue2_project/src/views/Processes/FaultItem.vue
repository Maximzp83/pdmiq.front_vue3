<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container mrow']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="title" class="name-input fluid">
			<label v-if="itemIndex == 0">{{ tt('Name') }}</label>
			<CustomInput required v-model="formData.title" :placeholder="tt('title')" />
		</el-form-item>

		<div>
			<el-button
				v-if="!hideRemove"
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
		hideRemove: Boolean
	},
	data() {
		return {
			formData: {
				id: null,
				title: ''
			}
		};
	},

	computed: {
		rules: that => ({
			title: that.required ? required : null
		}),
		deleteNewId: () => true
	}
};
</script>
