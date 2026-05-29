<template>
	<div class="option-row">
		<div class="label">{{ itemData.name }}</div>
		<div class="value" v-html="itemData.value"></div>

		<div class="checkbox-wrapper">
			<el-checkbox
				v-model="formData.is_visible_in_vibration_analysis"
				class="capitalize"
				:true-value="1"
				:false-value="0"
			/>
		</div>
	</div>
</template>

<script setup>
import { reactive, watch } from 'vue';

defineOptions({
	name: 'TypeOptionValueItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: Number,
});

const formData = reactive({
	equipment_type_option_id: null,
	is_visible_in_vibration_analysis: false,
});

const setupPage = (item = {}) => {
	formData.equipment_type_option_id = item.equipment_type_option_id || item.id || null;
	formData.is_visible_in_vibration_analysis = item.is_visible_in_vibration_analysis || false;
};

const collectData = () => ({ ...formData });
const validateForm = () => true;

watch(
	() => props.itemData,
	(item) => setupPage(item),
	{ immediate: true },
);

defineExpose({
	formData,
	collectData,
	validateForm,
});
</script>
