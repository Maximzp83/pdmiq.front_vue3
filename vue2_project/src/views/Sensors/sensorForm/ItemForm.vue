<template>
	<div :class="['edit-form-container', {'half-width': !fromModal}]">
		<!-- <div class="toggle-lubematrix-button" v-if="showLubeMatrixButton">
			<el-button
				type="primary"
				size="small"
				@click="formData.is_lube_mode = !formData.is_lube_mode"
			>{{ `${tt(formData.is_lube_mode ? 'Disable' : 'Enable')} LubeMatrix` }}</el-button>
		</div> -->
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="el-form-item info-list"
				v-if="showDeviceDataRegisters"
			>
				<div class="info-item">
					<div class="div-block"><b>{{ tt('Model') }}</b>:</div>
					<div class="div-block info">{{ itemData.device_data.Model }}</div>
				</div>

				<div class="info-item">
					<div class="div-block"><b>{{ tt('Serial_Number') }}</b>:</div>
					<div class="div-block info">{{ itemData.device_data.Sn }}</div>
				</div>

				<div class="info-item">
					<div class="div-block"><b>{{ `${tt('Sensor')} ${tt('Model')}` }}</b>:</div>
					<div class="div-block info">{{ itemData.device_data.SenModel }}</div>
				</div>

				<div class="info-item">
					<div class="div-block"><b>{{ `${tt('Sensor')} ${tt('Serial_Number')}` }}</b>:</div>
					<div class="div-block info">{{ itemData.device_data.SenSn }}</div>
				</div>

				<div class="info-item">
					<div class="div-block"><b>{{ `${tt('Sensor')} ${tt('Firmware_Number')}` }}</b>:</div>
					<div class="div-block info">{{ itemData.device_data.SenFwVer_Evaluated }}</div>
				</div>

				<!-- <div class="info-item">
					<div class="div-block"><b>{{ `${tt('Sensor')} ${tt('Serial_Number')}` }} (SenSn)</b>:</div>
					<div class="div-block info">{{ itemData.device_data.device_data_updated_at }}</div>
				</div> -->
			</div>

			<div class="el-form-item info-list"
				v-if="showLastLubricationExternalStats"
			>
				<div class="info-item">
					<div class="div-block"><b>{{ tt('phrases.shots_count_per_today') }}</b>:</div>
					<div class="div-block info">{{ itemData.last_lubrication_external_stats.shots_count_per_today }}</div>
				</div>

				<div class="info-item">
					<div class="div-block"><b>{{ tt('phrases.total_shots_count') }}</b>:</div>
					<div class="div-block info">{{ itemData.last_lubrication_external_stats.total_shots_count }}</div>
				</div>

				<div class="info-item">
					<div class="div-block"><b>{{ tt('phrases.total_successful_shots_count') }}</b>:</div>
					<div class="div-block info">{{ itemData.last_lubrication_external_stats.total_successful_shots_count }}</div>
				</div>

				<div class="info-item">
					<div class="div-block"><b>{{ tt('phrases.total_unsuccessful_shots_count') }}</b>:</div>
					<div class="div-block info">{{ itemData.last_lubrication_external_stats.total_unsuccessful_shots_count }}</div>
				</div>
			</div>

			<el-form-item :label="tt('Type')" prop="data_set">
				<el-select
					@change="handleChangeDataSet"
					v-model="formData.data_set"
					:placeholder="`${tt('Select')} ${tt('dataset')}`"
				>
					<!-- v-show="item.controller_type === SENSOR_TYPES.BANNER" -->
					<el-option
						v-for="item in filteredDataSetsList"
						:key="'data_set-' + item.id"
						:label="
							`${item.label} ${item.alt_label ? '(' + item.alt_label + ')' : ''}`
						"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('Location')" prop="location_in_equipment" required>
				<CustomInput
					v-model="formData.location_in_equipment"
					:placeholder="`${tt('enter')} ${tt('location')}`"
				/>
			</el-form-item>

			<!-- <el-form-item :label="tt('Item')" prop="equipment_id">
				<SimpleSpinner :active="equipmentsLoading" />

				<el-select
					filterable
					:filter-method="q => selectQuery(q, eqipQueryOptions)"
					v-model="formData.equipment_id"
					placeholder="Type query ..."
				>
					<el-option
						v-for="(item, idx) in equipmentsList"
						:key="`equipment_id-${item.id}_index-${idx}`"
						:label="setupLabel(item, equipmentLabelOptions)"
						:value="item.id"
					/>
				</el-select>
			</el-form-item> -->

			<el-form-item :label="tt('Controller')" prop="controller_id">
				<CustomSelect
					filterable
					:optionsLoading="controllersLoading"
					:optionsList="final_controllersList"
					:placeholder="`${tt('Select')} ${tt('controller')}`"
					v-model="formData.controller_id"
				/>
			</el-form-item>

			<!-- <el-form-item :label="tt('Type')" prop="data_set"
				v-if="!formData.is_lube_mode || !itemId"
			>
				<el-select
					v-model="formData.port_number"
					:placeholder="`${tt('Select')} ${tt('port')}`"
				>
					<el-option
						v-for="item in portsList"
						:key="'port_number-' + item"
						:label="item"
						:value="item"
					/>
				</el-select>
			</el-form-item> -->

			<div class="el-form-item">
				<el-form-item :label="tt('Node')" prop="port_number"
					v-if="!isLubeMatrixV3 && !currentSensorType.isBannerTempVibe2 && !currentSensorType.isBannerV2Generic && !currentSensorType.isBannerV2_1 && !currentSensorType.isBannerM25"
				>
					<el-select
						v-model="formData.port_number"
						:placeholder="`${tt('Select')} ${tt('port')}`"
					>
						<el-option
							v-for="item in portsList"
							:key="'port_number-' + item"
							:label="item"
							:value="item"
						/>
					</el-select>
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
					:label="tt('phrases.Acute_samples')"
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
				</el-form-item>

				<el-form-item :label="tt('phrases.Stable_samples')" prop="stable_samples">
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

				<el-form-item
					:label="`${tt('Recommended')} ${tt('Work_Order')}`"
					prop="is_creating_recommended_maintenance"
					class="label_pt-0"
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
				</el-form-item>

				<el-form-item
					:label="`${tt('phrases.Model_Power')} ${tt('Type')}`"
					prop="power_type"
					v-if="currentSensorType.isBanner"
					required
				>
					<CustomSelect
						:optionsList="bannerPowerTypesList"
						:placeholder="`${tt('Select')} ${tt('type')}`"
						v-model="formData.power_type"
					/>
				</el-form-item>

				<el-form-item
					:label="`${tt('Setup')} ${tt('Type')}`"
					prop="setup_type"
					v-if="currentSensorType.isCustomPDM"
					required
				>
					<CustomSelect
						:optionsList="sensorCustomSetupTypesList"
						:placeholder="`${tt('Select')} ${tt('setup')}`"
						v-model="formData.setup_type"
					/>
				</el-form-item>

				<el-form-item
					:label="`${tt('phrases.banner_v2_subtype')}`"
					prop="banner_v2_subtype_id"
					v-if="currentSensorType.isBannerV2Generic"
				>
					<CustomSelect
						:optionsLoading="bannerSubtypesLoading"
						:optionsList="final_bannerSubtypesList"
						:placeholder="`${tt('Select')} ${tt('subtype')}`"
						v-model="formData.banner_v2_subtype_id"
					/>
				</el-form-item>

				<div class="el-form-item form-subitems-list content-row"
					v-if="currentSensorType.isBannerV2Generic && selectedSubtype && preparedSubtypeParametersList.length"
				>
					<SubTypeParameterItem
						ref="SubTypeParameterItem"
						v-for="(item, idx) in preparedSubtypeParametersList"
						:key="`subtype_item-${item.id}`"
						:item-data="item"
						:item-index="idx"
						fromModal
					/>
				</div>

				<el-form-item
					:label="`${tt('Vertical')} ${tt('Axis')}`"
					prop="ncd_active_vertical_axis"
					v-if="currentSensorType.isBannerTempVibe2 || currentSensorType.isBannerV2_1"
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
					v-if="currentSensorType.isBannerTempVibe2 || currentSensorType.isBannerV2_1"
					required
				>
					<CustomSelect
						:optionsList="ncdAxisList"
						:placeholder="`${tt('Select')} ${tt('axis')}`"
						v-model="formData.ncd_active_axial_axis"
					/>
				</el-form-item>

				<el-form-item
					:label="`${tt('Device')} ${tt('address')} id`"
					prop="device_address_id"
					v-if="isLubeMatrixV3 || currentSensorType.isBannerTempVibe2 || currentSensorType.isBannerV2Generic || currentSensorType.isBannerV2_1 || currentSensorType.isBannerM25"
					required
				>
					<CustomInput v-model="formData.device_address_id" />
				</el-form-item>

				<el-form-item
					:label="`${tt('Sensor')} Id`"
					prop="fft_sensor_id"
					v-if="isLubeMatrixV3 || currentSensorType.isBannerTempVibe2 || currentSensorType.isBannerV2Generic || currentSensorType.isBannerV2_1 || currentSensorType.isBannerM25"
					required
				>
					<CustomInput v-model="formData.fft_sensor_id" />
				</el-form-item>

				<el-form-item
					v-if="
						isNew &&
							!currentSensorType.isCustomPDM &&
							(currentSensorType.isBanner ||
								currentSensorType.isBannerExtraVibration ||
								currentSensorType.isBannerCM1L)
					"
					:label="`${tt('Start')} ${tt('rebaseline')}`"
					prop="is_re_baseline"
				>
					<el-switch
						v-model="formData.is_re_baseline"
						:active-value="1"
						:inactive-value="0"
					/>
				</el-form-item>

				<div class="el-form-item" v-if="currentSensorType.isExtravibration">
					<div class="flex mrow content-row align-center">
						<el-form-item
							prop="equipment_rpm"
							:label="`${tt('constants.Motor')} ${tt('RPM')}`"
							class="mcol-xs-7"
						>
							<el-input v-model.number.lazy="formData.equipment_rpm" />
						</el-form-item>

						<div class="mcol-xs-2">
							<el-button
								@click="sendRpm"
								:loading="rpm_sending"
								type="primary"
								native-type="button"
								class="form-button-element"
								>{{ tt('Send') }}
							</el-button>
						</div>
					</div>

					<div class="el-form-item content-row bold">
						{{ tt('phrases.Extra_vibration_threshold_multipliers') }}:
					</div>

					<!-- <div class="content-row mrow flex 1threshold-multipliers-form-item">
						<div class="mcol-xs-7">
							<label class="el-form-item__label">Motor RPM</label>
							
						</div>
					</div> -->

					<div class="content-row mrow flex wrap threshold-multipliers-form-item">
						<div
							class="mcol-xs-6"
							v-for="item in thresholdMultipliersList"
							:key="`threshold-${item.id}`"
						>
							<label class="el-form-item__label">{{ item.key }}</label>
							<el-form-item :prop="`threshold_multipliers.${item.key}`">
								<el-input v-model.lazy="formData.threshold_multipliers[item.key]" />
							</el-form-item>
							<span>%</span>
						</div>
					</div>
				</div>

				<el-form-item
					:label="`CM1L ${tt('Type')}`"
					prop="data_set_converter"
					v-if="currentSensorType.isBannerCM1L"
					class="dataSetRadioBlock"
				>
					<el-radio-group v-model="formData.data_set_converter">
						<el-radio-button
							v-for="item in dataSetConvertersList"
							:key="`data_set_converter-${item.id}`"
							:disabled="item.id === DATASET_CONVERTERS.AMPS_CUSTOM_150"
							:label="item.id"
							>{{ item.label }}</el-radio-button
						>
					</el-radio-group>
				</el-form-item>

				<el-form-item
					:label="`${tt('Custom')} A`"
					prop="data_set_convert_value"
					v-if="
						formData.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_20 ||
							formData.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_150
					"
					required
				>
					<CustomInput
						v-model="formData.data_set_convert_value"
						:placeholder="tt('value')"
					/>
				</el-form-item>

				<!-- <el-form-item
					v-if="formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS"
					label="Convert value"
					prop="data_set_convert_value"
				>
					<el-input
						v-model="formData.data_set_convert_value"
						placeholder="type expression"
					/>
				</el-form-item> -->

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

				<el-form-item :label="`${tt('phrases.Running_Threshold')}`" prop="running_thresholds"
					v-if="showRunningThresholds"
				>
					<div class="options-container wrapperBlock">
						<div
							v-if="runningThresholdItemsList.length"
							:class="['content-row running-thresholds-list', { fluid: fromModal }]"
						>
							<RunningThresholdItem
								ref="RunningThresholdItem"
								v-for="(item, idx) in runningThresholdItemsList"
								:key="`param-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:isLast="idx === runningThresholdItemsList.length - 1"
								:parametersList="runningThresholdParametersList.all"
								@onRemove="id => removeFormItem(id, 'runningThresholdItemsList')"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="mini"
								type="success"
								@click="addFormItem('runningThresholdItemsList', 'rt_i-')"
							>
								<span class="capitalize">{{ `${tt('add')} ${tt('Parameter')}` }}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>

				<!-- ---------------------- -->
				<el-form-item
					v-if="showLubeMatrixButton"
					:label="`${tt('Enable')} LubeMatrix`"
					prop="is_lube_mode"
				>
					<el-switch
						v-model="formData.is_lube_mode"
						:active-value="1"
						:inactive-value="0"
					/>
				</el-form-item>

				<div class="el-form-item"	v-if="isLubeMatrixV4">
					<div class="content-row">
						<b>{{ `LubeMatrix ${tt('Setup')}` }}</b>
					</div>

					<el-form-item class="content-row"
						:label="tt('phrases.lube_based_device_address_id')" prop="lube_based_device_address_id" required>
						<CustomInput
							v-model="formData.lube_based_device_address_id"
							:placeholder="`${tt('address')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('phrases.lube_based_physical_sensor_id')" prop="lube_based_physical_sensor_id" required>
						<CustomInput
							v-model="formData.lube_based_physical_sensor_id"
							placeholder="id"
						/>
					</el-form-item>

					<el-form-item
						:label="tt('phrases.lube_trigger_metric_type')" prop="lube_trigger_metric_type" required>
						<!-- <div class="1mcol-sm-6"> -->
						<CustomSelect
							filterable
							:optionsList="runningThresholdParametersList.withThresholdsOnly"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							v-model="formData.lube_trigger_metric_type"
						/>
						<!-- </div> -->
					</el-form-item>
				</div>

				<ItemFormUltraSound
					v-if="isLubeMatrixV4 || isLubeMatrixV3"
					class="el-form-item"
					@event="handleEventNew"
					ref="ItemFormUltraSound"
					fromBannerSensorForm
					:isLubeMatrixV3="isLubeMatrixV3"
					:isLubeMatrixV4="isLubeMatrixV4"
					:fromModal="fromModal"
					:equipmentData="equipmentData"
					:itemData="itemData"
					:itemsName="itemsName"
					:isNew="isNew"
					:dataSetChanged="dataSetChanged"
					:formulasList="formulasList"
					:bearingsList="bearingsList"
					:lubeTypesList="lubeTypesList"
					:controllersList="ultrasound_controllersList"
					:banner_controllersList="controllersList"
					:commonItemsLoadings="commonItemsLoadings"
					:parentDataSet="formData.data_set"
				/>

				<el-form-item
					:label="tt('phrases.runtime_tracking_threshold_data_value')"
					prop="runtime_tracking_threshold_data_value"
					v-if="formData.is_runtime_tracking"
				>
					<el-input-number v-model="formData.runtime_tracking_threshold_data_value" />
				</el-form-item>

				<div
					class="el-form-item flex mrow align-center"
					v-if="
						formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
							formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20
					"
				>
					<div class="mcol-xs-6">
						<!-- v-show="formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS" -->
						<span v-text="getExpression(formData.data_set)"></span>
					</div>

					<!-- label="Gain signal value" -->
					<div class="mcol-xs-6">
						<el-form-item class="inline-form-row" prop="gain_ultrasound_signal">
							<label class="el-form-item__label">{{
								tt('phrases.Gain_signal_value')
							}}</label>
							<CustomSelect
								:optionsList="gain_ultrasound_signal_list"
								labelKey="label"
								valueKey="value"
								:placeholder="`${tt('Select')} ${tt('value')}`"
								v-model="formData.gain_ultrasound_signal"
							/>
						</el-form-item>
					</div>
				</div>

				<!-- <div class="el-form-item">
					<div
						v-if="itemData.is_re_baseline_process !== undefined"
						class="el-form-item__content"
						style="margin-left: 150px"
						v-html="`Rebaseline process <b>is ${itemData.is_re_baseline_process ? 'active' : 'finished'}</b>`"
					></div>
				</div> -->

				<div
					class="el-form-item"
					v-if="
						formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
							formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20
					"
				>
					<el-button
						@click="resetSensor"
						type="primary"
						native-type="button"
						class="item-action-button small"
					>
						<span>{{ tt('phrases.reset_sensor') }}</span>
					</el-button>
				</div>

				<el-form-item
					:label="`${tt('Range')}`"
					prop="pressure_range"
					v-if="currentSensorType.isBannerPressure"
					required
				>
					<CustomSelect
						:optionsList="bannerPressureRangesList"
						:placeholder="`${tt('Select')} ${tt('range')}`"
						v-model="formData.pressure_range"
					/>
				</el-form-item>
			</div>			

			<FormOperationsButtons
				v-if="!fromModal && !editInModal"
				@onCancel="handleCancel"
				@onSave="handleValidateSensorForm"
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
import { findItemBy, removeDuplicatesObjectsArray, prepareSubmitData } from '@/helpers';
import {
	dataSetsList,
	SENSOR_TYPES,
	dataSetConvertersList,
	DATASET,
	DATASET_CONVERTERS,
	sensorCustomSetupTypesList,
	bannerPowerTypesList,
	bannerPressureRangesList,
} from '@/constants/global';

import { ADJUSTMENT_ACTIONS_TYPES, LUBE_VERSIONS } from '@/constants/ultrasound';

import { 
	ncdAxisList, BANNER_M25_PARAMETERS_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';

import { chartsListsConfig } from '@/modules/charts_factory/controllers/Sensor/chartsListsConfig';


import {
	// itemFormMixin,
	requestsListMixin,
	sensorTypeMixin,
	actionButtonsMixin,
	fetchItemsHelper,
	subItemsListMixin,
	subItemMixin,
	eventHandler
	// fetchByQueryMixin
} from '@/mixins';

export default {
	mixins: [
		// itemFormMixin(),
		requestsListMixin(),
		sensorTypeMixin(),
		actionButtonsMixin(),
		fetchItemsHelper(),
		subItemsListMixin(),
		subItemMixin(),
		eventHandler()
	],

	components: {
		SubTypeParameterItem: () => import('./SubTypeParameterItem.vue'),
		RunningThresholdItem: () => import('./RunningThresholdItem.vue'),
		ItemFormUltraSound: () => import('./ItemFormUltraSound.vue'),
	},	

	props: {
		equipmentData: {
			type: Object,
			default: () => ({})
		},

		ignoreLocalSubmit: Boolean,
		isNew: Boolean,
		commonItemsLoadings: { type: Object, default: () => ({})},
		controllersList: Array,
		bannerSubtypesList: Array,
		formulasList: Array,

		// ---for lubematrix v3-------
		ultrasound_controllersList: Array,
		lubeTypesList: Array,
		bearingsList: Array,

		// ---From FormItemMixin-------
		itemData: {	type: Object,	default: () => null },
		fromModal: Boolean,
		showSubmitButtons: Boolean,
		editInModal: Boolean,
		additionalSettings: { type: Object,	default: () => ({}) },
		itemsName: { type: Object, default: () => ({}) },
		// new_item_type: Number,
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
			bannerSubtypesLoadingLocal: false,
			bannerSubtypesListLocal: [],
			selectedSensorInitiated: false,

			hasError: false,
			editAcute: false,
			init_crash_indication_threshold: 5,
			editStableSamples: false,
			init_stable_samples: 10,
			rpm_sending: false,

			snoozeDateRange: [],
			maintenanceAlarm: false,
			maintenanceWarning: false,

			runningThresholdItemsList: [],

			dataSetChanged: false,

			formData: {
				type: SENSOR_TYPES.BANNER,
				// external_id: null,
				equipment_id: null,
				controller_id: null,
				port_number: null,
				location_in_equipment: '',
				sensor_default_notifications: [],
				crash_indication_threshold: 5,
				stable_samples: 10,
				data_set: null,
				data_set_converter: null,
				data_set_convert_value: '',

				setup_type: null,

				equipment_rpm: 0,
				threshold_multipliers: {
					'1x': '',
					'2x': '',
					'3x': '',
					'4x': '',
					'5x': '',
					'6x': '',
					'7x': '',
					'8x': '',
					'9x': '',
					'10x': ''
				},

				is_re_baseline: false,
				is_creating_recommended_maintenance: false,
				alarms_types_maintenance: [],
				gain_ultrasound_signal: 60,
				power_type: null,
				is_runtime_tracking: false,

				pressure_range: null,

				runtime_tracking_threshold_data_value: 0,
				device_address_id: '',

				fft_sensor_id: '',
				// sensor_default_mail_notifications: []

				ncd_active_vertical_axis: null,
				ncd_active_axial_axis: null,
				banner_v2_subtype_id: null,
				banner_v2_subtype_parameters: [],
				running_thresholds: [],

				// -----------
				is_lube_mode: false,
				lube_based_device_address_id: '',
			  lube_based_physical_sensor_id: '',
			  lube_trigger_metric_type: null,

				ultrasound_formData: null
			},

			sensor_item_lube_version: null,

			rules: {
				// location_in_equipment: required,
				// equipment_id: required,
				port_number: required,
				controller_id: required,
				data_set: required,
				data_set_converter: null,
				data_set_convert_value: null,
				gain_ultrasound_signal: null
			}
		};
	},

	computed: {
		...mapState({
			userPlantId: state => state.auth.authUser.plant_id,
			showPlantName: state => state.global.navbarSettings.showPlantName,
			globalFilters: state => state.global.globalFilters,
		}),

		showDeviceDataRegisters() {
			const { isBannerTempVibe2, isBannerV2_1, isBannerV2Generic, isBannerM25, isLubeMatrixV3 } = this.currentSensorType;
			if (
				(this.itemData && this.itemData.device_data) &&
				(isBannerTempVibe2 || isBannerV2_1 || isBannerV2Generic || this.formData.is_lube_mode || isBannerM25 || isLubeMatrixV3)
			) {
				return true;
			}
			return false;
		},

		showLastLubricationExternalStats() {
			return this.itemData && (this.formData.is_lube_mode || this.isLubeMatrixV3) && this.itemData.last_lubrication_external_stats;
		},

		instanceName: () => 'Sensors',

		filteredDataSetsList() {
			const list = dataSetsList().filter(
				ds =>
					// ds.id !== DATASET.BANNER_TEMP_VIBE_V2 && (
					ds.controller_type === SENSOR_TYPES.BANNER ||
					ds.id === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
					ds.id === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20 ||
					ds.id === DATASET.SDT_SENSOR_FULL_SPECTRUM ||
					ds.id === DATASET.LUBEMATRIX_V3 // для внедрения lube v3 в banner форму
				// )
			);

			return Object.freeze(list);
		},

		isLubeMatrixV3: that => that.formData.data_set === DATASET.LUBEMATRIX_V3 && !!that.formData.is_lube_mode,
		// formData.is_lube_mode: that => that.formData.data_set === DATASET.LUBEMATRIX_V3,
		showLubeMatrixButton: that => that.formData.data_set === DATASET.BANNER_TEMP_VIBE_V2_1 || that.formData.data_set === DATASET.BANNER_M25,
		isLubeMatrixV4: that => that.showLubeMatrixButton && !!that.formData.is_lube_mode,

		SENSOR_TYPES: () => SENSOR_TYPES,
		dataSetConvertersList: that =>
			dataSetConvertersList.filter(ci => {
				if (that.isNew) {
					return ci.id !== DATASET_CONVERTERS.AMPS_CUSTOM_150;
				} else {
					if (ci.id === DATASET_CONVERTERS.AMPS_CUSTOM_150) {
						return (
							that.itemData.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_150
						);
					}
					return true;
				}
			}),
		DATASET: () => Object.freeze(DATASET),
		DATASET_CONVERTERS: () => DATASET_CONVERTERS,
		sensorCustomSetupTypesList: that =>
			Object.freeze(that.$translate(sensorCustomSetupTypesList)),
		bannerPowerTypesList: () => Object.freeze(bannerPowerTypesList()),
		ncdAxisList: () => Object.freeze(ncdAxisList),

		runtime_tracking_switcher() {
			const { isBannerCM1L, isBanner, isBannerTempVibe2, isBannerV2Generic } = this.currentSensorType;
			return (
				this.equipmentData && this.equipmentData.plant_is_equipment_runtime_tracking &&
				(isBannerCM1L || isBanner || isBannerTempVibe2 || isBannerV2Generic)
			);
		},
		bannerPressureRangesList: () => Object.freeze(bannerPressureRangesList()),

		fromSensorsList: that => that.additionalSettings.fromSensorsList,
		controllerId: that => that.additionalSettings.controllerId,

		portsList() {
			const list = [];
			for (let i = 1; i < 41; i++) {
				list.push(i);
			}
			return list;
		},

		gain_ultrasound_signal_list: () =>
			Object.freeze([
				{ id: 10, value: 0, label: '0' },
				{ id: 1, value: 12, label: '12' },
				{ id: 2, value: 24, label: '24' },
				{ id: 3, value: 36, label: '36' },
				{ id: 4, value: 48, label: '48' },
				{ id: 5, value: 60, label: '60' }
			]),
		thresholdMultipliersList() {
			let list = [];
			for (let i = 1; i < 11; i++) {
				list.push({ id: i, key: `${i}x` });
			}
			return Object.freeze(list);
		},

		final_formulasList: that =>
			that.fromModal ? that.formulasList : that.formulasListLocal,
		final_controllersList: that =>
			(that.fromModal && !that.fromSensorsList) ? that.controllersList : that.controllersListLocal,
		final_bannerSubtypesList: that =>
			that.fromModal ? that.bannerSubtypesList : that.bannerSubtypesListLocal,

		controllersLoading: that => that.commonItemsLoadings.banner_controllersLoading,
		bannerSubtypesLoading: that => that.commonItemsLoadings.banner_subtypesLoading,

		formulasLoading: that => that.commonItemsLoadings.formulasLoading,

		requestsToDoList() {
			if (!this.fromModal || this.fromSensorsList) {
				let items = [
					{
						action: 'fetch_controllers',
						payload: {
							params: {
								type: this.formData.type,
								plantId: this.globalFilters.plantId
							}
						},
						localProp: 'controllersListLocal',
						localLoadProp: 'controllersLoadingLocal'
					},
					{
						action: 'fetch_banner_subtypes',
						localProp: 'bannerSubtypesListLocal',
						localLoadProp: 'bannerSubtypesLoadingLocal'
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

		selectedSubtype() {
			const { formData, final_bannerSubtypesList } = this;

			if (formData.banner_v2_subtype_id && final_bannerSubtypesList.length) {
				return findItemBy('id', formData.banner_v2_subtype_id, final_bannerSubtypesList);
			}
			return null;
		},

		customizableSubtypeParametersList() {
			const { selectedSubtype } = this;

			if (selectedSubtype && selectedSubtype.parameters) {
				return selectedSubtype.parameters.filter(pi => pi.is_customizable);
			}
			return [];
		},

		preparedSubtypeParametersList() {
			const { customizableSubtypeParametersList, itemData } = this;
			if (customizableSubtypeParametersList.length) {
				return customizableSubtypeParametersList.map((item) => {
					if (itemData && itemData.bannerV2SubtypeParameters) {
						const subItem = itemData.bannerV2SubtypeParameters.find(pi => pi.parent_id === item.id);
						if (subItem) {
							return {
								id: item.id,
								name: subItem.name,
								units: item.units,
								formula: subItem.formula,
								graph_type: subItem.graph_type,
								title: `${subItem.name}: ${item.formula} ${item.units}`,
								is_line_speed: subItem.is_line_speed,
								is_signed: subItem.is_signed,
							};
						}
					}
					return {
						id: item.id,
						title: `${item.name}: ${item.formula} ${item.units}`,
						name: item.name,
						units: item.units,
						graph_type: item.graph_type,
						formula: item.formula,
						// isDefaultValues: true
					};
				});				
			}
			return [];
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'SubTypeParameterItem', targetProp: 'banner_v2_subtype_parameters' },
			{ ref: 'RunningThresholdItem', targetProp: 'running_thresholds' },
			{ ref: 'ItemFormUltraSound', targetProp: 'ultrasound_formData' }
		]),

		showRunningThresholds() {
			const {	
				isBanner, isBannerCM1L,
				isBannerTempVibe2, isBannerV2_1,
				isBannerM25
			} = this.currentSensorType;

			return isBanner || isBannerCM1L || isBannerTempVibe2 || isBannerV2_1 || isBannerM25;
		},

		runningThresholdParametersList() {
			const {	
				chartSettingsKey, isBanner,
				isBannerCM1L, isBannerTempVibe2,
				isBannerV2_1, isBannerM25
			} = this.currentSensorType;

			if (
				(isBanner || isBannerCM1L || isBannerTempVibe2 ||	isBannerV2_1 || isBannerM25) &&
					chartSettingsKey
			) {
				const configsList = chartsListsConfig(chartSettingsKey);
				if (configsList) {
					let result = [];
					let resultWithThresholdsOnly = [];
					configsList.forEach(ci => {
						result = result.concat(ci.requestsList);
						if (ci.transformator_settings.specification.setupPlotlinesData === false) {
							//skip
						} else {
							resultWithThresholdsOnly = resultWithThresholdsOnly.concat(ci.requestsList[0]);
						}
						// console.log(ci.transformator_settings.specification.setupPlotlinesData === false, ci.transformator_settings.specification.setupPlotlinesData)
					})

					if (isBannerM25) {
						const paramsList = [
							BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS,
							BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION,
							// BANNER_M25_PARAMETERS_TYPES.HFE_IMPACT_INDEX,
							// BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION,
							// BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_CREST_FACTOR,
							// BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_KURTOSIS,
						];
						result = result.filter(pi => paramsList.some(paramId => paramId === pi.id));
						resultWithThresholdsOnly = resultWithThresholdsOnly.filter(pi => paramsList.some(paramId => paramId === pi.id));
					}

					return {
						all: Object.freeze(removeDuplicatesObjectsArray(result, 'id')),
						withThresholdsOnly: Object.freeze(removeDuplicatesObjectsArray(resultWithThresholdsOnly, 'id'))
					}
				}
			}

			return {
				all: [],
				withThresholdsOnly: []
			};
		},

		/*isSDTsensorDB: that => that.formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS,
		isSDTsensorDB420: that => that.formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20,
		isExtravibration: that => that.formData.data_set === DATASET.EXTRA_VIBRATION,
		isBannerTempVibe2: that => that.formData.data_set === DATASET.BANNER_TEMP_VIBE_V2,
		isBannerPressure: that => that.formData.data_set === DATASET.BANNER_PRESSURE,
		isBanner: that => that.formData.data_set === DATASET.TEMP_VIBE,*/
	},

	methods: {
		...mapActions({
			// fetch_external_sensors: 'sensors/fetch_external_sensors',
			fetch_controllers: 'controllers/fetch_controllers',
			fetch_users: 'users/fetch_users',
			save_item: 'sensors/save_sensor',
			send_rpm: 'sensors/send_rpm',

			fetch_dataset_formulas: 'sensors/fetch_dataset_formulas',
			gain_adjustment: 'sensors/gain_adjustment',
			fetch_banner_subtypes: 'banner_v2_subtypes/fetch_subtypes',
			// fetch_equipments: 'equipments/fetch_equipments'
		}),

		/*toConsole(val) {
			console.log(val);
		},*/

		toggleProp(propName) {
			this[propName] = !this[propName];
		},

		getExpression(data_set) {
			const item = findItemBy('data_set', data_set, this.final_final_formulasList);
			if (item) {
				return item.expression;
			}
			return '';
		},

		sendRpm() {
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
		},

		localSetupPageActions(item) {
			// console.log(item);

			const { equipmentData, maintenanceWarningVal, maintenanceAlarmVal, isLubeMatrixV4 } = this;
			if (item) {
				this.init_crash_indication_threshold = item.crash_indication_threshold || 5;
				this.init_stable_samples = item.stable_samples || 10;

				this.formData.crash_indication_threshold = this.init_crash_indication_threshold;
				this.formData.stable_samples = this.init_stable_samples;

				const { equipment } = item;

				if (item.data_set === DATASET.EXTRA_VIBRATION) {
					if (equipment && equipment.equipmentType) {
						if (equipment.equipmentType.threshold_multipliers) {
							const { threshold_multipliers } = equipment.equipmentType;
							for (const key in threshold_multipliers) {
								this.formData.threshold_multipliers[key] =
									threshold_multipliers[key];
							}
						}
					}
				}
				// console.log('1', this.formData.data_set_convert_value)

				this.formData.is_creating_recommended_maintenance =
					item.is_creating_recommended_maintenance;

				if (item.alarms_types_maintenance && item.alarms_types_maintenance.length) {
					item.alarms_types_maintenance.forEach(ati => {
						this.maintenanceWarning = ati == maintenanceWarningVal;
						this.maintenanceAlarm = ati == maintenanceAlarmVal;
					});
				}

				if (item.lube_version === LUBE_VERSIONS.V3) {
					this.formData.type = SENSOR_TYPES.BANNER;
					if (item.is_lube_mode && !isLubeMatrixV4) {
						// console.log('lube matrix v3');
						this.formData.data_set = DATASET.LUBEMATRIX_V3;
					}
				} else {
					//
				}
				
				this.runningThresholdItemsList = this.setupFormSubItemsList(item.running_thresholds, 'rt_i');

				if (this.formData.data_set === DATASET.BANNER_M25) {
					this.runningThresholdItemsList = this.runningThresholdItemsList.filter(
						ri => ri.node_parameter === BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS ||
									ri.node_parameter === BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION 
					)
				}

				// this.sensor_item_lube_version = ;
			}

			if (equipmentData && equipmentData.id) {
				this.formData.equipment_id = equipmentData.id;
			}

			if (this.fromSensorsList && this.controllerId) {
				this.formData.controller_id = this.controllerId;
			}

		},

		setupEquipmentRpm(item) {
			const { equipmentData } = this;

			if (item && item.equipment_rpm) {
				this.formData.equipment_rpm = +item.equipment_rpm;
			} else if (equipmentData.typeOptions) {
				for (let option of equipmentData.typeOptions) {
					if (option.is_rpm && option.raw_values.length) {
						this.formData.equipment_rpm = +option.raw_values[0];
						break;
					}
				}
			}
		},

		// -----------------
		localGetFormDataCallback(data) {
			data.alarms_types_maintenance = [];
			const {
				isSDTsensorDB,
				isSDTsensorDB420,
				isBanner,
				isExtravibration,
				isBannerPressure,
				isBannerTempVibe2,
				isBannerV2Generic,
				isBannerV2_1,
				isBannerM25
			} = this.currentSensorType;

			if (isSDTsensorDB || isSDTsensorDB420) {
				data.data_set_converter = DATASET.ULTRA_SOUND_SDT_DECIBELS;
			}

			if (isExtravibration) {
				// console.log(data)
				if (!Object.values(data.threshold_multipliers).every(tm => !!tm)) {
					this.$notify({
						type: 'warning',
						title: this.$t('phrases.form_isnt_ready'),
						message: this.$t(
							`phrases.all_threshold_multipliers_fields_should_have_values`
						)
					});
					return null;
				}
			} else {
				delete data.threshold_multipliers;
				delete data.equipment_rpm;
			}

			if (!isBanner) {
				delete data.power_type;
			}

			if (!this.isNew || !isExtravibration) {
				delete data.is_re_baseline;
			}

			if (!isBannerPressure) {
				delete data.pressure_range;
			}

			if (!isBannerTempVibe2 && !isBannerV2_1) {
				delete data.ncd_active_vertical_axis;
				delete data.ncd_active_axial_axis;
			}

			if (data.is_creating_recommended_maintenance) {
				if (this.maintenanceWarning) {
					data.alarms_types_maintenance.push(this.maintenanceWarningVal);
				}
				if (this.maintenanceAlarm) {
					data.alarms_types_maintenance.push(this.maintenanceAlarmVal);
				}
			}

			if (this.isLubeMatrixV3 || isBannerTempVibe2 || isBannerV2Generic || isBannerV2_1 || isBannerM25) {
				delete data.port_number;				
			} else {
				delete data.device_address_id;
				delete data.fft_sensor_id;
			}

			if (!isBannerV2Generic) {
				delete data.banner_v2_subtype_id;
			}

			if (!this.isLubeMatrixV4) {
				delete data.lube_based_device_address_id;
			  delete data.lube_based_physical_sensor_id;
			  delete data.lube_trigger_metric_type;
			}

			/*if (!this.editAcute) {
				delete data.crash_indication_threshold;
			}
			if (!this.editStableSamples) {
				delete data.stable_samples;
			}*/

			return data;
		},

		localGetFormData(data) {
			let sensorType = 'banner';
			let payload = {
				formData: { 
					id: this.itemId,
					...prepareSubmitData(data),
				}
			};
			if (this.isLubeMatrixV3 || this.isLubeMatrixV4) {
				// console.log('0 localGetFormData banner us formdadta', data.ultrasound_formData.formData )
				sensorType = 'ultrasound';
				payload.formData = {
					...payload.formData,
					...data.ultrasound_formData.formData,
					// type: (this.isLubeMatrixV3 || this.isLubeMatrixV4) ? SENSOR_TYPES.ULTRA_SOUND : SENSOR_TYPES.BANNER,
				};

				if (data.ultrasound_formData.levelZonesFormData) {
					payload.levelZonesFormData = {
						...data.ultrasound_formData.levelZonesFormData
					};
				}
				if (data.ultrasound_formData.pumpFormData) {
					payload.pumpFormData = {
						...data.ultrasound_formData.pumpFormData
					};
				}

				delete payload.formData.ultrasound_formData;
				/*delete payload.formData.ultrasound_formData;
				console.log('submit data', payload);
				return*/
			}

			/*if (payload) {
				console.log(payload)
				return
			}*/
			// this.$emit('submit', { sensorType, payload });
			// console.log('1 localGetFormData banner', payload )
			return { sensorType, payload };
		},

		localSubmit(payloadData, options = {}) {
			// console.log('localSubmit', payloadData);
			const { fromSensorsList } = options;
			const {	sensorType,	payload } = payloadData;
			const { formData } = payload;
			// console.log('1', successCounter, payload)

			//-------- для внедрения lube v3 в banner форму-----
			if (sensorType == 'ultrasound') {
				// formData.ultrasound_position = pumpFormData ? +pumpFormData.position : null;
				// console.log('2 localSubmit banner', payload )

				const ItemFormUltraSound = this.$refs.ItemFormUltraSound;
				ItemFormUltraSound.localSubmit(payload);
			} else {
				/*if (process.env.NODE_ENV === 'development') {
					console.log(sensorType, formData);
					return;
				}*/
				this.toggleSubmitRequestResult({fromSensorsList, isLoading:1});

				this.save_item({ data: formData, itemName: 'Sensor',}).then(({data}) => {
					// console.log('2', data.data.id)
					this.itemId = data.data.id;
					this.toggleSubmitRequestResult({fromSensorsList, isLoading:0, success:1});
					
				})
				.catch(() => {
					this.toggleSubmitRequestResult({fromSensorsList, isLoading:0, success:0});
				});
			}
		},

		toggleSubmitRequestResult(settings) {
			const {	fromSensorsList, isLoading, success	} = settings;

			if (fromSensorsList) {
				this.$emit('event', { eventName: 'toggleSaving', data: !!isLoading, onward: true });

				if (!isLoading && success) {
					this.$emit('event', {
						eventName: 'successModalSubmit',
						data: {},
						onward: true
					});
				}
			} else {
				if (isLoading) {
					this.$emit('event', { eventName:'toggleSpinner', data:true });				
				} else {
					this.$emit('event', {
						eventName: 'handleFormSubmitFinish',
						data:	{isLoading, success},
					});
				}
			}
		},

		// для случая когда sensorType == 'ultrasound' и submit вызывается в ItemFormUltraSound
		toggleSpinner(val) {
			this.$emit('event', { eventName:'toggleSpinner', data:val });			
		},

		handleFormSubmitFinish(payload) {
			this.$emit('event', { eventName:'handleFormSubmitFinish', data:payload });
		},

		// -----------------------------

		resetSensor() {
			this.confirmHelper({
				message: `${this.tt('phrases.Do_you_really_want_to')} <b>${this.tt(
					'Reset_sensor'
				)}</b>?`
			})
				.then(() => {
					// console.log('toggleGainAdjustment')
					this.gain_adjustment({
						sensorId: this.itemData.id,
						data: { action: ADJUSTMENT_ACTIONS_TYPES.RESET }
					}).then((/*response*/) => {
						// console.log(response);
					});
				})
				.catch(() => {});
		},

		// -------From SensorsList Submit-------
		handleValidateSensorForm() {
			// const isValid = this.validateItemForm();
			if (this.validateItemForm()) {
				this.submitItemForm({fromSensorsList:true});
			}
		},

		handleCancel() {
			// console.log(1)
			this.$emit('onCancel');
		},

		handleChangeDataSet() {
			this.dataSetChanged = true;
		}
	},

	watch: {
		itemData(data) {
			this.isInitialSetup = true;
			if (!this.blockSetupPageInWatcher) {
				this.setupPage(data);
			}
		},
		
		'selectedController'(controller) {
			// console.log('banner selectedController', controller, this.selectedSensorInitiated)

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
			if (id === DATASET.CM1L) {
				this.rules.data_set_converter = required;
				this.rules.data_set_convert_value = required;
				// console.log(this.formData.data_set_convert_value)

				/*if (id === DATASET.ULTRA_SOUND_SDT_DECIBELS && !this.formData.data_set_convert_value) {
					this.formData.data_set_convert_value = '0.000253*{reg}+36.67';
				} */
			} else {
				this.rules.data_set_converter = null;
				this.formData.data_set_converter = null;
				this.rules.data_set_convert_value = null;
				this.formData.data_set_convert_value = '';
			}

			if (
				id === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
				id === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20
			) {
				this.rules.gain_ultrasound_signal = required;
			} else {
				this.rules.gain_ultrasound_signal = null;
			}

			if (id === DATASET.EXTRA_VIBRATION) {
				this.rules.equipment_rpm = required;
				this.setupEquipmentRpm(this.itemData);
			} else {
				this.rules.equipment_rpm = null;
			}

			if (!this.isInitialSetup) {
				this.formData.is_lube_mode = id === DATASET.LUBEMATRIX_V3;
				this.runningThresholdItemsList = [];				
			}
		},

		'formData.data_set_converter'(id) {
			if (id === DATASET_CONVERTERS.AMPS_CUSTOM_20) {
				this.rules.data_set_convert_value = required;
				// console.log('2', this.formData.data_set_convert_value)

				if (
					this.final_formulasList.length &&
					!this.formData.data_set_convert_value
				) {
					const formula = findItemBy(
						'data_set',
						DATASET.CM1L,
						this.final_formulasList
					);
					this.formData.data_set_convert_value = formula ? formula.expression : '';
				}
			} /*else if (this.formData.data_set !== DATASET.ULTRA_SOUND_SDT_DECIBELS) {
				this.rules.data_set_convert_value = null;
				this.formData.data_set_convert_value = null;
			}*/
		},

		'final_formulasList'(list) {
			if (list.length) {
				const { formData } = this;
				// console.log('3', formData.data_set_convert_value)

				if (
					formData.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_20 &&
					!formData.data_set_convert_value
				) {
					const formula = findItemBy(
						'data_set',
						DATASET.CM1L,
						this.final_formulasList
					);
					this.formData.data_set_convert_value = formula ? formula.expression : '';
				}
			}
		}
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
						keyPrefix: 'banner_controllers',
						payload: {
							params: {
								type: this.formData.type,
								max: -1,
								plantId: this.showPlantName
									? this.showPlantName.id
									: this.globalFilters.plantId
							}
						}
					},
					{
						action: 'fetch_banner_subtypes',
						keyPrefix: 'banner_subtypes',
						payload: { params: { max: -1 } }
					},
				],
				onward: true
			});
		}
	},

	beforeMount() {
		this.isMobile = document.documentElement.clientWidth < 992;
	}
};
</script>

<style lang="scss" scoped>
	.toggle-lubematrix-button {
		position: absolute;	
		top: 75px;
		right: 0;

		.el-button {
			padding-top: 8px;
			padding-bottom: 8px;	
		}
	}
</style>
