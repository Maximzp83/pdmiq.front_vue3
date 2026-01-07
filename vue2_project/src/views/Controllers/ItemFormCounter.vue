<template>
	<div class="edit-form-container ">
		<!-- :validate="" -->
		<el-form
			:class="[
				'item-edit-form relative section-row',
				{ 'half-width': !fromAnotherInstance && !isMobile }
			]"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<!-- <div class="custom-form-item el-form-item" v-if="itemId">
				<div class="el-form-item__label">{{tt('Controller')}} id</div>
				<div
					class="value-instead-input el-form-item__content bold"
					v-text="itemId"
				></div>
			</div> -->

			<el-form-item :label="`${tt('Version')} ${tt('Number')}`" prop="version">
				<CustomSelect
					:optionsList="controllerVersionsList"
					:placeholder="`${tt('Select')} ${tt('version')}`"
					v-model="formData.version"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Controller')} uuid`" prop="uuid">
				<el-input v-model="formData.uuid" />
			</el-form-item>

			<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
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
	communicateMethodsList,
	connectionTypesList,
	CLOUD_CONNECTION_TYPES,
	cloudConnectionTypesList,
	// CONTROLLER_VERSIONS,
	controllerVersionsList
} from '@/constants/global';

// import { sensorParametersList } from '@/modules/charts_factory/controllers/Sensor/enums';

import { required } from '@/constants/validation';
import { itemFormMixin, requestsListMixin } from '@/mixins';
import { timeZonesList } from '@/constants/date_time';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],

	props: {
		hideCompanies: Boolean,
		// silentCompanies: Boolean,
		hidePlants: Boolean,
		new_item_type: Number
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
				uuid: '',
				name: '',
				plant_id: null,
				company_id: null,
				time_zone: 0,

				communicate_method: null,
				connection_type: null,

				binding_code: '',
				cloud_connection_type: null,
				router_sim_card_number: '',
				router_serial_number: '',

				version: null
				// metric_system_type: null,
			}
		};
	},

	computed: {
		...mapState({
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,
			authUser: state => state.auth.authUser
		}),

		// metricSystemsList:() => Object.freeze(metricSystemsList),
		timeZonesList: () => Object.freeze(timeZonesList()),
		communicateMethodsList: () => Object.freeze(communicateMethodsList),
		connectionTypesList: () => Object.freeze(connectionTypesList),
		cloudConnectionTypesList: () => Object.freeze(cloudConnectionTypesList()),
		CLOUD_CONNECTION_TYPES: () => Object.freeze(CLOUD_CONNECTION_TYPES),
		controllerVersionsList: () => Object.freeze(controllerVersionsList),

		rules: () =>
			Object.freeze({
				name: required,
				uuid: required,
				company_id: required,
				plant_id: required,
				version: required
			}),

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_companies',
					localProp: 'companiesList',
					localLoadProp: 'companiesLoading'
				},
				{
					action: 'fetch_plants',
					bindTo: [{ prop: 'formData.company_id', param: 'companyId' }],
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
