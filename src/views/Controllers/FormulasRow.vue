<template>
	<el-form
		ref="itemFormRef"
		class="flex mrow standard-form-row align-center"
		:model="formData"
		:rules="rules"
	>
		<div class="mcol-xs-4 capitalize" v-text="title"></div>

		<el-form-item prop="math_expression" class="mcol-xs-4">
			<CustomInput
				v-model="formData.math_expression"
				placeholder="Expl: ({reg}/20)*5"
			/>
		</el-form-item>

		<el-form-item prop="math_expression_back" class="mcol-xs-4">
			<CustomInput
				v-model="formData.math_expression_back"
				placeholder="Expl: ({reg}/20)*5"
			/>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { setupParameterName } from '@/modules/charts_factory/controllers/Sensor/methods';
import { useSubItem } from '@/composables/mixins/useSubItem';

defineOptions({
	name: 'ControllerFormulasRow',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	formulasData: { type: Array, default: () => [] },
});

const itemFormRef = ref(null);
const formData = ref({
	sensor_parameter_type: null,
	math_expression: '',
	math_expression_back: '',
});

const title = computed(() => setupParameterName({ parameterItem: props.itemData }));

const rules = computed(() => ({
	math_expression: formData.value.math_expression_back ? required : null,
	math_expression_back: formData.value.math_expression ? required : null,
}));

const localSetupPageActions = (parameterTypeItem) => {
	if (props.formulasData.length) {
		const formulasItem =
			findItemBy('sensor_parameter_type', formData.value.sensor_parameter_type, props.formulasData)
			|| findItemBy('sensor_parameter_type', parameterTypeItem?.id, props.formulasData);

		if (formulasItem) {
			formData.value = formulasItem;
		}
		return;
	}

	formData.value = {
		sensor_parameter_type: parameterTypeItem?.id || null,
		math_expression: '',
		math_expression_back: '',
	};
};

const { validateItemForm, getFormData } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions,
	deleteId: true,
});

defineExpose({
	validateItemForm,
	getFormData,
});
</script>
