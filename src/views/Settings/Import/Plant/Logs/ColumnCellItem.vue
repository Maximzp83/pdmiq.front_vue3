<template>
	<div
		:class="[
			'table-cell',
			{ hasError: hasError || hasProdlineWithoutMachine },
			{ 'flex align-center': enableAlternateModal },
		]"
	>
		<el-checkbox
			v-if="enableParallelCheckbox"
			v-model="parallelIsChecked"
			class="parallel-checkbox"
		/>

		<el-checkbox
			v-if="enableCheckbox"
			v-model="columnIsChecked"
		>
			{{ initialValue }}
		</el-checkbox>

		<CustomInput
			v-else-if="enableInput"
			v-model="value"
			className="is-error"
			placeholder=" "
		/>

		<RadioButtonsBlock
			v-else-if="enableRadio"
			:value="action"
			:settings="radioSettings"
			:optionsList="radioOptionsList"
			@onChange="radioChange"
		/>

		<CustomSelectV2
			v-else-if="enableSelect"
			v-model="selectedValue"
			filterable
			clearable
			:optionsList="selectOptionsList"
			:optionsLoading="selectOptionsLoading"
			:placeholder="tt('select')"
			@change="handleSelectChange"
		/>

		<span v-else v-text="cellData.value || '-'"></span>

		<el-dialog
			v-if="enableAlternateModal"
			v-model="showAlternateModal"
			center
			:show-close="false"
			append-to-body
			class="small rounded hide-header hide-body"
		>
			<AlternateOptionsList
				showClose
				:options="alternateOptions"
				@radioChange="handleAlternateValue"
				@closeDialog="showAlternateModal = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';

import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import AlternateOptionsList from './AlternateOptionsList.vue';

const { tt } = Lang;

defineOptions({ name: 'ImportColumnCellItem' });

const props = defineProps({
	cellData: { type: Object, required: true },
	enableInputProp: Boolean,
	enableRadioProp: null,
	hasProdlineWithoutMachine: Boolean,
	hasStoreroomAndLocationConflict: Boolean,
	plantId: Number,
});
const emit = defineEmits(['event']);

const fetchMachinesRequest = createGetRequest(ENTITIES.Machines.apiBase);
const initialValue = ref(null);
const columnIsChecked = ref(false);
const parallelIsChecked = ref(false);
const isRequired = ref(false);
const value = ref(null);
const action = ref(null);
const selectOptionsList = ref([]);
const selectOptionsLoading = ref(false);
const selectedValue = ref(null);
const showAlternateModal = ref(false);
const updatingValue = ref(null);

const errorItem = computed(() => props.cellData.errorItem);
const hasError = computed(() => !!errorItem.value);
const enableAlternateModal = computed(() => !!errorItem.value?.is_predefined);
const alternateOptions = computed(() =>
	errorItem.value?.existing_values
		? errorItem.value.existing_values.map((item) => ({ id: item, name: item }))
		: [],
);
const enableRadio = computed(() =>
	!!errorItem.value &&
	!!(props.enableRadioProp || (errorItem.value.imported_value && errorItem.value.existing_values)),
);
const enableSelect = computed(() =>
	props.hasProdlineWithoutMachine && !!errorItem.value && props.cellData.column_name === 'machine_name',
);
const enableInput = computed(() =>
	!!errorItem.value &&
	(props.enableInputProp || (!enableRadio.value && !enableSelect.value && !errorItem.value.imported_value)),
);
const enableCheckbox = computed(() => {
	if (props.hasStoreroomAndLocationConflict && errorItem.value) {
		return errorItem.value.column_name === 'storeroom' || errorItem.value.column_name === 'location';
	}
	if (props.hasProdlineWithoutMachine && errorItem.value) {
		return props.cellData.column_name === 'production_line_name';
	}
	return false;
});
const enableParallelCheckbox = computed(() => {
	if (props.hasProdlineWithoutMachine && errorItem.value) {
		if (props.cellData.column_name === 'machine_name') return true;
		if (props.cellData.column_name === 'production_line_name') return true;
	}
	return false;
});
watch(
	[enableParallelCheckbox, () => props.cellData.column_name],
	([enabled, columnName]) => {
		if (enabled && columnName === 'production_line_name') {
			columnIsChecked.value = true;
		}
	},
	{ immediate: true },
);
const radioOptionsList = computed(() => {
	if (props.enableRadioProp) return props.enableRadioProp.radioOptionsList;
	if (!errorItem.value || !enableRadio.value) return [];

	const { existing_values: existingValues, imported_value: importedValue, is_predefined: isPredefined } = errorItem.value;
	const list = [{ id: 1, name: `In System ${existingValues ? existingValues.join(', ') : '-'}` }];
	if (isPredefined && existingValues) list.push({ id: 2, name: `Update ${updatingValue.value || ''}` });
	list.push({ id: 3, name: `Import ${importedValue}` });
	return Object.freeze(list);
});
const radioSettings = Object.freeze({
	className: 'el-checkbox',
	inline: true,
	isCheckbox: true,
	alwaysSwitch: true,
});

const fetchMachines = () => {
	selectOptionsLoading.value = true;
	fetchMachinesRequest({ params: { plantId: props.plantId } })
		.then(({ value: items }) => {
			selectOptionsList.value = items || [];
		})
		.finally(() => {
			selectOptionsLoading.value = false;
		});
};
const handleSelectChange = (id) => {
	const item = findItemBy('id', id, selectOptionsList.value);
	value.value = item ? item.name : null;
};
const handleAlternateValue = (nextValue) => {
	updatingValue.value = nextValue;
};
const radioChange = (nextAction) => {
	action.value = nextAction;
	updatingValue.value = null;
	if (nextAction === 1) value.value = null;
	if (nextAction === 2) {
		value.value = errorItem.value.imported_value;
		showAlternateModal.value = true;
	}
	if (nextAction === 3) value.value = errorItem.value.imported_value;
};
const getFormData = () => {
	const data = {
		log_item_id: errorItem.value ? errorItem.value.id : null,
		column_name: props.cellData.column_name,
		value: value.value,
	};
	if (enableRadio.value) {
		data.action = action.value;
		data.updating_value = updatingValue.value;
	}
	return {
		data,
		isValid: isRequired.value ? !!value.value : true,
	};
};

watch(columnIsChecked, (isChecked) => {
	value.value = isChecked ? initialValue.value : '';
	if (props.cellData.pair_column_name) {
		emit('event', {
			eventName: 'handleColumnChecked',
			data: {
				column_name: props.cellData.column_name,
				pair_column_name: props.cellData.pair_column_name,
				is_checked: isChecked,
			},
		});
	}
});
watch(parallelIsChecked, (isChecked) => {
	isRequired.value = isChecked;
	if (!isChecked) {
		value.value = '';
		selectedValue.value = null;
	}
});

onBeforeMount(() => {
	if (enableCheckbox.value) initialValue.value = props.cellData.value;
	if (enableSelect.value) fetchMachines();
	if (enableParallelCheckbox.value && props.cellData.column_name === 'machine_name') {
		parallelIsChecked.value = true;
	}
});

defineExpose({
	columnIsChecked,
	getFormData,
});
</script>
