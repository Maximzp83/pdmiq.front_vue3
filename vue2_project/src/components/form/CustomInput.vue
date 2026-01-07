<template>
	<!-- <div :class="type == 'textarea' ? 'el-textarea' : 'el-input'"> -->
	<div :class="[type == 'textarea' ? 'el-textarea' : 'el-input', 'custom-input']">
		<i v-if="prefixIcon" :class="['input-prefix', prefixIcon]"></i>

		<el-button
			class="input-prefix prependButton"
			v-if="prepend"
			icon="icomoon icon-search"
		/>
		<!-- @click="({ target }) => handlePrepend(target)" -->

		<input
			ref="inputElement"
			v-if="reactive && type == 'text'"
			:disabled="disabled"
			autocomplete="off-disabled-closed"
			autocapitalize="off"
			:placeholder="placeholder"
			:class="[
				'el-input__inner',
				className,
				{ 'has-prefix': prefixIcon },
				{ 'has-prepend': prepend }
			]"
			@blur="({ target }) => handleInput(target)"
			@keyup.enter="({ target }) => handleInput(target)"
			@input="({ target }) => handleInput(target)"
			:value="value"
		/>

		<input
			ref="inputElement"
			v-else-if="type == 'text'"
			:disabled="disabled"
			autocomplete="off-disabled-closed"
			autocapitalize="off"
			:placeholder="placeholder"
			:class="[
				'el-input__inner',
				className,
				{ 'has-prefix': prefixIcon },
				{ 'has-prepend': prepend }
			]"
			@blur="({ target }) => handleInput(target)"
			@keyup.enter="({ target }) => handleInput(target)"
			:value="value"
		/>
		<!-- onkeydown="keyDown" -->
		<textarea
			ref="inputElement"
			v-else-if="type == 'textarea' && elastic"
			:disabled="disabled"
			autocomplete="off"
			:placeholder="placeholder"
			:class="['el-textarea__inner elastic', className]"
			@input="({ target }) => handleInput(target)"
			@keyup.enter="({ target }) => handleInput(target)"
			:value="value"
			:rows="1"
		></textarea>

		<textarea
			ref="inputElement"
			v-else-if="type == 'textarea'"
			:disabled="disabled"
			autocomplete="off"
			:placeholder="placeholder"
			:class="['el-textarea__inner', className]"
			@blur="({ target }) => handleInput(target)"
			@keyup.enter="({ target }) => handleInput(target)"
			:value="value"
			:rows="rows"
		></textarea>

		<!-- :value="props.value" -->
		<!-- <div class="el-form-item__error" v-show="hasError">{{ errorText }}</div> -->
	</div>
</template>

<script>
// import { isEmptyString } from '@/utils/validate';

export default {
	// functional: true,
	props: {
		value: null,
		placeholder: {
			type: String,
			default: 'input...'
		},
		className: String,
		disabled: Boolean,
		required: Boolean,
		elastic: Boolean,
		type: { type: String, default: 'text' },
		rows: { type: String, default: '4' },
		prefixIcon: String,
		prepend: Boolean,
		reactive: Boolean,
		inputCallback: { type: Function, required: false }
	},

	data() {
		return {
			hasError: false
		};
	},

	methods: {
		handleInput(data) {
			// console.log(data, data.value)
			if (this.elastic) {
				data.style.height = data.scrollHeight + 'px';
			}
			/*if (this.required) {
				this.hasError = isEmptyString(val);
			}*/
			if (this.inputCallback) {
				data.value = this.inputCallback(data.value);
			}
			this.$emit('input', data.value);
		},

		focus() {
			this.$refs.inputElement.focus();
		}

		/*handlePrepend(target) {
			console.log(target)
		}*/
	},

	mounted() {
		// console.log(this.$refs.inputElement)
		if (this.elastic) {
			const input = this.$refs.inputElement;
			input.style.height = input.scrollHeight + 'px';
		}
	}
};
</script>
