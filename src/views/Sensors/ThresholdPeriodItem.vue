<template>
	<el-form
		ref="itemFormRef"
		class="option-item-container relative"
		:model="formData"
		:rules="rules"
		label-position="top"
	>
		<div class="flex mrow">
			<el-form-item
				:label="isHumiditySensor ? tt('constants.High_zone') : tt('constants.Alarm_zone')"
				prop="alarm_zone"
			>
				<el-input-number v-model="formData.alarm_zone" :min="formData.warning_zone" />
			</el-form-item>

			<el-form-item
				prop="warning_zone"
				class="content-row"
				:label="isHumiditySensor ? tt('constants.Low_zone') : tt('constants.Warning_zone')"
			>
				<el-input-number
					v-model="formData.warning_zone"
					:min="0"
					:max="formData.alarm_zone"
				/>
			</el-form-item>

			<el-form-item :label="tt('Months')" prop="months">
				<el-select
					v-model="formData.months"
					multiple
					:placeholder="`${tt('select')} ${tt('months')}`"
					class="multiple-select"
				>
					<el-option
						v-for="item in filteredMonthsList"
						:key="`months-${item.id}`"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item label=" ">
				<el-button
					class="action-button inverted"
					size="small"
					type="primary"
					@click="removeItem"
				>
					<i class="icomoon icon-cross remove-button"></i>
				</el-button>
			</el-form-item>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt, translate } = Lang;

defineOptions({
	name: 'ThresholdPeriodItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	isOffAlarm: Boolean,
	isMobile: Boolean,
	selectedMonths: { type: Array, default: () => [] },
	isHumiditySensor: Boolean,
});

const emit = defineEmits(['onRemove', 'selectMonth']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	baseline_zone: 0,
	warning_zone: 0,
	alarm_zone: 0,
	critical_alarm_zone: 0,
	custom_zone: 0,
	normal_zone: 0,
	months: [],
});

const rules = {
	warning_zone: required,
	alarm_zone: required,
};

const monthsList = computed(() =>
	translate([
		{ id: 1, name: 'constants.Jan' },
		{ id: 2, name: 'constants.Feb' },
		{ id: 3, name: 'constants.Mar' },
		{ id: 4, name: 'constants.Apr' },
		{ id: 5, name: 'constants.May' },
		{ id: 6, name: 'constants.Jun' },
		{ id: 7, name: 'constants.Jul' },
		{ id: 8, name: 'constants.Aug' },
		{ id: 9, name: 'constants.Sept' },
		{ id: 10, name: 'constants.Oct' },
		{ id: 11, name: 'constants.Nov' },
		{ id: 12, name: 'constants.Dec' },
	]),
);

const filteredMonthsList = computed(() =>
	monthsList.value.filter(
		(month) =>
			!props.selectedMonths.some((id) => id === month.id) ||
			formData.value.months.some((id) => id === month.id),
	),
);

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

watch(
	() => formData.value.months,
	(ids) => {
		emit('selectMonth', ids);
	},
	{ deep: true },
);

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
	formData,
});
</script>
