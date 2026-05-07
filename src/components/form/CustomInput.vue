<template>
	<!-- <div :class="type == 'textarea' ? 'el-textarea' : 'el-input'"> -->
	<div :class="[type == 'textarea' ? 'el-textarea' : 'el-input', 'custom-input']">
		<i v-if="prefixIcon" :class="['input-prefix', prefixIcon]"></i>

		<el-button
			class="input-prefix prependButton"
			v-if="prepend"
		>
			<i class="icomoon icon-search"></i>
		</el-button>
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
			:value="inputValue"
		/>
			<!-- @focus="clearError('email')" -->

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
			:value="inputValue"
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
			:value="inputValue"
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
			:value="inputValue"
			:rows="rows"
		></textarea>

		<!-- :value="props.value" -->
		<!-- <div class="el-form-item__error" v-show="hasError">{{ errorText }}</div> -->
	</div>
</template>

<script setup>
import { onMounted, computed, useTemplateRef } from 'vue';

	// =========================
	const props = defineProps({
		modelValue: null,		
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
	});

	// ========== Computed ===========
	const inputValue = computed(() => props.modelValue ?? props.value ?? '');
	const inputRef = useTemplateRef('inputElement');

	// ========== Methods ===========
	const emit = defineEmits(['update:modelValue', 'input']);

	const handleInput = (inputNode) => {
		// console.log(inputNode)
		if (props.elastic) {
			inputNode.style.height = inputNode.scrollHeight + 'px';
		}
		if (props.inputCallback) {
			inputNode.value = props.inputCallback(inputNode.value);
		}

		if (inputNode.value == inputValue.value) return;

		emit('update:modelValue', inputNode.value);
		emit('input', inputNode.value);
	}

	const focus = () => inputRef.value.focus();
	defineExpose({ focus });

	onMounted(() => {
		if (props.elastic && inputRef.value) {
			inputRef.value.style.height = inputRef.value.scrollHeight + 'px';
		}
	});
</script>
