<template>
	<div class="description-table-cell">
		<el-popover
			:disabled="value.disablePopover"
			placement="bottom"
			popper-class="text-popover"
			:title="value.content"
			trigger="hover"
			width="350"
			:close-delay="0"
		>
			<template #reference>
				<span v-text="value.cellContent"></span>
			</template>
		</el-popover>
	</div>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'MaintenanceDescriptionTableCell',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
});

const value = computed(() => {
	const prop = props.additionalProps?.prop;
	const content = String((prop && props.propsData?.[prop]) || '-');
	const enablePopover = content.length >= 100;

	return {
		content,
		cellContent: enablePopover ? `${content.slice(0, 100)}...` : content,
		disablePopover: !enablePopover,
	};
});
</script>
