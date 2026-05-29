<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row controller-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<CustomTransition>
				<div
					v-show="activeTab.prop === 'mainTabActive'"
					key="tab-0"
					class="tab-container"
					:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
				>
					
						<div v-if="itemId" class="custom-form-item el-form-item">
							<div class="el-form-item__label">{{ tt('Controller') }} id</div>
							<div class="value-instead-input el-form-item__content bold" v-text="itemId"></div>
						</div>

						<el-form-item :label="tt('Type')" prop="command_topic_type">
							<CustomSelectV2
								v-model="formData.command_topic_type"
								:optionsList="controllerTopicTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
							/>
						</el-form-item>

						<el-form-item label="UUID" prop="uuid">
							<CustomInput v-model="formData.uuid" :placeholder="`${tt('input')} uuid`" />
						</el-form-item>

						<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
							<CustomInput v-model="formData.name" :placeholder="`${tt('input')} ${tt('name')}`" />
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

						<el-form-item :label="`${tt('constants.temperature')} ${tt('constants.warning_zone')}`" prop="temperature_warning_zone">
							<el-input-number v-model="formData.temperature_warning_zone" :min="0" />
						</el-form-item>

						<el-form-item :label="`${tt('constants.temperature')} ${tt('constants.alarm_zone')}`" prop="temperature_alarm_zone">
							<el-input-number v-model="formData.temperature_alarm_zone" :min="0" />
						</el-form-item>

						<el-form-item :label="tt('phrases.Acute_samples')" prop="crash_indication_threshold">
							<div class="flex">
								<el-input-number v-if="editAcute" v-model="formData.crash_indication_threshold" :min="1" />
								<div v-else class="bold value-instead-input" v-text="initCrashIndicationThreshold"></div>
								<div
									class="link underline value-instead-input toggle-link"
									v-text="editAcute ? tt('Cancel') : tt('Change')"
									@click="toggleProp('editAcute')"
								></div>
							</div>
						</el-form-item>

						<el-form-item :label="tt('phrases.Stable_samples')" prop="stable_samples">
							<div class="flex">
								<el-input-number v-if="editStableSamples" v-model="formData.stable_samples" :min="1" />
								<div v-else class="bold value-instead-input" v-text="initStableSamples"></div>
								<div
									class="link underline value-instead-input toggle-link"
									v-text="editStableSamples ? tt('Cancel') : tt('Change')"
									@click="toggleProp('editStableSamples')"
								></div>
							</div>
						</el-form-item>

						<el-form-item :label="tt('time_zone')" prop="time_zone">
							<CustomSelectV2
								v-model="formData.time_zone"
								:optionsList="timeZonesList"
								:placeholder="`${tt('select')} ${tt('time_zone')}`"
								labelKey="label"
							/>
						</el-form-item>

						<el-form-item :label="tt('phrases.Commucate_method')" prop="communicate_method">
							<CustomSelectV2
								v-model="formData.communicate_method"
								:optionsList="communicateMethodsList"
								:placeholder="`${tt('select')} ${tt('method')}`"
								labelKey="label"
							/>
						</el-form-item>

						<el-form-item :label="tt('phrases.Connection_Type')" prop="connection_type">
							<CustomSelectV2
								v-model="formData.connection_type"
								:optionsList="connectionTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
								labelKey="label"
							/>
						</el-form-item>

						<el-form-item :label="tt('phrases.binding_code')" prop="binding_code">
							<CustomInput v-model="formData.binding_code" :placeholder="`${tt('input')} ${tt('code')}`" />
						</el-form-item>

						<div v-if="itemData && itemData.device_data" class="el-form-item info-list">
							<div class="info-item">
								<div class="div-block"><b>{{ tt('phrases.Script_version') }}</b>:</div>
								<div class="div-block info">
									{{ itemData.device_data.HMI_Interface_Prg ? itemData.device_data.HMI_Interface_Prg / 100 : '' }}
								</div>
							</div>

							<div class="info-item">
								<div class="div-block"><b>{{ tt('phrases.Binding_code') }}</b>:</div>
								<div class="div-block info">{{ itemData.device_data.Binding_Code }}</div>
							</div>
						</div>

						<el-form-item :label="tt('phrases.cloud_connection_type')" prop="cloud_connection_type">
							<CustomSelectV2
								v-model="formData.cloud_connection_type"
								:optionsList="cloudConnectionTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
								labelKey="label"
							/>
						</el-form-item>

						<div v-show="formData.cloud_connection_type === CLOUD_CONNECTION_TYPES.CELL_MODEM" class="el-form-item">
							<el-form-item :label="tt('phrases.router_sim_card_number')" prop="router_sim_card_number">
								<CustomInput v-model="formData.router_sim_card_number" :placeholder="`${tt('input')} ${tt('number')}`" />
							</el-form-item>

							<el-form-item :label="tt('phrases.router_serial_number')" prop="router_serial_number">
								<CustomInput v-model="formData.router_serial_number" :placeholder="`${tt('input')} ${tt('router_number')}`" />
							</el-form-item>
						</div>

						<el-form-item class="upload-form-item" :label="`${tt('Cofigure')} ${tt('file')}`" prop="configure_file">
							<FileUploadBlock
								:ref="(el) => setSubItemRef('FileUploadBlock1', el, 0)"
								uploadBlockType="inline"
								deleteFileId
								showDeleteButton
								keepFilePath
								:enableLinkToFile="!!itemId && !!itemData?.configure_file_link && !configFileChanged"
								filePropName="configure_file"
								accept=".xml"
								:buttonText="tt('phrases.click_to_upload')"
								buttonIcon=" "
								buttonClass=" "
								:pictures="itemConfigFile"
								@onSelectFile="configFileChanged = true"
							/>
						</el-form-item>

						<el-form-item class="upload-form-item" :label="`${tt('Script')} ${tt('file')}`" prop="sb_file">
							<FileUploadBlock
								:ref="(el) => setSubItemRef('FileUploadBlock2', el, 0)"
								uploadBlockType="inline"
								deleteFileId
								keepFilePath
								:enableLinkToFile="!!itemId && !!itemData?.sb_file_link && !SBFileChanged"
								filePropName="sb_file"
								:buttonText="tt('phrases.click_to_upload')"
								buttonIcon=" "
								buttonClass=" "
								:pictures="itemSBFile"
								accept=" "
								@onSelectFile="SBFileChanged = true"
							/>
						</el-form-item>
				</div>

				<div
					v-if="isFormulasTabPresent"
					v-show="activeTab.prop === 'formulasTabActive'"
					key="tab-1"
					class="tab-container standard-form"
				>
					<div class="form-header content-row full-width-background">
						<div :class="{ 'width-75': !isMobile }">
							<div class="mrow flex uppercase">
								<div class="mcol-xs-4">{{ tt('phrases.Sensor_parameter') }}</div>
								<div class="mcol-xs-4">{{ tt('phrases.For_incoming_registers') }}</div>
								<div class="mcol-xs-4">{{ tt('phrases.Reverse_formula') }}</div>
							</div>
						</div>
					</div>

					<div class="content-row" :class="{ 'width-75': !isMobile }">
						<FormulasRow
							v-for="item in sensorParametersList"
							:key="`formulas_parameter-${item.id}`"
							class="form-row inline"
							:item-data="item"
							:formulasData="formData.sensor_job_preprocess_math_expressions"
						/>
					</div>
				</div>

				<div
					v-if="isDXMCommandsTabPresent"
					v-show="activeTab.prop === 'commandsTabActive'"
					key="tab-2"
					class="tab-container standard-form"
				>
					<DXMCommandsTab
						:topicType="formData.command_topic_type"
						:controllerData="itemData"
					/>
				</div>

				<div
					v-if="isDevicesTabPresent"
					v-show="activeTab.prop === 'devicesTabActive'"
					key="tab-3"
					class="tab-container"
				>
					<BannerSensorsList
						insideOtherPage
						:propsFilters="sensorsListFilters"
					/>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				v-if="
					!fromModal &&
					(!isDXMCommandsTabPresent || activeTab.prop !== 'commandsTabActive') &&
					(!isDevicesTabPresent || activeTab.prop !== 'devicesTabActive')
				"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, reactive, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	communicateMethodsList,
	connectionTypesList,
	CLOUD_CONNECTION_TYPES,
	cloudConnectionTypesList as getCloudConnectionTypesList,
	controllerTopicTypesList as getControllerTopicTypesList,
} from '@/constants/global';
import { timeZonesList as getTimeZonesList } from '@/constants/date_time';
import { required } from '@/constants/validation';
import { sensorParametersList as getSensorParametersList } from '@/modules/charts_factory/controllers/Sensor/enums';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const FormulasRow = defineAsyncComponent(() => import('./FormulasRow.vue'));
const DXMCommandsTab = defineAsyncComponent(() => import('./DXMCommandsTab.vue'));
const BannerSensorsList = defineAsyncComponent(() => import('../Sensors/BannerSensorsList.vue'));

const { tt } = Lang;

defineOptions({
	name: 'ControllerItemForm',
});

const props = defineProps(buildProps({
	hideCompanies: Boolean,
	hidePlants: Boolean,
	activeTab: { type: Object, required: true },
	tabsList: { type: Array, required: true },
	new_item_type: Number,
	additionalItemType: String,
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const companiesEntity = ENTITIES.Companies;
const plantsEntity = ENTITIES.Plants;

const itemFormRef = ref(null);
const refsMap = reactive({});

const configFileChanged = ref(false);
const SBFileChanged = ref(false);
const editAcute = ref(false);
const initCrashIndicationThreshold = ref(5);
const editStableSamples = ref(false);
const initStableSamples = ref(10);

const companiesLoading = ref(false);
const companiesList = shallowRef([]);
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
	time_zone: 0,
	configure_file: null,
	sb_file: null,
	communicate_method: null,
	connection_type: null,
	binding_code: '',
	cloud_connection_type: null,
	router_sim_card_number: '',
	router_serial_number: '',
	command_topic_type: null,
});

const rules = {
	name: required,
	plant_id: required,
};

const isIndustrialMatrix = computed(() => authStore.isIndustrialMatrix || authStore.isDeveloper);
const sensorParametersList = computed(() => Object.freeze(getSensorParametersList()));
const timeZonesList = computed(() => Object.freeze(getTimeZonesList()));
const cloudConnectionTypesList = computed(() => Object.freeze(getCloudConnectionTypesList()));
const controllerTopicTypesList = computed(() => Object.freeze(getControllerTopicTypesList()));

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'FileUploadBlock2' },
		{ ref: 'FileUploadBlock1', cleanIfEmpty: { prop: 'configure_file', val: null } },
	])
);

const isDXMCommandsTabPresent = computed(() =>
	props.tabsList.some((tab) => tab.prop === 'commandsTabActive')
);
const isFormulasTabPresent = computed(() =>
	props.tabsList.some((tab) => tab.prop === 'formulasTabActive')
);
const isDevicesTabPresent = computed(() =>
	props.tabsList.some((tab) => tab.prop === 'devicesTabActive')
);

const sensorsListFilters = computed(() =>
	props.itemData
		? Object.freeze({
				controllerId: itemId.value,
				dataSet: [],
			})
		: {}
);

const itemConfigFile = computed(() => {
	if (props.itemData?.configure_file_link) {
		return [
			{
				file_path: props.itemData.configure_file_link,
				name: props.itemData.configure_file_name,
			},
		];
	}

	return [];
});

const itemSBFile = computed(() => {
	if (props.itemData?.sb_file_link) {
		return [{ file_path: props.itemData.sb_file_link, name: props.itemData.sb_file_name }];
	}

	return [];
});

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

	preparedData.sensor_job_preprocess_math_expressions = (
		preparedData.sensor_job_preprocess_math_expressions || []
	).filter((expression) => expression.math_expression && expression.math_expression_back);

	return preparedData;
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

const {
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	setSubItemRef,
} = useSubItemsList({
	formData,
	refsMap,
});

const { isMobile, itemId, validateForm, handleCancel } = useItemForm({
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
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
});
</script>
