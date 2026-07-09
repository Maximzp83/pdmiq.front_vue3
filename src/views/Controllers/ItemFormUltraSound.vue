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
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="itemId"
						></div>
					</div>

					<el-form-item v-if="itemId" :label="tt('Type')" prop="type">
						<CustomSelectV2
							v-model="formData.type"
							:optionsList="controllerTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							labelKey="alt_name"
						/>
					</el-form-item>

					<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
						<CustomInput v-model="formData.name" :placeholder="`${tt('input')} ${tt('name')}`" />
					</el-form-item>

					<el-form-item :label="`${tt('Site')} ID`" prop="uuid">
						<CustomInput v-model="formData.uuid" :placeholder="`${tt('input')} ID`" />
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

					<el-form-item :label="tt('phrases.cloud_connection_type')" prop="cloud_connection_type"
						class="content-row"
					>
						<CustomSelectV2
							v-model="formData.cloud_connection_type"
							:optionsList="cloudConnectionTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							labelKey="label"
						/>
					</el-form-item>

					<div
						v-show="formData.cloud_connection_type === CLOUD_CONNECTION_TYPES.CELL_MODEM"
						class="content-row"
					>
						<el-form-item :label="tt('phrases.router_SIM_card_number')" prop="router_sim_card_number">
							<CustomInput v-model="formData.router_sim_card_number" :placeholder="`${tt('input')} ${tt('number')}`" />
						</el-form-item>

						<el-form-item :label="tt('phrases.router_serial_number')" prop="router_serial_number">
							<CustomInput v-model="formData.router_serial_number" :placeholder="`${tt('input')} ${tt('router_number')}`" />
						</el-form-item>
					</div>
				</div>

				<div
					v-if="isDXMCommandsTabPresent"
					v-show="activeTab.prop === 'commandsTabActive'"
					key="tab-2"
					class="tab-container standard-form"
				>
					<DXMCommandsTab
						:controllerData="itemData"
						:topicType="CONTROLLER_TOPIC_TYPES.PDM"
					/>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				v-if="!fromModal && (!isDXMCommandsTabPresent || activeTab.prop !== 'commandsTabActive')"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	communicateMethodsList,
	connectionTypesList,
	CLOUD_CONNECTION_TYPES,
	cloudConnectionTypesList as getCloudConnectionTypesList,
	controllerTypesList as getControllerTypesList,
	CONTROLLER_TYPES,
	CONTROLLER_TOPIC_TYPES,
} from '@/constants/global';
import { timeZonesList as getTimeZonesList } from '@/constants/date_time';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const DXMCommandsTab = defineAsyncComponent(() => import('./DXMCommandsTab.vue'));

const { tt } = Lang;

defineOptions({
	name: 'ControllerItemFormUltraSound',
});

const props = defineProps(buildProps({
	hideCompanies: Boolean,
	hidePlants: Boolean,
	new_item_type: Number,
	activeTab: { type: Object, required: true },
	tabsList: { type: Array, required: true },
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const companiesEntity = ENTITIES.Companies;
const plantsEntity = ENTITIES.Plants;

const itemFormRef = ref(null);
const companiesLoading = ref(false);
const companiesList = shallowRef([]);
const plantsLoading = ref(false);
const plantsList = shallowRef([]);

const formData = ref({
	type: null,
	name: '',
	uuid: '',
	plant_id: null,
	company_id: null,
	time_zone: 0,
	communicate_method: null,
	connection_type: null,
	binding_code: '',
	cloud_connection_type: null,
	router_sim_card_number: '',
	router_serial_number: '',
});

const isIndustrialMatrix = computed(() => authStore.isIndustrialMatrix || authStore.isDeveloper);

const controllerTypesList = computed(() =>
	Object.freeze(
		getControllerTypesList().filter((type) =>
			[CONTROLLER_TYPES.BANNER, CONTROLLER_TYPES.ULTRA_SOUND].includes(type.id),
		),
	),
);
const timeZonesList = computed(() => Object.freeze(getTimeZonesList()));
const cloudConnectionTypesList = computed(() => Object.freeze(getCloudConnectionTypesList()));

const rules = Object.freeze({
	name: required,
	company_id: required,
	plant_id: required,
	uuid: required,
});

const isDXMCommandsTabPresent = computed(() =>
	props.tabsList.some((tab) => tab.prop === 'commandsTabActive')
);

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

const { isMobile, itemId, validateForm, handleCancel } = useItemForm({
	entityKey: 'Controllers',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	fromAnotherInstance: props.fromAnotherInstance,
	new_item_type: props.new_item_type,
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
