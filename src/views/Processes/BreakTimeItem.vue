<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="finish_time" class="small-paddings-time">
			<div class="flex mrow">
				<div class="mcol-xs-6">
					<el-time-select
						class="time-select"
						v-model="formData.start_time"
						value-format="HH:mm"
						:placeholder="tt('start')"
						:start="startTimePickerOptions.start"
						:end="startTimePickerOptions.end"
						:step="startTimePickerOptions.step"
						:min-time="startTimePickerOptions.minTime"
						:max-time="startTimePickerOptions.maxTime"
						@blur="clearValidate"
						@change="formData.finish_time = ''"
					/>
				</div>

				<div class="mcol-xs-6">
					<el-time-select
						class="time-select"
						v-model="formData.finish_time"
						:disabled="!formData.start_time"
						value-format="HH:mm"
						:placeholder="tt('finish')"
						:start="endTimePickerOptions.start"
						:end="endTimePickerOptions.end"
						:step="endTimePickerOptions.step"
						:min-time="endTimePickerOptions.minTime"
						:max-time="endTimePickerOptions.maxTime"
					/>
				</div>
			</div>
		</el-form-item>

		<div v-if="!hideRemove" class="action-buttons-container absolute">
			<el-button
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="removeItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { required as requiredRule } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'ProcessBreakTimeItem',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	itemIndex: { type: Number, default: 0 },
	required: Boolean,
	timePickerOptions: { type: Object, default: () => ({}) },
	workTime: { type: Object, default: () => ({}) },
	hideRemove: Boolean,
});

const emit = defineEmits(['onRemove', 'onCreate']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	start_time: '',
	finish_time: '',
});

const rules = computed(() => ({
	start_time: props.required ? requiredRule : null,
	finish_time: props.required ? requiredRule : null,
}));

const defaultTimePickerOptions = {
	start: '00:00',
	end: '23:45',
	step: '00:15',
	minTime: '',
	maxTime: '',
};

const startTimePickerOptions = computed(() => ({
	...defaultTimePickerOptions,
	...props.timePickerOptions,
	minTime: props.workTime.start_work_day,
	maxTime: props.workTime.finish_work_day,
}));

const endTimePickerOptions = computed(() => ({
	...defaultTimePickerOptions,
	...props.timePickerOptions,
	minTime: formData.value.start_time,
	maxTime: props.workTime.finish_work_day,
}));

const clearValidate = () => {
	itemFormRef.value?.clearValidate?.(['start_time', 'finish_time']);
};

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
