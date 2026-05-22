<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item v-if="!hideCompanies && isIndustrialMatrix" :label="tt('Company')" prop="company_id">
				<CustomSelectV2
					v-model="formData.company_id"
					filterable
					:optionsLoading="companiesLoading"
					:optionsList="companiesList"
					:placeholder="`${tt('Select')} ${tt('company')}`"
				/>
			</el-form-item>

			<el-form-item v-if="isIndustrialMatrix || adminsList.length" label="IM CSM" prop="im_csms">
				<CustomSelectV2
					v-model="formData.im_csms"
					filterable
					multiple
					collapse-tags
					:optionsLoading="usersLoading"
					:optionsList="adminsList"
					:placeholder="`${tt('Select')} ${tt('admins')}`"
					labelKey="full_name"
				/>
			</el-form-item>

			<el-form-item :label="tt('Champions')" prop="champions">
				<CustomSelectV2
					v-model="formData.champions"
					filterable
					multiple
					collapse-tags
					:optionsLoading="plantUsersLoading"
					:optionsList="thisPlantUsersList"
					:placeholder="`${tt('Select')} ${tt('users')}`"
					labelKey="full_name"
				/>
			</el-form-item>

			<el-form-item :label="tt('Logo')" prop="file" class="upload-form-item">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					rotate
					deleteFileId
					showDeleteButton
					:pictures="itemPictures"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Plant')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" placeholder="Name" />
			</el-form-item>

			<el-form-item :label="tt('phrases.joined_at')" prop="joined_at" class="half-width">
				<Datepicker v-model="formData.joined_at" :placeholder="`${tt('Select')} ${tt('date')}`" />
			</el-form-item>

			<el-form-item :label="tt('Region')" prop="region">
				<CustomInput v-model="formData.region" />
			</el-form-item>

			<el-form-item :label="tt('Address')" prop="address">
				<CustomInput v-model="formData.address" />
			</el-form-item>

			<div class="el-form-item">
				<div class="flex mrow height-60">
					<el-form-item
						class="mcol-xs-6 flex align-center label-margin-0"
						:label="`${tt('amplitude')} ${tt('alarms')}`"
						prop="is_amplitude_alarm_tracking"
					>
						<el-switch
							v-model="formData.is_amplitude_alarm_tracking"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<el-form-item
						v-show="formData.is_amplitude_alarm_tracking"
						class="mcol-xs-6 text-right label-margin-0"
						prop="amplitude_alarm_threshold_multiplier"
					>
						<el-input-number
							v-model="formData.amplitude_alarm_threshold_multiplier"
							:precision="2"
							:step="0.1"
						/>
					</el-form-item>
				</div>
			</div>

			<el-form-item :label="tt('time_zone')" prop="time_zone">
				<el-select v-model="formData.time_zone" filterable :placeholder="`${tt('select')} ${tt('time_zone')}`">
					<el-option
						v-for="item in timeZones"
						:key="`utc_id-${item.id}`"
						:label="item.label"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('Measurement')" prop="metric_system_type">
				<CustomSelectV2
					v-model="formData.metric_system_type"
					:optionsList="metricSystems"
					:placeholder="`${tt('select')} ${tt('system')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('phrases.industrial_services')" prop="industrial_service_ids">
				<CustomSelectV2
					v-model="formData.industrial_service_ids"
					filterable
					multiple
					collapse-tags
					:optionsLoading="industrialServicesLoading"
					:optionsList="industrialServicesList"
					:placeholder="`${tt('Select')} ${tt('services')}`"
				/>
			</el-form-item>

			<el-form-item label="ZOHO Deal ID" prop="zoho_id">
				<CustomInput v-model="formData.zoho_id" placeholder="ID" />
			</el-form-item>

			<el-form-item v-if="isIndustrialMatrix" class="mcol-xs-6" :label="`${tt('Billing_Plan')} ${tt('Cost')}`" prop="billing_plan_cost">
				<CustomInput v-model.number="formData.billing_plan_cost" />
			</el-form-item>

			<el-form-item
				v-show="formData.billing_plan_cost"
				:required="!!formData.billing_plan_cost"
				:label="tt('Renewal_Date')"
				prop="billing_plant_renewal_date"
				class="half-width"
			>
				<Datepicker
					v-model="formData.billing_plant_renewal_date"
					:placeholder="`${tt('Select')} ${tt('date')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Meeting_Tracker')} ${tt('Email_List')}`" prop="meeting_tracker_mail_list">
				<CustomInput v-model="formData.meeting_tracker_mail_list" />
			</el-form-item>

			<el-form-item :label="tt('phrases.enable_run_hour_tracking_for_sensors')" prop="is_equipment_runtime_tracking" class="label_pt-0">
				<el-switch
					v-model="formData.is_equipment_runtime_tracking"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item :label="tt('Commissioning')" prop="is_commissioning">
				<el-switch v-model="formData.is_commissioning" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item v-if="canArchivePlant" :label="tt('Archive')" prop="is_archived">
				<el-switch v-model="formData.is_archived" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item :label="tt('Locations')" prop="locations">
				<div class="options-container">
					<div v-if="locationsItemsList.length" class="content-row">
						<LocationItem
							ref="locationItemRefs"
							v-for="(item, idx) in locationsItemsList"
							:key="`location_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="(id) => removeFormItem(id, locationsItemsList)"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="small"
							type="success"
							@click="addFormItem(locationsItemsList, 'l_i-')"
						>
							<i class="icomoon icon-cross"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef, defineAsyncComponent } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { cleanDateString } from '@/helpers';
import { required } from '@/constants/validation';
import { timeZonesList } from '@/constants/date_time';
import { USER_ROLES_TYPES } from '@/constants/global';
import { metricSystemsList } from '@/modules/charts_factory/controllers/Sensor/enums';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import Datepicker from '@/components/common/Datepicker.vue';
const FormOperationsButtons = defineAsyncComponent(
	() => import('@/components/form/FormOperationsButtons.vue'),
);
// import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import LocationItem from './LocationItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'PlantsItemForm',
});

const props = defineProps(buildProps({
	hideCompanies: Boolean,
}));

// const emit = defineEmits(['submit', 'onCancel']);
const companiesEntity = ENTITIES.Companies;
const usersEntity = ENTITIES.Users;
const industrialServicesEntity = ENTITIES.IndustrialServices;

const authStore = useAuthStore();
const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const locationItemRefs = ref([]);

const companiesLoading = ref(false);
const companiesList = shallowRef([]);
const usersLoading = ref(false);
const usersList = shallowRef([]);
const thisPlantUsersList = shallowRef([]);
const plantUsersLoading = ref(false);
const industrialServicesLoading = ref(false);
const industrialServicesList = shallowRef([]);
const locationsItemsList = ref([]);

const formData = ref({
	type: 1,
	name: '',
	address: '',
	region: '',
	company_id: null,
	time_zone: 0,
	metric_system_type: null,
	industrial_service_ids: [],
	billing_plan_cost: null,
	im_csms: [],
	billing_plant_renewal_date: '',
	champions: [],
	locations: [],
	meeting_tracker_mail_list: '',
	is_amplitude_alarm_tracking: 0,
	amplitude_alarm_threshold_multiplier: 2.5,
	is_equipment_runtime_tracking: 0,
	is_archived: 0,
	is_commissioning: 0,
	joined_at: '',
	zoho_id: '',
});

const rules = {
	name: required,
	address: required,
	company_id: required,
	region: required,
};

const timeZones = computed(() => Object.freeze(timeZonesList()));
const metricSystems = computed(() => Object.freeze(metricSystemsList()));
const isIndustrialMatrix = computed(() => !!authStore.isIndustrialMatrix);
const canArchivePlant = computed(() => authStore.hasAccessTo(['archive_plants']));

const adminsList = computed(() =>
	Object.freeze(
		usersList.value.filter(
			(user) => user?.role && user.role.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX,
		),
	),
);

const itemPictures = computed(() => {
	const item = props.itemData;
	if (item?.file) {
		return [{ file: item.file }];
	}
	return [];
});

const refsMap = computed(() => ({
	FileUploadBlock: fileUploadBlockRef.value,
	LocationItem: locationItemRefs.value,
}));

const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'FileUploadBlock',
			setIfEmpty: { prop: 'delete_file', val: 1 },
			cleanIfEmpty: { prop: 'file', val: null },
		},
		{
			ref: 'LocationItem',
			targetProp: 'locations',
		},
	]),
);

const requestsToDoList = computed(() => {
		return Object.freeze([
			{
				action: methodsMap.fetch_companies,
				localProp: companiesList,
				localLoadProp: companiesLoading,
				payload: { params: { max: -1, orderByColumn: 'name', orderByMethod: 'asc' } },
				notFetch: props.hideCompanies || !isIndustrialMatrix.value,
			},
			{
				action: methodsMap.fetch_users,
				localProp: usersList,
				localLoadProp: usersLoading,
				payload: { params: { max: -1, type: USER_ROLES_TYPES.INDUSTRIAL_MATRIX } },
			},
			{
				action: methodsMap.fetch_users,
				localProp: thisPlantUsersList,
				localLoadProp: plantUsersLoading,
				payload: { params: { max: -1 } },
				bindTo: [
					{
						param: 'plantId',
						getValue: () => itemId.value,
						withoutClean: true,
					},
				],
				blockInitialFetch: true,
			},
			{
				action: methodsMap.fetch_industrial_services,
				localProp: industrialServicesList,
				localLoadProp: industrialServicesLoading,
				payload: { params: { max: -1 } },
			},
		])
});

const methodsMap = {
	fetch_companies: createGetRequest(companiesEntity.apiBase),
	fetch_users: createGetRequest(usersEntity.apiBase),
	fetch_industrial_services: createGetRequest(industrialServicesEntity.apiBase),
};

const prepareSubmitDataSettings = computed(() =>
	Object.freeze({
		skipValueValidationProps: ['meeting_tracker_mail_list'],
	}),
);

// ---------Form Methods Section (Before Form Composable) -------
const localSetupPage = (item) => {
	if (item) {
		locationsItemsList.value = setupFormSubItemsList(item.locations || [], 'l_i');

		if (Array.isArray(item.im_csms) && item.im_csms.length) {
			formData.value.im_csms = item.im_csms.map((row) => row.id);
		}
		if (Array.isArray(item.champions) && item.champions.length) {
			formData.value.champions = item.champions.map((row) => row.id);
		}
		if (item.billing_plant_renewal_date) {
			formData.value.billing_plant_renewal_date = cleanDateString(
				item.billing_plant_renewal_date,
				{ withoutTime: true },
			);
		}
	} else {
		locationsItemsList.value = [];
	}

	if (!isIndustrialMatrix.value && authStore.authUser?.company_id) {
		formData.value.company_id = authStore.authUser.company_id;
	}
};

const localPrepareSubmitData = (data) => {
	const prepared = { ...data };

	if (!prepared.is_amplitude_alarm_tracking) {
		delete prepared.amplitude_alarm_threshold_multiplier;
	}
	if (!isIndustrialMatrix.value && !adminsList.value.length) {
		delete prepared.im_csms;
	}
	if (prepared.joined_at) {
		prepared.joined_at = cleanDateString(prepared.joined_at, { withoutTime: true });
	}
	if (prepared.billing_plant_renewal_date) {
		prepared.billing_plant_renewal_date = cleanDateString(prepared.billing_plant_renewal_date, {
			withoutTime: true,
		});
	}
	return prepared;
};

// --------Main Composables Section--------
useRequestsList({
	methodsMap,
	requestsToDoList,
});

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	validateSubItemsForm,
	resetFormDataBySubItems,
	collectDataFromSubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const {
	isMobile,
	itemId,
	validateForm,
	handleCancel,
	// formData
} = useItemForm({
	entityKey: 'Plants',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localPrepareSubmitData,
	prepareSubmitDataSettings: prepareSubmitDataSettings.value,
	// emit,
});

defineExpose({
	validateForm,
});
</script>
