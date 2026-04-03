<template>
	<div class="edit-form-container user-form">
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
			autocomplete="off"
		>
			<CustomTransition :startingElementIdx="startingElementIdx">
				<div
					v-show="activeTab.prop == 'mainTab'"
					:class="[
						'tab-container',
						{ 'half-width': !fromAnotherInstance && !isMobile }
					]"
					key="tab-0"
				>
					<el-form-item :label="tt('phrases.First_name')" prop="first_name">
						<CustomInput
							required
							v-model="formData.first_name"
							:placeholder="`${tt('input')} ${tt('name')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('phrases.last_name')" prop="last_name">
						<CustomInput
							required
							v-model="formData.last_name"
							:placeholder="`${tt('input')} ${tt('last_name')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('sidebar_menu.User_Role')" prop="role_id">
						<CustomSelect
							:optionsList="filteredUserRolesList"
							:placeholder="`${tt('Select')} ${tt('role')}`"
							v-model="formData.role_id"
							@change="handleUserRoleChange"
						/>
					</el-form-item>

					<div class="el-form-item" v-if="isCustomer">
						<el-form-item
							:label="tt('Company')"
							prop="company_id"
							v-if="!isHideCompany"
							required
						>
							<CustomSelect
								filterable
								:optionsLoading="companiesLoading"
								:optionsList="companiesList"
								:placeholder="`${tt('Select')} ${tt('company')}`"
								v-model="formData.company_id"
							/>
						</el-form-item>

						<el-form-item
							:label="tt('plant')"
							prop="plants_ids"
							v-if="!isHidePlants"
							required
						>
							<CustomSelect
								@change="handlePlantsChange"
								className="multiple-select"
								multiple
								filterable
								:optionsLoading="plantsLoading"
								:optionsList="plantsList"
								:placeholder="`${tt('Select')} ${tt('plant')}`"
								v-model="formData.plants_ids"
							/>
						</el-form-item>
					</div>

					<el-form-item :label="tt('Language')" prop="language">
						<CustomSelect
							:optionsList="languagesList"
							:placeholder="`${tt('Select')} ${tt('language')}`"
							v-model="formData.language"
						/>
					</el-form-item>

					<el-form-item :label="tt('time_zone')" prop="timezone">
						<el-select
							v-model="formData.timezone"
							:placeholder="`${tt('select')} ${tt('time_zone')}`"
						>
							<el-option
								v-for="item in timeZonesList"
								:key="'utc_id-' + item.id"
								:label="item.label"
								:value="item.id"
							/>
						</el-select>
					</el-form-item>

					<el-form-item :label="tt('Email')" prop="email">
						<el-input
							v-model="formData.email"
							type="email"
							autocomplete="new-email"
						/>
					</el-form-item>

					<el-form-item :label="tt('Phone')" prop="phone_number" v-if="itemId">
						<PhoneInput ref="PhoneInput" v-model="formData" />
					</el-form-item>

					<PhoneVerificationBlock
						class="el-form-item"
						v-if="
							itemId &&
								(!formData.is_mfa_enabled || formData.mfa_type !== MFA_TYPES.SMS)
						"
						@phoneVerified="handlePhoneVerified"
						:isPhoneVerified="isPhoneVerified"
						:phone_number="formData.phone_number"
					/>

					<!-- <input autocomplete="false" name="hidden" type="text" style="display: none;" > -->

					<el-form-item
						:label="`${tt('Old')} ${tt('Password')}`"
						v-if="itemId"
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
						:label="tt('Password')"
						prop="password"
						class="error-block-not-absolute"
						v-if="itemId"
					>
						<PasswordCheckList
							:show="showPassTooltip"
							:password="formData.password"
							:equalsToAccountName="equalsToAccountName"
						>
							<el-input
								@focus="showPassTooltip = true"
								@blur="showPassTooltip = false"
								v-model="formData.password"
								type="password"
								show-password
								name="new-password"
								autocomplete="new-password"
							/>
						</PasswordCheckList>
					</el-form-item>

					<el-form-item
						:label="tt('phrases.confirm_password')"
						prop="password_confirmation"
						v-if="itemId"
					>
						<el-input
							v-model="formData.password_confirmation"
							type="password"
							show-password
							name="newPassword"
							autocomplete="new-password"
						/>
					</el-form-item>

					<!-- <el-form-item
						class=""
						:label="tt('phrases.Notifiable_plants')"
					>
						<el-switch
							v-model="formData.report_notifiable_plants"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item> -->

					<el-form-item
						:label="tt('phrases.Notifiable_plants')"
						prop="notifiable_plants"
						v-if="isIndustrialMatrix"
					>
						<CustomSelect
							filterable
							multiple
							:optionsLoading="allPlantsLoading"
							:optionsList="allPlantsList"
							:placeholder="`${tt('Select')} ${tt('plants')}`"
							v-model="formData.notifiable_plants"
						/>
					</el-form-item>

					<el-form-item
						v-if="!isIndustrialMatrix"
						class=""
						prop="is_monitoring_all_notifiable_plants"
						:label="tt('phrases.Notifications_for_all_monitoring_points')"
					>
						<el-switch
							v-model="formData.is_monitoring_all_notifiable_plants"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<div
						class="el-form-item"
						v-if="!formData.is_monitoring_all_notifiable_plants"
					>
						<ProdlinesSelectItem
							ref="ProdlinesSelectItem"
							v-for="plantId in selectedPlantIds"
							:key="`prodline-plant-${plantId}`"
							class="el-form-item"
							:plantId="plantId"
							:plantsList="plantsList"
							:currentNotifiableProdlinesIds="formData.notifiable_production_lines"
						/>
					</div>

					<el-form-item
						:label="tt('phrases.hourly_rate')"
						prop="hourly_rate"
						v-if="isTechnician"
						required
					>
						<CustomInput
							v-model="formData.hourly_rate"
							:placeholder="`${tt('input')} ${tt('rate')}`"
						/>
					</el-form-item>

					<el-form-item v-if="isIndustrialMatrix" class="" :label="`IM CSM`">
						<el-switch
							v-model="formData.is_im_csm"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<el-form-item label="MFA" prop="is_mfa_enabled">
						<el-switch
							@change="formData.mfa_type = null"
							:disabled="disableMfaSwitcher"
							v-model="formData.is_mfa_enabled"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<MFABlock
						:disabled="!!disableMfaBlock"
						class="el-form-item"
						v-if="formData.is_mfa_enabled && itemId"
						v-model="formData.mfa_type"
						:phone_number="formData.phone_number"
						:isPhoneVerified="isPhoneVerified"
					/>

					<div class="el-form-item daily-summary-form-item">
						<!-- <label class="el-form-item__label">{{tt('phrases.daily_summary_notify_at')}}</label> -->
						<div class="flex mrow align-center">
							<el-form-item
								class="mcol-xs-4 checkbox-part"
								:label="`${tt('phrases.daily_summary')}`"
							>
								<el-checkbox
									v-model="formData.is_day_summary_notify"
									:true-label="1"
									:false-label="0"
									>{{ tt('Email') }}</el-checkbox
								>
							</el-form-item>

							<el-form-item
								v-if="formData.is_day_summary_notify"
								class="mcol-xs-8"
								prop="daily_summary_notify_at"
							>
								<el-time-select
									v-model="formData.daily_summary_notify_at"
									:picker-options="{
										start: '00:00',
										step: '00:15',
										end: '23:45'
									}"
									:placeholder="`${tt('select')} ${tt('time')}`"
								>
								</el-time-select>
							</el-form-item>
						</div>
					</div>
				</div>

				<div
					v-show="activeTab.prop == 'notificationsTab'"
					:class="[
						'tab-container',
						{ 'half-width': !fromAnotherInstance && !isMobile }
					]"
					key="tab-1"
				>
					<div class="el-form-item notifications-block">
						<NotificationsBlock
							:title="tt('Notifications')"
							class="notifications-block"
							ref="NotificationsBlock"
							:rows="userNotificationItemsList"
							:isPhoneVerified="isPhoneVerified"
						/>
					</div>

					<div class="el-form-item notifications-block">
						<NotificationsBlock
							:title="tt('phrases.Real_time_sensor_Notifications')"
							class="notifications-block"
							ref="NotificationsBlockRT"
							:rows="userRealTimeNotificationItemsList"
							:isPhoneVerified="isPhoneVerified"
						/>
					</div>

					<div class="el-form-item notifications-block">
						<NotificationsBlock
							:title="tt('phrases.Requisitions_Notifications')"
							class="notifications-block"
							ref="NotificationsBlockRequisitions"
							:rows="userRequisitionNotificationItemsList"
						/>
					</div>
				</div>

				<div
					v-if="itemId"
					v-show="activeTab.prop == 'reportsTab'"
					:class="['tab-container reports-tab']"
					key="tab-2"
				>
					<ReportsList
						insideOtherPage
						preventSetNavbar
						:userId="itemId"
						:isCSM="!!formData.is_im_csm"
						:enableBaselineReport="
							currentUserisIndustrialMatrix && itemId === authUser.id
						"
						:sensorsListProps="sensorsList"
						:plantsListProps="formData.company_id ? plantsList : allPlantsList"
					/>
				</div>

				<div
					v-if="itemId && hasApiTab"
					v-show="activeTab.prop == 'apiTab'"
					:class="['tab-container reports-tab']"
					key="tab-3"
				>
					<ClientApiCredentialsList
						insideOtherPage
						preventSetNavbar
						:userId="itemId"
						:canManageCredentials="isEditingOwnAccount"
					/>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				v-if="!fromModal && !['reportsTab', 'apiTab'].includes(activeTab.prop)"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import {
	USER_ROLES_TYPES,
	// WORK_ORDER_ROLES,
	// workOrderRolesList,
	PLANT_WORK_ORDER_TYPES,
	userNotificationTypesList,
	userRealTimeNotificationTypesList,
	userRequisitionNotificationTypesList,
	MFA_TYPES
} from '@/constants/global';

import { LANGUAGE_TYPES, languagesList } from '@/localization/utils';
// import { MENU_TYPES } from '@/constants/menuItems';

import { required } from '@/constants/validation';
import { itemFormMixin, requestsListMixin, subItemsListMixin } from '@/mixins';
import {
	removeObjProps,
	setupLabel
	// findItemBy
} from '@/helpers';
import { timeZonesList } from '@/constants/date_time';
import { isPasswordStrong } from '@/helpers/specialHelpers';

export default {
	mixins: [itemFormMixin(), requestsListMixin(), subItemsListMixin()],

	components: {
		PhoneInput: () => import('@/components/form/PhoneInput.vue'),
		NotificationsBlock: () => import('./NotificationsBlock.vue'),
		ReportsList: () => import('../UserReports/ItemsList.vue'),
		ClientApiCredentialsList: () => import('./ClientApiCredentialsList.vue'),
		MFABlock: () => import('./MFABlock.vue'),
		PhoneVerificationBlock: () => import('./PhoneVerificationBlock.vue'),

		PasswordCheckList: () => import('@/components/pages/PasswordCheckList.vue'),
		ProdlinesSelectItem: () => import('./ProdlinesSelectItem.vue')
	},

	props: {
		hideType: Boolean,
		hidePlants: Boolean,
		hideCompany: Boolean,

		activeTab: {
			type: Object,
			required: true
		},
		tabsList: {
			type: Array,
			required: true
		}
	},

	data() {
		return {
			startingElementIdx: 0,

			showPassTooltip: false,
			country_code_item: null,
			daily_summary_notify_enabled: false,

			confirmedPhoneNumber: '',

			userRolesList: [],
			userRolesLoading: false,

			companiesLoading: false,
			companiesList: [],
			plantsLoading: false,
			plantsList: [],
			allPlantsLoading: false,
			allPlantsList: [],
			sensorsLoading: false,
			sensorsList: [],

			userNotificationItemsList: [],
			userRealTimeNotificationItemsList: [],
			userRequisitionNotificationItemsList: [],

			formData: {
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
				// distributor_id: null,
				// distributor_location_id: null,

				// work_order_role: 0,
				hourly_rate: '',

				// is_device_notifiable: 0,
				language: LANGUAGE_TYPES.ENGLISH,

				is_mfa_enabled: 0,
				mfa_type: null,
				timezone: null,

				// reporting_plants: [],
				is_im_csm: 0,

				is_monitoring_all_notifiable_plants: false,
				notifiable_production_lines: []
				// is_amplitude_alarm_notifiable: false,
			},

			submitUserFormData: {},

			rules: {
				first_name: required,
				last_name: required,
				email: required,
				password: [{ validator: this.validatePassword, trigger: 'blur' }],
				password_confirmation: [
					{ validator: this.validateConfirmPassword, trigger: 'blur' }
				]

				// hourly_rate: required
				// is_real_time_notify: required,
				// is_day_summary_notify: required
			}
		};
	},

	computed: {
		...mapState({
			// globalPlantsLoading: state => state.global.globalPlantsLoading,
			// globalPlantsList: state => state.global.globalPlantsList,
			currentUserisIndustrialMatrix: state =>
				state.auth.isIndustrialMatrix || state.auth.isDeveloper,
			currentUserIsCustomer: state => state.auth.isCustomer,
			currentUserIsDeveloper: state => state.auth.isDeveloper,
			globalFilters: state => state.global.globalFilters
		}),

		subItemsSettings: () =>
			Object.freeze([
				{ ref: 'NotificationsBlock', targetProp: 'notification_rules' },
				{ ref: 'NotificationsBlockRT', targetProp: 'notification_rules' },
				{ ref: 'NotificationsBlockRequisitions', targetProp: 'notification_rules' },
				{ ref: 'ProdlinesSelectItem', targetProp: 'notifiable_production_lines' }
			]),
		timeZonesList: () => Object.freeze(timeZonesList()),
		MFA_TYPES: () => Object.freeze(MFA_TYPES),

		userNotificationTypesList: () => Object.freeze(userNotificationTypesList()),
		userRealTimeNotificationTypesList: () =>
			Object.freeze(userRealTimeNotificationTypesList()),
		userRequisitionNotificationTypesList: () =>
			Object.freeze(userRequisitionNotificationTypesList()),

		disableMfaSwitcher() {
			return (
				this.itemId &&
				this.authUser &&
				this.authUser.id !== this.itemId &&
				this.itemData &&
				!this.formData.is_mfa_enabled
			);
		},

		disableMfaBlock() {
			return (
				!this.itemId ||
				this.disableMfaSwitcher ||
				(this.authUser && this.authUser.id !== this.itemId)
			);
		},

		isPhoneVerified() {
			// return false
			const { itemId, itemData, formData, confirmedPhoneNumber } = this;
			return (
				itemId &&
				((itemData.phone_number && itemData.phone_number == formData.phone_number) ||
					(confirmedPhoneNumber && confirmedPhoneNumber == formData.phone_number))
			);
		},

		finalUserRolesList() {
			if (this.userRolesList.length) {
				const { role } = this.authUser;
				return this.currentUserIsDeveloper
					? this.userRolesList.concat(role)
					: this.userRolesList;
			}
			return [];
		},

		filteredUserRolesList() {
			const { role } = this.authUser;
			if (this.currentUserisIndustrialMatrix) {
				return this.finalUserRolesList;
			}

			if (role) {
				return this.finalUserRolesList.filter(
					item =>
						(role.child_role_ids && role.child_role_ids.includes(item.id)) ||
						item.id === role.id
				);
			}
			return [];
		},

		selectedRole() {
			if (this.finalUserRolesList && this.formData.role_id) {
				return this.finalUserRolesList.find(r => r.id === this.formData.role_id);
			}
			return null;
		},

		isIndustrialMatrix: that =>
			that.selectedRole &&
			(that.selectedRole.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX ||
				that.selectedRole.type === USER_ROLES_TYPES.DEVELOPER),
		isCustomer: that =>
			that.selectedRole && that.selectedRole.type === USER_ROLES_TYPES.CUSTOMER,
		isTechnician: that => that.selectedRole && that.selectedRole.is_technic,
		isEditingOwnAccount: that =>
			!!that.itemId && !!that.authUser && that.itemId === that.authUser.id,

		setupLabel: () => setupLabel,

		languagesList: () => languagesList,
		PLANT_WORK_ORDER_TYPES: () => PLANT_WORK_ORDER_TYPES,
		// workOrderRolesList: () => Object.freeze(workOrderRolesList()),

		isHideType: that => that.hideType || that.settings.hideType || false,
		isHidePlants: that => that.hidePlants || that.settings.hidePlants || false,
		isHideCompany: that =>
			that.hideCompany || that.settings.hideCompany || that.currentUserIsCustomer,

		hasApiTab: that => that.tabsList && that.tabsList.some(t => t.prop === 'apiTab'),
		/*reportsListFilters: that => that.itemId && Object.freeze({ 
			userId: that.itemId,
		}),*/
		/*isFabShopManager() {
			return (
				this.authUser &&
				this.authUser.work_order_role === WORK_ORDER_ROLES.FAB_SHOP_MANAGER
			);
		},*/

		// userPropsToUse: () => ['company_id', 'type'],
		// userPropsToUseForDistrib: () => ['company_id', 'distributor_id', 'type'],

		requestsToDoList() {
			let settings = [
				{
					action: 'fetch_plants',
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				},
				{
					action: 'fetch_plants',
					localProp: 'allPlantsList',
					localLoadProp: 'allPlantsLoading',
					payload: { params: { max: -1, archived: true } }
				},
				{
					action: 'fetch_user_roles',
					localProp: 'userRolesList',
					localLoadProp: 'userRolesLoading'
				}
			];

			if (this.currentUserisIndustrialMatrix) {
				settings[0].bindTo = [
					{
						prop: 'formData.company_id',
						param: 'companyId',
						clean_prop: 'formData.plants_ids'
					}
				];

				settings.push({
					action: 'fetch_companies',
					payload: { options: { notLoading: this.hideCompanies } },
					localProp: 'companiesList',
					localLoadProp: 'companiesLoading'
				});
			} else {
				settings[0].payload = { params: { companyId: this.authUser.company_id } };
			}
			// console.log(settings)
			return Object.freeze(settings);
		},

		prepareSubmitDataSettings: () =>
			Object.freeze({
				skipValueValidationProps: ['phone_number', 'country_code']
			}),

		equalsToAccountName() {
			return this.formData.email === this.formData.password;
		},

		routeQuery() {
			const { query } = this.$route;
			return Object.keys(query).length ? query : null;
		},

		selectedPlantIds() {
			return this.formData.plants_ids;
		}

		/*selectedPlant() {
			const { plantsList, formData } = this;
			if (formData.plants_ids && plantsList.length) {
				return Object.freeze(findItemBy('id', formData.plants_ids, plantsList));
			}
			return null;
		},*/

		/*selectedPlantsWORoles() {
			const { plantsList, formData } = this;
			let result = {
				// hasRole: false,
				hasFabRole: false,
				hasRequisitionRole: false,
				roles: []
			};

			if (formData.plants_ids.length && plantsList.length) {
				formData.plants_ids.forEach(id => {
					const plant = findItemBy('id', id, plantsList);
					if (plant && plant.work_order_role) {
						const { work_order_role } = plant;
						result.roles.push(work_order_role);
						if (work_order_role === PLANT_WORK_ORDER_TYPES.FABRICATION) {
							result.hasFabRole = true;
						}
						if (work_order_role === PLANT_WORK_ORDER_TYPES.REQUISITION) {
							result.hasRequisitionRole = true;
						}
						// selectedPlants.push(plant);
					}
				});
			}

			return Object.freeze(result);
		}*/

		// canadaRegExp: () => /^\+1/
	},

	methods: {
		...mapActions({
			fetch_user_roles: 'user_roles/fetch_user_roles',
			fetch_companies: 'companies/fetch_companies',
			fetch_plants: 'plants/fetch_plants',
			fetch_sensors: 'sensors/fetch_sensors',

			save_item: 'users/save_user'
		}),

		handlePhoneVerified() {
			this.confirmedPhoneNumber = this.formData.phone_number;
		},

		handlePlantsChange(ids) {
			if (ids && ids.length) {
				if (this.itemId) {
					this.fetchSensors(ids);
				}
			} else {
				this.sensorsList = [];
			}
		},

		fetchSensors(plantIds) {
			const payload = { params: { max: -1, plantIds: plantIds } };

			this.doFetchAction('fetch_sensors', 'sensorsList', 'sensorsLoading', payload);
		},

		/*handlePlantsChange(ids) {
			this.formData.notifiable_plants = ids;
		},*/

		validatePassword(rule, value, callback) {
			// console.log('validatePassword', rule)
			if (!value) {
				if (this.rules.password.some(ri => ri.required)) {
					callback(new Error(this.$t('phrases.password_is_required')));
				} else {
					callback();
				}
			} else {
				if (!isPasswordStrong(value.trim()).isStrong || this.equalsToAccountName) {
					callback(new Error(this.$t(`aliases.password_validation`)));
				}

				/*if (value !== this.formData.password_confirmation) {
					callback(new Error(this.$t(`aliases.passwords_compar_error`)));					
				}*/
			}

			callback();
		},

		validateConfirmPassword(rule, value, callback) {
			if (this.formData.password) {
				if (value !== this.formData.password) {
					callback(new Error(this.$t(`aliases.passwords_compar_error`)));
				}
			}
			callback();
		},

		setupNotificationsBlockList({ list, itemData }) {
			return list.map(mi => {
				let item = {
					title: mi.name,
					formData: {
						message_type: mi.id,
						is_email: 0,
						is_sms: 0,
						is_push: 0
					}
				};
				// console.log(mi)
				if (itemData && itemData.notification_rules) {
					const found = itemData.notification_rules.find(
						p => p.message_type === item.formData.message_type
					);
					if (found) {
						item.formData = { ...found };
					}
				}

				return item;
			});
		},

		localSetupPage(itemData) {
			/*if (!this.currentUserisIndustrialMatrix) {
				this.userRolesList = item ? [item.role] : [this.authUser.role];
			}*/

			if (itemData) {
				this.confirmedPhoneNumber = itemData.phone_number;
				/*this.formData.phone_number = this.setupPhone(
					this.country_code_item,
					this.formData.phone_number
				);*/
				/*if (this.isCustomer) {
					this.handlePlantsChange(item.plants_ids);					
				}*/
				/*if (itemData.daily_summary_notify_at) {
					this.daily_summary_notify_enabled = true;
				}*/
				this.handlePlantsChange(itemData.plants_ids);

				if (this.routeQuery && this.routeQuery.enableMfa == 'true') {
					this.formData.is_mfa_enabled = 1;
				}
			} else {
				// this.rules.password.push(required)
			}

			/*if (!this.confirmedPhoneNumber) {
				this.formData.mfa_type = null;
			}*/

			this.userNotificationItemsList = this.setupNotificationsBlockList({
				list: this.userNotificationTypesList,
				itemData
			});
			this.userRealTimeNotificationItemsList = this.setupNotificationsBlockList({
				list: this.userRealTimeNotificationTypesList,
				itemData
			});
			this.userRequisitionNotificationItemsList = this.setupNotificationsBlockList({
				list: this.userRequisitionNotificationTypesList,
				itemData
			});
		},

		handleUserRoleChange() {
			// console.log(type)
			if (!this.isCustomer) {
				this.formData.plants_ids = [];
				this.formData.company_id = null;
			}

			this.$emit('updateApiTabVisibility', this.canViewApiTab);
		},

		localValidationHook() {
			if (
				!this.isIndustrialMatrix &&
				!this.formData.is_monitoring_all_notifiable_plants &&
				!this.formData.notifiable_production_lines.length
			) {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`aliases.prodline_warn_1`)
				});
				return false;
			}

			if (
				!this.isPhoneVerified &&
				this.formData.is_mfa_enabled &&
				this.formData.mfa_type === MFA_TYPES.SMS
			) {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`aliases.mfa_warn_3`)
				});
				return false;
			}

			this.submitForm();
		},

		localPrepareSubmitData(data) {
			// data.phone_number = this.preparePhone(data.phone_number);
			// data.country_code = data.country_code == 'other' ? null : data.country_code;

			if (!this.itemId) {
				data = removeObjProps(data, [
					'password',
					'password_confirmation',
					'current_password'
				]);
			}

			if (this.isIndustrialMatrix) {
				data = removeObjProps(data, [
					'company_id',
					'plants_ids',
					'is_monitoring_all_notifiable_plants',
					'notifiable_production_lines'
					// 'is_real_time_notify',
					// 'is_day_summary_notify',
					// 'is_mail_sensor_job_notify',
					// 'is_sms_sensor_job_notify',
					// 'daily_summary_notify_at',
				]);
			} else {
				data = removeObjProps(data, ['notifiable_plants']);
				data.is_im_csm = 0;
			}

			if (data.password) {
				data.password = data.password.trim();
			}

			if (
				!this.selectedRole.is_requisitioner &&
				!this.selectedRole.is_fab_shop_manager
			) {
				data.work_order_role = 0;
			}

			if (!this.selectedRole.is_technic) {
				data.hourly_rate = 0;
			}

			if (!data.is_day_summary_notify) {
				data.daily_summary_notify_at = null;
			}

			if (!data.phone_number) {
				data.country_code = null;
			}

			/*if (this.disableMfaSwitcher) {
				data.is_mfa_enabled = this.itemData ? this.itemData.is_mfa_enabled : data.is_mfa_enabled;
			}*/

			if (this.itemId !== this.authUser.id && data.is_mfa_enabled) {
				delete data.is_mfa_enabled;
			}

			return data;
		},

		localSubmit(data) {
			if (this.$refs['PhoneInput'] && this.$refs['PhoneInput']._data.hasError) {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.please_check_phone_number_form_field_first`)
				});
			} else {
				// console.log('submit', data)
				this.$emit('submit', data);
			}
		}
	},

	watch: {
		/*'formData.plants_ids'(ids) {
			console.log(ids)
			if (ids && ids.length) {
				if (this.itemId) {
					this.fetchSensors(ids);
				}
			} else {
				this.sensorsList = [];
			}
		},*/
		'formData.password'(val) {
			this.rules.current_password = this.itemId && val ? required : null;
		}

		/*'formData.report_notifiable_plants'() {
			this.formData.reporting_plants = [];
		},*/
		/*'formData.is_im_csm'() {
			this.formData.reporting_plants = [];
		}*/
	}
};
</script>
