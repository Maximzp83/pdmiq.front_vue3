<template>
	<div class="edit-form-container user-form">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			:validate-on-rule-change="false"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
			autocomplete="off"
		>
			<CustomTransition :startingElementIdx="startingElementIdx">
				<div
					v-show="activeTab?.prop === 'mainTab'"
					:key="'tab-main'"
					:class="['tab-container', { 'half-width': !fromAnotherInstance && !isMobile }]"
				>
					<el-form-item :label="tt('phrases.First_name')" prop="first_name">
						<CustomInput
							v-model="formData.first_name"
							required
							:placeholder="`${tt('input')} ${tt('name')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('phrases.last_name')" prop="last_name">
						<CustomInput
							v-model="formData.last_name"
							required
							:placeholder="`${tt('input')} ${tt('last_name')}`"
						/>
					</el-form-item>

					<el-form-item class="content-row" :label="tt('sidebar_menu.User_Role')" prop="role_id">
						<CustomSelectV2
							v-model="formData.role_id"
							:optionsList="filteredUserRolesList"
							:optionsLoading="userRolesLoading"
							:placeholder="`${tt('Select')} ${tt('role')}`"
							@change="handleUserRoleChange"
						/>
					</el-form-item>

					<div v-if="isCustomer" class="content-row">
						<el-form-item
							v-if="!isHideCompany"
							:label="tt('Company')"
							prop="company_id"
							required
						>
							<CustomSelectV2
								v-model="formData.company_id"
								filterable
								:optionsLoading="companiesLoading"
								:optionsList="companiesList"
								:placeholder="`${tt('Select')} ${tt('company')}`"
							/>
						</el-form-item>

						<el-form-item
							v-if="!isHidePlants"
							:label="tt('plant')"
							prop="plants_ids"
							required
						>
							<CustomSelectV2
								v-model="formData.plants_ids"
								className="multiple-select"
								multiple
								filterable
								:optionsLoading="plantsLoading"
								:optionsList="plantsList"
								:placeholder="`${tt('Select')} ${tt('plant')}`"
								@change="handlePlantsChange"
							/>
						</el-form-item>
					</div>

					<el-form-item class="content-row" :label="tt('Language')" prop="language">
						<CustomSelectV2
							v-model="formData.language"
							:optionsList="languagesListOptions"
							:placeholder="`${tt('Select')} ${tt('language')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('time_zone')" prop="timezone">
						<el-select v-model="formData.timezone" :placeholder="`${tt('select')} ${tt('time_zone')}`">
							<el-option
								v-for="item in timeZonesListOptions"
								:key="`utc_id-${item.id}`"
								:label="item.label"
								:value="item.id"
							/>
						</el-select>
					</el-form-item>

					<el-form-item :label="tt('Email')" prop="email">
						<CustomInput
							v-model="formData.email"
							type="email"
							autocomplete="new-email"
						/>
					</el-form-item>

					<el-form-item v-if="itemId" :label="tt('Phone')" prop="phone_number">
						<PhoneInput ref="phoneInputRef" v-model="formData" />
					</el-form-item>

					<PhoneVerificationBlock
						v-if="itemId && (!formData.is_mfa_enabled || formData.mfa_type !== MFA_TYPES.SMS)"
						class="el-form-item"
						:phone_number="formData.phone_number"
						:isPhoneVerified="isPhoneVerified"
						@phoneVerified="handlePhoneVerified"
					/>

					<el-form-item
						v-if="itemId"
						:label="`${tt('Old')} ${tt('Password')}`"
						prop="current_password"
					>
						<el-input
							v-model="formData.current_password"
							type="password"
							show-password
							name="newPassword"
							autocomplete="new-password"
						/>
					</el-form-item>

					<el-form-item
						v-if="itemId"
						:label="tt('Password')"
						prop="password"
						class="error-block-not-absolute"
					>
						<PasswordCheckList
							:show="showPassTooltip"
							:password="formData.password"
							:equalsToAccountName="equalsToAccountName"
						>
							<el-input
								v-model="formData.password"
								type="password"
								show-password
								name="new-password"
								autocomplete="new-password"
								@focus="showPassTooltip = true"
								:validate-event="false"
								@blur="handlePasswordBlur"
							/>
						</PasswordCheckList>
					</el-form-item>

					<el-form-item
						v-if="itemId"
						:label="tt('phrases.confirm_password')"
						prop="password_confirmation"
					>
						<el-input
							v-model="formData.password_confirmation"
							type="password"
							show-password
							name="newPassword"
							autocomplete="new-password"
							:validate-event="false"
							@blur="handlePasswordConfirmationBlur"
						/>
					</el-form-item>

					<el-form-item
						v-if="isIndustrialMatrix"
						:label="tt('phrases.Notifiable_plants')"
						prop="notifiable_plants"
					>
						<CustomSelectV2
							v-model="formData.notifiable_plants"
							filterable
							multiple
							:optionsLoading="allPlantsLoading"
							:optionsList="allPlantsList"
							:placeholder="`${tt('Select')} ${tt('plants')}`"
						/>
					</el-form-item>

					<el-form-item
						v-if="!isIndustrialMatrix"
						:label="tt('phrases.Notifications_for_all_monitoring_points')"
						prop="is_monitoring_all_notifiable_plants"
					>
						<el-switch
							v-model="formData.is_monitoring_all_notifiable_plants"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<div
						v-if="!formData.is_monitoring_all_notifiable_plants"
						class="mt-20"
					>
						<ProdlinesSelectItem
							v-for="(plantId, idx) in selectedPlantIds"
							:key="`prodline-plant-${plantId}`"
							:ref="(el) => setSubItemRef('ProdlinesSelectItem', el, idx)"
							class="el-form-item"
							:plantId="plantId"
							:plantsList="plantsList"
							:currentNotifiableProdlinesIds="formData.notifiable_production_lines"
						/>
					</div>

					<el-form-item
						class="mt-20"
						v-if="isTechnician"
						:label="tt('phrases.hourly_rate')"
						prop="hourly_rate"
						required
					>
						<CustomInput v-model="formData.hourly_rate" :placeholder="`${tt('input')} ${tt('rate')}`" />
					</el-form-item>

					<el-form-item v-if="isIndustrialMatrix" :label="`IM CSM`" class="switcher">
						<el-switch v-model="formData.is_im_csm" :active-value="1" :inactive-value="0" />
					</el-form-item>

					<el-form-item label="MFA" prop="is_mfa_enabled" class="switcher">
						<el-switch
							v-model="formData.is_mfa_enabled"
							:active-value="1"
							:inactive-value="0"
							:disabled="disableMfaSwitcher"
							@change="formData.mfa_type = null"
						/>
					</el-form-item>

					<MFABlock
						v-if="formData.is_mfa_enabled && itemId"
						v-model="formData.mfa_type"
						class="el-form-item"
						:disabled="!!disableMfaBlock"
						:phone_number="formData.phone_number"
						:isPhoneVerified="isPhoneVerified"
					/>

					<div class="el-form-item daily-summary-form-item">
						<div class="flex mrow align-center">
							<el-form-item class="mcol-xs-4 checkbox-part label_pt-0 label-align-center" :label="`${tt('phrases.daily_summary')}`">
								<el-checkbox
									v-model="formData.is_day_summary_notify"
									:true-value="1"
									:false-value="0"
								>
									{{ tt('Email') }}
								</el-checkbox>
							</el-form-item>

							<el-form-item
								v-if="formData.is_day_summary_notify"
								class="mcol-xs-8"
								prop="daily_summary_notify_at"
							>
								<el-time-select
									v-model="formData.daily_summary_notify_at"
									:picker-options="{ start: '00:00', step: '00:15', end: '23:45' }"
									:placeholder="`${tt('select')} ${tt('time')}`"
								/>
							</el-form-item>
						</div>
					</div>
				</div>

				<div
					v-show="activeTab?.prop === 'notificationsTab'"
					:key="'tab-notifications'"
					:class="['tab-container', { 'half-width': !fromAnotherInstance && !isMobile }]"
				>
					<div class="content-row notifications-block">
						<NotificationsBlock
							ref="notificationsBlockRef"
							class="notifications-block"
							:title="tt('Notifications')"
							:rows="userNotificationItemsList"
							:isPhoneVerified="isPhoneVerified"
						/>
					</div>

					<div class="content-row notifications-block">
						<NotificationsBlock
							ref="notificationsBlockRTRef"
							class="notifications-block"
							:title="tt('phrases.Real_time_sensor_Notifications')"
							:rows="userRealTimeNotificationItemsList"
							:isPhoneVerified="isPhoneVerified"
						/>
					</div>

					<!-- <div class="content-row notifications-block">
						<NotificationsBlock
							ref="notificationsBlockRequisitionsRef"
							class="notifications-block"
							:title="tt('phrases.Requisitions_Notifications')"
							:rows="userRequisitionNotificationItemsList"
						/>
					</div> -->
				</div>

				<div v-if="itemId" v-show="activeTab?.prop === 'reportsTab'" :key="'tab-reports'" class="tab-container reports-tab">
					<ReportsList
						insideOtherPage
						:userId="itemId"
						:isCSM="!!formData.is_im_csm"
						:enableBaselineReport="currentUserisIndustrialMatrix && itemId === authUser?.id"
						:sensorsListProps="sensorsList"
						:plantsListProps="formData.company_id ? plantsList : allPlantsList"
					/>
				</div>

				<div
					v-if="itemId && hasApiTab"
					v-show="activeTab?.prop === 'apiTab'"
					:key="'tab-api'"
					class="tab-container reports-tab"
				>
					<ClientApiCredentialsList
						insideOtherPage
						:userId="itemId"
						:canManageCredentials="isEditingOwnAccount"
					/>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				v-if="!fromModal && !['reportsTab', 'apiTab'].includes(activeTab?.prop)"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	LANGUAGE_TYPES,
	languagesList,
} from '@/localization/utils';
import {
	MFA_TYPES,
	PLANT_WORK_ORDER_TYPES,
	USER_ROLES_TYPES,
	userNotificationTypesList,
	userRealTimeNotificationTypesList,
	// userRequisitionNotificationTypesList,
} from '@/constants/global';
import { timeZonesList } from '@/constants/date_time';
import { required } from '@/constants/validation';
import { removeObjProps, setupLabel } from '@/helpers';
import { isPasswordStrong } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useNotify } from '@/composables/useNotify';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useAuthStore } from '@/stores/AuthStore';

import CustomTransition from '@/components/common/CustomTransition.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const PhoneInput = defineAsyncComponent(() => import('@/components/form/PhoneInput.vue'));
// import PhoneInput from '@/components/form/PhoneInput.vue';
const PasswordCheckList = defineAsyncComponent(() => import('@/components/pages/PasswordCheckList.vue'));
const ReportsList = defineAsyncComponent(() => import('@/views/UserReports/ItemsList.vue'));
const ClientApiCredentialsList = defineAsyncComponent(() => import('./ClientApiCredentialsList.vue'));
const MFABlock = defineAsyncComponent(() => import('./MFABlock.vue'));
const NotificationsBlock = defineAsyncComponent(() => import('./NotificationsBlock.vue'));
const PhoneVerificationBlock = defineAsyncComponent(() => import('./PhoneVerificationBlock.vue'));
const ProdlinesSelectItem = defineAsyncComponent(() => import('./ProdlinesSelectItem.vue'));


// import PasswordCheckList from '@/components/pages/PasswordCheckList.vue';
// import ReportsList from '@/views/UserReports/ItemsList.vue';
// import ClientApiCredentialsList from './ClientApiCredentialsList.vue';
// import MFABlock from './MFABlock.vue';
// import NotificationsBlock from './NotificationsBlock.vue';
// import PhoneVerificationBlock from './PhoneVerificationBlock.vue';
// import ProdlinesSelectItem from './ProdlinesSelectItem.vue';

const { tt } = Lang;
const { Notify } = useNotify();

defineOptions({
	name: 'UsersItemForm',
});

const props = defineProps(buildProps({
	hideType: Boolean,
	hidePlants: Boolean,
	hideCompany: Boolean,
	itemsName: { type: Object, default: () => ({}) },
	activeTab: { type: Object, default: () => ({ prop: 'mainTab' }) },
	tabsList: { type: Array, default: () => [] },
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const { authUser } = storeToRefs(authStore);

const itemFormRef = ref(null);
const phoneInputRef = ref(null);
const notificationsBlockRef = ref(null);
const notificationsBlockRTRef = ref(null);
const startingElementIdx = ref(0);
const showPassTooltip = ref(false);
const confirmedPhoneNumber = ref('');

const userRolesList = ref([]);
const userRolesLoading = ref(false);
const companiesLoading = ref(false);
const companiesList = ref([]);
const plantsLoading = ref(false);
const plantsList = ref([]);
const allPlantsLoading = ref(false);
const allPlantsList = ref([]);
const sensorsList = ref([]);
const userNotificationItemsList = ref([]);
const userRealTimeNotificationItemsList = ref([]);
// const userRequisitionNotificationItemsList = ref([]);

const formData = ref({
	role_id: null,
	first_name: '',
	last_name: '',
	email: '',
	password: '',
	current_password: '',
	password_confirmation: '',
	country_code: null,
	phone_number: '',
	plants_ids: [],
	company_id: null,
	daily_summary_notify_at: '00:00',
	is_day_summary_notify: false,
	notification_rules: [],
	notifiable_plants: [],
	hourly_rate: '',
	language: LANGUAGE_TYPES.ENGLISH,
	is_mfa_enabled: 0,
	mfa_type: null,
	timezone: null,
	is_im_csm: 0,
	is_monitoring_all_notifiable_plants: 0,
	notifiable_production_lines: [],
});

const rules = ref({
	first_name: required,
	last_name: required,
	email: required,
	password: [{ validator: (_rule, value, callback) => validatePassword(value, callback), trigger: 'blur' }],
	password_confirmation: [
		{ validator: (_rule, value, callback) => validateConfirmPassword(value, callback), trigger: 'blur' },
	],
});

const timeZonesListOptions = computed(() => Object.freeze(timeZonesList()));
const languagesListOptions = computed(() => languagesList);
const userNotificationTypesListOptions = computed(() => Object.freeze(userNotificationTypesList()));
const userRealTimeNotificationTypesListOptions = computed(() =>
	Object.freeze(userRealTimeNotificationTypesList()),
);
/*const userRequisitionNotificationTypesListOptions = computed(() =>
	Object.freeze(userRequisitionNotificationTypesList()),
);*/

const currentUserisIndustrialMatrix = computed(
	() => authStore.isIndustrialMatrix || authStore.isDeveloper,
);
const currentUserIsCustomer = computed(() => authStore.isCustomer);
const currentUserIsDeveloper = computed(() => authStore.isDeveloper);
const routeQuery = computed(() => (typeof window !== 'undefined'
	? new URLSearchParams(window.location.search)
	: null));

const refsMap = computed(() => ({
	NotificationsBlock: notificationsBlockRef.value,
	NotificationsBlockRT: notificationsBlockRTRef.value,
	ProdlinesSelectItem: prodlinesSelectItemRefs.value,
}));

const prodlinesSelectItemRefs = ref([]);

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'NotificationsBlock', targetProp: 'notification_rules' },
		{ ref: 'NotificationsBlockRT', targetProp: 'notification_rules' },
		{ ref: 'ProdlinesSelectItem', targetProp: 'notifiable_production_lines' },
	]),
);

const { validateSubItemsForm, collectDataFromSubItems, resetFormDataBySubItems, setSubItemRef } = useSubItemsList({
	formData,
	refsMap,
});

const itemData = computed(() => props.itemData);
const itemId = computed(() => itemData.value?.id || null);

const finalUserRolesList = computed(() => {
	if (!userRolesList.value.length) return [];
	const role = authUser.value?.role;
	const sourceList = currentUserIsDeveloper.value && role
		? [...userRolesList.value, role]
		: userRolesList.value;

	return sourceList.filter(
		(item, idx, list) => list.findIndex((candidate) => candidate?.id === item?.id) === idx,
	);
});

const filteredUserRolesList = computed(() => {
	const role = authUser.value?.role;
	if (currentUserisIndustrialMatrix.value) {
		return finalUserRolesList.value;
	}
	if (!role) return [];

	return finalUserRolesList.value.filter(
		(item) =>
			item.id === role.id || (Array.isArray(role.child_role_ids) && role.child_role_ids.includes(item.id)),
	);
});

const selectedRole = computed(() => {
	if (!formData.value.role_id) return null;
	return finalUserRolesList.value.find((item) => item.id === formData.value.role_id) || null;
});

const isIndustrialMatrix = computed(
	() =>
		selectedRole.value &&
		[
			USER_ROLES_TYPES.INDUSTRIAL_MATRIX,
			USER_ROLES_TYPES.DEVELOPER,
		].includes(selectedRole.value.type),
);
const isCustomer = computed(
	() => !!selectedRole.value && selectedRole.value.type === USER_ROLES_TYPES.CUSTOMER,
);
const isTechnician = computed(() => !!selectedRole.value?.is_technic);
const isEditingOwnAccount = computed(
	() => !!itemId.value && !!authUser.value && itemId.value === authUser.value.id,
);

const isHidePlants = computed(
	() => props.hidePlants || props.settings?.hidePlants || false,
);
const isHideCompany = computed(
	() => props.hideCompany || props.settings?.hideCompany || currentUserIsCustomer.value,
);
const hasApiTab = computed(() => props.tabsList?.some((tab) => tab.prop === 'apiTab'));

const equalsToAccountName = computed(() => formData.value.email === formData.value.password);
const selectedPlantIds = computed(() => formData.value.plants_ids || []);

const disableMfaSwitcher = computed(
	() =>
		!!itemId.value &&
		!!authUser.value &&
		authUser.value.id !== itemId.value &&
		!!itemData.value &&
		!formData.value.is_mfa_enabled,
);

const disableMfaBlock = computed(
	() =>
		!itemId.value ||
		disableMfaSwitcher.value ||
		(!!authUser.value && authUser.value.id !== itemId.value),
);

const isPhoneVerified = computed(
	() =>
		!!itemId.value &&
		((itemData.value?.phone_number &&
			itemData.value.phone_number === formData.value.phone_number) ||
			(confirmedPhoneNumber.value &&
				confirmedPhoneNumber.value === formData.value.phone_number)),
);

const setupNotificationsBlockList = ({ list, currentItemData }) =>
	list.map((item) => {
		const next = {
			title: item.name,
			formData: {
				message_type: item.id,
				is_email: 0,
				is_sms: 0,
				is_push: 0,
			},
		};

		if (currentItemData?.notification_rules) {
			const found = currentItemData.notification_rules.find(
				(rule) => rule.message_type === next.formData.message_type,
			);
			if (found) {
				next.formData = { ...found };
			}
		}

		return next;
	});

const plantsEntity = ENTITIES.Plants;
const companiesEntity = ENTITIES.Companies;
const userRolesEntity = ENTITIES.UserRoles;
const sensorsEntity = ENTITIES.Sensors;

const methodsMap = {
	fetch_plants: createGetRequest(plantsEntity.apiBase),
	fetch_companies: createGetRequest(companiesEntity.apiBase),
	fetch_user_roles: createGetRequest(userRolesEntity.apiBase),
	fetch_sensors: createGetRequest(sensorsEntity.apiBase),
};

const requestsToDoList = computed(() => {
	const settings = [
		{
			action: methodsMap.fetch_plants,
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
		{
			action: methodsMap.fetch_plants,
			localProp: allPlantsList,
			localLoadProp: allPlantsLoading,
			payload: { params: { max: -1, archived: true } },
		},
		{
			action: methodsMap.fetch_user_roles,
			localProp: userRolesList,
			localLoadProp: userRolesLoading,
		},
	];

	if (currentUserisIndustrialMatrix.value) {
		settings[0].bindTo = [
			{
				param: 'companyId',
				getValue: () => formData.value.company_id,
				onTrigger: () => {
					formData.value.plants_ids = [];
				},
			},
		];

		settings.push({
			action: methodsMap.fetch_companies,
			localProp: companiesList,
			localLoadProp: companiesLoading,
		});
	} else if (authUser.value?.company_id) {
		settings[0].payload = { params: { companyId: authUser.value.company_id } };
	}

	return Object.freeze(settings);
});

const fetchSensors = (ids) =>
	methodsMap.fetch_sensors({
		params: { max: -1, plantIds: ids },
	}).then(({ value }) => {
		sensorsList.value = value || [];
	});

const handlePhoneVerified = () => {
	confirmedPhoneNumber.value = formData.value.phone_number;
};

const handlePlantsChange = (ids) => {
	if (ids?.length && itemId.value) {
		fetchSensors(ids);
		return;
	}
	sensorsList.value = [];
};

const validatePassword = (value, callback) => {
	if (!value) {
		if (rules.value.password.some((rule) => rule.required)) {
			callback(new Error(tt('phrases.password_is_required')));
			return;
		}
		callback();
		return;
	}

	if (!isPasswordStrong(value.trim()).isStrong || equalsToAccountName.value) {
		callback(new Error(tt('aliases.password_validation')));
		return;
	}

	callback();
};

const validateConfirmPassword = (value, callback) => {
	if (formData.value.password && value !== formData.value.password) {
		callback(new Error(tt('aliases.passwords_compar_error')));
		return;
	}
	callback();
};

const handlePasswordBlur = () => {
	showPassTooltip.value = false;
	itemFormRef.value?.validateField?.('password');
};

const handlePasswordConfirmationBlur = () => {
	itemFormRef.value?.validateField?.('password_confirmation');
};

const normalizeSwitchValue = (value) =>
	value === true || value === 1 || value === '1' ? 1 : 0;

const normalizeSwitchFields = () => {
	['is_monitoring_all_notifiable_plants', 'is_im_csm', 'is_mfa_enabled'].forEach(
		(field) => {
			formData.value[field] = normalizeSwitchValue(formData.value[field]);
		},
	);
};

const localSetupPage = (currentItemData) => {
	normalizeSwitchFields();

	if (currentItemData) {
		confirmedPhoneNumber.value = currentItemData.phone_number;
		handlePlantsChange(currentItemData.plants_ids);

		if (routeQuery.value?.get('enableMfa') === 'true') {
			formData.value.is_mfa_enabled = 1;
		}
	}

	userNotificationItemsList.value = setupNotificationsBlockList({
		list: userNotificationTypesListOptions.value,
		currentItemData,
	});
	userRealTimeNotificationItemsList.value = setupNotificationsBlockList({
		list: userRealTimeNotificationTypesListOptions.value,
		currentItemData,
	});
	/*userRequisitionNotificationItemsList.value = setupNotificationsBlockList({
		list: userRequisitionNotificationTypesListOptions.value,
		currentItemData,
	});*/
};

const handleUserRoleChange = () => {
	if (!isCustomer.value) {
		formData.value.plants_ids = [];
		formData.value.company_id = null;
	}
};

const localValidationHook = () => {
	if (
		!isIndustrialMatrix.value &&
		!formData.value.is_monitoring_all_notifiable_plants &&
		!formData.value.notifiable_production_lines.length
	) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('aliases.prodline_warn_1'),
		});
		return false;
	}

	if (
		!isPhoneVerified.value &&
		formData.value.is_mfa_enabled &&
		formData.value.mfa_type === MFA_TYPES.SMS
	) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('aliases.mfa_warn_3'),
		});
		return false;
	}

	return true;
};

const localPrepareSubmitData = (data) => {
	let nextData = { ...data };

	if (!itemId.value) {
		nextData = removeObjProps(nextData, ['password', 'password_confirmation', 'current_password']);
	}

	if (isIndustrialMatrix.value) {
		nextData = removeObjProps(nextData, [
			'company_id',
			'plants_ids',
			'is_monitoring_all_notifiable_plants',
			'notifiable_production_lines',
		]);
	} else {
		nextData = removeObjProps(nextData, ['notifiable_plants']);
		nextData.is_im_csm = 0;
	}

	if (nextData.password) {
		nextData.password = nextData.password.trim();
	}

	if (!selectedRole.value?.is_requisitioner && !selectedRole.value?.is_fab_shop_manager) {
		nextData.work_order_role = PLANT_WORK_ORDER_TYPES.WITHOUT;
	}

	if (!selectedRole.value?.is_technic) {
		nextData.hourly_rate = 0;
	}

	if (!nextData.is_day_summary_notify) {
		nextData.daily_summary_notify_at = null;
	}

	if (!nextData.phone_number) {
		nextData.country_code = null;
	}

	if (itemId.value !== authUser.value?.id && nextData.is_mfa_enabled) {
		delete nextData.is_mfa_enabled;
	}

	return nextData;
};

const localSubmit = (preparedData) => {
	if (phoneInputRef.value?.hasError) {
		return false;
	}

	emit('submit', preparedData);
	return true;
};

const {
	isMobile,
	validateForm,
	handleCancel,
} = useItemForm({
	entityKey: 'Users',
	itemData,
	formData,
	formRef: itemFormRef,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localValidationHook,
	localPrepareSubmitData,
	localSubmit,
	fromModal: props.fromModal,
	editModal: props.editModal,
	prepareSubmitDataSettings: Object.freeze({
		skipValueValidationProps: ['phone_number', 'country_code'],
	}),
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

watch(
	() => formData.value.password,
	(value) => {
		rules.value.current_password = itemId.value && value ? required : null;
	},
);

defineExpose({
	validateForm,
	setupLabel,
	languagesList: languagesListOptions,
});
</script>
