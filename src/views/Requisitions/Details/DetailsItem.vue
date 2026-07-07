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

			<div class="content-row content-block mcol-xs-6">
				<div v-for="item in detailsList" :key="`detail-${item.id}`" class="details-row">
					<div class="label">{{ item.label }}</div>

					<div v-if="item.buttons" class="semi-bold">
						<div v-if="item.buttons.length">
							<el-button
								v-for="(button, idx) in item.buttons"
								:key="`button-${idx}`"
								:class="button.className"
								:type="button.type || 'primary'"
								@click="downloadFile(button)"
							>
								{{ button.text }}
							</el-button>
						</div>
						<span v-else>-</span>
					</div>

					<div
						v-else-if="item.values"
						v-for="(valueItemSettings, idx) in item.values"
						:key="`value-${idx}`"
						class="flex mrow"
					>
						<div v-for="settingItem in valueItemSettings" :key="`value-${settingItem.id}`">
							<div class="label">{{ settingItem.label }}</div>
							<div class="semi-bold" v-html="settingItem.value"></div>
						</div>
					</div>

					<div v-else class="semi-bold" v-html="item.value"></div>
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
import { computed } from 'vue';

import { getCellValue, getObjectVal } from '@/helpers';

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
const detailsList = computed(() =>
	props.settings.map((setting) => {
		const item = {
			...setting,
			value: getCellValue(props.orderData, setting),
		};

		if (setting.meta?.isAttachment) {
			const files = Array.isArray(item.value) ? item.value : [];
			item.buttons = files.map((file) => {
				const fullPath = file.file_path || file.url || file.path || '';
				const pathArray = fullPath.split('/');
				const filename = file.name || file.file_name || pathArray[pathArray.length - 1] || fullPath;
				return {
					...setting.buttonSettings,
					filename,
					fullPath,
					text: filename,
				};
			});
		} else if (setting.meta?.isArray) {
			const values = Array.isArray(item.value) ? item.value : [];
			item.values = values.map((valueItem) =>
				setting.meta.isArray.map((arraySetting) => ({
					...arraySetting,
					value: getCellValue(valueItem, arraySetting),
				})),
			);
		} else {
			item.value = formatValue(setting);
		}

		return item;
	}),
);
const emitAction = (button) => emit('event', button.event, button.args || button);
const downloadFile = ({ filename, fullPath }) => {
	if (!fullPath) return;
	const link = document.createElement('a');
	link.href = fullPath;
	link.download = filename;
	link.target = '_blank';
	link.click();
};
</script>
