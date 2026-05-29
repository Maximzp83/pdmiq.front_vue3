<template>
	<div class="work-order-details-item card content-row">
		<div class="card-header filled_2 flex space-between align-center">
			<div class="semi-bold uppercase">{{ title }}</div>
			<div v-if="headerButtons.length" class="flex mrow">
				<el-button
					v-for="button in headerButtons"
					:key="`header-button-${button.id}`"
					size="small"
					:class="button.className"
					@click="emitAction(button)"
				>
					<i v-if="button.icon" :class="button.icon"></i>
					<span>{{ button.text }}</span>
				</el-button>
			</div>
		</div>

		<div class="card-content flex top">
			<div class="header-block flex align-center">
				<div class="step-number bold span-block">
					<span>{{ progress }}</span>
				</div>
			</div>

			<div class="details-values-list">
				<div v-for="item in settings" :key="`detail-${item.id}`" class="details-value-item">
					<div class="muted">{{ item.label }}</div>
					<div class="semi-bold">
						<button
							v-if="item.meta?.isAttachment && Array.isArray(getValue(item))"
							v-for="attachment in getValue(item)"
							:key="attachment.id || attachment.url || attachment.name"
							class="link underline"
							type="button"
							@click="downloadFile(attachment)"
						>
							{{ attachment.name || attachment.file_name || attachment.url }}
						</button>
						<span v-else>{{ formatValue(item) }}</span>
					</div>
				</div>
			</div>
		</div>

		<div v-if="actionButtons.length" class="card-footer dialog-decorate-footer">
			<el-button
				v-for="button in actionButtons"
				:key="`action-button-${button.id}`"
				:class="button.className"
				size="small"
				@click="emitAction(button)"
			>
				{{ button.text }}
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { getObjectVal } from '@/helpers';

defineOptions({ name: 'RequisitionDetailsItem' });

const props = defineProps({
	progress: { type: Number, default: 1 },
	title: { type: String, default: '' },
	orderData: { type: Object, default: () => ({}) },
	settings: { type: Array, default: () => [] },
	actionButtons: { type: Array, default: () => [] },
	headerButtons: { type: Array, default: () => [] },
});
const emit = defineEmits(['event']);

const getValue = (item) => getObjectVal(props.orderData, item.prop);
const formatValue = (item) => {
	const value = getValue(item);
	if (value === null || value === undefined || value === '') return '-';
	if (item.meta?.getItemValue?.list) {
		const match = item.meta.getItemValue.list.find((listItem) => listItem.id === value);
		return match?.[item.meta.getItemValue.prop] || value;
	}
	if (item.meta?.prepareValue?.localMethod) {
		return item.meta.prepareValue.localMethod(value, item.meta.prepareValue.args);
	}
	return `${item.prefix || ''}${value}${item.postfix || ''}`;
};
const emitAction = (button) => emit('event', button.event, button.args || button);
const downloadFile = (attachment) => {
	const url = attachment.url || attachment.path;
	if (url) window.open(url, '_blank');
};
</script>
