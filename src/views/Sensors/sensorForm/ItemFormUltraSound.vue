<template>
	<div class="edit-form-container">
		<el-form
			ref="itemForm"
			class="item-edit-form content-row"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="content-row">
				<el-form-item :label="tt('Lube_Type')" prop="functionality_type" 
					class="content-row"
				>
					<CustomSelectV2
						v-model="formData.functionality_type"
						:optionsList="ultrasoundSensorTypes"
						:placeholder="`${tt('select')} ${tt('type')}`"
					/>
				</el-form-item>

				<el-form-item v-if="!isLubeMatrixV4" :label="tt('Data_Set')" prop="data_set">
					<CustomSelectV2
						v-model="formData.data_set"
						:class="{ showJustInfo: isLubeMatrixV3 && !isNew && !datasetChanged }"
						:disabled="isLubeMatrixV3 && !isNew && !datasetChanged"
						:optionsList="dataSets"
						:placeholder="`${tt('select')} ${tt('dataset')}`"
						:setupLabelMethod="setupDataSetLabel"
					/>
				</el-form-item>

				<el-form-item
					v-if="!fromBannerSensorForm"
					:label="tt('Location')"
					prop="location_in_equipment"
					required
				>
					<CustomInput
						v-model="formData.location_in_equipment"
						:placeholder="`${tt('enter')} ${tt('location')}`"
					/>
				</el-form-item>

				<el-form-item v-if="!fromBannerSensorForm" :label="tt('Controller')" prop="controller_id">
					<FetchByQuerySelect
						v-model="formData.controller_id"
						clearable
						enableLoadmore
						:settings="controllersSelectSettings"
						:placeholder="`${tt('select')} ${tt('controller')}`"
					/>
				</el-form-item>

				<!-- <el-form-item v-if="!fromBannerSensorForm" :label="tt('Item')" prop="equipment_id">
					<FetchByQuerySelect
						v-model="formData.equipment_id"
						clearable
						enableLoadmore
						:settings="equipmentsSelectSettings"
						:placeholder="`${tt('select')} ${tt('item')}`"
					/>
				</el-form-item> -->

				<el-form-item
					v-if="formData.lube_version !== LUBE_VERSIONS.V3"
					:label="tt('Node')"
					prop="port_number"
				>
					<CustomSelectV2
						v-model="formData.port_number"
						:optionsList="portsList"
						:placeholder="`${tt('select')} ${tt('node')}`"
					/>
				</el-form-item>

				<el-form-item
					v-if="formData.lube_version !== LUBE_VERSIONS.V3"
					:label="tt('Position')"
					prop="ultrasound_position"
					required
				>
					<CustomSelectV2
						v-model="formData.ultrasound_position"
						:optionsList="positionsList"
						:placeholder="`${tt('select')} ${tt('position')}`"
					/>
				</el-form-item>

				<el-form-item
					class="content-row"
					v-if="!fromBannerSensorForm"
					:label="tt('phrases.lube_version')"
					prop="lube_version"
				>
					<CustomSelectV2
						v-model="formData.lube_version"
						:optionsList="lubeVersions"
						:placeholder="`${tt('select')} ${tt('version')}`"
					/>
				</el-form-item>

				<el-form-item
					class="content-row"
					v-if="!fromBannerSensorForm && formData.lube_version === LUBE_VERSIONS.V3"
					:label="`${tt('Device')} ${tt('address')} id`"
					prop="device_address_id"
					required
				>
					<CustomInput v-model="formData.device_address_id" />
				</el-form-item>

				<el-form-item
					class="content-row"
					v-if="!fromBannerSensorForm && formData.lube_version === LUBE_VERSIONS.V3"
					:label="`${tt('Sensor')} Id 2`"
					prop="fft_sensor_id"
					required
				>
					<CustomInput v-model="formData.fft_sensor_id" />
				</el-form-item>

				<div v-if="!isSensorOnly" class="content-row">
					<el-form-item :label="`${tt('constants.Lube')} ${tt('Method')}`" prop="lube_method">
						<CustomSelectV2
							v-model="formData.lube_method"
							:optionsList="lubeMethods"
							:placeholder="`${tt('select')} ${tt('method')}`"
						/>
					</el-form-item>

					<el-form-item
						v-if="!fromBannerSensorForm"
						:label="`${tt('Lubricator')} ${tt('type')}`"
						class="mcol-lg-6 is-required"
					>
						<CustomSelectV2
							v-model="pumpFormData.type"
							:disabled="formData.lube_version === LUBE_VERSIONS.V3"
							:optionsList="pumpTypes"
							:placeholder="`${tt('Select')} ${tt('type')}`"
						/>
					</el-form-item>

					<div v-if="showAlarmGainBlock" class="el-form-item flex mrow align-center">
						<div class="mcol-xs-6">
							<span>{{ formulaExpression }}</span>
						</div>
						<div v-if="showGainControl" class="mcol-xs-6">
							<el-form-item class="inline-form-row" prop="gain_ultrasound_signal">
								<label class="el-form-item__label">{{ tt('phrases.gain_signal_value') }}</label>
								<CustomSelectV2
									v-model="formData.gain_ultrasound_signal"
									:optionsList="gainUltrasoundSignalList"
									labelKey="label"
									valueKey="value"
									:placeholder="`${tt('select')} ${tt('value')}`"
								/>
							</el-form-item>
						</div>
					</div>
				</div>

				<div v-if="!isSensorOnly && pumpFormData.type === PUMP_TYPES.PERMA" class="content-row">
					<div class="content-row">
						<b>{{ `${tt('Bearing')} ${tt('information')}` }}</b>
					</div>

					<div class="form-section paint content-row">
						<div class="flex mrow wrap content-row labels-on-top">
							<el-form-item
								:label="`${tt('Bearing')} ${tt('number')}`"
								prop="bearing_id"
								class="mcol-xs-12 mcol-md-6"
							>
								<CustomSelectV2
									v-model="formData.bearing_id"
									filterable
									:optionsLoading="commonItemsLoadings.bearingsLoading"
									:optionsList="bearingsList"
									labelKey="number"
									:placeholder="`${tt('select')} ${tt('bearing')}`"
								/>
							</el-form-item>

							<el-form-item
								:label="tt('RPM')"
								prop="bearing_rpm"
								class="mcol-xs-12 mcol-md-6"
							>
								<el-input-number v-model="formData.bearing_rpm" :min="0" />
							</el-form-item>

							<div class="el-form-item mcol-xs-12 mcol-md-6">
								<div class="el-form-item__label">
									{{ tt('phrases.Outside_Diameter') }} (mm)
								</div>
								<div
									class="value-instead-input el-form-item__content bold"
									v-text="selectedBearing.outside_diameter || '-'"
								></div>
							</div>

							<div class="el-form-item mcol-xs-12 mcol-md-6">
								<div class="el-form-item__label">{{ tt('Width') }} (mm)</div>
								<div
									class="value-instead-input el-form-item__content bold"
									v-text="selectedBearing.width || '-'"
								></div>
							</div>

							<el-form-item
								:label="`${tt('Replenishment')} ${tt('type')}`"
								prop="replenishment_type"
								class="mcol-xs-12 mcol-md-6"
							>
								<CustomSelectV2
									v-model="formData.replenishment_type"
									filterable
									:optionsList="replenishmentTypes"
									:placeholder="`${tt('Select')} ${tt('type')}`"
									labelKey="label"
								/>
							</el-form-item>

							<div class="el-form-item mcol-xs-12 mcol-md-6">
								<div class="el-form-item__label">
									{{ tt('phrases.Calculated_Lubricated_Quantity') }} (g)
								</div>
								<div
									class="value-instead-input el-form-item__content bold"
									v-text="calculatedLubesData.calculatedLubricantQuantity || '-'"
								></div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</el-form>

		<el-form
			v-if="!isSensorOnly"
			ref="pumpForm"
			class="item-edit-form content-row"
			label-width="150px"
			:model="pumpFormData"
			:rules="pumpRules"
			label-position="top"
		>
			<div class="content-row">
				<b>{{ `${tt('Lubricator')} ${tt('Configuration')}` }}</b>
			</div>

			<div class="form-section paint content-row items_width_180">
				<div v-if="pumpFormData.type === PUMP_TYPES.PULSAR" class="flex mrow wrap content-row">
					<el-form-item
						required
						class="mcol-xs-12 mcol-md-6"
						:label="tt('Grease_pack')"
						prop="lubricant_container"
					>
						<CustomSelectV2
							v-model="pumpFormData.lubricant_container"
							:optionsList="greasePacks"
							:placeholder="`${tt('select')} ${tt('pack')}`"
							labelKey="label"
							valueKey="val"
						/>
					</el-form-item>

					<el-form-item
						:label="tt('phrases.Modes_of_Cycles')"
						prop="lube_cycle_max_count"
						class="mcol-xs-12 mcol-md-6"
						required
					>
						<CustomSelectV2
							v-model="pumpFormData.lube_cycle_max_count"
							:optionsList="numberOfCyclesList"
							:placeholder="`${tt('select')} ${tt('mode')}`"
							labelKey="label"
							valueKey="val"
						/>
						<span class="input-description bold right-outside">{{ totalLubeLevel }}</span>
					</el-form-item>

					<el-form-item
						:label="`${tt('Warning')} ${tt('Level')}`"
						prop="lube_cycle_warning_count"
						class="mcol-xs-12 mcol-md-6"
					>
						<el-input-number v-model="pumpFormData.lube_cycle_warning_count" :min="0" />
					</el-form-item>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">{{ tt('phrases.Lube_cycle_spent_count') }}</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="pumpFormData.lube_cycle_spent_count"
						></div>
					</div>
				</div>

				<div v-if="pumpFormData.type === PUMP_TYPES.PERMA" class="flex mrow wrap">
					<el-form-item
						required
						class="mcol-xs-12 mcol-md-6"
						:label="`${tt('Lubricant')} ${tt('Type')}`"
						prop="lubricant_type_id"
					>
						<CustomSelectV2
							v-model="pumpFormData.lubricant_type_id"
							:optionsLoading="commonItemsLoadings.lubeTypesLoading"
							:optionsList="lubeTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
						/>
					</el-form-item>

					<el-form-item
						class="mcol-xs-12 mcol-md-6"
						:label="`${tt('Lubricant')} ${tt('Cartridge')}`"
						prop="lubricant_container"
					>
						<CustomSelectV2
							v-model="pumpFormData.lubricant_container"
							:optionsList="lubricantCartridges"
							:placeholder="`${tt('select')} ${tt('cartridge')}`"
							labelKey="label"
							valueKey="val"
						/>
					</el-form-item>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div>
							<div class="el-form-item__label">{{ `${tt('Lubricant')} ${tt('Density')}` }} (g/cm3)</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="selectedLubeType.density"
							></div>
						</div>
					</div>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div>
							<div class="el-form-item__label">{{ tt('phrases.Lube_Cycles_Per_Cartridge') }}</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="permaLubeCyclesPerCartridge"
							></div>
						</div>
					</div>

					<el-form-item
						:label="`${tt('Lubricant')} ${tt('Amount')} (cm3/cycle)`"
						prop="lubricant_amount"
						class="mcol-xs-12 mcol-md-6"
					>
						<el-select
							v-model="pumpFormData.lubricant_amount"
							:placeholder="`${tt('select')} ${tt('Amount')}`"
						>
							<el-option
								v-for="item in lubricantAmountsList"
								:key="'userType-' + item.val"
								:label="item.label"
								:value="item.val"
							/>
						</el-select>
					</el-form-item>

					<el-form-item
						:label="`${tt('Warning')} ${tt('Level')}`"
						prop="lube_cycle_warning_count"
						class="mcol-xs-12 mcol-md-6"
					>
						<el-input-number v-model="pumpFormData.lube_cycle_warning_count" :min="0" />
					</el-form-item>
				</div>
			</div>

			<div v-if="pumpFormData.type === PUMP_TYPES.PERMA" class="content-row">
				<b>{{ `${tt('Lubricant')} ${tt('Amount')}` }}</b>
			</div>

			<div
				v-if="pumpFormData.type === PUMP_TYPES.PERMA"
				class="form-section paint content-row items_width_180"
			>
				<div class="flex mrow wrap content-row">
					<div class="mcol-xs-12 mcol-md-6">
						<div>
							{{ tt('phrases.Total_Lubricant_Delivered_In_All_Sets') }} (g)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="calculatedLubesData.totalGramsLubricantDeliveredInAllSets || '-'"
						></div>
					</div>

					<div class="mcol-xs-12 mcol-md-6">
						<div>
							{{ tt('phrases.Total_Lubricant_Delivered_In_All_Sets') }} (% of CQ)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="calculatedLubesData.totalPercentLubricantDeliveredInAllSets || '-'"
						></div>
					</div>

					<div class="mcol-xs-12 mcol-md-6">
						<div>
							{{ tt('phrases.Target_Lubricant_Per_Set') }} (g) (10%)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="calculatedLubesData.targetLubricantPerCycle || '-'"
						></div>
					</div>

					<div class="mcol-xs-12 mcol-md-6">
						<div>
							{{ tt('phrases.Lubricant_Delivered_Per_Set') }} (%)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="calculatedLubesData.lubricantDeliveredPerCycle || '-'"
						></div>
					</div>

					<div class="mcol-xs-12 mcol-md-6">
						<div>
							{{ tt('phrases.Actual_Lubricant_Per_Set') }} (g)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="calculatedLubesData.actualLubricantPerCycle || '-'"
						></div>
					</div>
				</div>
			</div>
		</el-form>

		<el-form
			v-if="!isSensorOnly"
			ref="itemForm2"
			class="item-edit-form content-row"
			label-width="150px"
			:model="formData"
			:rules="rules"
			label-position="top"
		>
			<div class="content-row">
				<div class="content-row flex align-center">
					<b>{{ tt('phrases.Lube_Logic_Setup') }}</b>

					<el-button
						class="ml-auto"
						size="small"
						type="success"
						:disabled="!readyToApplyCalculated"
						@click="applyCalculatedData"
					>
						<span>{{ tt('phrases.Apply_calculated_data') }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>

				<div v-if="formData.lube_method === LUBE_METHODS.ALARM" class="form-section paint content-row">
					<div class="flex mrow wrap content-row">
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.Lube_Cycles_Per_Set')" prop="lube_cycle">
							<el-input-number v-model="formData.lube_cycle" :min="0" />
						</el-form-item>
						<div class="mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.Calculated_Cycles_Per_Set') }}
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.calculatedCyclesPerSet || '-'"
							></div>
						</div>

						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.time_between_lube_cycles_sec')" prop="lube_cycle_dwell_time">
							<el-input-number v-model="formData.lube_cycle_dwell_time" :min="0" />
						</el-form-item>
						<div class="mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.calculated_time') }} (sec)
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.timeBetweenCycles || '-'"
							></div>
						</div>

						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('Lube_Sets')" prop="lube_cycle_set">
							<el-input-number v-model="formData.lube_cycle_set" :min="0" />
						</el-form-item>
						<div class="mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.Calculated_Lube_Sets') }}
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.calculatedLubeSets || '-'"
							></div>
						</div>

						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.time_between_lube_sets_sec')" prop="lube_cycle_set_dwell_time">
							<el-input-number v-model="formData.lube_cycle_set_dwell_time" :min="0" />
						</el-form-item>
						<div class="mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.Calculated_Time') }} (sec)
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.timeBetweenSets || '-'"
							></div>
						</div>

						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.warm_up_time_minutes')" prop="lube_cycle_warm_up_minutes" required>
							<el-input-number v-model="formData.lube_cycle_warm_up_minutes" :min="5" :max="300" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.cool_down_time_minutes')" prop="lube_cycle_cool_down_minutes" required>
							<el-input-number v-model="formData.lube_cycle_cool_down_minutes" :min="1" :max="120" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.percentage_of_points_above_alarm')" prop="lube_cycle_percent_danger_points" required>
							<el-input-number v-model="formData.lube_cycle_percent_danger_points" :min="0" />
						</el-form-item>
					</div>
				</div>

				<div v-if="formData.lube_method === LUBE_METHODS.FREQUENCY" class="flex mrow wrap form-section paint content-row">
					<div class="mcol-xs-12 flex">
						<el-button
							v-show="frequencyBlockDisabled"
							type="primary"
							native-type="button"
							class="ml-auto item-action-button inverted small"
							@click="handleResetFrequencySettings"
						>
							<span class="uppercase">{{ tt('reset') }}</span>
						</el-button>
					</div>

					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('Period')" prop="lube_period" required>
							<CustomSelectV2
								v-model="formData.lube_period"
								:disabled="frequencyBlockDisabled"
								:optionsList="lubePeriods"
								:placeholder="`${tt('select')} ${tt('period')}`"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('time')" prop="lube_period_time">
							<el-input-number
								v-model="formData.lube_period_time"
								:disabled="frequencyBlockDisabled"
								:min="1"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('Lube_Cycles')" prop="lube_cycle">
							<el-input-number
								v-model="formData.lube_cycle"
								:disabled="frequencyBlockDisabled"
								:min="0"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('phrases.lube_cycle_dwell_time')" prop="lube_cycle_dwell_time">
							<el-input-number
								v-model="formData.lube_cycle_dwell_time"
								:disabled="frequencyBlockDisabled"
								:min="0"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12">
						<el-form-item :label="tt('Starting_At')">
							<div class="flex mrow">
								<div class="mcol-xs-6">
									<Datepicker
										v-model="selectedLubeDate"
										:disabled="frequencyBlockDisabled"
										className=" "
										:placeholder="`${tt('Select')} ${tt('date')}`"
										:pickerOptions="pickerOptions"
									/>
								</div>

								<div class="mcol-xs-6">
									<el-time-picker
										v-model="selectedLubeTime"
										:disabled="frequencyBlockDisabled"
										value-format="HH:mm:ss"
										:placeholder="`${tt('select')} ${tt('time')}`"
										:disabled-hours="disabledTimeHours"
										:disabled-minutes="disabledTimeMinutes"
										:disabled-seconds="disabledTimeSeconds"
										@blur="handleResetValidate"
									/>
								</div>
							</div>
						</el-form-item>
					</div>
				</div>
			</div>
		</el-form>

		<el-form
			v-if="enableLevelZonesForm"
			ref="itemForm3"
			class="item-edit-form content-row"
			label-width="150px"
			:model="levelZoneForm"
			:rules="levelZoneRules"
			label-position="top"
		>
			<div class="content-row">
				<b>{{ tt('Zones') }}</b>
			</div>
			<div class="form-section paint el-form-item content-row">
				<div class="flex wrap mrow content-row">
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="`${tt('constants.Alarm')} ${tt('zone')}`" prop="alarm_zone" required>
							<el-input-number
								v-model="levelZoneForm.alarm_zone"
								:min="levelZoneForm.warning_zone"
								:precision="2"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="`${tt('constants.Warning')} ${tt('zone')}`" prop="warning_zone" required>
							<el-input-number
								v-model="levelZoneForm.warning_zone"
								:max="levelZoneForm.alarm_zone"
								:precision="2"
							/>
						</el-form-item>
					</div>
				</div>
				<div class="flex wrap mrow content-row">
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('constants.Baseline_zone')" prop="baseline_zone" required>
							<el-input-number v-model="levelZoneForm.baseline_zone" :precision="2" />
						</el-form-item>
					</div>
				</div>
			</div>
		</el-form>

		<FormOperationsButtons
			v-if="!fromModal && !editInModal"
			@onCancel="handleCancel"
			@onSave="handleSave"
		/>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { DATASET, PUMP_TYPES, SENSOR_TYPES, dataSetsList, pumpTypesList } from '@/constants/global';
import {
	LUBE_METHODS,
	LUBE_PERIODS,
	LUBE_VERSIONS,
	ULTRASOUND_SENSOR_TYPES,
	greasePacksList,
	lubeMethodsList,
	lubePeriodsList,
	lubeVersionsList,
	lubricantCartridgeList,
	pulsarLubeLevelStep,
	replenismentTypesList,
	ultrasoundSensorTypesList,
} from '@/constants/ultrasound';
import { required } from '@/constants/validation';
import { findItemBy, getRoundedValue, getYmdDateString, prepareSubmitData } from '@/helpers';
import { Lang } from '@/localization';
import {
	METRIC_SYSTEM_TYPES,
	SENSOR_SPECIFIC_PARAMETERS_TYPES,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSensors } from '@/composables/useSensors';
import { useNotify } from '@/composables/useNotify';
import { useGlobalStore } from '@/stores/GlobalStore';

import Datepicker from '@/components/common/Datepicker.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'SensorItemFormUltraSound',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
	additionalSettings: { type: Object, default: () => ({}) },
	itemsName: { type: Object, default: () => ({}) },
	equipmentData: { type: Object, default: () => ({}) },
	isNew: Boolean,
	fromBannerSensorForm: Boolean,
	isLubeMatrixV3: Boolean,
	isLubeMatrixV4: Boolean,
	parentDataSet: null,
	dataSetChanged: Boolean,
	controllersList: { type: Array, default: () => [] },
	formulasList: { type: Array, default: () => [] },
	bearingsList: { type: Array, default: () => [] },
	lubeTypesList: { type: Array, default: () => [] },
	commonItemsLoadings: { type: Object, default: () => ({}) },
	editInModal: Boolean,
});

const emit = defineEmits(['submit', 'onCancel', 'event']);

const { fetchDatasetFormulas } = useSensors();
const { Notify } = useNotify();
const globalStore = useGlobalStore();

const itemForm = ref(null);
const pumpForm = ref(null);
const itemForm2 = ref(null);
const itemForm3 = ref(null);
const formulasListLocal = ref([]);
const frequencyBlockDisabled = ref(false);
const isResetFrequencySettingsBeforeSubmit = ref(false);
const datasetChanged = ref(false);
const selectedLubeDate = ref('');
const selectedLubeTime = ref('');
const calculateParamsData = ref({
	bearing_id: null,
	bearing_rpm: null,
	replenishment_type: null,
	lubricant_type_id: null,
	lubricant_amount: null,
});
const calculatedLubesData = ref({});
const levelZoneForm = ref({
	metric_system_type: METRIC_SYSTEM_TYPES.METRIC,
	parameter_type: SENSOR_SPECIFIC_PARAMETERS_TYPES.DB,
	alarm_zone: 0,
	warning_zone: 0,
	baseline_zone: 0,
});

const initialFormData = {
	id: null,
	type: SENSOR_TYPES.ULTRA_SOUND,
	port_number: null,
	controller_id: null,
	equipment_id: props.equipmentData?.id || null,
	data_set: DATASET.ULTRA_SOUND_DECIBELS,
	location_in_equipment: '',
	gain_ultrasound_signal: 60,
	lube_method: LUBE_METHODS.ALARM,
	lube_period: LUBE_PERIODS.HOUR,
	lube_period_time: 1,
	lube_cycle: null,
	lube_cycle_dwell_time: null,
	lube_cycle_set: null,
	lube_cycle_set_dwell_time: null,
	lube_cycle_scheduled_start_time: '',
	bearing_id: null,
	bearing_rpm: null,
	replenishment_type: null,
	ultrasound_position: null,
	lube_cycle_warm_up_minutes: 50,
	lube_cycle_cool_down_minutes: 10,
	lube_cycle_percent_danger_points: 80,
	functionality_type: null,
	lube_version: null,
	device_address_id: '',
	fft_sensor_id: '',
	is_lube_mode: 1,
	is_archived: 0,
};
const formData = ref({ ...initialFormData });
const pumpFormData = ref({
	id: null,
	position: '',
	type: null,
	sensor_id: null,
	lubricant_container: null,
	lube_cycle_max_count: null,
	lube_cycle_warning_count: 20,
	lube_cycle_spent_count: 0,
	lubricant_type_id: null,
	lubricant_amount: null,
});

function validatePositiveNumber(rule, value, callback) {
	if (value === null || value === undefined || value === '' || Number(value) <= 0) {
		callback(new Error('Value should be greater than 0'));
		return;
	}

	callback();
}

const rules = reactive({
	equipment_id: required,
	controller_id: required,
	data_set: props.fromBannerSensorForm ? null : required,
	location_in_equipment: required,
	lube_cycle: [{ validator: validatePositiveNumber, trigger: 'change' }],
	lube_cycle_dwell_time: [{ validator: validatePositiveNumber, trigger: 'change' }],
	lube_cycle_set: [{ validator: validatePositiveNumber, trigger: 'change' }],
	lube_cycle_set_dwell_time: [{ validator: validatePositiveNumber, trigger: 'change' }],
	lube_cycle_warm_up_minutes: required,
	lube_cycle_cool_down_minutes: required,
	lube_cycle_percent_danger_points: required,
	lube_period: required,
});
const pumpRules = reactive({
	position: required,
	type: required,
	lubricant_container: required,
	lube_cycle_max_count: required,
	lubricant_type_id: null,
	lubricant_amount: null,
});
const levelZoneRules = reactive({
	alarm_zone: required,
	warning_zone: required,
	baseline_zone: required,
});

const dataSets = computed(() => {
	if (formData.value.lube_version === LUBE_VERSIONS.V3) {
		return Object.freeze(dataSetsList().filter((item) => item.isLubeV3));
	}

	return Object.freeze(
		dataSetsList().filter((item) => item.controller_type === SENSOR_TYPES.ULTRA_SOUND),
	);
});
const setupDataSetLabel = (item) => `${item.label} ${item.alt_label ? `(${item.alt_label})` : ''}`;
const lubeMethods = computed(() => Object.freeze(lubeMethodsList()));
const lubePeriods = computed(() => Object.freeze(lubePeriodsList()));
const lubeVersions = computed(() => Object.freeze(lubeVersionsList()));
const pumpTypes = computed(() => Object.freeze(pumpTypesList()));
const greasePacks = computed(() => Object.freeze(greasePacksList()));
const lubricantCartridges = computed(() => Object.freeze(lubricantCartridgeList()));
const replenishmentTypes = computed(() => Object.freeze(replenismentTypesList()));
const ultrasoundSensorTypes = computed(() => Object.freeze(ultrasoundSensorTypesList()));
const portsList = computed(() =>
	Object.freeze(Array.from({ length: 40 }, (_, index) => ({ id: index + 1, name: index + 1 }))),
);
const positionsList = computed(() =>
	Object.freeze([
		{ id: 1, name: 1 },
		{ id: 2, name: 2 },
	]),
);
const gainUltrasoundSignalList = computed(() =>
	Object.freeze([
		{ id: 1, value: 12, label: '12' },
		{ id: 2, value: 24, label: '24' },
		{ id: 3, value: 36, label: '36' },
		{ id: 4, value: 48, label: '48' },
		{ id: 5, value: 60, label: '60' },
	]),
);
const finalFormulasList = computed(() =>
	props.fromModal && props.formulasList.length ? props.formulasList : formulasListLocal.value,
);
const isSensorOnly = computed(
	() => formData.value.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY,
);
const enableLevelZonesForm = computed(
	() => props.isNew && !isSensorOnly.value && formData.value.lube_method === LUBE_METHODS.ALARM,
);
const isLubeMatrixV3 = computed(() => props.isLubeMatrixV3 || formData.value.lube_version === LUBE_VERSIONS.V3);
const isLubeMatrixV4 = computed(() => props.isLubeMatrixV4);
const showAlarmGainBlock = computed(
	() =>
		formData.value.lube_method === LUBE_METHODS.ALARM &&
		[
			DATASET.ULTRA_SOUND_SDT_DECIBELS,
			DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20,
			DATASET.SDT_SENSOR_FULL_SPECTRUM,
			DATASET.LUBE_MATRIX_SDT_TEMP_C,
			DATASET.LUBE_MATRIX_SDT_TEMP_F,
		].includes(formData.value.data_set),
);
const showGainControl = computed(() =>
	[DATASET.ULTRA_SOUND_SDT_DECIBELS, DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20].includes(
		formData.value.data_set,
	),
);
const formulaExpression = computed(() => {
	const item = findItemBy('data_set', formData.value.data_set, finalFormulasList.value);
	return item?.expression || '';
});
const selectedBearing = computed(() => {
	if (props.bearingsList.length && formData.value.bearing_id) {
		return findItemBy('id', formData.value.bearing_id, props.bearingsList) || {};
	}
	return {};
});
const selectedLubeType = computed(() => {
	if (props.lubeTypesList.length && pumpFormData.value.lubricant_type_id) {
		return findItemBy('id', pumpFormData.value.lubricant_type_id, props.lubeTypesList) || {};
	}
	return {};
});
const numberOfCyclesList = computed(() => {
	if (pumpFormData.value.lubricant_container) {
		const pack = findItemBy('val', pumpFormData.value.lubricant_container, greasePacks.value);
		if (pack) return Object.freeze(pack.cyclesList);
	}
	return [];
});
const lubricantAmountsList = computed(() => {
	if (pumpFormData.value.lubricant_container) {
		const pack = findItemBy(
			'val',
			pumpFormData.value.lubricant_container,
			lubricantCartridges.value,
		);
		if (pack) return Object.freeze(pack.amountsList);
	}
	return [];
});
const permaLubeCyclesPerCartridge = computed(() => {
	if (pumpFormData.value.type === PUMP_TYPES.PERMA && pumpFormData.value.lubricant_amount) {
		const item = findItemBy('val', pumpFormData.value.lubricant_amount, lubricantAmountsList.value);
		if (item) return Object.freeze(item.pos);
	}
	return 0;
});
const totalLubeLevel = computed(() => {
	const { lube_cycle_max_count, lubricant_container } = pumpFormData.value;
	if (lubricant_container && lube_cycle_max_count && numberOfCyclesList.value.length) {
		const selectedItem = findItemBy('val', lube_cycle_max_count, numberOfCyclesList.value);
		if (selectedItem) {
			return `${selectedItem.pos * pulsarLubeLevelStep.val}${pulsarLubeLevelStep.unit}`;
		}
	}
	return 0;
});
const readyToApplyCalculated = computed(() =>
	!!(
		calculatedLubesData.value.calculatedCyclesPerSet ||
		calculatedLubesData.value.timeBetweenCycles ||
		calculatedLubesData.value.calculatedLubeSets ||
		calculatedLubesData.value.timeBetweenSets
	)
);
const pickerOptions = Object.freeze({
	disabledDate(date) {
		const start = new Date();
		const today = start.getTime() - 3600000 * 24;
		return date.getTime() < today;
	},
});
const timePickerStart = computed(() => {
	if (!selectedLubeDate.value) return null;

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const selectedDate = new Date(`${selectedLubeDate.value}T00:00:00`);

	if (selectedDate.getTime() === today.getTime()) {
		return {
			hour: now.getHours(),
			minute: now.getMinutes(),
			second: now.getSeconds(),
		};
	}

	return null;
});
const disabledTimeHours = () => {
	if (!timePickerStart.value) return [];
	return Array.from({ length: timePickerStart.value.hour }, (_, index) => index);
};
const disabledTimeMinutes = (hour) => {
	if (!timePickerStart.value || hour !== timePickerStart.value.hour) return [];
	return Array.from({ length: timePickerStart.value.minute }, (_, index) => index);
};
const disabledTimeSeconds = (hour, minute) => {
	if (
		!timePickerStart.value ||
		hour !== timePickerStart.value.hour ||
		minute !== timePickerStart.value.minute
	) {
		return [];
	}
	return Array.from({ length: timePickerStart.value.second }, (_, index) => index);
};

const controllersSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.Controllers.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.Controllers.apiBase),
	params: {
		max: -1,
		type: SENSOR_TYPES.ULTRA_SOUND,
		plantId: globalStore.navbarSettings?.showPlantName?.id || globalStore.globalFilters?.plantId,
	},
}));
const generateIdInRange = (min, max) => {
	const now = Date.now();
	const perf = Math.floor(performance.now());
	return ((now + perf) % (max - min + 1)) + min;
};

const handleCalculateData = (data = {}) => {
	calculateParamsData.value = {
		...calculateParamsData.value,
		...data,
	};

	if (!Object.values(calculateParamsData.value).every((value) => !!value)) return;

	api_request.post('/ultrasound/lubes/params', {
		data: calculateParamsData.value,
		notNotify: true,
	})
		.then(({ value }) => {
			const result = {};
			Object.keys(value || {}).forEach((key) => {
				result[key] = getRoundedValue(value[key], 1, key === 'timeBetweenCycles' ? 0 : 3);
			});
			calculatedLubesData.value = result;
		});
};

const applyCalculatedData = () => {
	if (calculatedLubesData.value.calculatedCyclesPerSet) {
		formData.value.lube_cycle = Math.round(calculatedLubesData.value.calculatedCyclesPerSet);
	}
	if (calculatedLubesData.value.timeBetweenCycles) {
		formData.value.lube_cycle_dwell_time = Math.round(calculatedLubesData.value.timeBetweenCycles);
	}
	if (calculatedLubesData.value.calculatedLubeSets) {
		formData.value.lube_cycle_set = Math.round(calculatedLubesData.value.calculatedLubeSets);
	}
	if (calculatedLubesData.value.timeBetweenSets) {
		formData.value.lube_cycle_set_dwell_time = Math.round(calculatedLubesData.value.timeBetweenSets);
	}
};

const resetFrequencySettings = ({ resetFormDataFields } = {}) => {
	if (!props.itemData?.id) return Promise.resolve();

	emit('event', { eventName: 'toggleSaving', data: true });

	return api_request.put(`/ultrasound/commands/${props.itemData.id}/reset/setup`, {
		resultMessage: { text: `${tt('successfully')} ${tt('reset')}` },
	})
		.then(() => {
			if (resetFormDataFields) {
				formData.value.lube_period = null;
				formData.value.lube_period_time = 0;
				formData.value.lube_cycle = 0;
				formData.value.lube_cycle_dwell_time = 0;
				selectedLubeDate.value = '';
				selectedLubeTime.value = '';
			}
			frequencyBlockDisabled.value = false;
		})
		.finally(() => {
			emit('event', { eventName: 'toggleSaving', data: false });
		});
};

const handleResetFrequencySettings = () => {
	resetFrequencySettings({ resetFormDataFields: true });
};

const handleResetValidate = () => {
	itemForm.value?.clearValidate?.();
	itemForm2.value?.clearValidate?.();
};

const getPumpFormData = () => {
	const data = { ...pumpFormData.value };

	if (data.type !== PUMP_TYPES.PERMA) {
		delete data.lubricant_amount;
		delete data.lubricant_type_id;
	}
	if (data.type !== PUMP_TYPES.PULSAR) {
		delete data.lube_cycle_max_count;
	}

	return data;
};

const localSetupPage = (item) => {
	if (isLubeMatrixV3.value || isLubeMatrixV4.value) {
		formData.value.lube_version = LUBE_VERSIONS.V3;
	}

	if (item?.lube_method === LUBE_METHODS.FREQUENCY && item.lube_cycle_dwell_time) {
		formData.value.lube_cycle_dwell_time = item.lube_cycle_dwell_time / 60;
	}

	if (item?.pump?.position) {
		formData.value.ultrasound_position = item.pump.position;
	}

	if (item?.pump) {
		pumpFormData.value = {
			...pumpFormData.value,
			...item.pump,
		};
	}

	if (item?.lube_cycle_scheduled_start_time) {
		selectedLubeDate.value = getYmdDateString({ ms: item.lube_cycle_scheduled_start_time });
		selectedLubeTime.value = getYmdDateString({
			ms: item.lube_cycle_scheduled_start_time,
			withTime: true,
			timeOnly: true,
			timeZone: 'UTC',
		});
	}

	if (props.equipmentData?.id) {
		formData.value.equipment_id = props.equipmentData.id;
	}

	if (!formData.value.lube_method) {
		formData.value.lube_method = LUBE_METHODS.ALARM;
	}

	if (!pumpFormData.value.type) {
		pumpFormData.value.type = PUMP_TYPES.PULSAR;
	}

	frequencyBlockDisabled.value =
		!props.isNew && formData.value.lube_method === LUBE_METHODS.FREQUENCY;
	formData.value.is_lube_mode = 1;
};

const validateFormRef = (formRef) => {
	const form = formRef.value;
	if (!form?.validate) return Promise.resolve(true);

	return new Promise((resolve) => {
		form.validate((valid) => {
			resolve(valid);
		});
	});
};

const localValidationHook = () => {
	const validations = [Promise.resolve(true)];

	if (itemForm2.value) {
		validations.push(validateFormRef(itemForm2));
	}

	if (pumpForm.value) {
		validations.push(validateFormRef(pumpForm));
	}

	if (itemForm3.value) {
		validations.push(validateFormRef(itemForm3));
	}

	return Promise.all(validations).then((next) => {
		if (enableLevelZonesForm.value && levelZoneForm.value.alarm_zone < levelZoneForm.value.warning_zone) {
			Notify({
				type: 'warning',
				title: tt('phrases.form_isnt_ready'),
				message: tt('Alarm_zone_should_be_higher_than_Warning_zone'),
			});
			next.push(false);
		}

		if (formData.value.lube_method === LUBE_METHODS.FREQUENCY) {
			if (!selectedLubeDate.value || !selectedLubeTime.value) {
				setTimeout(() => {
					Notify({
						type: 'warning',
						title: tt('phrases.form_isnt_ready'),
						message: tt('phrases.Scheduled_start_date_and_time_required'),
					});
				}, 0);
				return false;
			}
		}
			if (next.every((value) => value)) {
				return true;
			}

		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('phrases.Please_check_fields_errors_first'),
		});
		return false;
	});
};

const localPrepareSubmitData = (data) => {
	const preparedData = {
		...data,
	};

	if (preparedData.lube_method !== LUBE_METHODS.ALARM) {
		delete preparedData.lube_cycle_set;
		delete preparedData.lube_cycle_set_dwell_time;
		delete preparedData.data_set_convert_value;
		delete preparedData.lube_cycle_warm_up_minutes;
		delete preparedData.lube_cycle_cool_down_minutes;
		delete preparedData.lube_cycle_percent_danger_points;
	}

	if (
		preparedData.data_set !== DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20 &&
		preparedData.data_set !== DATASET.ULTRA_SOUND_SDT_DECIBELS
	) {
		delete preparedData.gain_ultrasound_signal;
	}

	if (preparedData.lube_method !== LUBE_METHODS.FREQUENCY) {
		delete preparedData.lube_period;
		delete preparedData.lube_period_time;
		delete preparedData.lube_cycle_scheduled_start_time;
	} else {
		if (preparedData.lube_cycle_dwell_time) {
			preparedData.lube_cycle_dwell_time = preparedData.lube_cycle_dwell_time * 60;
		}
		preparedData.lube_cycle_scheduled_start_time = `${selectedLubeDate.value} ${selectedLubeTime.value}`;
	}

	if (isSensorOnly.value) {
		[
			'gain_ultrasound_signal',
			'lube_method',
			'lube_period',
			'lube_period_time',
			'lube_cycle',
			'lube_cycle_dwell_time',
			'lube_cycle_set',
			'lube_cycle_set_dwell_time',
			'lube_cycle_scheduled_start_time',
			'bearing_id',
			'bearing_rpm',
			'replenishment_type',
			'lube_cycle_warm_up_minutes',
			'lube_cycle_cool_down_minutes',
			'lube_cycle_percent_danger_points',
		].forEach((key) => delete preparedData[key]);
	}

	return preparedData;
};

const localGetFormData = (data) => {
	const preparedData = { ...data };
	const preparedPumpFormData = getPumpFormData();

	if (preparedPumpFormData.type !== PUMP_TYPES.PERMA) {
		delete preparedData.bearing_id;
		delete preparedData.bearing_rpm;
		delete preparedData.replenishment_type;
	}

	if (!props.fromBannerSensorForm && preparedData.lube_version === LUBE_VERSIONS.V3) {
		if (!preparedPumpFormData.position) {
			preparedPumpFormData.position = generateIdInRange(1, 2);
			preparedData.ultrasound_position = preparedPumpFormData.position;
		}
		if (!preparedData.port_number) {
			preparedData.port_number = generateIdInRange(0, 40);
		}
	} else {
		preparedPumpFormData.position = preparedData.ultrasound_position;
		delete preparedData.device_address_id;
		delete preparedData.fft_sensor_id;
	}

	if (isSensorOnly.value) {
		[
			'lubricant_container',
			'lube_cycle_max_count',
			'lube_cycle_warning_count',
			'lube_cycle_spent_count',
			'lubricant_type_id',
			'lubricant_amount',
		].forEach((key) => delete preparedPumpFormData[key]);
	}

	if (props.fromBannerSensorForm) {
		delete preparedData.location_in_equipment;
		delete preparedData.controller_id;
		preparedData.type = SENSOR_TYPES.ULTRA_SOUND;
		if (isLubeMatrixV4.value) {
			preparedData.type = SENSOR_TYPES.BANNER;
			preparedData.data_set = props.parentDataSet;
		}
	}

	const payload = {
		formData: {
			id: itemId.value,
			...prepareSubmitData(preparedData),
		},
	};

	if (preparedPumpFormData) {
		payload.pumpFormData = preparedPumpFormData;
	}

	if (props.itemData && props.itemData.data_set !== preparedData.data_set) {
		delete payload.formData.id;
		delete preparedPumpFormData.id;
	}

	if (enableLevelZonesForm.value) {
		payload.levelZonesFormData = { ...levelZoneForm.value };
	}

	return payload;
};

const toggleSubmitRequestResult = (settings = {}) => {
	const { isLoading, success } = settings;

	if (isLoading) {
		emit('event', { eventName: 'toggleSpinner', data: true });
		return;
	}

	emit('event', {
		eventName: 'handleFormSubmitFinish',
		data: { isLoading, success },
	});
};

const saveSensor = (formDataForSave) => {
	const method = formDataForSave?.id ? 'put' : 'post';
	const url = formDataForSave?.id ? `/sensors/${formDataForSave.id}` : '/sensors';

	return api_request[method](url, {
		data: formDataForSave,
		itemName: 'Sensor',
	});
};

const savePump = ({ pumpFormData, sensorId }) => {
	const method = pumpFormData.id ? 'put' : 'post';
	const url = pumpFormData.id ? `/ultrasound/pumps/${pumpFormData.id}` : '/ultrasound/pumps';

	return api_request[method](url, {
		data: {
			...pumpFormData,
			sensor_id: sensorId,
		},
		itemName: 'Pump',
	});
};

const saveLevelZone = ({ levelZonesFormData, sensorId }) =>
	api_request.post(`/sensors/jobs/${sensorId}/level-zones`, {
		data: levelZonesFormData,
		itemName: 'Zones',
	});

const sensorSave = (payloadData) => {
	if (!payloadData) return;

	const { formData: formDataForSave, pumpFormData, levelZonesFormData } = payloadData;
	let successCounter = 0;
	const responseQuantity = 1 + (pumpFormData ? 1 : 0) + (levelZonesFormData ? 1 : 0);

	if (formDataForSave.lube_version !== LUBE_VERSIONS.V3) {
		formDataForSave.ultrasound_position = pumpFormData ? +pumpFormData.position : null;
	} else {
		delete formDataForSave.ultrasound_position;
		if (pumpFormData) pumpFormData.position = 0;
		delete formDataForSave.port_number;
	}

	/*if (process.env.NODE_ENV === 'development') {
		console.log('sensorSave ultrasound', formData, pumpFormData);
		return;
	}*/

	toggleSubmitRequestResult({ isLoading: 1 });

	saveSensor(formDataForSave)
		.then((answer) => {
			successCounter++;
			const savedSensorId = answer?.data?.data?.id || formDataForSave.id;
			itemId.value = savedSensorId;

			if (pumpFormData) {
				savePump({ pumpFormData, sensorId: savedSensorId })
					.then(() => {
						successCounter++;
						if (successCounter === responseQuantity) {
							toggleSubmitRequestResult({ isLoading: 0, success: 1 });
						}
					})
					.catch(() => {
						toggleSubmitRequestResult({ isLoading: 0, success: 0 });
					});
			}

			if (levelZonesFormData) {
				saveLevelZone({ levelZonesFormData, sensorId: savedSensorId })
					.then(() => {
						successCounter++;
						if (successCounter === responseQuantity) {
							toggleSubmitRequestResult({ isLoading: 0, success: 1 });
						}
					})
					.catch(() => {
						toggleSubmitRequestResult({ isLoading: 0, success: 0 });
					});
			}

			if (!pumpFormData && !levelZonesFormData) {
				toggleSubmitRequestResult({ isLoading: 0, success: 1 });
			}
		})
		.catch(() => {
			toggleSubmitRequestResult({ isLoading: 0, success: 0 });
		});
};

const localSubmit = (payloadData) => {
	if (isResetFrequencySettingsBeforeSubmit.value) {
		resetFrequencySettings().then(() => {
			isResetFrequencySettingsBeforeSubmit.value = false;
			sensorSave(payloadData);
		});
		return;
	}

	sensorSave(payloadData);
};

const {
	isMobile,
	isInitialSetup,
	itemId,
	setupPage,
	validateItemForm,
	getFormData,
	submitItemForm,
} = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef: itemForm,
	localSetupPageActions: localSetupPage,
	localValidationHook,
	localGetFormDataCallback: localPrepareSubmitData,
	localGetFormData,
	localSubmit,
	emit,
});

const validateForm = async () => {
	if (!(await validateItemForm())) return false;
	submitItemForm();
	return true;
};

const handleSave = () => {
	validateForm();
};

const handleCancel = () => {
	emit('onCancel');
};

watch(
	() => props.equipmentData?.id,
	(equipmentId) => {
		if (equipmentId) {
			formData.value.equipment_id = equipmentId;
		}
	},
	{ immediate: true },
);

watch(
	() => props.itemData,
	(item) => {
		setupPage(item);
	},
);

watch(
	() => formData.value.lube_method,
	(lubeMethod, oldLubeMethod) => {
		if (itemId.value && oldLubeMethod && lubeMethod !== oldLubeMethod) {
			isResetFrequencySettingsBeforeSubmit.value = true;
			emit('event', { eventName: 'frequencySettingsChanged', data: true });
		}
	},
);

watch(
	() => formData.value.lube_version,
	(version) => {
		if (version === LUBE_VERSIONS.V3) {
			pumpFormData.value.type = PUMP_TYPES.PERMA;
		}
	},
);

watch(
	() => pumpFormData.value.type,
	(type) => {
		if (!isInitialSetup.value) {
			pumpFormData.value.lubricant_container = null;
		}
		pumpRules.lubricant_amount = type === PUMP_TYPES.PERMA ? required : null;
		pumpRules.lubricant_type_id = type === PUMP_TYPES.PERMA ? required : null;
		pumpRules.lube_cycle_max_count = type === PUMP_TYPES.PULSAR ? required : null;
	},
);

watch(
	() => pumpFormData.value.lubricant_container,
	() => {
		if (!isInitialSetup.value) {
			pumpFormData.value.lube_cycle_max_count = null;
			pumpFormData.value.lubricant_amount = null;
		}
	},
);

watch(
	() => pumpFormData.value.lube_cycle_max_count,
	(value) => {
		if (!isInitialSetup.value) {
			pumpFormData.value.lube_cycle_warning_count = value - 10;
		}
	},
);

watch(
	() => pumpFormData.value.lubricant_type_id,
	(value) => handleCalculateData({ lubricant_type_id: value }),
);

watch(
	() => pumpFormData.value.lubricant_amount,
	(value) => handleCalculateData({ lubricant_amount: value }),
);

watch(
	() => formData.value.bearing_id,
	(value) => handleCalculateData({ bearing_id: value }),
);

watch(
	() => formData.value.bearing_rpm,
	(value) => handleCalculateData({ bearing_rpm: value }),
);

watch(
	() => formData.value.replenishment_type,
	(value) => handleCalculateData({ replenishment_type: value }),
);

watch(selectedLubeDate, () => {
	selectedLubeTime.value = '';
});

if (props.fromBannerSensorForm && props.dataSetChanged) {
	formData.value.data_set = null;
	datasetChanged.value = true;
}

watch(
	() => props.parentDataSet,
	() => {
		if (props.fromBannerSensorForm) {
			formData.value.data_set = null;
			datasetChanged.value = true;
		}
	},
);

if (!props.fromModal || !props.formulasList.length) {
	fetchDatasetFormulas({ params: { max: -1 } }).then((response) => {
		formulasListLocal.value = response?.data?.data || response?.data || response || [];
	});
}

defineExpose({
	validateForm,
	validateItemForm,
	submitItemForm,
	getFormData,
	localSubmit,
});
</script>
