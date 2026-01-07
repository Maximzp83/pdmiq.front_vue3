<template>
	<div class="el-input phone-input">
		<el-select
			popper-class="phone-code-dropdown"
			@change="handleSelect"
			:value="value.country_code"
		>
			<!-- v-show="item.id != 'other'" -->
			<el-option
				v-for="item in countryCodeList"
				:key="'country_code_id-' + item.id"
				:value="item.id"
			>
				<!-- :label="item.code" -->
				<span class="option-container">
					<span v-text="item.code" class="code"></span>
					<img
						v-if="flagSrc(item.flag)"
						:src="flagSrc(item.flag)"
						:alt="item.name"
					/>
				</span>
			</el-option>

			<!-- <el-option :value="{ id: COUNTRY_CODES.OTHER, code: 'other' }" :label="'other...'" /> -->

			<div class="" slot="prefix">
				<span v-text="selectedCodeItem.code" class="code"></span>
				<img
					v-if="selectedCodeItem.flag"
					:src="flagSrc(selectedCodeItem.flag)"
					alt="flag"
				/>
			</div>
		</el-select>

		<input
			:disabled="disabled"
			:required="required"
			type="text"
			autocomplete="off"
			:placeholder="placeholder"
			:class="['text-input el-input__inner', className, { 'has-error': hasError }]"
			@blur="({ target }) => handleInput(target.value)"
			@focus="(hasError = false), (errorText = '')"
			:value="visiblePhoneNumber"
		/>
		<!-- :value="props.value" -->
		<div class="el-form-item__error" v-show="hasError">{{ errorText }}</div>
	</div>
</template>

<script>
import { isEmptyString } from '@/utils/validate';
import { findItemBy } from '@/helpers';
import { countryCodeList, COUNTRY_CODES } from '@/constants/global';

export default {
	// functional: true,
	props: {
		value: null,
		/*errorText: {
			type: String,
			default: 'This field is required'
		},*/
		placeholder: {
			type: String,
			default: 'input number'
		},
		className: String,
		disabled: Boolean,
		required: Boolean
	},

	data() {
		return {
			hasError: false,
			errorText: ''
		};
	},

	computed: {
		countryCodeList: () => countryCodeList,

		selectedCodeItem: that =>
			findItemBy(
				'id',
				that.value.country_code || COUNTRY_CODES.OTHER,
				countryCodeList
			),

		phoneNumber: that => that.value.phone_number,

		visiblePhoneNumber() {
			let codeItem = this.selectedCodeItem;
			let phone_number = this.phoneNumber;

			if (codeItem) {
				countryCodeList.forEach(ci => {
					const regExp = new RegExp(`^\\${ci.code}`);
					phone_number = phone_number.replace(regExp, '');
				});
			}

			return phone_number;
		}
	},

	methods: {
		flagSrc(flagName) {
			if (flagName) {
				return `/static/img/flags/${flagName}`;
			}
			return null;
		},

		handleSelect(val) {
			this.submitForm({
				code: val == 'other' ? null : val,
				number: this.visiblePhoneNumber
			});
		},

		handleInput(val) {
			const is_empty = isEmptyString(val);

			if (this.required) {
				this.hasError = is_empty;
				this.hasError ? (this.errorText = 'This field is required') : null;
			}
			if (!is_empty) {
				this.hasError = val.length < 10;
				const str = 'phone number is not valid';
				if (this.hasError) {
					this.errorText = this.errorText.length
						? `${this.errorText}, ${str}`
						: `${str}`;
				}
			}

			this.submitForm({ number: val });
		},

		submitForm({ code, number }) {
			let phone_number = number;
			let codeItem =
				code !== undefined
					? findItemBy('id', code, countryCodeList)
					: this.selectedCodeItem;

			if (phone_number && codeItem && codeItem.id !== COUNTRY_CODES.OTHER) {
				phone_number = codeItem.code + phone_number;
			}

			let payload = {
				phone_number: phone_number
			};

			if (code !== undefined) {
				payload.country_code = phone_number ? code : null;
				// console.log(payload.country_code, phone_number, code)
			}
			this.$emit('input', { ...this.value, ...payload });
		}
	}
};
</script>
