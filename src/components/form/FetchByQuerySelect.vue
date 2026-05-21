<template>
	<CustomSelectV2
		ref="selectRootRef"
		filterable
		:enabled="!disabled"
		:multiple="multiple"
		:className="`${className} ${enableLoadmore ? 'enableLoadmore' : ''}`"
		:disabled="disabled"
		:clearable="clearable"
		:filter-method="selectQuery"
		:optionsLoading="innerOptionsLoading"
		:optionsList="innerOptionsList"
		:placeholder="placeholder"
		:labelKey="labelKey"
		:valueKey="valueKey"
		:idKey="idKey"
		:value="currentValue"
		:setupLabelSettings="setupLabelSettings"
		:setupLabelMethod="setupLabelMethod"
		:prefixIcon="prefixIcon"
		:popperClass="popperClass"
		@change="handleInput"
		@focus="handleFocus"
		@toggleDropdown="handleToggleDropdown"
	/>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';

import { useAsyncSelect } from '@/composables/requests/useAsyncSelect';

// import CustomSelect from '@/components/form/CustomSelect.vue';

defineOptions({
	name: 'FetchByQuerySelect',
});

const props = defineProps({
	modelValue: null,
	value: null,
	clearable: Boolean,
	disabled: Boolean,
	multiple: Boolean,
	required: Boolean,
	optionsLoading: Boolean,
	enableLoadmore: Boolean,
	preventResetOptionsWhenQueryIsCleared: Boolean,
	loadmoreIsActive: { type: Boolean, default: true },
	placeholder: { type: String, default: 'select item' },
	labelKey: { type: String, default: 'name' },
	valueKey: { type: String, default: 'id' },
	idKey: { type: String, default: 'id' },
	className: { type: String, default: '' },
	label: String,
	setupLabelSettings: null,
	setupLabelMethod: { type: Function, default: undefined },
	prefixIcon: String,
	minOptionsToFetch: null,
	optionsList: { type: Array, default: () => [] },
	settings: { type: Object, default: () => ({}) },
	fetchParams: { type: Object, default: () => ({}) },
});

const emit = defineEmits([
	'update:modelValue',
	'input',
	'change',
	'focus',
	'update:optionsLoading',
	'update:optionsList',
]);

const currentValue = computed(() =>
	props.modelValue !== null && props.modelValue !== undefined ? props.modelValue : props.value,
);
const selectRootRef = ref(null);
const popperClass = `fetch-by-query-select-popper-${Math.random().toString(36).slice(2, 10)}`;

const getSelectRootElement = () => {
	const root = selectRootRef.value;
	return root?.$el || root;
};

const getDropdownWrap = () => {
	const byPopperClass = [
		`.${popperClass} .el-vl__window`,
		`.${popperClass} .el-scrollbar__wrap`,
		`.${popperClass} .el-select-dropdown__wrap`,
	]
		.map((selector) => document.querySelector(selector))
		.find(Boolean);

	if (byPopperClass) return byPopperClass;

	const visibleWraps = Array.from(document.querySelectorAll('.el-select-dropdown__wrap')).filter(
		(node) => node.offsetParent !== null,
	);

	if (visibleWraps.length) {
		return visibleWraps[visibleWraps.length - 1];
	}

	const virtualWraps = Array.from(
		document.querySelectorAll('.el-virtual-scrollbar__wrap, .el-scrollbar__wrap'),
	).filter((node) => node.offsetParent !== null);

	return virtualWraps[virtualWraps.length - 1] || null;
};

const detachLoadmoreListener = () => {
	const el = getSelectRootElement();
	if (el?.__loadmoreWrap && el?.__loadmoreHandler) {
		el.__loadmoreWrap.removeEventListener('scroll', el.__loadmoreHandler);
		el.__loadmoreWrap = null;
		el.__loadmoreHandler = null;
	}
};

const attachLoadmoreListener = async () => {
	if (!props.enableLoadmore) return;

	await nextTick();

	const el = getSelectRootElement();
	if (!el) return;

	const wrap = getDropdownWrap();
	// console.log('wrap', wrap, el.__loadmoreWrap);
	if (!wrap || wrap === el.__loadmoreWrap) return;

	detachLoadmoreListener();

	const onScroll = function () {
		// console.log('onScroll', this.scrollHeight+'-'+ Math.ceil(this.scrollTop)+'-'+2+'<='+ this.clientHeight);
		if (this.scrollHeight - Math.ceil(this.scrollTop) - 2 <= this.clientHeight) {
			loadmore();
		}
	};

	wrap.addEventListener('scroll', onScroll);
	el.__loadmoreWrap = wrap;
	el.__loadmoreHandler = onScroll;
};

const {
	innerOptionsList,
	innerOptionsLoading,
	fetchSelectedItemsById,
	selectQuery,
	handleToggleDropdown: toggleDropdown,
	loadmore,
	handleValueCleared,
	notifyDropdownOpenIntent,
	syncExternalOptionsList,
	syncExternalOptionsLoading,
} = useAsyncSelect({
	settings: computed(() => props.settings),
	fetchParams: computed(() => props.fetchParams),
	optionsList: props.optionsList,
	optionsLoading: props.optionsLoading,
	currentValue,
	idKey: props.idKey,
	loadmoreIsActive: props.loadmoreIsActive,
	onValueChange: (val) => handleInput(val),
	onOptionsListChange: (value) => emit('update:optionsList', value),
	onOptionsLoadingChange: (value) => emit('update:optionsLoading', value),
});

const handleInput = (value) => {
	emit('update:modelValue', value);
	emit('input', value);
	emit('change', value);

	if (!value && value !== 0) {
		handleValueCleared();
	}
};

const handleFocus = (event) => {
	notifyDropdownOpenIntent();
	setTimeout(() => {
		emit('focus', event);
	}, 10);
};

const handleToggleDropdown = async (open) => {
	// console.log('handleToggleDropdown', open);
	if (open) {
		await toggleDropdown(open, props.minOptionsToFetch || 2);
		await attachLoadmoreListener();
		return;
	}

	detachLoadmoreListener();
	await toggleDropdown(open, props.minOptionsToFetch || 2);
};

watch(
	currentValue,
	() => {
		fetchSelectedItemsById();
	},
	{ immediate: true },
);

watch(
	() => props.optionsList,
	(value) => {
		syncExternalOptionsList(value);
	},
	{ deep: true },
);

watch(
	() => props.optionsLoading,
	(value) => {
		syncExternalOptionsLoading(value);
	},
);

watch(
	() => props.enableLoadmore,
	(value) => {
		if (!value) {
			detachLoadmoreListener();
		}
	},
);
</script>
