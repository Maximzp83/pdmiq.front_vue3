<template>
	<div class="edit-form-container">
		<!-- :validate="" -->
		<el-form
			:class="['item-edit-form', { 'half-width': !fromModal }]"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Sensor')} ${tt('Type')}`" prop="data_set">
				<CustomSelect
					:disabled="!isNew && !itemData.is_archived"
					:optionsList="filteredDataSetsList"
					:placeholder="`${tt('Select')} ${tt('dataset')}`"
					v-model="formData.data_set"
					:setupLabelMethod="setupDataSetLabel"
				/>
			</el-form-item>
			
			<el-form-item :label="tt('Location')" prop="location_in_equipment" required>
				<CustomInput
					v-model="formData.location_in_equipment"
					:placeholder="`${tt('enter')} ${tt('location')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Controller')" prop="controller_id">
				<CustomSelect
					filterable
					:disabled="!isNew && !itemData.is_archived"
					:optionsLoading="controllersLoading"
					:optionsList="final_controllersList"
					:placeholder="`${tt('Select')} ${tt('controller')}`"
					v-model="formData.controller_id"
				/>
			</el-form-item>

			<el-form-item :label="tt('Node')" prop="port_number">
				<CustomSelect
					:disabled="!isNew && !itemData.is_archived"
					:optionsList="portsList"
					:placeholder="`${tt('Select')} ${tt('port')}`"
					v-model="formData.port_number"
				/>
			</el-form-item>

			<el-form-item :label="tt('MAC_address')" prop="mac_address">
				<el-input
					:disabled="!isNew && !itemData.is_archived"
					@input="handleMacAddressInput"
					:value="formData.mac_address"
					:placeholder="`${tt('example')}: 00:13:a2:00:41:f5:90:51`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.data_set === DATASET.NCD_4_20MA"
				:label="`${tt('Linespeed')} ${tt('Node')}`"
				prop="is_linespeed_node"
			>
				<el-checkbox
					v-model="formData.is_linespeed_node"
					:true-label="1"
					:false-label="0"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Archive')} ${tt('Node')}`"
				prop="is_archived"
				v-if="!isNew"
			>
				<el-checkbox
					@change="isArchivedChanged = !isArchivedChanged"
					v-model="formData.is_archived"
					:true-label="1"
					:false-label="0"
				/>
			</el-form-item>

			<div class="el-form-item" v-if="formData.data_set === DATASET.NCD_4_20MA">
				<el-form-item
					prop="ncd_config_sensor_boot_time_420ma"
					:label="`${tt('phrases.sensor_boot_time')}`"
					class="mcol-xs-6"
					required
				>
					<el-input-number v-model="formData.ncd_config_sensor_boot_time_420ma" />
				</el-form-item>

				<el-form-item
					prop="value_4ma"
					:label="`4mA ${tt('Value')}`"
					class="mcol-xs-6"
					required
				>
					<el-input-number v-model="formData.value_4ma" />
				</el-form-item>

				<el-form-item
					prop="value_20ma"
					:label="`20mA ${tt('Value')}`"
					class="mcol-xs-6"
					required
				>
					<el-input-number v-model="formData.value_20ma" />
				</el-form-item>

				<el-form-item
					:label="`${tt('Chart')} ${tt('Name')}`"
					prop="chart_name"
					required
				>
					<CustomInput
						v-model="formData.chart_name"
						:placeholder="`${tt('enter')} ${tt('name')}`"
					/>
				</el-form-item>

				<el-form-item :label="`${tt('units')}`" prop="chart_unit_label" required>
					<CustomInput
						v-model="formData.chart_unit_label"
						:placeholder="`${tt('enter')} ${tt('units')}`"
					/>
				</el-form-item>

				<!-- prop="data_set_convert_value" -->
				<el-form-item :label="`${tt('Expression')}`" class="showJustInfo">
					<!-- :placeholder="`${${tt('expression')}`" -->
					<CustomInput :value="ncd_4_20_expression" />
				</el-form-item>

				<el-form-item
					:label="`${tt('constants.Alarm')} ${tt('Type')}`"
					prop="alarm_type"
					required
				>
					<CustomSelect
						clearable
						:optionsList="ncdAlarmTypesList"
						:placeholder="`${tt('Select')} ${tt('type')}`"
						v-model="formData.alarm_type"
					/>
				</el-form-item>
			</div>

			<div
				class="el-form-item"
				v-if="formData.data_set === DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM"
			>
				<span class="el-form-item__label">{{ tt('Expression') }} </span>
				<span
					class="el-form-item__content"
					style="margin-left: 150px; display: block;"
					v-text="getExpression(formData.data_set)"
				></span>
			</div>

			<el-form-item
				:label="`${tt('Power')} ${tt('Type')}`"
				prop="power_type"
				v-show="isPowerTypeEnabled"
			>
				<CustomSelect
					clearable
					:optionsList="powerTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.power_type"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Sensor')} ${tt('Range')}`"
				prop="pressure_range"
				v-if="formData.data_set === DATASET.NCD_PRESSURE"
				required
			>
				<CustomSelect
					clearable
					:optionsList="ncdPressureRangesList"
					:placeholder="`${tt('Select')} ${tt('range')}`"
					v-model="formData.pressure_range"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Vertical')} ${tt('Axis')}`"
				prop="ncd_active_vertical_axis"
				v-if="
					formData.data_set === DATASET.NCD_WIRED_TEMP_VIBE ||
						formData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT ||
						formData.data_set === DATASET.NCD_ALL_IN_ONE_TEMP_VIBE
				"
				required
			>
				<CustomSelect
					:optionsList="ncdAxisList"
					:placeholder="`${tt('Select')} ${tt('axis')}`"
					v-model="formData.ncd_active_vertical_axis"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Axial')} ${tt('Axis')}`"
				prop="ncd_active_axial_axis"
				v-if="
					formData.data_set === DATASET.NCD_WIRED_TEMP_VIBE ||
						formData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT ||
						formData.data_set === DATASET.NCD_ALL_IN_ONE_TEMP_VIBE
				"
				required
			>
				<CustomSelect
					:optionsList="ncdAxisList"
					:placeholder="`${tt('Select')} ${tt('axis')}`"
					v-model="formData.ncd_active_axial_axis"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('phrases.hide_vertical_axis_rms')"
				prop="is_hidden_ncd_active_vertical_axis"
				v-if="
					formData.data_set === DATASET.NCD_WIRED_TEMP_VIBE ||
						formData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT ||
						formData.data_set === DATASET.NCD_ALL_IN_ONE_TEMP_VIBE
				"
			>
				<el-checkbox
					v-model="formData.is_hidden_ncd_active_vertical_axis"
					:true-label="1"
					:false-label="0"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('phrases.disable_IAQ')"
				prop="is_iaq_disabled"
				v-if="formData.data_set === DATASET.NCD_ENVIRONMENTAL"
			>
				<el-checkbox
					v-model="formData.is_iaq_disabled"
					:true-label="1"
					:false-label="0"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('phrases.is_google_cloud_data')"
				prop="is_google_cloud_data"
			>
				<el-checkbox
					v-model="formData.is_google_cloud_data"
					:true-label="1"
					:false-label="0"
				/>
			</el-form-item>

			<el-form-item
				prop="equipment_rpm"
				:label="`${tt('constants.Motor')} ${tt('RPM')}`"
				class="mcol-xs-6"
				v-if="
					formData.data_set === DATASET.NCD_WIRED_TEMP_VIBE ||
						formData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT ||
						formData.data_set === DATASET.NCD_ALL_IN_ONE_TEMP_VIBE
				"
			>
				<CustomInput
					v-model="formData.equipment_rpm"
					:placeholder="`${tt('enter')} ${tt('rpm')}`"
				/>
			</el-form-item>

			<el-form-item
				prop="current_sensor_rating"
				:label="`${tt('Current')} ${tt('Sensor')} ${tt('Rating')}`"
				class="mcol-xs-6"
				v-if="formData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT"
			>
				<CustomInput
					v-model="formData.current_sensor_rating"
					:placeholder="`${tt('enter')} ${tt('rating')}`"
				/>
			</el-form-item>

			<el-form-item
				:label="`${tt('Node')} ${tt('Type')}`"
				prop="node_type"
				v-if="formData.data_set === DATASET.NCD_4_20MA"
			>
				<CustomSelect
					clearable
					:optionsList="ncdNodeTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.node_type"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Position')"
				prop="ncd_ultrasound_position"
				v-if="
					formData.data_set === DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM ||
						(formData.data_set === DATASET.NCD_4_20MA &&
							formData.node_type === NCD_NODE_TYPES.POSITION_2)
				"
			>
				<CustomSelect
					:disabled="!isNew && !itemData.is_archived"
					:optionsList="ncdUltrasoundPositionsList"
					:placeholder="`${tt('Select')} ${tt('position')}`"
					:setupLabelMethod="setupPositionLabel"
					v-model="formData.ncd_ultrasound_position"
				/>
				<!-- v-model="formData.position" -->
			</el-form-item>

			<el-form-item
				:label="tt('phrases.Notifications_for')"
				prop="sensor_default_notifications"
			>
				<CustomSelect
					filterable
					multiple
					:optionsLoading="usersLoading"
					:optionsList="usersList"
					labelKey="full_name"
					:placeholder="`${tt('Select')} ${tt('users')}`"
					v-model="formData.sensor_default_notifications"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('phrases.samples_to_alarm')"
				prop="crash_indication_threshold"
			>
				<div class="flex">
					<el-input-number
						v-if="editAcute"
						v-model="formData.crash_indication_threshold"
						:min="1"
						:max="500"
					/>
					<div
						v-else
						class="bold value-instead-input"
						v-text="init_crash_indication_threshold"
					></div>
					<div
						class="link underline value-instead-input toggle-link"
						v-text="editAcute ? tt('Cancel') : tt('Change')"
						@click="toggleProp('editAcute')"
					></div>
				</div>
				<div class="">
					{{
						(editAcute
							? formData.crash_indication_threshold
							: init_crash_indication_threshold) * 5
					}}
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
					<div
						v-else
						class="bold value-instead-input"
						v-text="init_stable_samples"
					></div>
					<div
						class="link underline value-instead-input toggle-link"
						v-text="editStableSamples ? tt('Cancel') : tt('Change')"
						@click="toggleProp('editStableSamples')"
					></div>
				</div>
				<div class="">
					{{
						(editStableSamples ? formData.stable_samples : init_stable_samples) * 5
					}}
					minutes
				</div>
			</el-form-item>

			<el-form-item
				v-if="runtime_tracking_switcher"
				:label="tt('phrases.Show_Run_Hours')"
				prop="is_runtime_tracking"
			>
				<el-switch
					v-model="formData.is_runtime_tracking"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('phrases.runtime_tracking_threshold_data_value')"
				prop="runtime_tracking_threshold_data_value"
				v-if="formData.is_runtime_tracking"
			>
				<el-input-number v-model="formData.runtime_tracking_threshold_data_value" />
			</el-form-item>

			<!-- <el-form-item
				:label="`${tt('Recommended')} ${tt('Work_Order')}`"
				prop="is_creating_recommended_maintenance"
			>
				<div class="flex mrow align-center">
					<span class="mcol-xs-4">
						<el-switch v-model="formData.is_creating_recommended_maintenance" />
					</span>

					<span
						class="mcol-xs-8"
						v-show="formData.is_creating_recommended_maintenance"
					>
						<el-checkbox v-model="maintenanceWarning">Warning</el-checkbox>
						<el-checkbox v-model="maintenanceAlarm">Alarm</el-checkbox>
					</span>
				</div>
			</el-form-item> -->

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>

		<!-- <div class="mcol-xs-12 mcol-sm-6" v-if="itemData && itemData.equipment">
			<div class="item-info-block inline ">
				<div class="info-item">
					<div class="label">Machine name:</div>
					<div class="info"><b v-text="itemData.equipment.machine_name"></b></div>
				</div>
				<div class="info-item">
					<div class="label">Brand:</div>
					<div class="info"><b v-text="itemData.equipment.brand_name"></b></div>
				</div>
				<div class="info-item">
					<div class="label">Location:</div>
					<div class="info"><b v-text="itemData.equipment.location_name"></b></div>
				</div>
				<div class="info-item">
					<div class="label">Part number:</div>
					<div class="info"><b v-text="itemData.equipment.part_number"></b></div>
				</div>
				<div class="info-item">
					<div class="label">Item type:</div>
					<div class="info"><b v-text="itemData.equipment.item_type"></b></div>
				</div>
			</div>
		</div> -->
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { required } from '@/constants/validation';
import { findItemBy, prepareSubmitData } from '@/helpers';
import { macAddressMask } from '@/helpers/specialHelpers';

import {
	dataSetsList,
	SENSOR_TYPES,
	DATASET,
	powerTypesList,
	ncdUltrasoundPositionsList,
	ncdPressureRangesList,
	ncdNodeTypesList,
	NCD_NODE_TYPES,
	ncdAlarmTypesList
} from '@/constants/global';

import { ncdAxisList } from '@/modules/charts_factory/controllers/Sensor/enums';
// import { ADJUSTMENT_ACTIONS_TYPES } from '@/constants/ultrasound';

import {
	// itemFormMixin,
	requestsListMixin,
	sensorTypeMixin,
	actionButtonsMixin,
	subItemMixin,
	webSocketMixin
} from '@/mixins';

export default {
	mixins: [
		// itemFormMixin(),
		requestsListMixin(),
		sensorTypeMixin(),
		actionButtonsMixin(),
		subItemMixin(),
		webSocketMixin()
	],
	props: {
		equipmentData: {
			type: Object,
			default: () => ({})
		},

		isNew: Boolean,
		controllersList: Array,
		formulasList: Array,
		commonItemsLoadings: { type: Object, default: () => {} },

		// ---From FormItemMixin-------
		itemData: {	type: Object,	default: () => null },
		fromModal: Boolean,
		showSubmitButtons: Boolean,
		editInModal: Boolean,
		additionalSettings: { type: Object,	default: () => ({}) },
		itemsName: { type: Object, default: () => ({}) },
	},

	data() {
		return {
			isMobile: false,

			controllersLoadingLocal: false,
			controllersListLocal: [],
			formulasListLoadingLocal: false,
			formulasListLocal: [],
			usersLoading: false,
			usersList: [],
			selectedSensorInitiated: false,

			hasError: false,
			editAcute: false,
			editStableSamples: false,
			init_crash_indication_threshold: 5,
			init_stable_samples: 10,
			// rpm_sending: false,

			// maintenanceAlarm: false,
			// maintenanceWarning: false,
			isArchivedChanged: false,

			formData: {
				type: SENSOR_TYPES.NCD,
				// external_id: null,
				equipment_id: null,
				controller_id: null,
				port_number: null,
				mac_address: '',
				location_in_equipment: '',
				sensor_default_notifications: [],
				data_set: null,
				expression: '',
				power_type: null,

				equipment_rpm: 1800,
				current_sensor_rating: 0,
				position: null,

				crash_indication_threshold: 5,
				stable_samples: 10,

				is_archived: false,

				ncd_ultrasound_position: null,

				ncd_active_vertical_axis: 1,
				ncd_active_axial_axis: 1,
				is_hidden_ncd_active_vertical_axis: 0,

				pressure_range: null,

				is_runtime_tracking: false,
				is_google_cloud_data: 0,
				runtime_tracking_threshold_data_value: undefined,

				// -----NCD-Custom------
				ncd_config_sensor_boot_time_420ma: 5,
				node_type: null,
				chart_name: '',
				chart_unit_label: '',
				value_4ma: '',
				value_20ma: '',
				// data_set_convert_value: 'm*{reg} + b',
				// data_set_convert_value: '',
				alarm_type: null,
				is_iaq_disabled: false,
				is_linespeed_node: false,

				is_lube_mode: false,

				// is_creating_recommended_maintenance: false,
				// alarms_types_maintenance: [],
				// sensor_default_mail_notifications: []
			},

			rules: {
				// location_in_equipment: required,
				equipment_id: required,
				port_number: required,
				controller_id: required,
				data_set: required,
				power_type: null,
				current_sensor_rating: null
			},

			// -----------
			ncd_status_socket: null,
			ncd_status_socket_ready: false
		};
	},

	computed: {
		...mapState({
			showPlantName: state => state.global.navbarSettings.showPlantName,
			userPlantId: state => state.auth.authUser.plant_id,
			globalFilters: state => state.global.globalFilters,
			authUser: state => state.auth.authUser		
		}),

		socketChannel() {
			const { authUser } = this;
			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		},

		instanceName: () => 'Sensors',

		filteredDataSetsList: () =>
			dataSetsList().filter(ds => ds.controller_type === SENSOR_TYPES.NCD),
		// SENSOR_TYPES: () => SENSOR_TYPES,

		DATASET: () => DATASET,
		NCD_NODE_TYPES: () => NCD_NODE_TYPES,

		powerTypesList: () => Object.freeze(powerTypesList()),
		ncdAlarmTypesList: () => Object.freeze(ncdAlarmTypesList()),
		ncdUltrasoundPositionsList: () => Object.freeze(ncdUltrasoundPositionsList),
		ncdAxisList: () => Object.freeze(ncdAxisList),
		ncdPressureRangesList: () => Object.freeze(ncdPressureRangesList()),

		equipmentTypeIsMotor: that => that.equipmentData.equipmentType.name == 'Motor',

		ncd_4_20_expression() {
			let result = 'm*{reg} + b';

			if (this.formData.data_set === DATASET.NCD_4_20MA) {
				const { value_4ma, value_20ma, chart_unit_label } = this.formData;
				if (
					value_4ma !== undefined &&
					value_20ma !== undefined &&
					chart_unit_label !== undefined
				) {
					const m = (value_20ma - value_4ma) / 16;
					const b = value_4ma - m * 4;
					result = `${chart_unit_label} = ${m}(mA) + ${b}`;
				}
			}

			return result;
		},

		portsList() {
			const list = [];
			for (let i = 1; i < 41; i++) {
				list.push({ id: i, name: i });
			}
			return Object.freeze(list);
		},

		runtime_tracking_switcher() {
			const {
				isNCDTempVibe,
				isNCDWiredTempVibe,
				isNCDTempVibeCurr
			} = this.currentSensorType;
			return (
				this.equipmentData.plant_is_equipment_runtime_tracking &&
				(isNCDTempVibe || isNCDWiredTempVibe || isNCDTempVibeCurr)
			);
		},

		final_formulasList: that =>
			that.fromModal ? that.formulasList : that.formulasListLocal,
		final_controllersList: that =>
			that.fromModal ? that.controllersList : that.controllersListLocal,

		formulasLoading: that =>
			that.fromModal
				? that.commonItemsLoadings.formulasLoading
				: that.formulasLoadingLocal,
		controllersLoading: that =>
			that.fromModal
				? that.commonItemsLoadings.ncd_controllersLoading
				: that.controllersLoadingLocal,

		currentSensorTypeDataKey: () => 'formData',

		maintenanceWarningVal: () => 1,
		maintenanceAlarmVal: () => 2,

		selectedController() {
			const { formData, final_controllersList } = this;

			if (formData.controller_id && final_controllersList.length) {
				return findItemBy('id', formData.controller_id, final_controllersList);
			}
			return null;
		},

		requestsToDoList() {
			if (!this.fromModal) {
				let items = [
					{
						action: 'fetch_controllers',
						payload: {
							params: {
								type: this.formData.type,
								max: -1,
								plantId: this.showPlantName
									? this.showPlantName.id
									: this.globalFilters.plantId
							}
						},
						localProp: 'controllersListLocal',
						localLoadProp: 'controllersLoadingLocal'
					},
					{
						action: 'fetch_dataset_formulas',
						localProp: 'formulasListLocal',
						localLoadProp: 'formulasLoadingLocal'
					}
					// { localProp: 'equipmentsList', localLoadProp: 'equipmentsLoading' },
					// { localProp: 'usersList', localLoadProp: 'usersLoading' }
				];

				return items;
			}
			return [];
		},

		isPowerTypeEnabled: that =>
			that.formData.data_set === DATASET.NCD_WIRED_TEMP_VIBE ||
			that.formData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT ||
			that.formData.data_set === DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM ||
			that.formData.data_set === DATASET.NCD_ENVIRONMENTAL ||
			that.formData.data_set === DATASET.NCD_PRESSURE ||
			that.formData.data_set === DATASET.NCD_4_20MA,

		ncdNodeTypesList: () => Object.freeze(ncdNodeTypesList())
	},

	methods: {
		...mapActions({
			// fetch_external_sensors: 'sensors/fetch_external_sensors',
			fetch_controllers: 'controllers/fetch_controllers',
			fetch_users: 'users/fetch_users',
			save_item: 'sensors/save_sensor',

			fetch_dataset_formulas: 'sensors/fetch_dataset_formulas',
			set_global_state: 'set_global_state'
		}),

		handleMacAddressInput(str) {
			this.formData.mac_address = macAddressMask(str);
		},

		/*toConsole(val) {
			console.log(val);
		},*/
		setupDataSetLabel(item) {
			return `${item.label} ${item.alt_label ? '(' + item.alt_label + ')' : ''}`;
		},

		setupPositionLabel(item) {
			return `${this.tt('position')} ${item.id}`;
		},

		toggleProp(propName) {
			this[propName] = !this[propName];
		},

		getExpression(data_set) {
			const item = findItemBy('data_set', data_set, this.final_formulasList);
			if (item) {
				return item.expression;
			}
			return '';
		},

		/*sendRpm() {
			const payload = {
				sensorId: this.itemData.id
			};
			this.rpm_sending = true;

			this.send_rpm(payload)
				.then(() => {
					this.rpm_sending = false;
				})
				.catch(() => {
					this.rpm_sending = false;
				});
		},*/

		localSetupPageActions(item) {
			// console.log(item);
			const { equipmentData } = this;
			if (item) {
				this.init_crash_indication_threshold =
					item.crash_indication_threshold ||
					item.controller.crash_indication_threshold ||
					5;
				this.init_stable_samples =
					item.stable_samples || item.controller.stable_samples || 10;

				this.formData.crash_indication_threshold = this.init_crash_indication_threshold;
				this.formData.stable_samples = this.init_stable_samples;

				// const { equipment } = item;
				// console.log('1', this.formData.data_set_convert_value)

				/*this.formData.is_creating_recommended_maintenance =
					item.is_creating_recommended_maintenance;

				if (item.alarms_types_maintenance && item.alarms_types_maintenance.length) {
					item.alarms_types_maintenance.forEach(ati => {
						this.maintenanceWarning = ati == maintenanceWarningVal;
						this.maintenanceAlarm = ati == maintenanceAlarmVal;
					});
				}*/
			}

			this.setupEquipmentRpm(item);
			this.setupEquipmentFla(item);

			if (equipmentData.id) {
				this.formData.equipment_id = equipmentData.id;
			}
		},

		setupEquipmentRpm(sensor) {
			const { equipmentData, equipmentTypeIsMotor } = this;

			this.formData.equipment_rpm = sensor ? sensor.equipment_rpm || 1800 : 1800;

			if (equipmentTypeIsMotor && equipmentData.typeOptions) {
				const rpmItem = findItemBy('is_rpm', true, equipmentData.typeOptions);
				if (rpmItem) {
					this.formData.equipment_rpm =
						(rpmItem.raw_values && rpmItem.raw_values[0]) || 1800;
				}
			}
		},

		setupEquipmentFla(sensor) {
			const { equipmentData } = this;

			if (!sensor || (!sensor.current_sensor_rating && equipmentData.typeOptions)) {
				const flaItem = findItemBy('is_fla', true, equipmentData.typeOptions);
				if (flaItem) {
					this.formData.current_sensor_rating =
						flaItem.raw_values && flaItem.raw_values[0];
				}
			}
		},

		// ----------------
		localGetFormDataCallback(data) {
			// data.alarms_types_maintenance = [];
			if (!this.isPowerTypeEnabled) {
				delete data.power_type;
			}

			if (data.data_set === DATASET.NCD_TEMP_VIBE_CURRENT) {
				data.current_sensor_rating = +data.current_sensor_rating;
			} else {
				delete data.current_sensor_rating;
			}

			if (
				data.data_set !== DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM &&
				data.data_set !== DATASET.NCD_4_20MA &&
				data.node_type !== NCD_NODE_TYPES.POSITION_2
			) {
				delete data.position;
				delete data.ncd_ultrasound_position;
			}

			if (
				data.data_set === DATASET.NCD_WIRED_TEMP_VIBE ||
				data.data_set === DATASET.NCD_TEMP_VIBE_CURRENT ||
				data.data_set === DATASET.NCD_ALL_IN_ONE_TEMP_VIBE
			) {
				data.equipment_rpm = +data.equipment_rpm;
			} else {
				delete data.equipment_rpm;
				delete data.ncd_active_vertical_axis;
				delete data.ncd_active_axial_axis;
			}

			if (data.data_set !== DATASET.NCD_4_20MA) {
				delete data.ncd_config_sensor_boot_time_420ma;
				delete data.node_type;
				delete data.chart_name;
				delete data.chart_unit_label;
				delete data.value_4ma;
				delete data.value_20ma;
				delete data.alarm_type;
				delete data.is_linespeed_node;
			}

			if (data.data_set !== DATASET.NCD_ENVIRONMENTAL) {
				delete data.is_iaq_disabled;
			}

			delete data.data_set_convert_value;
			/*if (data.is_creating_recommended_maintenance) {
				if (this.maintenanceWarning) {
					data.alarms_types_maintenance.push(this.maintenanceWarningVal);
				}
				if (this.maintenanceAlarm) {
					data.alarms_types_maintenance.push(this.maintenanceAlarmVal);
				}
			}*/

			if (!this.editAcute) {
				delete data.crash_indication_threshold;
			}
			if (!this.editStableSamples) {
				delete data.stable_samples;
			}

			return data;
		},

		localGetFormData(data) {
			let payload = {
				formData: { 
					id: this.itemId,
					...prepareSubmitData(data),
				}
			};

			const { tt } = this;
			let archivationAction = '';

			if (this.isArchivedChanged) {
				archivationAction = data.is_archived ? tt('Archived') : tt('Restored');
			}

			if (
				data.ncd_active_axial_axis &&
				data.ncd_active_axial_axis == data.ncd_active_vertical_axis
			) {
				this.$notify({
					type: 'warning',
					title: tt('Error'),
					message: tt(`phrases.choose_a_different_axis`)
				});
				return false;
			}

			let { isNCDSDT, isNCDCustom_4_20 } = this.currentSensorType;

			isNCDSDT = isNCDSDT ||
				(isNCDCustom_4_20 ? data.node_type === NCD_NODE_TYPES.POSITION_2 : false);

			const enableWebSocket = this.isNew || this.isArchivedChanged;
			const successMessage = archivationAction
				? `${tt('Sensor')} ${archivationAction} ${tt('Successfully')}`
				: '';
				
			return {
				payload,
				isNCDSDT,
				enableWebSocket,
				successMessage,
				isNew: this.isNew
			};
		},

		localSubmit(formPayload) {
			const {
				isNCDSDT,
				enableWebSocket,
				successMessage,
				failMessage,
				payload,
				isNew
			} = formPayload;
			const { formData } = payload;
			// console.log('1', successCounter, payload)

			const initialArchieveStatus = formData.is_archived;
			const skipWebSocket = !!formData.is_google_cloud_data;

			/*if (process.env.NODE_ENV === 'development') {
				console.log(formData);
				return;
			}*/

			this.toggleSubmitRequestResult({isLoading:1});

			this.save_item({
				data: formData,
				itemName: 'Sensor',
				notNotify: enableWebSocket
			})
				.then(answer => {
					this.itemId = answer.data.data.id;
					
					// console.log('2', successCounter)
					if (
						enableWebSocket &&
						(isNCDSDT
							? isNew || initialArchieveStatus != answer.data.data.is_archived
							: true) &&
						!skipWebSocket
					) {
						const sensor_id = answer.data.data.id;

						this.setupWebSocket({
							socketName: 'ncd_status_socket',
							socketNameReadyProp: 'ncd_status_socket_ready',
							socketChannel: this.socketChannel,
							localHandleOpen: true,
							localHandleError: true
							// socketCallbackName: 'ncd_socketCallback'
						});

						this.toggleMainPreloader(true, `${this.tt('Working')}...`);

						this['ncd_status_socket'].onopen = () => {
							// console.log('onopen')
							this['ncd_status_socket'].onmessage = e => {
								// console.log('onmessage', e)

								this['ncd_socketCallback'](JSON.parse(e.data), {
									sensor_id,
									successMessage,
									failMessage
								})
									.then(() => {
										// console.log('ncd_socketCallback resolve')
										this.toggleMainPreloader(false, '', true);
									})
									.catch(() => {
										// console.log('ncd_socketCallback reject')
										this.toggleMainPreloader(false, '', false);
									});
							};
						};

						this['ncd_status_socket'].onerror = err => {
							this.toggleMainPreloader(false, '', false);
							this.$notify({
								type: 'warning',
								title: this.tt('Fail'),
								message: this.tt('phrases.Web_Socket_Error'),
								duration: 0
							});
							this['ncd_status_socket'].close();
							console.warn(err);
							// reject(err);
						};
					} else {
						this.toggleMainPreloader(false, '', true);
					}
				})
				.catch(() => {
					this.toggleSubmitRequestResult({isLoading:0, success:0});
				});
		},

		toggleMainPreloader(open, text, success) {
			if (open) {
				this.set_global_state({
					stateProp: 'overlay',
					value: {
						text: text || '',
						textStyle: { fontSize: '25px' }
					}
				});
				this.set_global_state({ stateProp: 'mainPreloader', value: true });
			} else {
				this.set_global_state({ stateProp: 'mainPreloader', value: false });
				this.set_global_state({ stateProp: 'overlay', value: {} });
				this.toggleSubmitRequestResult({isLoading:0, success});
				// this.$emit('event', { eventName:'toggleSpinner', data:false });
			}
		},

		toggleSubmitRequestResult(settings) {
			const {	isLoading, success } = settings;

			if (isLoading) {
				this.$emit('event', { eventName:'toggleSpinner', data:true });				
			} else {
				this.$emit('event', {
					eventName: 'handleFormSubmitFinish',
					data:	{isLoading, success},
				});
			}			
		},

		/*resetSensor() {
			this.confirmHelper({ message: `${tt('phrases.Do_you_really_want_to')} <b>Reset sensor</b>?` })
				.then(() => {
					// console.log('toggleGainAdjustment')
					this.gain_adjustment({
						sensorId: this.itemData.id,
						data: { action: ADJUSTMENT_ACTIONS_TYPES.RESET }
					}).then(response => {
						console.log(response);
					});
				})
				.catch(() => {});
		}*/
	},

	watch: {
		'selectedController'(controller) {
			if (controller) {
				const params = {
					companyId: controller.company_id,
					forNotifiable: true,
					plantId: controller.plant_id,
					max: -1
				};

				this.doFetchAction('fetch_users', 'usersList', 'usersLoading', {
					params: params
				});
			}

			if (this.selectedSensorInitiated) {
				this.formData.sensor_default_notifications = [];
			}
			this.selectedSensorInitiated = true;
		},

		'formData.data_set'(id) {
			if (
				id === DATASET.NCD_WIRED_TEMP_VIBE ||
				id === DATASET.NCD_TEMP_VIBE_CURRENT ||
				id === DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM ||
				id === DATASET.NCD_ENVIRONMENTAL ||
				id === DATASET.NCD_PRESSURE ||
				id === DATASET.NCD_4_20MA
			) {
				this.rules.power_type = required;
			} else {
				this.rules.power_type = null;
				this.formData.power_type = null;
			}

			/*if (id === DATASET.NCD_4_20MA) {
				this.formData.data_set_convert_value = 'm*{reg} + b';
			}*/

			/*if (id === DATASET.NCD_WIRED_TEMP_VIBE ||
					id === DATASET.NCD_TEMP_VIBE_CURRENT ||
					id === DATASET.NCD_ALL_IN_ONE_TEMP_VIBE) {

			}*/

			if (id === DATASET.NCD_TEMP_VIBE_CURRENT) {
				this.rules.current_sensor_rating = required;
			} else {
				this.rules.current_sensor_rating = null;
				this.formData.current_sensor_rating = null;
			}
		}

		/*'formData.data_set_converter'(id) {
			if (id === DATASET_CONVERTERS.AMPS_CUSTOM_20) {
				this.rules.data_set_convert_value = required;
				// console.log('2', this.formData.data_set_convert_value)

				if (this.formulasList.length && !this.formData.data_set_convert_value) {
					const formula = findItemBy('data_set', DATASET.CM1L, this.formulasList);
					this.formData.data_set_convert_value = formula ? formula.expression : '';
				}
			}
		},*/

		/*'formulasList'(list) {
			if (list.length) {
				const { formData } = this;
				// console.log('3', formData.data_set_convert_value)

				if (
					formData.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_20 &&
					!formData.data_set_convert_value
				) {
					const formula = findItemBy('data_set', DATASET.CM1L, this.formulasList);
					this.formData.data_set_convert_value = formula ? formula.expression : '';
				}
			}
		}*/
	},

	created() {
		if (this.fromModal) {
			this.$emit('event', {
				eventName: 'handleFetch',
				data: [
					{
						action: 'fetch_dataset_formulas',
						keyPrefix: 'formulas',
						payload: { params: { max: -1 } }
					},
					{
						action: 'fetch_controllers',
						keyPrefix: 'ncd_controllers',
						payload: {
							params: {
								type: this.formData.type,
								max: -1,
								plantId: this.showPlantName
									? this.showPlantName.id
									: this.globalFilters.plantId
							}
						}
					}
				],
				onward: true
			});
		}
	},

	beforeDestroy() {
		this.closeWebSocket({ socketName: 'ncd_status_socket' });
	}
};
</script>
