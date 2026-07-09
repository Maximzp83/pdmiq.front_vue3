<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<CustomTransition>
				<div
					key="tab-0"
					class="tab-container"
					:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
				>
					<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
						<CustomInput
							v-model="formData.name"
							:placeholder="`${tt('input')} ${tt('name')}`"
						/>
					</el-form-item>

					<el-form-item
						v-if="!hideCompanies && isIndustrialMatrix"
						:label="tt('Company')"
						prop="company_id"
					>
						<CustomSelectV2
							v-model="formData.company_id"
							filterable
							:optionsLoading="companiesLoading"
							:optionsList="companiesList"
							:placeholder="`${tt('Select')} ${tt('company')}`"
						/>
					</el-form-item>

					<el-form-item v-if="!hidePlants" :label="tt('plant')" prop="plant_id">
						<CustomSelectV2
							v-model="formData.plant_id"
							filterable
							:optionsLoading="plantsLoading"
							:optionsList="plantsList"
							:placeholder="`${tt('Select')} ${tt('plant')}`"
						/>
					</el-form-item>

					<el-form-item :label="`${tt('Controller')} ID`" prop="uuid">
						<el-input
							:model-value="formData.uuid"
							:placeholder="`${tt('input')} uuid`"
							@input="applyUUIDMask"
						/>
					</el-form-item>

					<el-form-item :label="tt('MAC_address')" prop="mac_address">
						<el-input
							:model-value="formData.mac_address"
							:placeholder="`${tt('example')}: 00:13:a2:00:41:f5:90:51`"
							@input="handleMacAddressInput"
						/>
					</el-form-item>

					<el-form-item :label="`${tt('constants.temperature')} ${tt('constants.warning_zone')}`" prop="temperature_warning_zone">
						<el-input-number v-model="formData.temperature_warning_zone" :min="0" />
					</el-form-item>

					<el-form-item :label="`${tt('constants.temperature')} ${tt('constants.alarm_zone')}`" prop="temperature_alarm_zone">
						<el-input-number v-model="formData.temperature_alarm_zone" :min="0" />
					</el-form-item>

					<el-form-item :label="tt('phrases.samples_to_alarm')" prop="crash_indication_threshold">
						<div class="flex">
							<el-input-number
								v-if="editAcute"
								v-model="formData.crash_indication_threshold"
								:min="1"
								:max="500"
							/>
							<div v-else class="bold value-instead-input" v-text="initCrashIndicationThreshold"></div>
							<div
								class="link underline value-instead-input toggle-link"
								v-text="editAcute ? tt('Cancel') : tt('Change')"
								@click="toggleProp('editAcute')"
							></div>
						</div>
						<div>
							{{ (editAcute ? formData.crash_indication_threshold : initCrashIndicationThreshold) * 5 }}
							minutes
						</div>
					</el-form-item>

					<el-form-item :label="tt('phrases.samples_to_settle')" prop="stable_samples">
						<div class="flex">
							<el-input-number
								v-if="editStableSamples"
								v-model="formData.stable_samples"
								:min="1"
							/>
							<div v-else class="bold value-instead-input" v-text="initStableSamples"></div>
							<div
								class="link underline value-instead-input toggle-link"
								v-text="editStableSamples ? tt('Cancel') : tt('Change')"
								@click="toggleProp('editStableSamples')"
							></div>
						</div>
						<div>
							{{ `${(editStableSamples ? formData.stable_samples : initStableSamples) * 5} ${tt('minutes')}` }}
						</div>
					</el-form-item>

					<el-form-item :label="tt('phrases.cloud_connection_type')" prop="cloud_connection_type">
						<CustomSelectV2
							v-model="formData.cloud_connection_type"
							:optionsList="cloudConnectionTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							labelKey="label"
						/>
					</el-form-item>

					<div
						v-show="formData.cloud_connection_type === CLOUD_CONNECTION_TYPES.CELL_MODEM"
						class="el-form-item"
					>
						<el-form-item :label="tt('phrases.router_SIM_card_number')" prop="router_sim_card_number">
							<CustomInput
								v-model="formData.router_sim_card_number"
								:placeholder="`${tt('input')} ${tt('number')}`"
							/>
						</el-form-item>
					</div>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	COMMUNICATE_METHODS,
	CLOUD_CONNECTION_TYPES,
	cloudConnectionTypesList as getCloudConnectionTypesList,
} from '@/constants/global';
import { required } from '@/constants/validation';
import { macAddressMask } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'ControllerItemFormNCD',
});

const props = defineProps(buildProps({
	hideCompanies: Boolean,
	hidePlants: Boolean,
	new_item_type: Number,
	additionalItemType: String,
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const companiesEntity = ENTITIES.Companies;
const plantsEntity = ENTITIES.Plants;

const itemFormRef = ref(null);
const editAcute = ref(false);
const initCrashIndicationThreshold = ref(5);
const editStableSamples = ref(false);
const initStableSamples = ref(10);

const companyPlantsList = shallowRef([]);
const companiesLoading = ref(false);
const companiesLoading2 = ref(false);
const companiesList = shallowRef([]);
const companiesList2 = shallowRef([]);
const plantsLoading = ref(false);
const plantsList = shallowRef([]);

const formData = ref({
	type: null,
	uuid: '',
	name: '',
	plant_id: null,
	company_id: null,
	temperature_warning_zone: 70,
	temperature_alarm_zone: 80,
	crash_indication_threshold: 5,
	stable_samples: 10,
	sensor_job_preprocess_math_expressions: [],
	configure_file: null,
	sb_file: null,
	communicate_method: COMMUNICATE_METHODS.MQTT,
	mac_address: '',
	cloud_connection_type: null,
	router_sim_card_number: '',
});

const rules = {
	name: required,
	plant_id: required,
	mac_address: {
		min: 23,
		message: 'Length should be 16 symbols',
		trigger: 'blur',
	},
};

const isIndustrialMatrix = computed(() => authStore.isIndustrialMatrix || authStore.isDeveloper);
const cloudConnectionTypesList = computed(() => Object.freeze(getCloudConnectionTypesList()));

const handleMacAddressInput = (str) => {
	formData.value.mac_address = macAddressMask(str);
};

const applyUUIDMask = (str) => {
	formData.value.uuid = str.replace(/[^a-zA-Z0-9-_]/g, '');
};

const toggleProp = (propName) => {
	if (propName === 'editAcute') {
		editAcute.value = !editAcute.value;
	}
	if (propName === 'editStableSamples') {
		editStableSamples.value = !editStableSamples.value;
	}
};

const localSetupPage = (item) => {
	if (item) {
		initCrashIndicationThreshold.value = item.crash_indication_threshold || 5;
		initStableSamples.value = item.stable_samples || 10;
		formData.value.crash_indication_threshold = initCrashIndicationThreshold.value;
		formData.value.stable_samples = initStableSamples.value;
		return;
	}

	if (props.new_item_type) {
		formData.value.type = props.new_item_type;
	}
};

const localPrepareSubmitData = (data) => {
	const preparedData = { ...data };

	if (!editAcute.value) {
		delete preparedData.crash_indication_threshold;
	}
	if (!editStableSamples.value) {
		delete preparedData.stable_samples;
	}
	if (!preparedData.configure_file) {
		delete preparedData.configure_file;
	}
	if (!preparedData.sb_file) {
		delete preparedData.sb_file;
	}

	return preparedData;
};

const localPrepareCollectedData = (dataArr = []) => {
	const data = [];

	for (const item of dataArr) {
		if (Object.values(item.data || {}).every((val) => !!val)) {
			data.push(item.data);
		}
	}

	return { data };
};

const methodsMap = {
	fetch_companies: createGetRequest(companiesEntity.apiBase),
	fetch_plants: createGetRequest(plantsEntity.apiBase),
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_companies,
			localProp: companiesList,
			localLoadProp: companiesLoading,
		},
		{
			action: methodsMap.fetch_plants,
			bindTo: [
				{
					getValue: () => formData.value.company_id,
					param: 'companyId',
					fetchAnyWay: !isIndustrialMatrix.value,
				},
			],
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
	])
);

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Controllers',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	fromAnotherInstance: props.fromAnotherInstance,
	new_item_type: props.new_item_type,
	localSetupPage,
	localPrepareSubmitData,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
	localPrepareCollectedData,
});
</script>
