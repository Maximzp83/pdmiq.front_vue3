<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			:class="['item-edit-form', { 'half-width': !fromModal }]"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Location')" prop="location_in_equipment" required>
				<CustomInput
					v-model="formData.location_in_equipment"
					:placeholder="`${tt('enter')} ${tt('location')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('data_set')" prop="data_set">
				<CustomSelectV2
					v-model="formData.data_set"
					:optionsList="manualRouteDataSetsList"
					:placeholder="`${tt('Select')} ${tt('dataset')}`"
					:setupLabelMethod="setupDataSetLabel"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { DATASET, SENSOR_TYPES, dataSetsList } from '@/constants/global';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSensors } from '@/composables/useSensors';

const { tt } = Lang;

defineOptions({
	name: 'SensorItemFormManualRoute',
});

const props = defineProps({
	equipmentData: { type: Object, default: () => ({}) },
	isNew: Boolean,
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	itemsName: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);
const { saveManualRouteSensor } = useSensors();
const itemFormRef = ref(null);
const formData = ref({
	equipment_id: null,
	location_in_equipment: '',
	data_set: DATASET.MANUAL_ROUTE_FFT,
});
const rules = Object.freeze({
	equipment_id: required,
	location_in_equipment: required,
	data_set: required,
});

const manualRouteDataSetsList = computed(() =>
	Object.freeze(
		dataSetsList().filter(
			item => item.controller_type === SENSOR_TYPES.MANUAL_ROUTE
		),
	),
);

const setupDataSetLabel = (item) =>
	`${item.label} ${item.alt_label ? `(${item.alt_label})` : ''}`;

const localSetupPageActions = () => {
	formData.value.equipment_id = props.equipmentData.id;
	formData.value.data_set = DATASET.MANUAL_ROUTE_FFT;
};

const localGetFormData = (data) => ({
	id: itemId.value,
	equipment_id: props.equipmentData.id,
	location_in_equipment: data.location_in_equipment,
	data_set: DATASET.MANUAL_ROUTE_FFT,
});

const toggleSubmitRequestResult = ({ isLoading, success } = {}) => {
	if (isLoading) {
		emit('event', { eventName: 'toggleSpinner', data: true });
		return;
	}

	emit('event', {
		eventName: 'handleFormSubmitFinish',
		data: { isLoading, success },
	});
};

const localSubmit = (data) => {
	toggleSubmitRequestResult({ isLoading: true });

	saveManualRouteSensor({
		data,
		itemName: 'Sensor',
	})
		.then((answer) => {
			const savedId = answer?.value?.id || answer?.data?.data?.id;
			if (savedId) {
				itemId.value = savedId;
			}
			toggleSubmitRequestResult({ isLoading: false, success: true });
		})
		.catch(() => {
			toggleSubmitRequestResult({ isLoading: false, success: false });
		});
};

const {
	isMobile,
	itemId,
	setupPage,
	validateItemForm,
	getFormData,
	submitItemForm,
} = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions,
	localGetFormData,
	localSubmit,
	emit,
});

watch(
	() => props.equipmentData?.id,
	(equipmentId) => {
		if (equipmentId) {
			formData.value.equipment_id = equipmentId;
		}
	},
	{ immediate: true },
);

watch(
	() => props.itemData,
	(item) => {
		setupPage(item);
	},
);

defineExpose({
	validateItemForm,
	getFormData,
	submitItemForm,
});
</script>
