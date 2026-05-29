<template>
	<el-form
		ref="itemFormRef"
		class="item-edit-form content-row"
		label-width="150px"
		:model="formData"
		:rules="rules"
		label-position="top"
	>
		<div class="content-row">
			<b>{{ `${tt('Lubricator')} ${tt('configuration')}` }}</b>
		</div>

		<div class="content-row">
			<el-form-item :label="`${tt('Lubricator')} ${tt('type')}`" prop="type" class="mcol-lg-6">
				<CustomSelectV2
					v-model="formData.type"
					:optionsList="pumpTypes"
					:placeholder="`${tt('Select')} ${tt('type')}`"
				/>
			</el-form-item>
		</div>

		<div class="form-section paint content-row items_width_180">
			<div v-show="formData.type === PUMP_TYPES.PULSAR" class="flex mrow wrap content-row">
				<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('Grease_pack')" prop="lubricant_container">
					<CustomSelectV2
						v-model="formData.lubricant_container"
						:optionsList="greasePacks"
						:placeholder="`${tt('select')} ${tt('pack')}`"
						labelKey="label"
						valueKey="val"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.Modes_of_Cycles')" prop="lube_cycle_max_count">
					<CustomSelectV2
						v-model="formData.lube_cycle_max_count"
						:optionsList="numberOfCyclesList"
						:placeholder="`${tt('select')} ${tt('mode')}`"
						labelKey="label"
						valueKey="val"
					/>
					<span class="input-description bold right-outside">{{ totalLubeLevel }}</span>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-md-6" :label="`${tt('Warning')} ${tt('Level')}`" prop="lube_cycle_warning_count">
					<el-input-number v-model="formData.lube_cycle_warning_count" :min="0" />
				</el-form-item>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">{{ tt('phrases.lube_cycle_spent_count') }}</div>
					<div class="value-instead-input el-form-item__content bold">{{ formData.lube_cycle_spent_count }}</div>
				</div>
			</div>

			<div v-show="formData.type === PUMP_TYPES.PERMA" class="flex mrow wrap">
				<el-form-item class="mcol-xs-12 mcol-md-6" :label="`${tt('Lubricant')} ${tt('type')}`" prop="lubricant_type_id">
					<CustomSelectV2
						v-model="formData.lubricant_type_id"
						:optionsLoading="lubeTypesLoading"
						:optionsList="lubeTypesList"
						:placeholder="`${tt('Select')} ${tt('type')}`"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-md-6" :label="`${tt('Lubricant')} ${tt('Cartridge')}`" prop="lubricant_container">
					<CustomSelectV2
						v-model="formData.lubricant_container"
						:optionsList="lubricantCartridges"
						:placeholder="`${tt('select')} ${tt('cartridge')}`"
						labelKey="label"
						valueKey="val"
					/>
				</el-form-item>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">{{ `${tt('Lubricant')} ${tt('Density')}` }} (g/cm3)</div>
					<div class="value-instead-input el-form-item__content bold"></div>
				</div>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">{{ tt('phrases.Lube Cycles Per Cartridge') }}</div>
					<div class="value-instead-input el-form-item__content bold">{{ permaLubeCyclesPerCartridge }}</div>
				</div>

				<el-form-item class="mcol-xs-12 mcol-md-6" label="Lubricant Amount (cm3/cycle)" prop="lubricant_amount">
					<CustomSelectV2
						v-model="formData.lubricant_amount"
						:optionsList="lubricantAmountsList"
						:placeholder="`${tt('select')} ${tt('Amount')}`"
						labelKey="label"
						valueKey="val"
					/>
				</el-form-item>

				<el-form-item class="mcol-xs-12 mcol-md-6" :label="`${tt('Warning')} ${tt('Level')}`" prop="lube_cycle_warning_count">
					<el-input-number v-model="formData.lube_cycle_warning_count" :min="0" />
				</el-form-item>
			</div>
		</div>

		<div v-show="formData.type === PUMP_TYPES.PERMA" class="content-row">
			<b>{{ `${tt('Lubrication')} ${tt('Amount')}` }}</b>
		</div>

		<div v-show="formData.type === PUMP_TYPES.PERMA" class="form-section paint content-row items_width_180">
			<div class="flex mrow wrap content-row">
				<div
					v-for="item in calculatedRows"
					:key="item.key"
					class="el-form-item mcol-xs-12 mcol-md-6"
				>
					<div class="el-form-item__label">{{ item.label }}</div>
					<div class="value-instead-input el-form-item__content bold">
						{{ calculatedLubesData[item.key] || '-' }}
					</div>
				</div>
			</div>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { PUMP_TYPES, pumpTypesList } from '@/constants/global';
import {
	greasePacksList,
	pulsarLubeLevelStep,
	lubricantCartridgeList,
} from '@/constants/ultrasound';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'SensorItemFormPump',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	equipmentData: { type: Object, default: () => ({}) },
	isNew: Boolean,
	lubeTypesList: { type: Array, default: () => [] },
	lubeTypesLoading: Boolean,
	calculatedLubesData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event', 'onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	type: null,
	sensor_id: null,
	lubricant_container: null,
	lube_cycle_max_count: null,
	lube_cycle_warning_count: 20,
	lube_cycle_spent_count: 0,
	lubricant_type_id: null,
	lubricant_amount: null,
});

const rules = ref({
	type: required,
	sensor_id: required,
	lubricant_container: required,
	lube_cycle_max_count: required,
	lubricant_amount: null,
});

const pumpTypes = computed(() => Object.freeze(pumpTypesList()));
const greasePacks = computed(() => Object.freeze(greasePacksList()));
const lubricantCartridges = computed(() => Object.freeze(lubricantCartridgeList()));

const numberOfCyclesList = computed(() => {
	if (formData.value.lubricant_container) {
		const pack = findItemBy('val', formData.value.lubricant_container, greasePacks.value);
		if (pack) return Object.freeze(pack.cyclesList);
	}
	return [];
});

const lubricantAmountsList = computed(() => {
	if (formData.value.lubricant_container) {
		const pack = findItemBy(
			'val',
			formData.value.lubricant_container,
			lubricantCartridges.value,
		);
		if (pack) return Object.freeze(pack.amountsList);
	}
	return [];
});

const permaLubeCyclesPerCartridge = computed(() => {
	if (formData.value.type === PUMP_TYPES.PERMA && formData.value.lubricant_amount) {
		const item = findItemBy('val', formData.value.lubricant_amount, lubricantAmountsList.value);
		if (item) return Object.freeze(item.pos);
	}
	return 0;
});

const totalLubeLevel = computed(() => {
	const { lube_cycle_max_count, lubricant_container } = formData.value;
	if (lubricant_container && lube_cycle_max_count && numberOfCyclesList.value.length) {
		const selectedItem = findItemBy('val', lube_cycle_max_count, numberOfCyclesList.value);
		if (selectedItem) {
			return `${selectedItem.pos * pulsarLubeLevelStep.val}${pulsarLubeLevelStep.unit}`;
		}
	}
	return 0;
});

const calculatedRows = computed(() => [
	{
		key: 'totalGramsLubricantDeliveredInAllSets',
		label: `${tt('phrases.total_lubricant_dilevered_in_all_sets')} (g)`,
	},
	{
		key: 'totalPercentLubricantDeliveredInAllSets',
		label: `${tt('phrases.total_lubricant_dilevered_in_all_sets')} (% of CQ)`,
	},
	{
		key: 'targetLubricantPerCycle',
		label: `${tt('phrases.target_lubricant_per_cycle')} (g)`,
	},
	{
		key: 'actualLubricantPerCycle',
		label: `${tt('phrases.actual_lubricant_per_cycle')} (g)`,
	},
]);

const localSetupPageActions = (itemData = {}) => {
	if (!itemData.type) {
		formData.value.type = PUMP_TYPES.PULSAR;
	}
};

const localGetFormDataCallback = (data) => {
	const nextData = { ...data };
	if (nextData.type !== PUMP_TYPES.PULSAR) {
		delete nextData.lube_cycle_max_count;
	}
	if (nextData.type !== PUMP_TYPES.PERMA) {
		delete nextData.lubricant_amount;
	}
	return nextData;
};

const handleCalculateData = () => {
	const { lubricant_type_id, lubricant_amount } = formData.value;
	if (lubricant_type_id && lubricant_amount) {
		emit('event', {
			eventName: 'calculateLubeParams',
			data: { lubricant_type_id, lubricant_amount },
		});
	}
};

const { validateItemForm, getFormData, removeItem, isInitialSetup, handleResetValidate } =
	useSubItem({
		itemData: computed(() => props.itemData),
		formData,
		itemFormRef,
		localSetupPageActions,
		localGetFormDataCallback,
		emit,
	});

watch(
	() => formData.value.lube_cycle_max_count,
	(value) => {
		if (!isInitialSetup.value) {
			formData.value.lube_cycle_warning_count = value - 10;
		}
	},
);

watch(
	() => formData.value.type,
	(type) => {
		if (!isInitialSetup.value) {
			formData.value.lubricant_container = null;
		}
		rules.value.lube_cycle_max_count = type === PUMP_TYPES.PULSAR ? required : null;
		rules.value.lubricant_amount = type === PUMP_TYPES.PERMA ? required : null;
		emit('event', { eventName: 'setPumpType', data: type });
	},
);

watch(
	() => formData.value.lubricant_container,
	() => {
		if (!isInitialSetup.value) {
			formData.value.lube_cycle_max_count = null;
			formData.value.lubricant_amount = null;
		}
	},
);

watch(() => formData.value.lubricant_type_id, handleCalculateData);
watch(() => formData.value.lubricant_amount, handleCalculateData);

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
	handleResetValidate,
});
</script>
