<template>
	<component :is="tag" v-if="hasValue">
		<span
			v-if="labelPosition == 'inline'"
			:class="['key', labelClassName]"
			v-html="label"
		></span>
		<div v-else :class="['key', labelClassName]" v-html="label"></div>

		<span v-if="settingItem.prefix_icon" class="content-with-prefix">
			<i :class="['prefix icon', settingItem.prefix_icon]" />

			<span :class="['value', valueClassName]" v-html="value"></span>
		</span>

		<span
			v-else-if="settingItem.event"
			@click="executeEvent"
			:class="['value', valueClassName]"
			v-html="value"
		></span>
		<span v-else :class="['value', valueClassName]" v-html="value"></span>
	</component>
</template>

<script setup>
import { computed } from 'vue';

import { getCellValue, validateBySettings } from '@/helpers';

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	settingItem: { type: Object, required: true },
	labelClassName: { type: String, default: '' },
	valueClassName: { type: String, default: '' },
	keyProp: { type: String, default: 'label' },
	valueProp: { type: [String, Number, Boolean, Object, Array, null], default: null },
	valueMethod: { type: Function, default: null },
	labelMethod: { type: Function, default: null },
	labelDisabled: { type: Boolean, default: false },
	labelPosition: { type: String, default: 'inline' },
	tag: { type: String, default: 'li' },
	emptyText: { type: String, default: '' },
});

const emit = defineEmits(['event']);

const label = computed(() => {
	const { labelMethod, keyProp, settingItem, itemData } = props;
	if (labelMethod) {
		return `${labelMethod(settingItem, itemData)}: `;
	}

	if (!props.labelDisabled) {
		return `${settingItem[keyProp]}: `;
	}

	return '';
});

const value = computed(() => {
	const { valueMethod, valueProp, settingItem, itemData, emptyText } = props;
	let settingItemCopy = { ...settingItem };

	if (emptyText) {
		settingItemCopy.meta = settingItemCopy.meta || {};
		settingItemCopy = {
			...settingItemCopy,
			meta: {
				...settingItemCopy.meta,
				emptyText,
			},
		};
	}

	if (settingItemCopy.value) {
		const getValue = settingItemCopy.predefinedValue ? false : true;
		if (getValue) {
			return getCellValue(settingItemCopy.value, settingItemCopy);
		}
		return settingItemCopy.value;
	}

	if (valueMethod) {
		return valueMethod(settingItemCopy, itemData);
	}

	if (valueProp) {
		return settingItemCopy[valueProp];
	}

	return getCellValue(itemData, settingItemCopy);
});

const hasValue = computed(() => {
	if (props.settingItem.conditionSettings) {
		return validateBySettings({
			...props.settingItem.conditionSettings,
			dataObj: props.itemData,
		});
	}

	return (!!value.value || value.value === 0) && value.value !== ' ';
});

const executeEvent = (e) => {
	const data = {
		...props.settingItem,
		row: props.itemData,
		native_event: e,
	};

	emit('event', {
		eventName: props.settingItem.event.name,
		data,
		onward: true,
	});
};
</script>
