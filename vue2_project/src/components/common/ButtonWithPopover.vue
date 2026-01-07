<template>
	<el-popover
		:disabled="final_disabled"
		:placement="placement"
		:popper-class="popperClass"
		:title="title"
		trigger="hover"
		:width="final_width"
	>
		<el-button
			slot="reference"
			:disabled="final_buttonDisabled"
			:class="final_buttonClass"
			native-type="button"
			@click="handleClick"
			:size="settings.buttonSize"
			:type="final_buttonType"
			:icon="final_buttonIcon"
		>
			<i v-if="buttonIconClass" :class="buttonIconClass"></i>
		</el-button>
	</el-popover>
</template>

<script>
export default {
	props: {
		title: { type: String, default: '' },
		settings: { type: Object, default: () => {} },
		width: String,
		disabled: Boolean,
		buttonType: String,
		buttonDisabled: Boolean,
		buttonIcon: String,
		buttonClass: null
	},

	computed: {
		placement: that => that.settings.placement || 'bottom',
		final_disabled: that => that.disabled || that.settings.popoverDisabled || false,
		popperClass: that => that.settings.popperClass || '',
		final_width: that => that.width || that.settings.width,
		buttonIconClass: that => that.settings.buttonIconClass,
		final_buttonClass: that => that.buttonClass || that.settings.buttonClass || '',
		final_buttonIcon: that => that.buttonIcon || that.settings.buttonIcon || '',
		final_buttonDisabled: that =>
			that.buttonDisabled || that.settings.buttonDisabled || false,
		final_buttonType: that =>
			that.buttonType || that.settings.buttonType || 'primary'
	},

	methods: {
		handleClick() {
			this.$emit('onClick');
		}
	}
};
</script>
