<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container relative content-row']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item class="small-paddings-time">
			<div class="flex mrow">
				<div class="mcol-xs-5">
					<Datepicker
						v-model="formData.date"
						className=" "
						:placeholder="`${tt('Select')} ${tt('date')}`"
					/>
				</div>

				<div class="mcol-xs-4">
					<el-time-select
						v-model="formData.start_day"
						value-format="HH:mm"
						:placeholder="tt('start')"
						:picker-options="startTimePickerOptions"
						@blur="clearValidate"
						@change="formData.finish_day = null"
					/>
				</div>

				<div class="mcol-xs-4">
					<el-time-select
						v-model="formData.finish_day"
						:disabled="!formData.start_day"
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

import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({
	name: 'ProcessWorkDateItem',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	itemIndex: { type: Number, default: 0 },
	required: Boolean,
	timePickerOptions: { type: Object, default: () => ({}) },
	hideRemove: Boolean,
});

const emit = defineEmits(['onRemove', 'onCreate']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	date: '',
	start_day: '',
	finish_day: '',
});

const rules = computed(() => ({
	date: requiredRule,
}));

const startTimePickerOptions = computed(() => ({
	...props.timePickerOptions,
}));

const endTimePickerOptions = computed(() => ({
	...props.timePickerOptions,
	minTime: formData.value.start_day,
}));

const clearValidate = () => {
	itemFormRef.value?.clearValidate?.(['start_day', 'finish_day']);
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
