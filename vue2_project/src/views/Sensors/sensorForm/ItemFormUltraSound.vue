<template>
	<div class="edit-form-container">
		<el-form
			class="item-edit-form content-row"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<!-- <el-form-item label="GUID" prop="ultra_sound_guuid">
				<el-input v-model="formData.ultra_sound_guuid" />
				</el-form-item> -->
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

			<div class="content-row">
				<!-- <div class="el-form-item" > -->
					<el-form-item
						:label="tt('Lube_Type')"
						prop="functionality_type"
					>
						<CustomSelect
							:optionsList="ultrasoundSensorTypesList"
							:placeholder="`${tt('select')} ${tt('type')}`"
							v-model="formData.functionality_type"
						/>
					</el-form-item>

					<el-form-item :label="tt('Data_Set')" prop="data_set" 
						:class="{'showJustInfo':fromBannerSensorForm && !isNew}"
					>
						<!-- <div class="1mcol-sm-6"> -->
						<el-select
							v-model="formData.data_set"

							:disabled="fromBannerSensorForm && !isNew"
							:placeholder="`${tt('Select')} ${tt('dataset')}`"
						>
							<el-option
								v-for="item in filteredDataSetsList"
								:key="'data_set-' + item.id"
								:label="item.alt_label"
								:value="item.id"
							/>
						</el-select>
						<!-- </div> -->
					</el-form-item>

					<el-form-item :label="tt('Location')" prop="location_in_equipment" required
						v-if="!fromBannerSensorForm"
					>
						<CustomInput
							v-model="formData.location_in_equipment"
							:placeholder="`${tt('enter')} ${tt('location')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('Controller')" prop="controller_id"
						v-if="!fromBannerSensorForm"
					>
						<!-- <div class="1mcol-sm-6"> -->
						<CustomSelect
							filterable
							:optionsLoading="controllersLoading"
							:optionsList="controllersList"
							:placeholder="`${tt('Select')} ${tt('controller')}`"
							v-model="formData.controller_id"
						/>
						<!-- </div> -->
					</el-form-item>
				<!-- </div> -->

				<el-form-item :label="tt('Node')" prop="port_number"
					v-if="formData.lube_version !== LUBE_VERSIONS.V3"
				>
					<CustomSelect
						:optionsList="portsList"
						:placeholder="`${tt('select')} ${tt('node')}`"
						v-model="formData.port_number"
					/>
					<!-- <el-select v-model="formData.port_number" :placeholder="`${tt('select')} ${tt('node')}`">
						<el-option
							v-for="item in portsList"
							:key="'port_number-' + item"
							::label="tt('Item')"
							:value="item"
						/>
					</el-select> -->
				</el-form-item>

				<el-form-item
					v-if="formData.lube_version !== LUBE_VERSIONS.V3"
					:label="tt('Position')"
					prop="ultrasound_position"
					required
				>
					<CustomSelect
						:optionsList="positionsList"
						:placeholder="`${tt('Select')} ${tt('position')}`"
						@change="handlePositionChange"
						:value="pumpFormData.position"
					/>
					<!-- <el-input v-model="pumpFormData.position" placeholder="1 or 2" /> -->
				</el-form-item>

				<!-- v-if="formData.lube_method === LUBE_METHODS.ALARM" -->

				<el-form-item
					v-if="!fromBannerSensorForm"
					:label="tt('phrases.lube_version')"
					prop="lube_version"
				>
					<CustomSelect
						:optionsList="lubeVersionsList"
						:placeholder="`${tt('Select')} ${tt('version')}`"
						v-model="formData.lube_version"
					/>
					<!-- <el-input v-model="pumpFormData.position" placeholder="1 or 2" /> -->
				</el-form-item>

				<el-form-item
					v-if="formData.lube_version === LUBE_VERSIONS.V3"
					:label="`${tt('Device')} ${tt('address')} id`"
					prop="device_address_id"
					required
				>
					<CustomInput v-model="formData.device_address_id" />
				</el-form-item>

				<el-form-item
					v-if="formData.lube_version === LUBE_VERSIONS.V3"
					:label="`${tt('Sensor')} Id`"
					prop="fft_sensor_id"
					required
				>
					<CustomInput v-model="formData.fft_sensor_id" />
				</el-form-item>

				<!-- <el-form-item
					v-if="
						formData.lube_method === LUBE_METHODS.ALARM &&
							formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS
					"
					label="Convert value"
					prop="data_set_convert_value"
				>
					<el-input
						v-model="formData.data_set_convert_value"
						placeholder="type expression"
					/>
				</el-form-item> -->

				<div class="el-form-item" v-if="!isSensorOnly">
					<el-form-item
						:label="`${tt('constants.Lube')} ${tt('Method')}`"
						prop="lube_method"
						class=""
					>
						<el-select
							@input="handleLubeMethodChange"
							v-model="formData.lube_method"
							:placeholder="`${tt('select')} ${tt('method')}`"
						>
							<el-option
								v-for="item in lubeMethodsList"
								:key="'lube_method-' + item.id"
								:label="item.label"
								:value="item.id"
							/>
						</el-select>
					</el-form-item>

					<el-form-item
						v-if="!fromBannerSensorForm"
						:label="`${tt('Lubricator')} ${tt('type')}`"
						class="mcol-lg-6 is-required"
					>
						<CustomSelect
							:disabled="formData.lube_version === LUBE_VERSIONS.V3"
							:optionsList="pumpTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							v-model="pumpFormData.type"
						/>
					</el-form-item>

					<div
						class="el-form-item flex mrow align-center"
						v-if="
							formData.lube_method === LUBE_METHODS.ALARM &&
								(formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
									formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20 ||
									formData.data_set === DATASET.SDT_SENSOR_FULL_SPECTRUM ||
									formData.data_set === DATASET.LUBE_MATRIX_SDT_TEMP_C ||
									formData.data_set === DATASET.LUBE_MATRIX_SDT_TEMP_F)
						"
					>
						<div class="mcol-xs-6">
							<!-- v-show="formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS" -->
							<span v-text="getExpression(formData.data_set)"></span>
						</div>

						<!-- label="Gain signal value" -->
						<div
							class="mcol-xs-6"
							v-if="
								formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
									formData.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20
							"
						>
							<el-form-item class="inline-form-row" prop="gain_ultrasound_signal">
								<label class="el-form-item__label">{{
									tt('phrases.gain_signal_value')
								}}</label>
								<el-select
									v-model="formData.gain_ultrasound_signal"
									:placeholder="`${tt('Select')} ${tt('value')}`"
								>
									<el-option
										v-for="item in gain_ultrasound_signal_list"
										:key="'gain_ultrasound_signal_item-' + item.id"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</div>
					</div>
				</div>
			</div>

			<div class="content-row" v-if="!isSensorOnly && pumpFormData.type === PUMP_TYPES.PERMA">
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
							<CustomSelect
								filterable
								:optionsLoading="bearingsLoading"
								:optionsList="bearingsList"
								labelKey="number"
								:placeholder="`${tt('select')} ${tt('bearing')}`"
								v-model="formData.bearing_id"
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
							<CustomSelect
								filterable
								:optionsList="replenismentTypesList"
								:placeholder="`${tt('Select')} ${tt('type')}`"
								labelKey="label"
								v-model="formData.replenishment_type"
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
		</el-form>

		<!-- ----------Pump------- -->
		<el-form
			v-if="!isSensorOnly"
			class="item-edit-form content-row"
			label-width="150px"
			ref="pumpForm"
			:model="pumpFormData"
			:rules="pumpRules"
			:label-position="'top'"
		>
			<div class="content-row">
				<b>{{ `${tt('Lubricator')} ${tt('Configuration')}` }}</b>
			</div>

			<div class="form-section paint content-row items_width_180">
				<div
					class="flex mrow wrap content-row"
					v-if="pumpFormData.type === PUMP_TYPES.PULSAR"
				>
					<el-form-item
						required
						class="mcol-xs-12 mcol-md-6"
						:label="tt('Grease_pack')"
						prop="lubricant_container"
					>
						<CustomSelect
							required
							:optionsList="greasePacksList"
							:placeholder="`${tt('select')} ${tt('pack')}`"
							v-model="pumpFormData.lubricant_container"
							labelKey="label"
							valueKey="val"
							idKey="val"
						/>
					</el-form-item>

					<el-form-item
						:label="tt('phrases.Modes_of_Cycles')"
						prop="lube_cycle_max_count"
						class="mcol-xs-12 mcol-md-6"
						required
					>
						<CustomSelect
							:optionsList="numberOfCyclesList"
							:placeholder="`${tt('select')} ${tt('mode')}`"
							v-model="pumpFormData.lube_cycle_max_count"
							labelKey="label"
							valueKey="val"
							idKey="val"
						/>

						<span class="input-description bold right-outside">
							{{ totalLubeLevel }}
						</span>
					</el-form-item>

					<el-form-item
						:label="`${tt('Warning')} ${tt('Level')}`"
						prop="lube_cycle_warning_count"
						class="mcol-xs-12 mcol-md-6"
					>
						<el-input-number
							v-model="pumpFormData.lube_cycle_warning_count"
							:min="0"
						/>
					</el-form-item>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
							{{ tt('phrases.Lube_cycle_spent_count') }}
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="pumpFormData.lube_cycle_spent_count"
						></div>
					</div>
				</div>

				<div class="flex mrow wrap" v-if="pumpFormData.type === PUMP_TYPES.PERMA">
					<el-form-item
						required
						class="mcol-xs-12 mcol-md-6"
						:label="`${tt('Lubricant')} ${tt('Type')}`"
						prop="lubricant_type_id"
					>
						<CustomSelect
							:optionsLoading="lubeTypesLoading"
							:optionsList="lubeTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							v-model="pumpFormData.lubricant_type_id"
						/>
					</el-form-item>

					<el-form-item
						class="mcol-xs-12 mcol-md-6"
						:label="`${tt('Lubricant')} ${tt('Cartridge')}`"
						prop="lubricant_container"
					>
						<CustomSelect
							required
							:optionsList="lubricantCartridgeList"
							:placeholder="`${tt('select')} ${tt('cartridge')}`"
							v-model="pumpFormData.lubricant_container"
							labelKey="label"
							valueKey="val"
							idKey="val"
						/>
					</el-form-item>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
							{{ `${tt('Lubricant')} ${tt('Density')}` }} (g/cm3)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="selectedLubeType.density"
						></div>
					</div>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
							{{ tt('phrases.Lube_Cycles_Per_Cartridge') }}
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="permaLubeCyclesPerCartridge"
						></div>
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

						<!-- <CustomSelect
							:optionsList="lubricantAmountsList"
							v-model="pumpFormData.lubricant_amount"
							:placeholder="`${tt('select')} ${tt('Amount')}`"
							labelKey="label"
							valueKey="val"
							idKey="val"
						/> -->
					</el-form-item>

					<el-form-item
						:label="`${tt('Warning')} ${tt('Level')}`"
						prop="lube_cycle_warning_count"
						class="mcol-xs-12 mcol-md-6"
					>
						<el-input-number
							v-model="pumpFormData.lube_cycle_warning_count"
							:min="0"
						/>
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
					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
							{{ tt('phrases.Total_Lubricant_Delivered_In_All_Sets') }} (g)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="
								calculatedLubesData.totalGramsLubricantDeliveredInAllSets || '-'
							"
						></div>
					</div>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
							{{ tt('phrases.Total_Lubricant_Delivered_In_All_Sets') }} (% of CQ)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="
								calculatedLubesData.totalPercentLubricantDeliveredInAllSets || '-'
							"
						></div>
					</div>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
							{{ tt('phrases.Target_Lubricant_Per_Set') }} (g) (10%)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="calculatedLubesData.targetLubricantPerCycle || '-'"
						></div>
					</div>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
							{{ tt('phrases.Lubricant_Delivered_Per_Set') }} (%)
						</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="calculatedLubesData.lubricantDeliveredPerCycle || '-'"
						></div>
					</div>

					<div class="el-form-item mcol-xs-12 mcol-md-6">
						<div class="el-form-item__label">
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
			class="item-edit-form content-row"
			label-width="150px"
			ref="itemForm2"
			:model="formData"
			:rules="rules"
			:label-position="'top'"
		>
			<div class="content-row">
				<div class="content-row flex align-center">
					<b>{{ tt('phrases.Lube_Logic_Setup') }}</b>

					<el-button
						class="ml-auto"
						size="mini"
						type="success"
						@click="applyCalculatedData"
						:disabled="!readyToApplyCalculated"
					>
						<span>{{ tt('phrases.Apply_calculated_data') }}</span>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>

				<div
					class="form-section paint content-row"
					v-if="formData.lube_method === LUBE_METHODS.ALARM"
				>
					<div class="flex mrow wrap content-row">
						<el-form-item
							class="mcol-xs-12 mcol-md-6"
							:label="tt('phrases.Lube_Cycles_Per_Set')"
							prop="lube_cycle"
						>
							<el-input-number v-model="formData.lube_cycle" :min="0" />
						</el-form-item>
						<div class="el-form-item mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.Calculated_Cycles_Per_Set') }}
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.calculatedCyclesPerSet || '-'"
							></div>
						</div>

						<el-form-item
							class="mcol-xs-12 mcol-md-6"
							:label="tt('phrases.time_between_lube_cycles_sec')"
							prop="lube_cycle_dwell_time"
						>
							<el-input-number v-model="formData.lube_cycle_dwell_time" :min="0" />
						</el-form-item>
						<div class="el-form-item mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.calculated_time') }} (sec)
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.timeBetweenCycles || '-'"
							></div>
						</div>

						<el-form-item
							class="mcol-xs-12 mcol-md-6"
							:label="tt('Lube_Sets')"
							prop="lube_cycle_set"
						>
							<el-input-number v-model="formData.lube_cycle_set" :min="0" />
						</el-form-item>
						<div class="el-form-item mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.Calculated_Lube_Sets') }}
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.calculatedLubeSets || '-'"
							></div>
						</div>

						<el-form-item
							class="mcol-xs-12 mcol-md-6"
							:label="tt('phrases.time_between_lube_sets_sec')"
							prop="lube_cycle_set_dwell_time"
						>
							<el-input-number
								v-model="formData.lube_cycle_set_dwell_time"
								:min="0"
							/>
						</el-form-item>
						<div class="el-form-item mcol-xs-12 mcol-md-6">
							<div class="el-form-item__label">
								{{ tt('phrases.Calculated_Time') }} (sec)
							</div>
							<div
								class="value-instead-input el-form-item__content bold"
								v-text="calculatedLubesData.timeBetweenSets || '-'"
							></div>
						</div>

						<el-form-item
							class="mcol-xs-12 mcol-md-6"
							:label="tt('phrases.warm_up_time_minutes')"
							prop="lube_cycle_warm_up_minutes"
							required
						>
							<el-input-number
								v-model="formData.lube_cycle_warm_up_minutes"
								:min="5"
								:max="300"
							/>
						</el-form-item>

						<el-form-item
							class="mcol-xs-12 mcol-md-6"
							:label="tt('phrases.cool_down_time_minutes')"
							prop="lube_cycle_cool_down_minutes"
							required
						>
							<el-input-number
								v-model="formData.lube_cycle_cool_down_minutes"
								:min="1"
								:max="120"
							/>
						</el-form-item>

						<el-form-item
							class="mcol-xs-12 mcol-md-6"
							:label="tt('phrases.percentage_of_points_above_alarm')"
							prop="lube_cycle_percent_danger_points"
							required
						>
							<el-input-number
								v-model="formData.lube_cycle_percent_danger_points"
								:min="0"
							/>
						</el-form-item>
					</div>
				</div>

				<div
					class="flex mrow wrap form-section paint content-row"
					v-if="formData.lube_method === LUBE_METHODS.FREQUENCY"
				>
					<div class="mcol-xs-12 flex">
						<el-button
							v-show="frequencyBlockDisabled"
							@click="resetFrequencySettings"
							type="primary"
							native-type="button"
							class="ml-auto item-action-button inverted small"
						>
							<span class="uppercase">{{ tt('reset') }}</span>
						</el-button>
					</div>

					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('Period')" prop="lube_period">
							<el-select
								v-model="formData.lube_period"
								:disabled="frequencyBlockDisabled"
								:placeholder="`${tt('select')} ${tt('period')}`"
							>
								<el-option
									v-for="item in lubePeriodsList"
									:key="'lube_period-' + item.id"
									:label="item.label"
									:value="item.id"
								/>
							</el-select>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('time')" prop="lube_period_time">
							<el-input-number
								:disabled="frequencyBlockDisabled"
								v-model="formData.lube_period_time"
								:min="1"
							/>
						</el-form-item>
					</div>

					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('Lube_Cycles')" prop="lube_cycle">
							<el-input-number
								:disabled="frequencyBlockDisabled"
								v-model="formData.lube_cycle"
								:min="0"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item
							:label="tt('phrases.lube_cycle_dwell_time')"
							prop="lube_cycle_dwell_time"
						>
							<el-input-number
								:disabled="frequencyBlockDisabled"
								v-model="formData.lube_cycle_dwell_time"
								:min="0"
							/>
						</el-form-item>
					</div>

					<div class="mcol-xs-12 ">
						<el-form-item :label="tt('Starting_At')">
							<div class="flex mrow">
								<div class="mcol-xs-6">
									<Datepicker
										:disabled="frequencyBlockDisabled"
										className=" "
										v-model="selected_lube_date"
										:placeholder="`${tt('Select')} ${tt('date')}`"
										:picker-options="pickerOptions"
									/>
								</div>

								<div class="mcol-xs-6">
									<el-time-picker
										:disabled="frequencyBlockDisabled"
										@blur="handleResetValidate"
										v-model="selected_lube_time"
										:value-format="'HH:mm:ss'"
										:placeholder="`${tt('select')} ${tt('time')}`"
										:picker-options="timePickerOptions"
									/>
								</div>
							</div>
						</el-form-item>
					</div>
				</div>
			</div>
		</el-form>

		<!-- ----------Level Zones------- -->
		<el-form
			v-if="enableLevelZonesForm"
			class="item-edit-form content-row"
			label-width="150px"
			ref="itemForm3"
			:model="levelZoneForm"
			:label-position="'top'"
		>
			<div class="content-row">
				<b>{{ tt('Zones') }}</b>
			</div>
			<div class="form-section paint el-form-item content-row">
				<div class="flex wrap mrow content-row">
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item
							:label="`${tt('constants.Alarm')} ${tt('zone')}`"
							prop="alarm_zone"
							required
						>
							<el-input-number
								v-model="levelZoneForm.alarm_zone"
								:min="levelZoneForm.warning_zone"
								:precision="2"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item
							:label="`${tt('constants.Warning')} ${tt('zone')}`"
							prop="warning_zone"
							required
						>
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
						<el-form-item
							:label="tt('constants.Baseline_zone')"
							prop="baseline_zone"
							required
						>
							<el-input-number
								v-model="levelZoneForm.baseline_zone"
								:precision="2"
							/>
						</el-form-item>
					</div>
					<!-- <div class="mcol-xs-12 mcol-md-6">
						<el-form-item label="Normal zone" prop="normal_zone">
							<el-input-number v-model="formData.normal_zone" :precision="2" />
						</el-form-item>
					</div> -->
				</div>
			</div>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import {
	findItemBy,
	getYmdDateString,
	removeObjProps,
	getRoundedValue,
	getRandomInt,
	prepareSubmitData
} from '@/helpers';
import {
	dataSetsList,
	SENSOR_TYPES,
	DATASET,
	PUMP_TYPES,
	pumpTypesList
} from '@/constants/global';

import {
	SENSOR_SPECIFIC_PARAMETERS_TYPES,
	METRIC_SYSTEM_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';

import {
	LUBE_METHODS,
	LUBE_PERIODS,
	lubeMethodsList,
	lubePeriodsList,
	replenismentTypesList,
	greasePacksList,
	pulsarLubeLevelStep,
	lubricantCartridgeList,
	ultrasoundSensorTypesList,
	ULTRASOUND_SENSOR_TYPES,
	lubeVersionsList,
	LUBE_VERSIONS,
} from '@/constants/ultrasound';
import { required } from '@/constants/validation';

import { navigation, subItemMixin, actionButtonsMixin } from '@/mixins';

import 'element-ui/lib/theme-chalk/time-picker.css';
import { mapState } from 'vuex';

// import { SENSOR_TYPES } from '@/constants/global';
// import { findItemBy } from '@/helpers';

export default {
	mixins: [navigation(), subItemMixin(), actionButtonsMixin()],
	// name: 'SensorPage',

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		ElTimePicker: () =>
			import(/* webpackChunkName: "ElTimePicker" */ 'element-ui/lib/time-picker')
	},

	props: {
		equipmentData: {
			type: Object,
			default: () => ({})
		},

		hasAccessToCreate: Boolean,

		isNew: Boolean,
		controllersList: Array,
		// banner_controllersList: Array,
		formulasList: Array,
		bearingsList: Array,
		lubeTypesList: Array,
		commonItemsLoadings: Object,
		fromBannerSensorForm: Boolean,

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

			frequencyBlockDisabled: false,
			sensorLubeMethod: null,

			calculateParamsData: {
				bearing_id: null,
				bearing_rpm: null,
				replenishment_type: null,
				lubricant_type_id: null,
				lubricant_amount: null
			},
			calculatedLubesData: {},

			currentPumpType: null,

			// -----------
			initialMount: true,

			selected_lube_date: '',
			selected_lube_time: '',

			isResetFrequencySettingsBeforeSubmit: false,

			formData: {
				// ----sensor-----
				type: SENSOR_TYPES.ULTRA_SOUND,
				port_number: null,

				// ultra_sound_guuid: '',
				// external_id: null,
				controller_id: null,
				data_set: null,
				// data_set_convert_value: '',
				location_in_equipment: '',
				gain_ultrasound_signal: 60,

				lube_method: null, //LUBE_METHODS.ALARM,
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
				equipment_id: null,
				ultrasound_position: null,

				lube_cycle_warm_up_minutes: 50,
				lube_cycle_cool_down_minutes: 10,
				lube_cycle_percent_danger_points: 80,
				functionality_type: null,

				lube_version: null,
				device_address_id: '',
				fft_sensor_id: ''
			},

			pumpFormData: {
				// ----pump-----
				id: null,
				position: '',
				type: null,
				sensor_id: null,
				lubricant_container: null,
				lube_cycle_max_count: null,
				lube_cycle_warning_count: 20,
				lube_cycle_spent_count: 0,

				lubricant_type_id: null,
				lubricant_amount: null
			},

			levelZoneForm: {
				metric_system_type: METRIC_SYSTEM_TYPES.METRIC,
				parameter_type: SENSOR_SPECIFIC_PARAMETERS_TYPES.DB,
				alarm_zone: 0,
				warning_zone: 0,
				baseline_zone: 0
			},

			rules: {
				// ----sensor-----
				equipment_id: required,
				controller_id: required,
				data_set: required,
				lube_cycle: required,
				lube_cycle_dwell_time: required,
				lube_cycle_set: required,
				lube_cycle_set_dwell_time: required,
				// lube_cycle_warm_up_minutes: required,
				// lube_cycle_cool_down_minutes: required,
				// lube_cycle_percent_danger_points: required,
				// data_set_convert_value: null,
				location_in_equipment: required
			},

			pumpRules: {
				// ----pump-----
				position: required,
				type: required,
				lubricant_container: required,
				lube_cycle_max_count: required,
				lubricant_amount: null
			}
		};
	},

	computed: {
		...mapState({
			showPlantName: state => state.global.navbarSettings.showPlantName,
			globalFilters: state => state.global.globalFilters,
		}),

		LUBE_METHODS: () => Object.freeze(LUBE_METHODS),
		lubeMethodsList: () => Object.freeze(lubeMethodsList()),
		lubePeriodsList: () => Object.freeze(lubePeriodsList()),
		replenismentTypesList: () => Object.freeze(replenismentTypesList()),
		PUMP_TYPES: () => Object.freeze(PUMP_TYPES),
		DATASET: () => Object.freeze(DATASET),
		ultrasoundSensorTypesList: () => Object.freeze(ultrasoundSensorTypesList()),
		/*lubeVersionsList: () => Object.freeze(
			lubeVersionsList().filter(lv=>lv.id !== LUBE_VERSIONS.V3)
		),*/
		lubeVersionsList: () => Object.freeze(lubeVersionsList()),
		LUBE_VERSIONS: () => Object.freeze(LUBE_VERSIONS),

		pumpData: that => (that.itemData.pump ? that.itemData.pump : {}),

		enableLevelZonesForm() {
			return this.isNew && !this.isSensorOnly && this.formData.lube_method === LUBE_METHODS.ALARM;
		},

		isSensorOnly: that => that.formData.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY,

		// -----Sensor-----
		filteredDataSetsList: () =>
			Object.freeze(dataSetsList().filter(ds => ds.controller_type === SENSOR_TYPES.ULTRA_SOUND)),

		portsList() {
			const list = [];
			for (let i = 1; i < 41; i++) {
				list.push({ id: i, name: i });
			}
			return Object.freeze(list);
		},

		positionsList() {
			return Object.freeze([
				{ id: 1, name: 1 },
				{ id: 2, name: 2 }
			]);
		},

		gain_ultrasound_signal_list: () =>
			Object.freeze([
				{ id: 1, value: 12, lablel: '12' },
				{ id: 2, value: 24, lablel: '24' },
				{ id: 3, value: 36, lablel: '36' },
				{ id: 4, value: 48, lablel: '48' },
				{ id: 5, value: 60, lablel: '60' }
			]),

		getYmdDateString: () => getYmdDateString,

		/*rules: () => ({
			external_id: required,
			controller_id: required,
			// ultra_sound_guuid: required,

			lube_cycle: required,
			lube_cycle_dwell_time: required,
			lube_cycle_set: required,
			lube_cycle_set_dwell_time: required
		}),*/

		pickerOptions: () => ({
			disabledDate(date) {
				const start = new Date();
				const today = start.getTime() - 3600000 * 24;
				const dateMs = date.getTime();

				return dateMs < today;
			}
		}),

		timePickerOptions: that => {
			const todayEnd = new Date().setHours(23, 59, 59);

			if (that.selected_lube_date) {
				if (Date.parse(that.selected_lube_date) < todayEnd + 1000) {
					return {
						selectableRange: `${getYmdDateString({
							dateObj: new Date(),
							withTime: true,
							timeOnly: true
						})} - '23:59:59'`
					};
				}
			}

			return {
				selectableRange: '00:00:00 - 23:59:59'
			};
		},

		// --------------
		bearingsLoading: that => that.commonItemsLoadings.bearingsLoading,
		lubeTypesLoading: that => that.commonItemsLoadings.lubeTypesLoading,
		formulasLoading: that => that.commonItemsLoadings.formulasLoading,
		controllersLoading: that =>
			that.commonItemsLoadings.ultrasound_controllersLoading,

		selectedBearing() {
			const { bearingsList, formData } = this;
			if (bearingsList.length && formData.bearing_id) {
				return findItemBy('id', formData.bearing_id, bearingsList);
			}
			return {};
		},

		// --------Pump------
		pumpTypesList: () => Object.freeze(pumpTypesList()),

		greasePacksList: () => Object.freeze(greasePacksList()),
		pulsarLubeLevelStep: () => Object.freeze(pulsarLubeLevelStep),
		lubricantCartridgeList: () => Object.freeze(lubricantCartridgeList()),

		numberOfCyclesList() {
			if (this.pumpFormData.lubricant_container) {
				const pack = findItemBy(
					'val',
					this.pumpFormData.lubricant_container,
					this.greasePacksList
				);
				if (pack) return Object.freeze(pack.cyclesList);
			}
			return [];
		},

		lubricantAmountsList() {
			if (this.pumpFormData.lubricant_container) {
				const pack = findItemBy(
					'val',
					this.pumpFormData.lubricant_container,
					this.lubricantCartridgeList
				);
				if (pack) return Object.freeze(pack.amountsList);
			}
			return [];
		},

		permaLubeCyclesPerCartridge() {
			const { pumpFormData, lubricantAmountsList } = this;

			if (pumpFormData.type === PUMP_TYPES.PERMA && pumpFormData.lubricant_amount) {
				const item = findItemBy(
					'val',
					pumpFormData.lubricant_amount,
					lubricantAmountsList
				);

				if (item) return Object.freeze(item.pos);
			}

			return 0;
		},

		totalLubeLevel() {
			const { lube_cycle_max_count, lubricant_container } = this.pumpFormData;
			const { numberOfCyclesList } = this;

			if (lubricant_container && lube_cycle_max_count && numberOfCyclesList.length) {
				const selectedItem = findItemBy(
					'val',
					lube_cycle_max_count,
					numberOfCyclesList
				);

				if (selectedItem) {
					return `${selectedItem.pos * pulsarLubeLevelStep.val}${
						pulsarLubeLevelStep.unit
					}`;
				}
			}
			return 0;
		},

		readyToApplyCalculated() {
			return (
				this.calculatedLubesData.calculatedCyclesPerSet ||
				this.calculatedLubesData.timeBetweenCycles ||
				this.calculatedLubesData.calculatedLubeSets ||
				this.calculatedLubesData.timeBetweenSets
			);
		},

		selectedLubeType() {
			const { lubeTypesList, pumpFormData } = this;
			if (lubeTypesList.length && pumpFormData.lubricant_type_id) {
				return findItemBy('id', pumpFormData.lubricant_type_id, lubeTypesList);
			}
			return {};
		},

		/*finalControllersList() {
			return Object.freeze(this.formData.lube_version === LUBE_VERSIONS.V3
							? this.banner_controllersList
							: this.controllersList);
		}*/

		/*isResetFrequencySettingsBeforeSubmit() {
			const { itemId, formData, itemData } = this;

			return itemId && formData.lube_method !== itemData.lube_method;
		}*/
	},

	methods: {
		...mapActions({
			save_item: 'sensors/save_sensor',
			save_level_zone: 'sensors/save_sensor_level_zones',
			save_pump: 'ultrasound_pumps/save_ultrasound_pump',

			calculate_lube_params: 'lube_types/calculate_lube_params',
			toggle_ultrasound_command: 'sensors/toggle_ultrasound_command'

			// fetch_equipments: 'equipments/fetch_equipments_crashes',
		}),

		handlePositionChange(val) {
			this.formData.ultrasound_position = val;
			this.pumpFormData.position = val;
		},

		getExpression(data_set) {
			const item = findItemBy('data_set', data_set, this.formulasList);
			if (item) {
				return item.expression;
			}
			return '';
		},

		// ---------------
		localSetupPageActions(item) {
			// console.log(item);
			// console.log('localSetupPageActions', item)

			if (this.fromBannerSensorForm) {
				this.formData.lube_version = LUBE_VERSIONS.V3;
			}

			if (item) {
				// this.radioFormData = this.setupForm(item, this.formData);

				if (
					item.lube_method === LUBE_METHODS.FREQUENCY &&
					item.lube_cycle_dwell_time
				) {
					this.formData.lube_cycle_dwell_time = item.lube_cycle_dwell_time / 60;
				}

				if (item.pump) {
					this.pumpFormData = this.setupForm(item.pump, this.pumpFormData);
					this.formData.ultrasound_position = item.pump.position;
				}

				if (item.lube_cycle_scheduled_start_time) {
					this.selected_lube_date = getYmdDateString({
						ms: item.lube_cycle_scheduled_start_time
					});
					this.selected_lube_time = getYmdDateString({
						ms: item.lube_cycle_scheduled_start_time,
						withTime: true,
						timeOnly: true,
						timeZone: 'UTC'
					});
				}
			}

			if (this.equipmentData.id) {
				this.formData.equipment_id = this.equipmentData.id;
			}

			if (!this.formData.lube_method) {
				this.formData.lube_method = LUBE_METHODS.ALARM;
			}

			if (!this.pumpFormData.type) {
				this.pumpFormData.type = PUMP_TYPES.PULSAR;
			}

			this.frequencyBlockDisabled =
				!this.isNew && this.formData.lube_method === LUBE_METHODS.FREQUENCY;
		},

		handleResetValidate() {
			this.$refs['itemForm'].clearValidate();
		},

		handleCalculateData() {
			const { bearing_id, bearing_rpm, replenishment_type } = this.formData;
			const { lubricant_type_id, lubricant_amount } = this.pumpFormData;

			if (
				bearing_id &&
				bearing_rpm &&
				replenishment_type &&
				lubricant_type_id &&
				lubricant_amount
			) {
				this.calculateLubeParams({
					bearing_id: bearing_id,
					bearing_rpm: bearing_rpm,
					replenishment_type: replenishment_type,
					lubricant_type_id: lubricant_type_id,
					lubricant_amount: lubricant_amount
				});
			}
		},

		applyCalculatedData() {
			this.calculatedLubesData.calculatedCyclesPerSet
				? (this.formData.lube_cycle = Math.round(
						this.calculatedLubesData.calculatedCyclesPerSet
				  ))
				: null;
			this.calculatedLubesData.timeBetweenCycles
				? (this.formData.lube_cycle_dwell_time = Math.round(
						this.calculatedLubesData.timeBetweenCycles
				  ))
				: null;
			this.calculatedLubesData.calculatedLubeSets
				? (this.formData.lube_cycle_set = Math.round(
						this.calculatedLubesData.calculatedLubeSets
				  ))
				: null;
			this.calculatedLubesData.timeBetweenSets
				? (this.formData.lube_cycle_set_dwell_time = Math.round(
						this.calculatedLubesData.timeBetweenSets
				  ))
				: null;
		},

		handleLubeMethodChange(lube_method) {
			const { itemId, itemData } = this;

			this.isResetFrequencySettingsBeforeSubmit =
				itemId && lube_method !== itemData.lube_method;
		},

		// --------------
		generateIdInRange(min, max) {
			if (typeof min !== 'number' || typeof max !== 'number' || min > max) {
				throw new Error('wrong min or max');
			}

			const now = Date.now();
			const perf = Math.floor(performance.now());
			const combined = now + perf;
			const range = max - min + 1;

			return (combined % range) + min;
		},

		localValidationHook() {
			let next = [true];

			if (this.$refs['itemForm2']) {
				this.$refs['itemForm2'].validate(valid => {
					next.push(valid);
				});
			}

			if (this.$refs['pumpForm']) {
				this.$refs['pumpForm'].validate(valid => {
					next.push(valid);
				});
			}
			
			if (this.$refs['itemForm3']) {
				this.$refs['itemForm3'].validate(valid => {
					next.push(valid);
				});
			}

			if (this.levelZoneForm.alarm_zone < this.levelZoneForm.warning_zone) {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`Alarm_zone_should_be_higher_than_Warning_zone`),
					duration: 0
				});
				next.push(false);
			}
			// console.log('next us', next, this.fromBannerSensorForm)
			if (next.every(v => v)) {
				return true;
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
				return false;
			}
		},

		localGetFormDataCallback(data) {
			// let { data } = payload;
			// data.id = this.itemData.id;

			if (data.lube_method !== LUBE_METHODS.ALARM) {
				data = removeObjProps(data, [
					'lube_cycle_set',
					'lube_cycle_set_dwell_time',
					// 'data_set',
					'data_set_convert_value',
					'lube_cycle_warm_up_minutes',
					'lube_cycle_cool_down_minutes',
					'lube_cycle_percent_danger_points'
				]);
			}

			if (
				data.data_set !== DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20 &&
				data.data_set !== DATASET.ULTRA_SOUND_SDT_DECIBELS
			) {
				delete data.gain_ultrasound_signal;
			}

			if (data.lube_method !== LUBE_METHODS.FREQUENCY) {
				data = removeObjProps(data, [
					'lube_period',
					'lube_period_time',
					'lube_cycle_scheduled_start_time'
				]);
			} else {
				data.lube_cycle_dwell_time = data.lube_cycle_dwell_time * 60;

				if (!this.selected_lube_date || !this.selected_lube_time) {
					this.$notify({
						type: 'warning',
						title: this.$t('phrases.form_isnt_ready'),
						message: this.$t(`phrases.Scheduled_start_date_and_time_required`)
					});
					return;
				}

				data.lube_cycle_scheduled_start_time = `${this.selected_lube_date} ${this.selected_lube_time}`;
			}

			if (this.isSensorOnly) {
				data = removeObjProps(data, [
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
				]);
			}

			return data;
		},

		localGetFormData(data) {
			// const { sensorFormData } = data.injectToBody;
			let pumpFormData = { ...this['pumpFormData'] };

			if (pumpFormData.type !== PUMP_TYPES.PERMA) {
				data = removeObjProps(data, [
					'bearing_id',
					'bearing_rpm',
					'replenishment_type'
				]);
				delete pumpFormData.lubricant_amount;
				delete pumpFormData.lubricant_type_id;
			}

			if (pumpFormData.type !== PUMP_TYPES.PULSAR) {
				delete pumpFormData.lube_cycle_max_count;
			}

			if (data.lube_version === LUBE_VERSIONS.V3) {
				/*data = removeObjProps(data, [
					'port_number',
					'ultrasound_position',
				]);*/
				if (!pumpFormData.position) {
					pumpFormData.position = getRandomInt(1,2);
					data.ultrasound_position = pumpFormData.position;
				}
				if (!data.port_number) {
					data.port_number = this.generateIdInRange(0,40);
				}
			} else {
				data = removeObjProps(data, [
					'device_address_id',
					'fft_sensor_id',
				]);
			}
			
			if (this.isSensorOnly) {
				pumpFormData = removeObjProps(pumpFormData, [
					'lubricant_container',
					'lube_cycle_max_count',
					'lube_cycle_warning_count',
					'lube_cycle_spent_count',
					'lubricant_type_id',
					'lubricant_amount',
				]);
			}

			let payload = {
				formData: {
					id: this.itemId,
					...prepareSubmitData(data),
				}
			};
			
			pumpFormData ? (payload.pumpFormData = pumpFormData) : null;
			
			if (this.itemData && this.itemData.data_set !== data.data_set) {
				delete payload.formData.id;
				delete pumpFormData.id;
			}

			this.enableLevelZonesForm
				? (payload.levelZonesFormData = this.levelZoneForm)
				: null;

			if (this.isResetFrequencySettingsBeforeSubmit) {
				this.resetFrequencySettings().then(() => {
					return payload;
				});
			} else {
				if (this.fromBannerSensorForm) {
					delete payload.formData.location_in_equipment;
					delete payload.formData.controller_id;
					// console.log('us loc submit', payload)
				}
				return payload;
			}
		},

		localSubmit(payloadData) {
			// console.log('localSubmit', payloadData);
			const { formData, pumpFormData, levelZonesFormData } = payloadData;
			let successCounter = 0,
					resposeQuantity = Object.keys(payloadData).length;
			// console.log('1', successCounter, payload)

			formData.ultrasound_position = pumpFormData ? +pumpFormData.position : null;

			/*if (process.env.NODE_ENV === 'development') {
				console.log('ultrasound', formData, pumpFormData);
				return;
			}*/

			this.toggleSubmitRequestResult({isLoading:1});

			this.save_item({
				data: formData,
				itemName: 'Sensor',
			})
				.then(answer => {
					successCounter++;
					this.itemId = answer.data.data.id;
					// console.log('2', successCounter)
					if (pumpFormData) {
						const payloadP = {
							data: {
								...pumpFormData,
								sensor_id: answer.data.data.id
								// position: formData.position
							}
						};

						this.save_pump(payloadP).then(() => {
							successCounter++;
							if (successCounter == resposeQuantity) {
								this.toggleSubmitRequestResult({isLoading:0, success:1});
							}
						})
						.catch(() => {
							this.toggleSubmitRequestResult({isLoading:0, success:0});
						});
					}

					if (levelZonesFormData) {
						const payloadLZ = {
							data: { ...levelZonesFormData },
							sensorId: answer.data.data.id
						};
						// console.log(answer.data.data.id, payloadLZ)

						this.save_level_zone(payloadLZ).then(() => {
							successCounter++;
							if (successCounter == resposeQuantity) {
								this.toggleSubmitRequestResult({isLoading:0, success:1});
							}
						})
						.catch(() => {
							this.toggleSubmitRequestResult({isLoading:0, success:0});
						});
					}
				})
				.catch(() => {
					this.toggleSubmitRequestResult({isLoading:0, success:0});
				});
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

		// --------------------------

		calculateLubeParams(data) {
			this.calculateParamsData = { ...this.calculateParamsData, ...data };

			if (Object.values(this.calculateParamsData).every(val => !!val)) {
				this.calculate_lube_params({ data: this.calculateParamsData }).then(
					({ value }) => {
						this.calculatedLubesData = {};
						for (const key in value) {
							let afterDot = 3;
							if (key == 'timeBetweenCycles') afterDot = 0;
							this.calculatedLubesData[key] = getRoundedValue(
								value[key],
								1,
								afterDot
							);
						}
						// console.log(response)
					}
				);
			}
		},

		hanldeResetFrequencySettings() {
			this.confirmHelper({
				// title: this.$t('phrases.Reset_Frequency_Settings'),
				insertToMessage: this.$t('phrases.reset_frequency_settings'),
				confirmButtonText: this.$t('Reset')
			})
				.then(() => {
					this.resetFrequencySettings();
				})
				.catch(() => {});
		},

		resetFrequencySettings() {
			return new Promise((resolve, reject) => {
				const payload = {
					method: 'PUT',
					url: `/ultrasound/commands/${this.itemData.id}/reset/setup`,
					resultMessage: { text: `${this.tt('successfully')} ${this.tt('reset')}` }
				};

				/*if (payload) {
					console.log(payload)
					this.$emit('event', {eventName: 'toggleSaving', data: true});
					setTimeout(() => {
						this.formData.lube_period = null;
						this.formData.lube_period_time = 0;
						this.formData.lube_cycle = 0;
						this.formData.lube_cycle_dwell_time = 0;
						this.selected_lube_date = '';
						this.selected_lube_time = '';
						this.frequencyBlockDisabled = false;
						this.$emit('event', {eventName: 'toggleSaving', data: false});
					}, 500);
					return
				}*/

				this.$emit('event', { eventName: 'toggleSaving', data: true });

				this.toggle_ultrasound_command(payload)
					.then(() => {
						this.formData.lube_period = null;
						this.formData.lube_period_time = 0;
						this.formData.lube_cycle = 0;
						this.formData.lube_cycle_dwell_time = 0;
						this.selected_lube_date = '';
						this.selected_lube_time = '';
						this.frequencyBlockDisabled = false;
						this.$emit('event', { eventName: 'toggleSaving', data: false });
						resolve();
					})
					.catch(() => {
						this.$emit('event', { eventName: 'toggleSaving', data: false });
						reject();
					});
			});
		},
	},

	watch: {
		'formData.bearing_id'() {
			if (!this.isInitialSetup) {
				this.handleCalculateData();
			}
		},
		'formData.bearing_rpm'() {
			if (!this.isInitialSetup) {
				this.handleCalculateData();
			}
		},
		'formData.replenishment_type'() {
			if (!this.isInitialSetup) {
				this.handleCalculateData();
			}
		},
		'pumpFormData.lubricant_type_id'() {
			if (!this.isInitialSetup) {
				this.handleCalculateData();
			}
		},
		'pumpFormData.lubricant_amount'() {
			if (!this.isInitialSetup) {
				this.handleCalculateData();
			}
		},

		'formData.lube_version'(version) {
			// console.log('formData.lube_version')

			if (version === LUBE_VERSIONS.V3) {
				this.pumpFormData.type = PUMP_TYPES.PERMA;
			}
		},

		'pumpFormData.type'(type) {
			this.pumpRules.lubricant_amount = type === PUMP_TYPES.PERMA ? required : null;
			this.pumpRules.lube_cycle_max_count =
				type === PUMP_TYPES.PULSAR ? required : null;
		}
	},

	mounted() {
		// console.log(this.itemData)
		const { itemData } = this;
		if (
			itemData &&
			itemData.lubesParams &&
			Object.keys(itemData.lubesParams).length
		) {
			this.calculatedLubesData = { ...itemData.lubesParams };
		}

		this.handleCalculateData();
	},

	created() {
		// console.log('created')
		this.$emit('event', {
			eventName: 'handleFetch',
			data: [
				{
					action: 'fetch_bearings',
					keyPrefix: 'bearings',
					payload: { params: { max: -1 } }
				},
				{
					action: 'fetch_lube_types',
					keyPrefix: 'lubeTypes',
					payload: { params: { max: -1 } }
				},
				{
					action: 'fetch_dataset_formulas',
					keyPrefix: 'formulas',
					payload: { params: { max: -1 } }
				},
				{
					action: 'fetch_controllers',
					keyPrefix: 'ultrasound_controllers',
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
};
</script>
