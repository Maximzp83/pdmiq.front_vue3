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
						v-model="formData.start_time"
						value-format="HH:mm"
						:placeholder="tt('start')"
						:picker-options="startTimePickerOptions"
						@blur="clearValidate"
						@change="formData.finish_time = ''"
					/>
				</div>

				<div class="mcol-xs-6">
					<el-time-select
						v-model="formData.finish_time"
						:disabled="!formData.start_time"
						value-format="HH:mm"
						:placeholder="tt('finish')"
						:picker-options="endTimePickerOptions"
					/>
				</div>
			</div>
		</el-form-item>

		<div v-if="!hideRemove" class="action-buttons-container absolute">
			<el-button
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
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

const startTimePickerOptions = computed(() => ({
	...props.timePickerOptions,
	minTime: props.workTime.start_work_day,
	maxTime: props.workTime.finish_work_day,
}));

const endTimePickerOptions = computed(() => ({
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
