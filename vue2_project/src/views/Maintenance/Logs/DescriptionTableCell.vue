<template>
	<div class="">
		<el-popover
			:disabled="value.disablePopover"
			:placement="'bottom'"
			:popper-class="`text-popover`"
			:title="value.content"
			trigger="hover"
			width="350"
			:close-delay="0"
		>
			<span slot="reference" v-text="value.cellContent"></span>
		</el-popover>
	</div>
</template>

<script>
export default {
	props: {
		propsData: Object, // row
		additionalProps: Object // column
	},

	computed: {
		value() {
			const { propsData: log } = this;
			const { prop } = this.additionalProps;

			const content = log[prop] || '-';
			const enablePopover = content.length >= 100;

			return {
				content,
				cellContent: enablePopover ? `${content.slice(0, 100)}...` : content,
				disablePopover: !enablePopover
			};
		}
	}
};
</script>
