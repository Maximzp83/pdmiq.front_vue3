<template>
	<VueElementLoading
		class="capitalize"
		:active="isLoading || isSaving"
		:spinner="spinner || 'ring'"
		:text="textValue"
		:background-color="'rgba(255, 255, 255, .7)'"
	/>
</template>

<script>
export default {
	props: {
		isLoading: { type: Boolean },
		isSaving: { type: Boolean },
		disableText: Boolean,
		itemsName: String,
		spinner: null,
		text: String
	},

	computed: {
		textValue() {
			const { isLoading, isSaving, itemsName, disableText, text } = this;

			if (text) return text;

			let result = itemsName || '';
			if (disableText) return '';
			if (isLoading) result += ` ${this.$t('loading')}...`;
			else if (isSaving) result += `${this.$t('saving')}...`;
			return result;
		}
	}
};
</script>
