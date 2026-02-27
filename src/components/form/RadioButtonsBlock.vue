<template>
	<div
		:class="[
			{ card: settings.card },
			'radio-container',
			{ group: settings.group },
			settings.blockClassName
		]"
	>
		<div
			v-if="!settings.hideTitle && settings.title"
			class="card-header capitalize bold article-title"
			v-text="settings.title"
		/>
		<div :class="[{ 'card-content': settings.card }]">
			<div
				:class="[
					'content-container',
					{ 'mrow flex': settings.inline },
					{ wrap: !settings.disableInlineWrap }
				]"
			>
				<div class="radio-item" v-for="(item, idx) in optionsList" :key="`${settings.title}-${idx}`">
					<el-button
						native-type="button"
						:type="settings.buttonType"
						:class="[settings.className, { [activeKey]: isActive(item) }]"
						@click="switchItem(item)"
					>
						<span v-if="settings.className == 'radio-input'" class="radio-input-icon"></span>
						<span
							v-else-if="settings.isCheckbox"
							:class="['el-checkbox__input', { 'is-checked': isActive(item) }]"
						>
							<span class="el-checkbox__inner"></span>
						</span>
						<span
							v-if="!settings.hideLabel"
							:class="['label capitalize', { 'el-checkbox__label': settings.isCheckbox }]"
							v-html="item.name || item.title"
						/>

						<span v-if="settings.icon || item.icon" class="icon-block">
							<i :class="`icomoon ${item.icon || item.icon}`" />
						</span>
					</el-button>

					<span v-if="item.hasInput && settings.valueAsObject" class="additional-info-cell">
						<CustomInput
							v-if="isActive(item)"
							:model-value="value?.[settings.valueAsObject.valueKey]"
							@update:modelValue="(val) => updateObjectInput(settings.valueAsObject.valueKey, val)"
							class="mini additional-input-cell"
						/>
						<span
							v-else
							class="additional-info-cell"
							v-html="item[settings.valueAsObject.valueKey]"
						></span>
					</span>

					<span
						v-else-if="settings.additionalInfoKey"
						class="additional-info-cell"
						v-html="item[settings.additionalInfoKey]"
					></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import CustomInput from '@/components/form/CustomInput.vue';

defineOptions({
	name: 'RadioButtonsBlock',
});

const props = defineProps({
	settings: { type: Object, required: true },
	optionsList: { type: Array, required: true },
	value: null,
	alwaysSwitch: Boolean,
});

const emit = defineEmits(['update:modelValue', 'input', 'onChange']);

const activeKey = computed(() => (props.settings.isCheckbox ? 'is-checked' : 'active'));
const valueAsObject = computed(() => props.settings.valueAsObject);
const valueAsArray = computed(() => props.settings.valueAsArray);

const isActive = (item) => {
	if (valueAsObject.value) {
		if (valueAsObject.value.isActiveKey) {
			return props.value[valueAsObject.value.isActiveKey] == item[valueAsObject.value.isActiveKey];
		}

		let value = {};
		valueAsObject.value.props.forEach((prop) => {
			value[prop] = item[prop];
		});
		return JSON.stringify(value) == JSON.stringify(props.value);
	} else if (valueAsArray.value) {
		return props.value.some((val) => val === item.id);
	}
	return props.value === item.id;
};

const emitValue = (val) => {
	emit('update:modelValue', val);
	emit('input', val);
	emit('onChange', val);
};

const updateObjectInput = (key, val) => {
	const base = props.value && typeof props.value === 'object' ? props.value : {};
	emitValue({ ...base, [key]: val });
};

const switchItem = (item) => {
	let selectedId = null;
	let selectedValue;

	if (valueAsObject.value) {
		selectedValue = {};
		valueAsObject.value.props.forEach((prop) => {
			selectedValue[prop] = item[prop];
		});
	} else if (valueAsArray.value) {
		selectedValue = [...props.value];
		if (selectedValue.includes(item.id)) {
			selectedValue = selectedValue.filter((val) => val !== item.id);
		} else {
			selectedValue.push(item.id);
		}
		emitValue(selectedValue);
		return;
	} else {
		selectedValue = item.id;
	}

	if (props.settings.clearable) {
		if (valueAsObject.value) {
			if (JSON.stringify(selectedValue) != JSON.stringify(props.value)) {
				selectedId = selectedValue;
			}
		} else if (selectedValue !== props.value) {
			selectedId = selectedValue;
		}
	} else {
		selectedId = selectedValue;
	}

	if (selectedId != props.value || props.settings.alwaysSwitch) {
		emitValue(selectedId);
	}
};
</script>
