<template>
	<div class="edit-form-container">
		<!-- :validate="" -->
		<el-form
			class="item-edit-form relative section-row"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<CustomTransition>
				<!-- v-show="activeTab.prop == tabsList[0].prop" -->
				<div
					class="tab-container"
					:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
					key="tab-0"
				>
					<div class="el-form-item">
						<!-- <div class="custom-form-item el-form-item" v-if="itemId">
							<div class="el-form-item__label">{{tt('Controller')}} id</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="itemId"
							></div>
						</div> -->

						<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
							<CustomInput
								v-model="formData.name"
								:placeholder="`${tt('input')} ${tt('name')}`"
							/>
						</el-form-item>

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
						</el-form-item>

						<el-form-item :label="tt('plant')" prop="plant_id" v-if="!hidePlants">
							<CustomSelect
								filterable
								:optionsLoading="plantsLoading"
								:optionsList="plantsList"
								:placeholder="`${tt('Select')} ${tt('plant')}`"
								v-model="formData.plant_id"
							/>
						</el-form-item>

						<el-form-item :label="`${tt('Controller')} ID`" prop="uuid">
							<el-input
								@input="applyUUIDMask"
								:value="formData.uuid"
								:placeholder="`${tt('input')} uuid`"
							/>
							<!-- <CustomInput v-model="formData.uuid" placeholder="input uuid" /> -->
						</el-form-item>

						<el-form-item :label="tt('MAC_address')" prop="mac_address">
							<el-input
								@input="handleMacAddressInput"
								:value="formData.mac_address"
								:placeholder="`${tt('example')}: 00:13:a2:00:41:f5:90:51`"
							/>
						</el-form-item>

						<!-- <el-form-item :label="tt('phrases.measuring_system')" prop="metric_system_type">
							<CustomSelect
								:optionsList="metricSystemsList"
								:placeholder="`${tt('select')} ${tt('system')}`"
								v-model="formData.metric_system_type"
							/>
						</el-form-item> -->

						<el-form-item
							:label="
								`${tt('constants.temperature')} ${tt('constants.warning_zone')}`
							"
							prop="temperature_warning_zone"
						>
							<el-input-number
								v-model="formData.temperature_warning_zone"
								:min="0"
							/>
						</el-form-item>

						<el-form-item
							:label="`${tt('constants.temperature')} ${tt('constants.alarm_zone')}`"
							prop="temperature_alarm_zone"
						>
							<el-input-number v-model="formData.temperature_alarm_zone" :min="0" />
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

						<el-form-item
							:label="tt('phrases.samples_to_settle')"
							prop="stable_samples"
						>
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
									`${(editStableSamples
										? formData.stable_samples
										: init_stable_samples) * 5} ${tt('minutes')}
							`
								}}
							</div>
						</el-form-item>

						<!-- <el-form-item :label="tt('time_zone')" prop="time_zone">
							<CustomSelect
								:optionsList="timeZonesList"
								:placeholder="`${tt('select')} ${tt('time_zone')}`"
								v-model="formData.time_zone"
								labelKey="label"
							/>
						</el-form-item> -->

						<!-- <el-form-item :label="tt('phrases.Commucate_method')" prop="communicate_method">
							<CustomSelect
								:optionsList="communicateMethodsList"
								:placeholder="`${tt('select')} ${tt('method')}`"
								v-model="formData.communicate_method"
								labelKey="label"
							/>
						</el-form-item> -->

						<!-- <el-form-item :label="tt('phrases.Connection_Type')" prop="connection_type">
							<CustomSelect
								:optionsList="connectionTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
								v-model="formData.connection_type"
								labelKey="label"
							/>
						</el-form-item> -->

						<!-- <el-form-item :label="tt('phrases.binding_code')" prop="binding_code">
							<CustomInput
								v-model="formData.binding_code"
								:placeholder="`${tt('input')} ${tt('code')}`"
							/>
						</el-form-item> -->

						<el-form-item
							:label="tt('phrases.cloud_connection_type')"
							prop="cloud_connection_type"
						>
							<CustomSelect
								:optionsList="cloudConnectionTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
								v-model="formData.cloud_connection_type"
								labelKey="label"
							/>
						</el-form-item>

						<div
							class="el-form-item"
							v-show="
								formData.cloud_connection_type === CLOUD_CONNECTION_TYPES.CELL_MODEM
							"
						>
							<el-form-item
								:label="tt('phrases.router_SIM_card_number')"
								prop="router_sim_card_number"
							>
								<CustomInput
									v-model="formData.router_sim_card_number"
									:placeholder="`${tt('input')} ${tt('number')}`"
								/>
							</el-form-item>

							<!-- <el-form-item :label="tt('phrases.router_serial_number')" prop="router_serial_number">
								<CustomInput
									v-model="formData.router_serial_number"
									:placeholder="`${tt('input')} ${tt('router_number')}`"
								/>
							</el-form-item> -->
						</div>
					</div>
				</div>

				<!-- <div
					v-show="activeTab.prop == tabsList[1].prop"
					class="tab-container standard-form"
					key="tab-1"
				>
					<div class="form-header content-row full-width-background">
						<div class="mrow flex uppercase" :class="{ 'width-75': !isMobile }">
							<div class="mcol-xs-4">Sensor parameter</div>
							<div class="mcol-xs-4">For incoming registers</div>
							<div class="mcol-xs-4">Reverse formula</div>
						</div>
					</div>

					<div class="content-row" :class="{ 'width-75': !isMobile }">
						<FormulasRow
							ref="FormulasRow"
							class="form-row inline"
							v-for="item in sensorParametersList"
							:key="`formulas_parameter-${item.id}`"
							@blockReady="blockReady"
							:parameterTypeItem="item"
							:options="inputOptions"
							:formulasData="formData.sensor_job_preprocess_math_expressions"
						/>
					</div>
				</div> -->
			</CustomTransition>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import {
	// metricSystemsList,
	// sensorParametersList,
	SCOPES,
	COMMUNICATE_METHODS,
	// connectionTypesList,
	CLOUD_CONNECTION_TYPES,
	cloudConnectionTypesList
} from '@/constants/global';
// import { timeZonesList } from '@/constants/date_time';

import { required } from '@/constants/validation';
import { macAddressMask } from '@/helpers/specialHelpers';

import {
	itemFormMixin,
	requestsListMixin,
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
	],
	components: {
		// FormulasRow: () => import('./FormulasRow.vue')
	},
	props: {
		hideCompanies: Boolean,
		// silentCompanies: Boolean,
		hidePlants: Boolean,
		/*activeTab: {
			type: Object,
			required: true
		},
		tabsList: {
			type: Array,
			required: true
		},*/
		new_item_type: Number,
		additionalItemType: String
		// silentPlants: Boolean
	},
	data() {
		return {
			companyPlantsList: [],
			editAcute: false,
			init_crash_indication_threshold: 5,
			editStableSamples: false,
			init_stable_samples: 10,

			companiesLoading: false,
			companiesLoading2: false,
			companiesList: [],
			companiesList2: [],
			plantsLoading: false,
			plantsList: [],

			formData: {
				type: null,
				uuid: '',
				name: '',
				plant_id: null,
				company_id: null,
				// metric_system_type: null,
				// range_sensor_notify_minutes: 5,
				temperature_warning_zone: 70,
				temperature_alarm_zone: 80,
				crash_indication_threshold: 5,
				stable_samples: 10,
				sensor_job_preprocess_math_expressions: [],
				// time_zone: 0,
				configure_file: null,
				sb_file: null,

				communicate_method: COMMUNICATE_METHODS.MQTT,
				mac_address: '',
				// connection_type: null,

				// binding_code: '',
				cloud_connection_type: null,
				router_sim_card_number: ''
				// router_serial_number: ''
			},

			rules: {
				name: required,
				// company_id: required,
				plant_id: required,
				mac_address: {
					min: 23,
					message: 'Length should be 16 symbols',
					trigger: 'blur'
				}
				// metric_system_type: required
			}
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser,
			isIndustrialMatrix: state =>
				state.auth.isIndustrialMatrix || state.auth.isDeveloper
		}),

		SCOPES: () => SCOPES,
		CLOUD_CONNECTION_TYPES: () => CLOUD_CONNECTION_TYPES,

		cloudConnectionTypesList: () => cloudConnectionTypesList(),

		/*refsList: () => ['FormulasRow'],
		refsOperationsSettings: () => ({
			submitActionName: 'submitForm',
			dataAsArray: true,
			itemSubmitMethod: 'handleValidateRefsItems'
			//itemSubmitMethod: 'handleSaveItem'
		}),
		*/
		// validateSubItems: () => true,
		// collectedDataWithoutInjectToForm: () => true,

		/*inputOptions: () => ({
			validate: {
				validateMethod: 'validateBlock'
			}
		}),*/

		requestsToDoList: that =>
			Object.freeze([
				{
					action: 'fetch_companies',
					localProp: 'companiesList',
					localLoadProp: 'companiesLoading'
				},
				{
					action: 'fetch_plants',
					bindTo: [
						{
							prop: 'formData.company_id',
							param: 'companyId',
							fetchAnyWay: !that.isIndustrialMatrix
						}
					],
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_companies: 'companies/fetch_companies',
			fetch_plants: 'plants/fetch_plants'
		}),

		handleMacAddressInput(str) {
			this.formData.mac_address = macAddressMask(str);
		},

		applyUUIDMask(str) {
			this.formData.uuid = str.replace(/[^a-zA-Z0-9-_]/g, '');
		},

		toggleProp(propName) {
			this[propName] = !this[propName];
		},
		// -------------
		localSetupPage(item) {
			// console.log(item);
			if (item) {
				this.init_crash_indication_threshold = item.crash_indication_threshold || 5;
				this.init_stable_samples = item.stable_samples || 10;

				this.formData.crash_indication_threshold = this.init_crash_indication_threshold;
				this.formData.stable_samples = this.init_stable_samples;
			} else {
				if (this.new_item_type) {
					// console.log(this.new_item_type);
					this.formData.type = this.new_item_type;
				}
			}
		},

		localPrepareCollectedData(dataArr) {
			let data = [];

			for (let item of dataArr) {
				if (Object.values(item.data).every(val => !!val)) {
					data.push(item.data);
				}
			}
			// console.log(data)
			return { data: data };
		},

		localPrepareSubmitData(data) {
			// data.sensor_job_preprocess_math_expressions = formulasData.data

			if (!this.editAcute) {
				delete data.crash_indication_threshold;
			}
			if (!this.editStableSamples) {
				delete data.stable_samples;
			}

			if (!data.configure_file) {
				delete data.configure_file;
			}
			if (!data.sb_file) {
				delete data.sb_file;
			}

			return data;
		}
	}
};
</script>
