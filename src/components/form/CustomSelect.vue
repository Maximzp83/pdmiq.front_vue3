<template>
	<div class="custom-select">
		<SimpleSpinner :active="optionsLoading" />
		<i v-if="prefixIcon" :class="['input-prefix', prefixIcon]"></i>
		<span v-if="prefixText" class="input-prefix prefix-text">{{ prefixText }}</span>

		<el-select
			:class="[
				{ 'multiple-select': multiple },
				className,
				{ 'has-prefix': prefixIcon },
				{ 'collapse-tags': collapseTags },
				{ mini: mini }
			]"
			@visible-change="handleToggleDropdown"
			:disabled="!enabled && (!optionsList.length || disabled)"
			:filterable="filterable"
			:clearable="clearable"
			:required="required"
			:multiple="multiple"
			:multiple-limit="multipleLimit"
			:filter-method="filterMethod"
			:placeholder="placeholder"
			@change="handleInput"
			:model-value="currentValue"
			@focus="handleFocus"
			@blur="handleBlur"
			:collapse-tags="collapseTags"
			:allow-create="allowCreate"
			:default-first-option="defaultFirstOption"
		>
			<el-option
				v-for="item in filteredList"
				:key="'select_id-' + item[idKey]"
				:class="optionClassName"
				:value="item[valueKey]"
				:label="useHtml ? getLabel(item).label : getLabel(item)"
			>
				<div v-if="useHtml" v-html="getLabel(item).html"></div>
			</el-option>
		</el-select>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { setupLabel, findItemBy } from '@/helpers';

// =========================
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
		default: () => []
	}
});

const emit = defineEmits(['update:modelValue', 'change', 'input', 'focus', 'blur', 'toggleDropdown']);

// =========================
const isDropdownActive = ref(false);

// Поддержка как v-model, так и :value
const currentValue = computed(() => {
	return props.modelValue !== null && props.modelValue !== undefined
		? props.modelValue
		: props.value;
});

const filteredList = computed(() => {
	const value = currentValue.value;
	const origList = props.optionsList;
	if (!origList.length) return [];

	if (isDropdownActive.value) {
		return Object.freeze(origList);
	}

	if (value) {
		if (value instanceof Array) {
			let list = [];
			for (let i = 0; i < value.length; i++) {
				const item = findItemBy('id', value[i], origList);
				if (item) list.push(item);
			}
			return Object.freeze(list);
		}
		return Object.freeze(origList.filter((pi) => pi.id === value));
	}

	return Object.freeze([origList[0]]);
});

// =========================
const getLabel = (item) => {
	if (props.setupLabelSettings) {
		return setupLabel(item, props.setupLabelSettings);
	}
	if (props.setupLabelMethod) {
		return props.setupLabelMethod(item);
	}
	return props.label || item[props.labelKey];
};

const handleToggleDropdown = (val) => {
	isDropdownActive.value = val;
	emit('toggleDropdown', val);
};

const handleInput = (value) => {
	// Поддержка v-model (Vue 3)
	emit('update:modelValue', value);
	// Поддержка @input (Vue 2 совместимость)
	emit('input', value);
	// Поддержка @change
	emit('change', value);
};

const handleFocus = (event) => {
	emit('focus', event);
};

const handleBlur = (event) => {
	emit('blur', event);
};
</script>
