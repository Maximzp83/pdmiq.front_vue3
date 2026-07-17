<template>
	<div
		class="edit-form-container "
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item
				:label="tt('Company')"
				prop="company_id"
				v-if="!hideCompanies && isIndustrialMatrix"
			>
				<CustomSelect
					filterable
					:optionsLoading="companiesLoading"
					:optionsList="companiesList"
					:placeholder="`${tt('Select')} ${tt('company')}`"
					v-model="formData.company_id"
				/>
				<!-- <SimpleSpinner :active="companiesLoading" />
				<el-select
					filterable
					:disabled="!companiesList.length"
					v-model="formData.company_id"
					:placeholder="`${tt('Select')} ${tt('company')}`"
				>
					<el-option
						v-for="item in companiesList"
						:key="'company_id-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select> -->
			</el-form-item>

			<el-form-item
				label="IM CSM"
				prop="im_csms"
				v-if="isIndustrialMatrix || adminsList.length"
			>
				<CustomSelect
					filterable
					multiple
					collapse-tags
					:optionsLoading="usersLoading"
					:optionsList="adminsList"
					:placeholder="`${tt('Select')} ${tt('admins')}`"
					labelKey="full_name"
					v-model="formData.im_csms"
				/>
			</el-form-item>

			<el-form-item :label="tt('Champions')" prop="champions">
				<CustomSelect
					filterable
					multiple
					collapse-tags
					:optionsLoading="plantUsersLoading"
					:optionsList="thisPlantUsersList"
					:placeholder="`${tt('Select')} ${tt('users')}`"
					labelKey="full_name"
					v-model="formData.champions"
				/>
			</el-form-item>

			<el-form-item :label="tt('Logo')" prop="file" class="upload-form-item">
				<FileUploadBlock
					ref="FileUploadBlock"
					rotate
					deleteFileId
					showDeleteButton
					:pictures="itemPictures"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Plant')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item
				:label="tt('phrases.joined_at')"
				prop="joined_at"
				class="half-width"
			>
				<Datepicker
					v-model="formData.joined_at"
					:placeholder="`${tt('Select')} ${tt('date')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Region')" prop="region">
				<el-input v-model="formData.region" />
			</el-form-item>

			<el-form-item :label="tt('Address')" prop="address">
				<el-input v-model="formData.address" />
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
						
						<!-- <el-checkbox
							v-model="formData.is_amplitude_alarm_tracking"
							:true-label="1"
							:false-label="0"
						/> -->
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

			<!--<el-form-item :label="`${tt('Status')} ${tt('Plant')}`" prop="work_order_role">
				<el-checkbox
					v-for="item in plantWorkOrderTypesList"
					:key="`pwo-${item.id}`"
					:true-label="item.value"
					:false-label="0"
					v-model="formData.work_order_role"
					>{{ item.label }}</el-checkbox
				>
			</el-form-item> -->

			<el-form-item :label="tt('time_zone')" prop="time_zone">
				<el-select
					v-model="formData.time_zone"
					:placeholder="`${tt('select')} ${tt('time_zone')}`"
					filterable
				>
					<el-option
						v-for="item in timeZonesList"
						:key="'utc_id-' + item.id"
						:label="item.label"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('Measurement')" prop="metric_system_type">
				<CustomSelect
					:optionsList="metricSystemsList"
					:placeholder="`${tt('select')} ${tt('system')}`"
					v-model="formData.metric_system_type"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('phrases.industrial_services')"
				prop="industrial_service_ids"
			>
				<CustomSelect
					filterable
					multiple
					collapse-tags
					:optionsLoading="industrialServicesLoading"
					:optionsList="industrialServicesList"
					:placeholder="`${tt('Select')} ${tt('services')}`"
					v-model="formData.industrial_service_ids"
				/>
			</el-form-item>

			<el-form-item label="ZOHO Deal ID" prop="zoho_id">
				<CustomInput v-model="formData.zoho_id" placeholder="ID" />
			</el-form-item>

			<el-form-item
				class="mcol-xs-6"
				v-if="isIndustrialMatrix"
				:label="`${tt('Billing_Plan')} ${tt('Cost')}`"
				prop="billing_plan_cost"
			>
				<el-input v-model.number="formData.billing_plan_cost" />
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

			<el-form-item
				class=""
				:label="`${tt('Meeting_Tracker')} ${tt('Email_List')}`"
				prop="meeting_tracker_mail_list"
			>
				<el-input v-model="formData.meeting_tracker_mail_list" />
			</el-form-item>

			<!-- <el-form-item label="Work Stations">
				<div class="options-container">
					<div v-if="workStationsItemsList.length" class="content-row">
						<WorkStationItem
							ref="WorkStationItem"
							v-for="(item, idx) in workStationsItemsList"
							:key="`ws_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="id => removeFormItem(id, 'workStationsItemsList')"
							@ready="blockReady"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="mini"
							type="success"
							icon="icomoon icon-cross"
							@click="addFormItem('workStationsItemsList', 'ws_i-')"
						/>
					</div>
				</div>
			</el-form-item> -->
			<!-- <el-form-item label="Controllers" prop="controllers_ids">
				<div class="flex">
					<div class="relative mcol-xs-10 fluid">
						<SimpleSpinner :active="controllersLoading" />

						<el-select
							multiple
							:disabled="!controllersList.length"
							v-model="formData.controllers_ids"
							placeholder="Select controllers"
						>
							<el-option
								v-for="item in controllersList"
								:key="'controller_id-' + item.id"
								:label="item.name"
								:value="item.id"
							/>
						</el-select>
					</div>

					<el-button
						v-if="!fromAnotherInstance"
						:class="'create-button'"
						:disabled="!itemId"
						@click="handleCreateSubItem('init_controller_modal', 'controllerDialogVisible')"
						size="mini"
						type="danger"
						icon="icomoon icon-plus"
					/>
				</div>
			</el-form-item> -->

			<!-- <el-form-item
				:label="tt('phrases.Notifications_for')"
				prop="sensor_default_notifications"
			>
				<SimpleSpinner :active="usersLoading" />
				<div class="flex">
					<div class="relative mcol-xs-10 fluid span-block">
						<el-select
							multiple
							collapse-tags
							:disabled="!usersList.length"
							v-model="formData.sensor_default_notifications"
							:placeholder="`${tt('Select')} ${tt('users')}`"
						>
							<el-option
								v-for="item in usersList"
								:key="'sms_user_id-' + item.id"
								:label="item.full_name"
								:value="item.id"
							/>
						</el-select>
					</div>

					<el-button
						v-if="!fromAnotherInstance"
						@click="createUser"
						:class="'create-button span-block'"
						:disabled="!itemId"
						size="mini"
						type="danger"
						icon="icomoon icon-plus"
					/>
				</div>
			</el-form-item> -->

			<el-form-item
				:label="tt('phrases.enable_run_hour_tracking_for_sensors')"
				prop="is_equipment_runtime_tracking"
				class="label_pt-0"
			>
				<el-switch
					v-model="formData.is_equipment_runtime_tracking"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Commissioning')"
				prop="is_commissioning"
			>
				<el-switch
					v-model="formData.is_commissioning"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				v-if="$hasAccessTo(['archive_plants'])"
				:label="tt('Archive')"
				prop="is_archived"
			>	
				<el-switch
					v-model="formData.is_archived"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				v-if="!isNew && $hasAccessTo(['archive_plants'])"
				:label="tt('constants.Blocked')"
				prop="is_blocked"
			>	
				<el-switch
					v-model="formData.is_blocked"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item :label="tt('Locations')" prop="locations">
				<div class="options-container">
					<div v-if="locationsItemsList.length" class="content-row">
						<LocationItem
							ref="LocationItem"
							v-for="(item, idx) in locationsItemsList"
							:key="`location_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="id => removeFormItem(id, 'locationsItemsList')"
						/>
					</div>

					<div class="margin-top-row">
						<el-button
							class="action-button create-button"
							size="mini"
							type="success"
							icon="icomoon icon-cross"
							@click="addFormItem('locationsItemsList', 'l_i-')"
						/>
					</div>
				</div>
			</el-form-item>

			<!-- ----------Conveyor------ -->
			<!-- <el-form-item
				label="Counting"
				prop="has_conveyor_mode"
			>
				<el-switch v-model="formData.has_conveyor_mode"
					:active-value="1" :inactive-value="0"
				/>
			</el-form-item> -->

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>

		<!-- <div v-if="init_controller_modal">
			<el-dialog
				center
				title="New Controller"
				:append-to-body="true"
				:visible.sync="controllerDialogVisible"
				:class="'small controller-modal'"
			>
				<div class="">
					<div class="nav-tabs-container small">
						<div class="main-group ">
							<el-button
								type="primary"
								v-for="tab in tabsList"
								:key="`tab_${tab.title}`"
								:class="['capitalize', { active: tab.prop == activeTab }]"
								round
								@click="toggleTab(tab)"
								v-text="tab.title"
							/>
						</div>
					</div>

					<ControllersItemForm
						ref="ControllersItemForm"
						@submit="handleControllerSubmitForm"
						:itemData="{ plant_id: itemId, company_id: formData.company_id }"
						:hideCompanies="true"
						:hidePlants="true"
						:activeTab="activeTab"
						:tabsList="tabsList"
					/>
				</div>

				<span slot="footer" class="dialog-footer">
					<el-button type="primary" :loading="controllerSaving" @click="handleSaveSubItem('ControllersItemForm')"
						class="uppercase">{{tt('SAVE')}}</el-button
					>
					<el-button @click="controllerDialogVisible = false">Cancel</el-button>
				</span>
			</el-dialog>
		</div> -->
	</div>
</template>

<script>
// import 'element-ui/lib/theme-chalk/time-picker.css';

import { mapActions, mapState } from 'vuex';
import { required } from '@/constants/validation';
import { timeZonesList } from '@/constants/date_time';
import { cleanDateString } from '@/helpers';

import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin
} from '@/mixins';

import {
	USER_ROLES_TYPES
	// plantWorkOrderTypesList,
} from '@/constants/global';

import { metricSystemsList } from '@/modules/charts_factory/controllers/Sensor/enums';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin()
	],
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		// TabsBar: () => import('@/components/common/TabsBar.vue'),
		// ControllersItemForm: () => import('../Controllers/ItemForm.vue'),
		// UsersItemForm: () => import('../Users/ItemForm.vue'),
		LocationItem: () => import('./LocationItem.vue')
		// WorkStationItem: () => import('./WorkStationItem.vue')
	},
	props: {
		hideCompanies: Boolean
	},

	data() {
		return {
			locationsItemsList: [],

			companiesLoading: false,
			companiesList: [],
			machinesLoading: false,
			machinesList: [],
			usersLoading: false,
			usersList: [],
			thisPlantUsersList: [],
			plantUsersLoading: false,
			industrialServicesLoading: false,
			industrialServicesList: [],
			userSaving: false,

			workStationsItemsList: [],

			formData: {
				type: 1,
				name: '',
				address: '',
				region: '',
				company_id: null,
				controllers_ids: [],
				// notifications: [],
				// sensor_default_notifications: [],

				// work_order_role: 0,
				time_zone: 0,
				// file: null,
				industrial_service_ids: [],
				billing_plan_cost: null,
				im_csms: [],
				billing_plant_renewal_date: '',
				champions: [],
				locations: [],
				metric_system_type: null,

				meeting_tracker_mail_list: '',
				is_amplitude_alarm_tracking: false,
				amplitude_alarm_threshold_multiplier: 2.5,
				is_equipment_runtime_tracking: false,
				is_commissioning: false,

				is_archived: false,
				is_blocked: false,
				joined_at: '',
				zoho_id: '',
				// workStations: []
				// ---------------
				// has_conveyor_mode: 0,
			},

			rules: {
				name: required,
				address: required,
				company_id: required,
				region: required
			},

			init_controller_modal: false,
			init_user_modal: false,
			controllerDialogVisible: false,
			userDialogVisible: false
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,

			globalFilters: state => state.global.globalFilters
		}),

		timeZonesList: () => Object.freeze(timeZonesList()),
		metricSystemsList: () => Object.freeze(metricSystemsList()),

		adminsList: that =>
			Object.freeze(
				that.usersList.filter(
					ui => ui.role && ui.role.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX
				)
			),

		/*thisPlantUsersList() {
			if (this.itemId && this.usersList.length) {
				return Object.freeze(
					this.usersList.filter(ui => this.itemId === ui.plant_id)
				);
			}
			return [];
		},*/

		// plantWorkOrderTypesList: () => plantWorkOrderTypesList().filter(pi => !!pi.id),

		uploadSettings: () => ({
			fileProp: 'file'
		}),

		itemPictures() {
			const { itemData } = this;
			if (itemData && itemData.file) {
				return [{ file: itemData.file }];
			}

			return [];
		},

		/*tabsList: () => [
			{ title: 'main', prop: 'mainTabActive' },
			{ title: 'formulas', prop: 'formulasTabActive' }
		],*/

		subItemsSettings: () => Object.freeze([
			{ ref: 'FileUploadBlock', setIfEmpty: { prop:'delete_file', val: 1 }, cleanIfEmpty: { prop:'file', val: null } },
			{ ref: 'LocationItem', targetProp: 'locations'},
		]),

		requestsToDoList() {
			let items = [
				{
					action: 'fetch_companies',
					payload: {
						options: { notLoading: this.hideCompanies }
					},
					localProp: 'companiesList',
					localLoadProp: 'companiesLoading'
				},
				{
					action: 'fetch_users',
					payload: { params: { type: USER_ROLES_TYPES.INDUSTRIAL_MATRIX } },
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				},
				/*{
					action: 'fetch_users',
					payload: { params: { forNotifiable: true } },
					bindTo: [
						{
							prop: 'formData.company_id',
							alternate_prop: 'formData.sensor_default_notifications',
							clean_prop: 'formData.sensor_default_notifications',
							param: 'companyId'
						}
					],
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				},*/
				{
					action: 'fetch_users',
					payload: { params: { plantId: this.itemId } },
					// notFetch: !this.itemId,
					localProp: 'thisPlantUsersList',
					localLoadProp: 'plantUsersLoading'
				},
				{
					action: 'fetch_machines',
					payload: { params: { plantId: this.globalFilters.plantId } },
					bindTo: [
						{
							prop: 'formData.has_conveyor_mode',
							// clean_prop: 'formData.conveyor_processes',
							param: ''
						}
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				},
				{
					action: 'fetch_industrial_services',
					localProp: 'industrialServicesList',
					localLoadProp: 'industrialServicesLoading'
				}
			];

			/*items.push({
				action: 'fetch_controllers',
				payload: { params: { max: -1 } },
				clean_up: 'set_controllers'
			});*/

			return Object.freeze(items);
		},

		prepareSubmitDataSettings: () =>
			Object.freeze({
				skipValueValidationProps: ['meeting_tracker_mail_list']
			})
	},

	methods: {
		...mapActions({
			fetch_companies: 'companies/fetch_companies',
			set_companies: 'companies/set_companies',
			fetch_machines: 'machines/fetch_machines',
			fetch_industrial_services: 'industrial_services/fetch_industrial_services',

			// fetch_controllers: 'controllers/fetch_controllers',
			// set_controllers: 'controllers/set_controllers',
			fetch_users: 'users/fetch_users',
			set_users: 'users/set_users',
			save_controller: 'controllers/save_controller'
			// save_user: 'users/save_user'
		}),

		createUser() {
			let modalSettings = {
				show: true,
				instanceName: 'Users',
				instanceData: {
					type: 2,
					company_id: this.formData.company_id,
					plant_id: this.itemId
				},
				settings: {
					hideType: true,
					hidePlants: true,
					hideCompany: true,
					fromAnotherInstance: true
				},
				title: 'Create User',
				callback: this.userCreated
			};

			this.show_edit_modal(modalSettings);
		},

		/*userCreated(answer) {
			const payload = {
				params: {
					max: -1,
					forNotifiable: true,
					companyId: this.formData.company_id
				}
			};

			this.doFetchAction('fetch_users', 'usersList', 'usersLoading', payload);

			const { data } = answer;
			// console.log(answer)
			if ((data && data.status === 'created') || answer.id) {
				this.formData.sensor_default_notifications.push(data.data.id);
			}

			this.show_edit_modal({});
		},*/

		localSetupPage(itemData) {
			if (itemData) {
				this.locationsItemsList = this.setupFormSubItemsList(
					itemData.locations,
					'l_i'
				);

				this.faultsItemsList = this.setupFormSubItemsList(itemData.faults, 'f_i');

				this.breakTimeItemsList = this.setupFormSubItemsList(
					itemData.work_breaks,
					'bt_i'
				);
				/*this.processesItemsList = this.setupFormSubItemsList(
					itemData.conveyor_processes,
					'pr_i'
				);*/
				/*this.workStationsItemsList = this.setupFormSubItemsList(
					itemData.workStations,
					'ws_i'
				);*/

				if (itemData.im_csms.length) {
					this.formData.im_csms = itemData.im_csms.map(im => im.id);
				}
				if (itemData.champions.length) {
					this.formData.champions = itemData.champions.map(im => im.id);
				}

				if (itemData.billing_plant_renewal_date) {
					this.formData.billing_plant_renewal_date = cleanDateString(
						itemData.billing_plant_renewal_date,
						{ withoutTime: true }
					);
				}
			}

			if (!this.isIndustrialMatrix) {
				this.formData.company_id = this.authUser.company_id;
			}
		},

		localPrepareSubmitData(data) {
			if (!data.is_amplitude_alarm_tracking) {
				delete data.amplitude_alarm_threshold_multiplier;
			}
			if (!this.isIndustrialMatrix && !this.adminsList.length) {
				delete data.im_csms;
			}
			return data;
		}

		/*setupForm(itemData, formData) {
			const companyId = itemData.company ? itemData.company.id : null
			const additionalRules = { company_id: companyId };
			return updateFormData(itemData, formData, additionalRules);
		},*/

		/*handleCompanyChange(id) {
			if (id) {
				this.formData.sensor_default_notifications = [];
				this.fetch_users({ params: { companyId: id, max: -1 } });
			}
		},*/

		/*handleControllerSubmitForm(formData) {
			const options = {
				action: 'save_controller',
				refreshAction: 'fetch_controllers',
				mod_array: 'controllers_ids',
				dialog: 'controllerDialogVisible'
			};

			this.handleSubmitSubItemForm(formData, options);
		},*/
	}

	/*created() {
		// const actions = ['', 'fetch_controllers', 'fetch_users'];
		// this.startFetchRequests({ actions: actions, params: { max: -1 } });
		if (this.isIndustrialMatrix) {
			this.fetch_companies({ params: { max:-1 } }).then(() => {
				if (this.formData.company_id) {
					// this.doResponses({ actions: actions, params: { max: -1 } });
					this.fetch_users({
						params: {
							companyId: this.formData.company_id,
							forNotifiable: true
						}
					});
				}
			});
		} else {
			this.fetch_users({
				params: {
					companyId: this.authUser.company_id,
					forNotifiable: true
				}
			});
		}

		this.fetch_controllers({ params: { max: -1 } });
	},*/

	/*beforeDestroy() {
		this.cleanLists(['set_companies', 'set_controllers', 'set_users']);
	}*/
};
</script>
