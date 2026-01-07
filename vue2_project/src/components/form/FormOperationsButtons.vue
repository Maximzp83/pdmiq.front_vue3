<template>
	<el-form-item :class="['FormOperationsButtons', className]">
		<el-button @click="onCancel" native-type="button" class="item-action-button">
			<span class="uppercase">{{ cancelButtonText || tt('CANCEL') }}</span>
		</el-button>

		<el-button
			@click="onSave"
			type="primary"
			native-type="button"
			class="item-action-button"
		>
			<span class="uppercase">{{ saveButtonText || tt('save') }}</span>
		</el-button>
	</el-form-item>
</template>

<script>
export default {
	props: {
		className: {
			type: String,
			default: ''
		},
		saveButtonText: String,
		cancelButtonText: String
	},

	methods: {
		onSave() {
			this.$emit('onSave');
		},
		onCancel() {
			this.$emit('onCancel');
		}
	}
};
</script>
