<template>
	<div class="edit-form-container ">
		<!-- :validate="" -->
		<el-form
			:class="[
				'item-edit-form relative section-row controller-form',
			]"
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
					<div class="custom-form-item el-form-item" v-if="itemId">
						<div class="el-form-item__label">{{ tt('Controller') }} id</div>
						<div
							class="value-instead-input el-form-item__content bold"
							v-text="itemId"
						></div>
					</div>

					<el-form-item :label="tt('Type')" prop="type" v-if="itemId">
						<CustomSelect
							:optionsList="controllerTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							:labelKey="'alt_name'"
							v-model="formData.type"
						/>
					</el-form-item>

					<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
						<el-input v-model="formData.name" />
					</el-form-item>

					<el-form-item :label="`${tt('Site')} ID`" prop="uuid">
						<el-input v-model="formData.uuid" />
					</el-form-item>

					<el-form-item
						:label="tt('Company')"
						prop="company_id"
						v-if="!hideCompanies && isIndustrialMatrix"
					>
						<SimpleSpinner :active="companiesLoading" />
						<el-select
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
						</el-select>
					</el-form-item>

					<el-form-item :label="tt('plant')" prop="plant_id" v-if="!hidePlants">
						<SimpleSpinner :active="plantsLoading" />
						<el-select
							:disabled="!plantsList.length"
							v-model="formData.plant_id"
							:placeholder="`${tt('Select')} ${tt('plant')}`"
						>
							<el-option
								v-for="item in plantsList"
								:key="'plant_id-' + item.id"
								:label="item.name"
								:value="item.id"
							/>
						</el-select>
					</el-form-item>

					<el-form-item :label="tt('time_zone')" prop="time_zone">
						<el-select
							v-model="formData.time_zone"
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

					<el-form-item :label="tt('phrases.Connection_Type')" prop="connection_type">
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
						v-show="formData.cloud_connection_type === CLOUD_CONNECTION_TYPES.CELL_MODEM"
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
				</div>

				<div
					v-if="isDXMCommandsTabPresent"
					v-show="activeTab.prop == 'commandsTabActive'"
					class="tab-container standard-form"
					key="tab-2"
				>
					<DXMCommandsTab
						:controllerData="itemData"
						:topicType="CONTROLLER_TOPIC_TYPES.PDM"
					/>
				</div>
			</CustomTransition>

			<!-- <el-form-item :label="tt('phrases.measuring_system')" prop="metric_system_type">
				<el-select v-model="formData.metric_system_type" :placeholder="`${tt('select')} ${tt('system')}`">
					<el-option
						v-for="item in metricSystemsList"
						:key="'metric_system_type-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item> -->

			<FormOperationsButtons
				v-if="
					!fromModal &&
					(!isDXMCommandsTabPresent || activeTab.prop !== 'commandsTabActive')
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
	communicateMethodsList,
	connectionTypesList,
	CLOUD_CONNECTION_TYPES,
	cloudConnectionTypesList,
	controllerTypesList,
	CONTROLLER_TYPES,
	CONTROLLER_TOPIC_TYPES
} from '@/constants/global';

import { sensorParametersList } from '@/modules/charts_factory/controllers/Sensor/enums';

import { required } from '@/constants/validation';
import { itemFormMixin, requestsListMixin } from '@/mixins';
import { timeZonesList } from '@/constants/date_time';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],
	components: {
		DXMCommandsTab: () => import('./DXMCommandsTab.vue'),
	},
	props: {
		hideCompanies: Boolean,
		// silentCompanies: Boolean,
		hidePlants: Boolean,
		new_item_type: Number,
		activeTab: {
			type: Object,
			required: true
		},
		tabsList: {
			type: Array,
			required: true
		},
		// silentPlants: Boolean
	},
	data() {
		return {
			companyPlantsList: [],

			companiesLoading: false,
			companiesList: [],
			plantsLoading: false,
			plantsList: [],

			formData: {
				type: null,
				name: '',
				uuid: '',
				plant_id: null,
				company_id: null,
				time_zone: 0,

				communicate_method: null,
				connection_type: null,

				binding_code: '',
				cloud_connection_type: null,
				router_sim_card_number: '',
				router_serial_number: ''

				// metric_system_type: null,
			}
		};
	},

	computed: {
		...mapState({
			isIndustrialMatrix: state =>
				state.auth.isIndustrialMatrix || state.auth.isDeveloper
		}),

		controllerTypesList: () => Object.freeze(
			controllerTypesList().filter(type => 
				type.id === CONTROLLER_TYPES.BANNER || type.id === CONTROLLER_TYPES.ULTRA_SOUND 
			)
		),
		CONTROLLER_TOPIC_TYPES: () => Object.freeze(CONTROLLER_TOPIC_TYPES),
		
		sensorParametersList: () => Object.freeze(sensorParametersList()),
		// metricSystemsList:() => Object.freeze(metricSystemsList),
		timeZonesList: () => Object.freeze(timeZonesList()),
		communicateMethodsList: () => Object.freeze(communicateMethodsList),
		connectionTypesList: () => Object.freeze(connectionTypesList),
		cloudConnectionTypesList: () => Object.freeze(cloudConnectionTypesList()),
		CLOUD_CONNECTION_TYPES: () => Object.freeze(CLOUD_CONNECTION_TYPES),

		isDXMCommandsTabPresent: that => that.tabsList.some(tab => tab.prop === 'commandsTabActive'),

		rules: () =>
			Object.freeze({
				name: required,
				company_id: required,
				plant_id: required,
				// metric_system_type: required,
				uuid: required
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
		})
	}
};
</script>
