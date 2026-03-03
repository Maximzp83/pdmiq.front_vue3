<template>
	<div class="custom-select">
		<SimpleSpinner :active="optionsLoading" />
		<i v-if="prefixIcon" :class="['input-prefix', prefixIcon]"></i>
		<span v-if="prefixText" class="input-prefix prefix-text">{{ prefixText }}</span>

		<el-select-v2
			:class="[
				{ 'multiple-select': multiple },
				className,
				{ 'has-prefix': prefixIcon },
				{ 'collapse-tags': collapseTags },
				{ mini: mini }
			]"
			:model-value="currentValue"
			:options="normalizedOptions"
			:disabled="!enabled && (!optionsList.length || disabled)"
			:filterable="filterable"
			:clearable="clearable"
			:multiple="multiple"
			:multiple-limit="multipleLimit"
			:filter-method="filterMethod"
			:placeholder="placeholder"
			:collapse-tags="collapseTags"
			:allow-create="allowCreate"
			:default-first-option="defaultFirstOption"
			@visible-change="handleToggleDropdown"
			@update:model-value="handleInput"
			@focus="handleFocus"
			@blur="handleBlur"
		>
			<template v-if="useHtml" #default="slotProps">
				<div v-if="slotProps.item.html" v-html="slotProps.item.html"></div>
				<span v-else>{{ slotProps.item.label }}</span>
			</template>
		</el-select-v2>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { setupLabel } from '@/helpers';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const props = defineProps({
	modelValue: null,
	value: null,

	filterable: Boolean,
	clearable: Boolean,
	disabled: Boolean,
	multiple: Boolean,
	required: Boolean,
	optionsLoading: Boolean,
	enabled: Boolean,
	mini: Boolean,
	collapseTags: Boolean,
	allowCreate: Boolean,
	defaultFirstOption: Boolean,
	prefixIcon: String,
	prefixText: String,
	optionClassName: { type: String, default: '' },

	placeholder: { type: String, default: 'select item' },
	labelKey: { type: String, default: 'name' },
	valueKey: { type: String, default: 'id' },
	idKey: { type: String, default: 'id' },
	filterMethod: { type: Function, default: undefined },
	className: { type: String, default: '' },
	label: String,
	setupLabelSettings: null,
	setupLabelMethod: { type: Function, default: undefined },
	useHtml: Boolean,
	multipleLimit: { type: Number, default: undefined },
	optionsList: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(['update:modelValue', 'change', 'input', 'focus', 'blur', 'toggleDropdown']);

const currentValue = computed(() => {
	return props.modelValue !== null && props.modelValue !== undefined
		? props.modelValue
		: props.value;
});

const getLabel = (item) => {
	if (props.setupLabelSettings) {
		return setupLabel(item, props.setupLabelSettings);
	}
	if (props.setupLabelMethod) {
		return props.setupLabelMethod(item);
	}
	return props.label || item[props.labelKey];
};

const normalizedOptions = computed(() => {
	return (props.optionsList || []).map((item) => {
		const labelData = getLabel(item);
		const label = typeof labelData === 'object' ? labelData.label : labelData;
		const html = typeof labelData === 'object' ? labelData.html : '';

		return {
			...item,
			label,
			value: item[props.valueKey],
			disabled: item.disabled || false,
			html,
			optionClassName: props.optionClassName,
		};
	});
});

const handleToggleDropdown = (val) => {
	emit('toggleDropdown', val);
};

const handleInput = (value) => {
	emit('update:modelValue', value);
	emit('input', value);
	emit('change', value);
};

const handleFocus = (event) => {
	emit('focus', event);
};

const handleBlur = (event) => {
	emit('blur', event);
};
</script>
