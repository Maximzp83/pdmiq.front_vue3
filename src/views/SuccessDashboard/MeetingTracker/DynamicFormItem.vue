<template>
	<div class="mrow flex wrap align-center el-form-item">
		<el-form-item :label="tt('Description')" class="mcol-xs-12 mcol-sm-7">
			<el-input v-model="localValue.description" type="textarea" :rows="2" />
		</el-form-item>

		<el-form-item :label="tt('Sensor')" class="mcol-xs-12 mcol-sm-4">
			<CustomSelectV2
				v-model="localValue.sensor_id"
				clearable
				filterable
				:optionsList="sensorsList"
				:placeholder="`${tt('Select')} ${tt('Sensor')}`"
			/>
		</el-form-item>

		<div class="mcol-xs-12 mcol-sm-1 text-right">
			<el-button class="delete-button inverted" type="primary" native-type="button" @click="emit('remove')">
				<i class="icomoon icon-plus rotate"></i>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardDynamicFormItem' });

const props = defineProps({
	modelValue: { type: Object, default: () => ({}) },
	sensorsList: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue', 'remove']);

const localValue = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
});
</script>
