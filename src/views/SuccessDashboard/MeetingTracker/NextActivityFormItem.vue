<template>
	<div class="mrow flex wrap align-center el-form-item">
		<el-form-item :label="tt('Description')" class="mcol-xs-12 mcol-sm-5">
			<el-input v-model="localValue.description" type="textarea" :rows="2" :disabled="showJustInfo" />
		</el-form-item>

		<el-form-item :label="tt('Sensor')" class="mcol-xs-12 mcol-sm-3">
			<CustomSelectV2
				v-model="localValue.sensor_id"
				clearable
				filterable
				:disabled="showJustInfo"
				:optionsList="sensorsList"
				:placeholder="`${tt('Select')} ${tt('Sensor')}`"
			/>
		</el-form-item>

		<el-form-item :label="tt('phrases.next_launch_date')" class="mcol-xs-12 mcol-sm-3">
			<Datepicker v-model="localValue.next_launch_date" :disabled="showJustInfo" />
		</el-form-item>

		<div v-if="showDeleteButton" class="mcol-xs-12 mcol-sm-1 text-right">
			<el-button class="delete-button inverted" type="primary" native-type="button" @click="emit('remove')">
				<i class="icomoon icon-plus rotate"></i>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Lang } from '@/localization';
import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardNextActivityFormItem' });

const props = defineProps({
	modelValue: { type: Object, default: () => ({}) },
	itemData: { type: Object, default: null },
	sensorsList: { type: Array, default: () => [] },
	showJustInfo: Boolean,
	showDeleteButton: { type: Boolean, default: true },
});
const emit = defineEmits(['update:modelValue', 'remove', 'onRemove', 'onDelete', 'onSave']);

const localValue = computed({
	get: () => props.itemData || props.modelValue,
	set: (value) => emit('update:modelValue', value),
});

defineExpose({
	getFormData: () => localValue.value,
	validateItemForm: () => true,
});
</script>
