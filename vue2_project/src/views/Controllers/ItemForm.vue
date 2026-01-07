<template>
	<div class="edit-form-container">
		<!-- :validate="" -->
		<el-form
			class="item-edit-form relative section-row controller-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<CustomTransition>
				<div
					v-show="activeTab.prop == 'mainTabActive'"
					class="tab-container"
					:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
					key="tab-0"
				>
					<div class="el-form-item">
						<div class="custom-form-item el-form-item" v-if="itemId">
							<div class="el-form-item__label">{{ tt('Controller') }} id</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="itemId"
							></div>
						</div>

						<el-form-item
							:label="tt('Type')"
							prop="command_topic_type"
						>
							<CustomSelect
								:optionsList="controllerTopicTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
								v-model="formData.command_topic_type"
							/>
						</el-form-item>

						<el-form-item label="UUID" prop="uuid">
							<CustomInput
								v-model="formData.uuid"
								:placeholder="`${tt('input')} uuid`"
							/>
						</el-form-item>

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

						<!-- <el-form-item
							:label="tt('phrases.measuring_system')"
							prop="metric_system_type"
						>
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
							:label="tt('phrases.Acute_samples')"
							prop="crash_indication_threshold"
						>
							<div class="flex">
								<el-input-number
									v-if="editAcute"
									v-model="formData.crash_indication_threshold"
									:min="1"
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
						</el-form-item>

						<el-form-item
							:label="tt('phrases.Stable_samples')"
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
						</el-form-item>

						<el-form-item :label="tt('time_zone')" prop="time_zone">
							<CustomSelect
								:optionsList="timeZonesList"
								:placeholder="`${tt('select')} ${tt('time_zone')}`"
								v-model="formData.time_zone"
								labelKey="label"
							/>
						</el-form-item>

						<el-form-item
							:label="tt('phrases.Commucate_method')"
							prop="communicate_method"
						>
							<CustomSelect
								:optionsList="communicateMethodsList"
								:placeholder="`${tt('select')} ${tt('method')}`"
								v-model="formData.communicate_method"
								labelKey="label"
							/>
						</el-form-item>

						<el-form-item
							:label="tt('phrases.Connection_Type')"
							prop="connection_type"
						>
							<CustomSelect
								:optionsList="connectionTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
								v-model="formData.connection_type"
								labelKey="label"
							/>
						</el-form-item>

						<el-form-item :label="tt('phrases.binding_code')" prop="binding_code">
							<CustomInput
								v-model="formData.binding_code"
								:placeholder="`${tt('input')} ${tt('code')}`"
							/>
						</el-form-item>

						<div class="el-form-item info-list" v-if="itemData && itemData.device_data">
							<div class="info-item">
								<div class="div-block"><b>{{ tt('phrases.Script_version') }}</b>:</div>
								<div class="div-block info">{{ itemData.device_data.HMI_Interface_Prg ? itemData.device_data.HMI_Interface_Prg / 100 : '' }}</div>
							</div>

							<div class="info-item">
								<div class="div-block"><b>{{ tt('phrases.Binding_code') }}</b>:</div>
								<div class="div-block info">{{ itemData.device_data.Binding_Code }}</div>
							</div>
						</div>

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
								:label="tt('phrases.router_sim_card_number')"
								prop="router_sim_card_number"
							>
								<CustomInput
									v-model="formData.router_sim_card_number"
									:placeholder="`${tt('input')} ${tt('number')}`"
								/>
							</el-form-item>

							<el-form-item
								:label="tt('phrases.router_serial_number')"
								prop="router_serial_number"
							>
								<CustomInput
									v-model="formData.router_serial_number"
									:placeholder="`${tt('input')} ${tt('router_number')}`"
								/>
							</el-form-item>
						</div>

						<el-form-item
							class="upload-form-item"
							:label="`${tt('Cofigure')} ${tt('file')}`"
							prop="configure_file"
						>
							<!-- deleteButtonType="mini-cross" -->
							<FileUploadBlock
								@onSelectFile="configFileChanged = true"
								uploadBlockType="inline"
								deleteFileId
								showDeleteButton
								ref="FileUploadBlock1"
								keepFilePath
								:enableLinkToFile="
									!!itemId && !!itemData.configure_file_link && !configFileChanged
								"
								filePropName="configure_file"
								accept=".xml"
								:buttonText="tt('phrases.click_to_upload')"
								:buttonIcon="' '"
								:buttonClass="' '"
								:pictures="itemConfigFile"
							/>
								<!-- @ready="blockReady" -->
						</el-form-item>

						<el-form-item
							class="upload-form-item"
							:label="`${tt('Script')} ${tt('file')}`"
							prop="sb_file"
						>
							<!-- deleteFileId -->
							<!-- uploadButtonToRight -->
							<FileUploadBlock
								@onSelectFile="SBFileChanged = true"
								injectDataToRoot
								uploadBlockType="inline"
								deleteFileId
								ref="FileUploadBlock2"
								keepFilePath
								:enableLinkToFile="
									!!itemId && !!itemData.sb_file_link && !SBFileChanged
								"
								filePropName="sb_file"
								:buttonText="tt('phrases.click_to_upload')"
								:buttonIcon="' '"
								:buttonClass="' '"
								:pictures="itemSBFile"
								:accept="' '"
							/>
								<!-- @ready="blockReady" -->
						</el-form-item>

						<!-- <el-form-item
							:label="`${tt('Cofigure')} ${tt('file')}`"
							prop="configure_file"
						>
							<el-upload
								ref="uploadContainer"
								:on-change="e => onSelectFile(e, 'configure_file')"
								:on-remove="() => onRemoveFile('configure_file')"
								action="#"
								class="upload-container"
								:auto-upload="false"
								accept=".xml"
							>
								<el-button size="small" type="primary">{{
									tt('phrases.click_to_upload')
								}}</el-button>
							</el-upload>
						</el-form-item>

						<el-form-item :label="`${tt('Script')} ${tt('file')}`" prop="sb_file">
							<el-upload
								ref="uploadContainer"
								:on-change="e => onSelectFile(e, 'sb_file')"
								:on-remove="() => onRemoveFile('sb_file')"
								action="#"
								class="upload-container"
								:auto-upload="false"
							>
								<el-button size="small" type="primary">{{
									tt('phrases.click_to_upload')
								}}</el-button>
							</el-upload>
						</el-form-item> -->
					</div>
				</div>

				<div
					v-show="activeTab.prop == 'formulasTabActive'"
					class="tab-container standard-form"
					key="tab-1"
				>
					<div class="form-header content-row full-width-background">
						<div :class="{ 'width-75': !isMobile }">
							<div class="mrow flex uppercase">
								<div class="mcol-xs-4">{{ tt('phrases.Sensor_parameter') }}</div>
								<div class="mcol-xs-4">
									{{ tt('phrases.For_incoming_registers') }}
								</div>
								<div class="mcol-xs-4">{{ tt('phrases.Reverse_formula') }}</div>
							</div>
						</div>
					</div>

					<div class="content-row" :class="{ 'width-75': !isMobile }">
						<!-- <FormulasRow
							ref="FormulasRow"
							class="form-row inline"
							v-for="item in sensorParametersList"
							:key="`formulas_parameter-${item.id}`"
							@blockReady="blockReady"
							:parameterTypeItem="item"
							:options="inputOptions"
						/> -->

							<!-- @ready="blockReady" -->
						<FormulasRow
							ref="FormulasRow"
							class="form-row inline"
							v-for="item in sensorParametersList"
							:key="`formulas_parameter-${item.id}`"
							:item-data="item"
							:formulasData="formData.sensor_job_preprocess_math_expressions"
						/>
						<!-- :parameterTypeItem="item" -->
					</div>
				</div>

				<div
					v-if="isDXMCommandsTabPresent"
					v-show="activeTab.prop == 'commandsTabActive'"
					class="tab-container standard-form"
					key="tab-2"
				>
					<DXMCommandsTab
						:topicType="formData.command_topic_type"
						:controllerData="itemData"
					/>
				</div>

				<div
					v-if="isDevicesTabPresent"
					v-show="activeTab.prop == 'devicesTabActive'"
					class="tab-container"
					key="tab-3"
				>
					<BannerSensorsList
						@event="handleEventNew"
						insideOtherPage
						preventSetNavbar
						:propsFilters="sensorsListFilters"
					/>
					<!-- <DXMCommandsTab :controllerData="itemData" /> -->
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

<script>
import { mapActions, mapState } from 'vuex';
import {
	SCOPES,
	communicateMethodsList,
	connectionTypesList,
	CLOUD_CONNECTION_TYPES,
	cloudConnectionTypesList,
	controllerTopicTypesList,	
	// DATASET,
} from '@/constants/global';

import { sensorParametersList } from '@/modules/charts_factory/controllers/Sensor/enums';

import { timeZonesList } from '@/constants/date_time';

import { required } from '@/constants/validation';
import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin,
	eventHandler
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin(),
		eventHandler()
	],
	components: {
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		FormulasRow: () => import('./FormulasRow.vue'),
		DXMCommandsTab: () => import('./DXMCommandsTab.vue'),
		BannerSensorsList: () => import('../Sensors/BannerSensorsList.vue')
		// ElUpload: () =>
		// import(/* webpackChunkName: "ElUpload" */ 'element-ui/lib/upload')
	},
	props: {
		hideCompanies: Boolean,
		// silentCompanies: Boolean,
		hidePlants: Boolean,
		activeTab: {
			type: Object,
			required: true
		},
		tabsList: {
			type: Array,
			required: true
		},
		new_item_type: Number,
		additionalItemType: String
		// silentPlants: Boolean
	},
	data() {
		return {
			configFileChanged: false,
			SBFileChanged: false,
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
				time_zone: 0,
				configure_file: null,
				sb_file: null,

				communicate_method: null,
				connection_type: null,

				binding_code: '',
				cloud_connection_type: null,
				router_sim_card_number: '',
				router_serial_number: '',

				command_topic_type: null
			},

			rules: {
				name: required,
				// company_id: required,
				plant_id: required
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

		sensorParametersList: () => Object.freeze(sensorParametersList()),
		// metricSystemsList: () => Object.freeze(metricSystemsList()),
		timeZonesList: () => Object.freeze(timeZonesList()),
		communicateMethodsList: () => Object.freeze(communicateMethodsList),
		connectionTypesList: () => Object.freeze(connectionTypesList),
		cloudConnectionTypesList: () => Object.freeze(cloudConnectionTypesList()),
		controllerTopicTypesList: () =>	Object.freeze(controllerTopicTypesList()),

		subItemsSettings: () => Object.freeze([
			// { ref: 'FormulasRow', targetProp: {prop: 'sensor_job_preprocess_math_expressions'} },// disable FormulasRow 22.11.24
			{ ref: 'FileUploadBlock2' },
			{ ref: 'FileUploadBlock1', cleanIfEmpty: {prop:'configure_file', val:null} },
		]),

		isDXMCommandsTabPresent: that => that.tabsList.some(tab => tab.prop === 'commandsTabActive'),
		isDevicesTabPresent: that => that.tabsList.some(tab => tab.prop === 'devicesTabActive'),
		// isInfoTabPresent: that => that.tabsList.some(tab => tab.prop === 'infoTabActive'),

		/*bindingCode() {
			if (this.itemData) {
				var {} = this.itemData;

			}
			return '';
		},*/

		sensorsListFilters: that => that.itemData && Object.freeze({ 
			controllerId: that.itemId,
			dataSet: [
				// DATASET.BANNER_TEMP_VIBE_V2,
				// DATASET.BANNER_V2_GENERIC,
			]
		}),

		uploadSettings: () =>
			Object.freeze([{ fileProp: 'configure_file' }, { fileProp: 'sb_file' }]),

		itemConfigFile() {
			const { itemData } = this;
			if (itemData && itemData.configure_file_link) {
				return [
					{
						file_path: itemData.configure_file_link,
						name: itemData.configure_file_name
					}
				];
			}
			return [];
		},
		itemSBFile() {
			const { itemData } = this;
			if (itemData && itemData.sb_file_link) {
				return [{ file_path: itemData.sb_file_link, name: itemData.sb_file_name }];
			}
			return [];
		},

		inputOptions: () => ({
			validate: {
				validateMethod: 'validateBlock'
			}
		}),

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

			data.sensor_job_preprocess_math_expressions = data.sensor_job_preprocess_math_expressions.filter(
				me => me.math_expression && me.math_expression_back
			);

			return data;
		}
	}
};
</script>
