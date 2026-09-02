<template>
	<el-form
		ref="itemFormRef"
		class="flex mrow relative content-row"
		:model="formData"
		:rules="rules"
		:label-position="fromModal ? 'left' : 'top'"
	>
		<el-form-item prop="date" class="mcol-xs-5 mini">
			<label v-if="!fromModal && itemIndex === 0">{{ tt('Date') }}</label>
			<Datepicker
				v-model="formData.date"
				className="datepicker-container mini"
				:placeholder="hideCreateButton ? '-' : `${tt('Select')} ${tt('date')}`"
				:disabled="hideCreateButton"
			/>
		</el-form-item>

		<el-form-item prop="time" class="mcol-xs-5 mini">
			<label v-if="!fromModal && itemIndex === 0">{{ tt('Hours') }}</label>
			<div class="flex mrow small-input-paddings">
				<CustomInput
					v-model="actualHours"
					class="mcol-xs-4 "
					className="text-center"
					placeholder="00"
					:disabled="hideCreateButton"
					@input="handleTimeInput"
				/>
				<div>:</div>
				<CustomInput
					v-model="actualMinutes"
					class="mcol-xs-4 "
					className="text-center"
					placeholder="00"
					:disabled="hideCreateButton"
					@input="handleTimeInput"
				/>
			</div>
		</el-form-item>

		<div :class="['action-buttons-container', { 'flex bottom': !fromModal }]">
			<el-button
				v-if="!isLast && !hideCreateButton"
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="removeCurrentItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>

			<el-button
				v-else-if="!hideCreateButton"
				class="action-button create-button"
				size="small"
				type="success"
				@click="$emit('onCreate')"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { required } from '@/constants/validation';
import { formatTime } from '@/helpers';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionExecTimesItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	isLast: Boolean,
	fromModal: Boolean,
	hideCreateButton: Boolean,
});
const emit = defineEmits(['onCreate', 'onRemove', 'calcTotalTime']);

const itemFormRef = ref(null);
const actualHours = ref('');
const actualMinutes = ref('');
const formData = ref({
	id: null,
	date: '',
	time: '',
});
const rules = ref({
	date: null,
	time: null,
});

const deleteNewId = computed(() => true);

const normalizeTimePart = (value) => {
	if (!value) return '';
	const normalized = `${value}`.replace(/\D/g, '').slice(0, 2);
	if (!normalized) return '';
	return normalized.length < 2 ? `0${normalized}` : normalized;
};

const updateRules = () => {
	if (formData.value.date || actualHours.value || actualMinutes.value) {
		rules.value = { date: required };
		return;
	}
	rules.value = { date: null, time: null };
};

const handleTimeInput = () => {
	actualHours.value = normalizeTimePart(actualHours.value);
	actualMinutes.value = normalizeTimePart(actualMinutes.value);
	updateRules();
	emit('calcTotalTime');
};

const localSetupPageActions = (item) => {
	if (item?.time) {
		formData.value.time = formatTime(item.time, 'H:M');
		const [hours = '', minutes = ''] = formData.value.time.split(':');
		actualHours.value = hours;
		actualMinutes.value = minutes;
	}
	updateRules();
};

const localGetFormDataCallback = (data) => {
	if (actualHours.value || actualMinutes.value) {
		data.time = `${actualHours.value || '00'}:${actualMinutes.value || '00'}`;
	}
	return data;
};

const {
	itemId,
	removeItem,
	validateItemForm,
	getFormData,
	handleResetValidate,
} = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions,
	localGetFormDataCallback,
	deleteNewId,
	emit,
});

const removeCurrentItem = () => {
	removeItem();
	emit('calcTotalTime');
};

watch(
	() => ({ ...formData.value, actualHours: actualHours.value, actualMinutes: actualMinutes.value }),
	() => {
		updateRules();
		setTimeout(handleResetValidate, 10);
	},
	{ deep: true },
);

defineExpose({
	itemId,
	validateItemForm,
	getFormData,
	actualHours,
	actualMinutes,
});
</script>
