<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row sensor-form"
			label-width="170px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="tab-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
				<div v-if="itemId" class="custom-form-item el-form-item">
					<div class="el-form-item__label">{{ tt('Sensor') }} id</div>
					<div class="value-instead-input el-form-item__content bold">{{ itemId }}</div>
				</div>

				<el-form-item :label="tt('Controller')" prop="controller_id">
					<FetchByQuerySelect
						v-model="formData.controller_id"
						clearable
						enableLoadmore
						:settings="controllersSelectSettings"
						:placeholder="`${tt('select')} ${tt('controller')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('Item')" prop="equipment_id">
					<FetchByQuerySelect
						v-model="formData.equipment_id"
						clearable
						enableLoadmore
						:settings="equipmentsSelectSettings"
						:placeholder="`${tt('select')} ${tt('item')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('Sensor_Type')" prop="data_set">
					<CustomSelectV2
						v-model="formData.data_set"
						:optionsList="dataSets"
						:placeholder="`${tt('select')} ${tt('type')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('Location')" prop="location_in_equipment">
					<CustomInput v-model="formData.location_in_equipment" :placeholder="tt('location')" />
				</el-form-item>

				<el-form-item :label="tt('lube_method')" prop="lube_method">
					<CustomSelectV2
						v-model="formData.lube_method"
						:optionsList="lubeMethods"
						:placeholder="`${tt('select')} ${tt('method')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('Archive')" prop="is_archived">
					<el-switch v-model="formData.is_archived" :active-value="1" :inactive-value="0" />
				</el-form-item>
			</div>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { api_request } from '@/api/request_provider';
import { DATASET, SENSOR_TYPES, dataSetsList } from '@/constants/global';
import { lubeMethodsList } from '@/constants/ultrasound';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';

import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'SensorItemFormUltraSound',
});

const props = defineProps(buildProps({
	equipmentData: { type: Object, default: () => ({}) },
	isNew: Boolean,
	fromBannerSensorForm: Boolean,
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const initialFormData = {
	id: null,
	type: SENSOR_TYPES.ULTRA_SOUND,
	controller_id: null,
	equipment_id: props.equipmentData?.id || null,
	data_set: DATASET.ULTRA_SOUND_DECIBELS,
	location_in_equipment: '',
	lube_method: null,
	is_archived: 0,
};
const formData = ref({ ...initialFormData });

const dataSets = computed(() =>
	dataSetsList().filter((item) => item.controller_type === SENSOR_TYPES.ULTRA_SOUND),
);
const lubeMethods = computed(() => lubeMethodsList());

const rules = {
	controller_id: required,
	equipment_id: required,
	data_set: required,
};

const controllersSelectSettings = computed(() => ({
	fetchAction: (payload) => api_request.get('/controllers', { notNotify: true, ...payload }),
	fetchByIdAction: ({ itemId }) => api_request.get(`/controllers/${itemId}`, { notNotify: true }),
	params: { max: 100, type: SENSOR_TYPES.ULTRA_SOUND },
}));

const equipmentsSelectSettings = computed(() => ({
	fetchAction: (payload) => api_request.get('/equipments', { notNotify: true, ...payload }),
	fetchByIdAction: ({ itemId }) => api_request.get(`/equipments/${itemId}`, { notNotify: true }),
	params: { max: 100 },
}));

const localPrepareSubmitData = (data) => ({
	...data,
	type: SENSOR_TYPES.ULTRA_SOUND,
});

const localSubmit = (preparedData) => {
	emit('submit', preparedData);
};

const {
	isMobile,
	itemId,
	validateForm,
	handleCancel,
} = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	initialFormData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	entityKey: 'Sensors',
	localPrepareSubmitData,
	localSubmit,
	emit,
});

defineExpose({
	validateForm,
});
</script>
