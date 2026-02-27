<template>
	<div class="el-input phone-input">
		<el-select
			popper-class="phone-code-dropdown"
			:value="currentValue.country_code"
			@change="handleSelect"
		>
			<el-option
				v-for="item in countryCodeList"
				:key="`country_code_id-${item.id}`"
				:value="item.id"
			>
				<span class="option-container">
					<span class="code" v-text="item.code"></span>
					<img v-if="flagSrc(item.flag)" :src="flagSrc(item.flag)" :alt="item.name" />
				</span>
			</el-option>

			<template #prefix>
				<div>
					<span class="code" v-text="selectedCodeItem.code"></span>
					<img v-if="selectedCodeItem.flag" :src="flagSrc(selectedCodeItem.flag)" alt="flag" />
				</div>
			</template>
		</el-select>

		<input
			:disabled="disabled"
			:required="required"
			type="text"
			autocomplete="off"
			:placeholder="placeholder"
			:class="['text-input el-input__inner', className, { 'has-error': hasError }]"
			:value="visiblePhoneNumber"
			@blur="({ target }) => handleInput(target.value)"
			@focus="handleFocus"
		/>
		<div v-show="hasError" class="el-form-item__error">{{ errorText }}</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { isEmptyString } from '@/utils/validate';
import { findItemBy } from '@/helpers';
import { countryCodeList, COUNTRY_CODES } from '@/constants/global';

const props = defineProps({
	modelValue: {
		type: Object,
		default: () => ({ phone_number: '', country_code: null }),
	},
	value: {
		type: Object,
		default: () => ({ phone_number: '', country_code: null }),
	},
	placeholder: {
		type: String,
		default: 'input number',
	},
	className: {
		type: String,
		default: '',
	},
	disabled: Boolean,
	required: Boolean,
});

const emit = defineEmits(['update:modelValue', 'input']);

const hasError = ref(false);
const errorText = ref('');

const currentValue = computed(() => {
	return props.modelValue && Object.keys(props.modelValue).length ? props.modelValue : props.value;
});

const selectedCodeItem = computed(() => {
	return (
		findItemBy('id', currentValue.value.country_code || COUNTRY_CODES.OTHER, countryCodeList) ||
		{ code: '', flag: '' }
	);
});

const phoneNumber = computed(() => currentValue.value.phone_number || '');

const visiblePhoneNumber = computed(() => {
	let value = phoneNumber.value;
	countryCodeList.forEach((ci) => {
		const regExp = new RegExp(`^\\${ci.code}`);
		value = value.replace(regExp, '');
	});
	return value;
});

const flagSrc = (flagName) => {
	if (!flagName) return null;
	return new URL(`../../assets/img/flags/${flagName}`, import.meta.url).href;
};

const submitForm = ({ code, number }) => {
	let mergedNumber = number;
	const codeItem =
		code !== undefined ? findItemBy('id', code, countryCodeList) : selectedCodeItem.value;

	if (mergedNumber && codeItem && codeItem.id !== COUNTRY_CODES.OTHER) {
		mergedNumber = codeItem.code + mergedNumber;
	}

	const payload = { phone_number: mergedNumber };
	if (code !== undefined) {
		payload.country_code = mergedNumber ? code : null;
	}

	const next = { ...currentValue.value, ...payload };
	emit('update:modelValue', next);
	emit('input', next);
};

const handleSelect = (val) => {
	submitForm({ code: val === 'other' ? null : val, number: visiblePhoneNumber.value });
};

const handleInput = (val) => {
	const isEmpty = isEmptyString(val);
	errorText.value = '';

	if (props.required) {
		hasError.value = isEmpty;
		if (hasError.value) {
			errorText.value = 'This field is required';
		}
	}

	if (!isEmpty) {
		hasError.value = val.length < 10;
		if (hasError.value) {
			errorText.value = errorText.value
				? `${errorText.value}, phone number is not valid`
				: 'phone number is not valid';
		}
	}

	submitForm({ number: val });
};

const handleFocus = () => {
	hasError.value = false;
	errorText.value = '';
};
</script>
