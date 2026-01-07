<template>
	<div class="card content-row selector-block">
		<div class="card-content">
			<div class="mrow flex wrap">
				<div class="mcol-xs-12 mcol-sm-3 selector-item">
					<label class="title bold article-title">{{ tt('company') }}</label>
					<div class="relative">
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
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-3 selector-item">
					<label class="title bold article-title">{{ tt('Plant') }}</label>
					<div class="relative">
						<SimpleSpinner :active="plantsLoading" />
						<el-select
							:multiple="options.multiple"
							collapse-tags
							:placeholder="`${tt('Select')} ${tt('plant_s')}`"
							:disabled="!plantsList.length"
							:value="formData.plant_id"
							@change="ids => handleChangeSelect(ids, 'plant_id')"
						>
							<!-- v-model="formData.plant_id" -->
							<el-option
								v-if="options.allPlantsOption"
								label="All Plants"
								:value="null"
								class="bold"
							/>
							<el-option
								v-for="item in plantsList"
								:key="'plant_id-' + item.id"
								:label="item.name"
								:value="item.id"
							/>
						</el-select>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-3 selector-item">
					<label class="title bold article-title">{{ tt('Controller') }}</label>
					<div class="relative">
						<SimpleSpinner :active="controllersLoading" />
						<el-select
							:multiple="options.multiple"
							collapse-tags
							:disabled="!controllersList.length"
							:value="formData.controller_id"
							:placeholder="`${tt('Select')} ${tt('controller_s')}`"
							@change="ids => handleChangeSelect(ids, 'controller_id')"
						>
							<el-option
								v-if="options.allControllersOption"
								label="All Controllers"
								:value="null"
								class="bold"
							/>
							<el-option
								v-for="item in controllersList"
								:key="'controller_id-' + item.id"
								:label="item.name"
								:value="item.id"
							/>
						</el-select>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-3 selector-item">
					<label class="title bold article-title">{{ tt('Sensor') }}</label>
					<div class="relative">
						<SimpleSpinner :active="sensorsLoading" />
						<el-select
							:multiple="options.multiple"
							collapse-tags
							:disabled="!sensorsList.length"
							:value="formData.sensor_id"
							:placeholder="`${tt('select')} ${tt('sensor_s')}`"
							@change="ids => handleChangeSelect(ids, 'sensor_id')"
						>
							<el-option
								v-if="options.allSensorsOption"
								label="All Sensors"
								:value="null"
								class="bold"
							/>
							<el-option
								v-for="item in sensorsList"
								:key="'sensor_id-' + item.id"
								:label="setupLabel(item, sensorsLabelOptions)"
								:value="item.id"
							/>
						</el-select>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { /*mapState,*/ mapActions } from 'vuex';
import { requestsListMixin, /*handleSaveFormBlock*/ } from '@/mixins';
import { cleanObjValues, setupLabel } from '@/helpers';

export default {
	mixins: [requestsListMixin(), /*handleSaveFormBlock()*/],

	props: {
		options: {
			type: Object,
			default: () => ({})
		}
	},

	data() {
		return {
			companiesLoading: false,
			companiesList: [],
			controllersLoading: false,
			controllersList: [],
			plantsLoading: false,
			plantsList: [],
			sensorsLoading: false,
			sensorsList: [],

			formData: {
				company_id: null,
				plant_id: null,
				controller_id: null,
				sensor_id: null
				/*company_id: 1,
				plant_id: 7,
				controller_id: 4,
				sensor_id: 4,*/
			}
		};
	},

	computed: {
		/*...mapState({
			companiesLoading: state => state.companies.isLoading,
			companiesList: state => state.companies.itemsList,
			controllersLoading: state => state.controllers.isLoading,
			controllersList: state => state.controllers.itemsList,
			plantsLoading: state => state.plants.isLoading,
			plantsList: state => state.plants.itemsList,
			sensorsLoading: state => state.sensors.isLoading,
			sensorsList: state => state.sensors.itemsList
		}),*/

		isSelectorBlock: () => true,
		sensorsLabelOptions: () => ({
			accessors: ['equipment.asset_number', 'equipment.machine_name'],
			delimeter: '-'
		}),

		setupLabel: () => setupLabel,

		requestsToDoList: () =>
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
							clean_prop: 'formData.plant_id',
							param: 'companyId'
						}
					],
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				},
				{
					action: 'fetch_controllers',
					bindTo: [
						{
							prop: 'formData.plant_id',
							clean_prop: 'formData.controller_id',
							param: 'plantId'
						}
					],
					localProp: 'controllersList',
					localLoadProp: 'controllersLoading'
				},
				{
					action: 'fetch_sensors',
					bindTo: [
						{
							prop: 'formData.controller_id',
							clean_prop: 'formData.sensor_id',
							param: 'controllerId'
						}
					],
					localProp: 'sensorsList',
					localLoadProp: 'sensorsLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_companies: 'companies/fetch_companies',
			set_companies: 'companies/set_companies',
			fetch_controllers: 'controllers/fetch_controllers',
			set_controllers: 'controllers/set_controllers',
			fetch_plants: 'plants/fetch_plants',
			set_plants: 'plants/set_plants',
			fetch_sensors: 'sensors/fetch_sensors',
			set_sensors: 'sensors/set_sensors'
		}),

		handleCleanForm() {
			this.formData = cleanObjValues(this.formData);
		},

		handleChangeSelect(ids, prop) {
			const { multiple } = this.options;
			if (multiple) {
				if (!ids.length || (ids.length && ids[ids.length - 1] == null)) {
					this.formData[prop] = [null];
				} else {
					this.formData[prop] = ids.filter(id => id != null);
				}
			} else {
				// if (ids) {
				this.formData[prop] = ids;
				// }
			}
		},

		prepareSelectorData(formData) {
			let newData = { company_id: formData.company_id };
			formData.plant_id[0] ? (newData.plant_ids = formData.plant_id) : null;
			formData.controller_id[0]
				? (newData.controller_ids = formData.controller_id)
				: null;
			formData.sensor_id[0] ? (newData.sensor_ids = formData.sensor_id) : null;
			console.log(formData, newData);
			return newData;
		}
	},

	watch: {
		/*'formData.company_id'(id) {
			const { multiple } = this.options;
			this.formData.plant_id = multiple ? [null] : null;
			this.set_plants([]);
			if (id) {
				this.fetch_plants({ params: { companyId: id } });
			}
		},
		'formData.plant_id'(ids) {
			const { multiple } = this.options;
			this.formData.controller_id = multiple ? [null] : null;
			this.set_controllers([]);

			if ((multiple && ids[0] != null) || (!multiple && ids)) {
				this.fetch_controllers({ params: { plantId: ids } });
			}
		},
		'formData.controller_id'(ids) {
			const { multiple } = this.options;
			this.formData.sensor_id = multiple ? [null] : null;
			this.set_sensors([]);
			if ((multiple && ids[0] != null) || (!multiple && ids)) {
				this.fetch_sensors({ params: { controllerId: ids } });
			}
		}*/
	}

	/*created() {
		// const actions = ['fetch_companies', 'fetch_controllers', 'fetch_plants', 'fetch_sensors'];
		this.startFetchRequests({ actions: ['fetch_companies'], params: { max: -1 } });
	},*/

	/*beforeDestroy() {
		this.cleanLists(['set_companies', 'set_controllers', 'set_plants', 'set_sensors']);
	}*/
};
</script>
