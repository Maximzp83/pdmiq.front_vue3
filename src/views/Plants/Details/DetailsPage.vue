<template>
	<div class="plant-details details-page main-instance-item">
		<div class="view-content-card" v-if="plantItem">
			equipmentsLayout

			<div class="section-row">
				<div class="mrow flex wrap big-padding">
					<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
						<el-button @click="toggleSearchbar">toggleSearchbar</el-button>

						<el-button label="Confirm" @click="confirm = true">confirm</el-button>
						<!-- <ItemPDMsStatisticBlock
							:title="tt('phrases.overall_asset_health')"
							@event="handleEventNew"
							:itemData="plantItem"
							:filters="filters"
							:predefinedFilters="predefinedFilters"
							:chartLegendEvents="chartLegendEvents"
						/> -->
					</div>

					<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
						<!-- <Counters @event="handleEventNew" /> -->
						<el-form @submit="onSubmit">
							<el-input v-model="name" />
							<el-input-number v-model="age" :min="1" :max="10" />

							<el-tooltip
								class="box-item"
								effect="dark"
								content="Top Left prompts info"
								placement="top-start"
							>
								<el-button>top-start</el-button>
							</el-tooltip>

							<el-upload
								class="upload-demo"
								action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
								multiple
							>
								<el-button type="primary">Click to upload</el-button>
								<template #tip>
									<div class="el-upload__tip">
										jpg/png files with a size less than 500KB.
									</div>
								</template>
							</el-upload>
							<!-- <el-select
								multiple
								v-model="select"
							>
								<el-option
									v-for="item in options"
									:key="`opt-${item}`"
									:label="item"
									:value="item"
								/>
							</el-select> -->

							<el-select-v2
								v-model="select2"
								:options="options2"
								placeholder="Please select"
							/>

							<el-date-picker
								v-model="date"
								type="datetime"
								placeholder="Select date and time"
							/>

							<el-time-select
								start="08:30"
								step="00:15"
								end="18:30"
								placeholder="Select time"
							/>

							<el-checkbox label="Option A">Option A</el-checkbox>

							<el-switch v-model="accept">I accept the license and terms</el-switch>

							<el-pagination layout="prev, pager, next" :total="50" />

							<el-popover
								class="box-item"
								title="Title"
								content="Top Left prompts info"
								placement="top-start"
							>
								<template #reference>
									<el-button>top-start</el-button>
								</template>
							</el-popover>

							<div>
								<el-button type="primary" @click="onSubmit">Submit</el-button>
								<el-button @click="onReset">Reset</el-button>
							</div>
						</el-form>
					</div>

					<div class="mcol-xs-12">
						<!-- <EquipmentsLayout
							ref="EquipmentsLayout"
							@event="handleEventNew"
							hideDropdownFilterbar
							hideDatepicker
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="equipmentsListFilters"
							:plantId="predefinedFilters.plantId"
						/> -->
					</div>

					<div class="mcol-xs-12">
						<!-- <AssetsList
							@event="handleEventNew"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
						/> -->
					</div>

					<div class="mcol-xs-12">
						<!-- <MachinesList
							@event="handleEventNew"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
						/> -->
					</div>

					<div class="mcol-xs-12">
						<!-- <ProductionLinesList
							@event="handleEventNew"
							:productionLineType="PRODUCTION_LINES_TYPES.PRODUCTION_LINE"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
						/> -->
					</div>

					<div class="mcol-xs-12">
						<!-- <ProductionLinesList
							@event="handleEventNew"
							:productionLineType="PRODUCTION_LINES_TYPES.UTILITY"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
						/> -->
					</div>

					<!-- <MaintenanceListWrapper
						v-if="$hasAccessTo(['view_maintenance'])"
						ref="MaintenanceListWrapper"
						:woFilters="woFilters"
						:logFilters="logFilters"
						hideDatepicker
						fromPlantDashboard
					/> -->
				</div>
			</div>
		</div>

		<el-dialog v-model="confirm">
			<div class="card">
				<div class="card-content">
					<div class="row items-center">
						<span class="q-ml-sm"
							>You are currently not connected to any network.</span
						>
					</div>

					<div align="right">
						<el-button @click="confirm = false" type="primary">Cancel</el-button>
						<el-button @click="confirm = false">Turn on Wifi</el-button>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script setup>
import { ref, onMounted, shallowReactive } from 'vue';

import { Lang } from '@/localization';
const { tt, translate } = Lang;

// -----Store-----
import { useAuthStore } from '@/stores/AuthStore';
const authStore = useAuthStore();
const authUser = authStore.authUser;

import { useGlobalStore } from '@/stores/GlobalStore';
const { set_value: set_global_store } = useGlobalStore();

// =========================

defineOptions({
	name: 'PlantDetails',
});
/*import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);
import { mapActions, mapState } from 'vuex';*/

// import { scrollToElement, waitForElement } from '@/helpers/specialHelpers';

// import { PRODUCTION_LINES_TYPES, MAINTENANCE_TYPES } from '@/constants/global';

/*import {
	// initPageDataMixin,
	tabsMixin,
	eventHandler,
	mainInstanceDetailsPage,
	fetchItemsHelper
} from '@/mixins';*/

import { ElNotification } from 'element-plus';

const options = [];
for (let i = 0; i <= 10; i++) {
	options.push('Opt ' + i);
}
const options2 = [];
for (let i = 0; i <= 100000; i++) {
	options2.push({ label: 'Opt ' + i, value: i });
}

const plantItem = true;
const name = ref(null);
const age = ref(null);
const accept = ref(false);
const select = ref(null);
const select2 = ref(null);
const date = ref('');
const confirm = ref(false);
const text = ref('');

const onSubmit = () => {
	if (accept.value !== true) {
		ElNotification({
			title: 'Title',
			type: 'warning',
			message: 'You need to accept the license and terms first',
		});
	} else {
		ElNotification({
			title: 'Title',
			type: 'success',
			message: 'Submitted',
		});
	}
};

const onReset = () => {
	console.log(name);
	name.value = null;
	age.value = null;
	accept.value = false;
	select.value = null;
};

const navbarSettings = shallowReactive({
	showFilter: true,
	showCompareButton: true,
	showSearchbar: true,
	datepickerSettings: {
		label: `${tt('phrases.statistics_for_period')}:`,
		storeSettings: {
			storeName: 'PlantsStore',
			stateKey: 'statistics_filters',
		},
	},

	// showSearchbar: true
});

const toggleSearchbar = () => {
	navbarSettings.showSearchbar = !navbarSettings.showSearchbar;
	set_global_store('navbarSettings', navbarSettings);
};

// ========== Hooks ==============
onMounted(() => {
	set_global_store('navbarSettings', navbarSettings);
});

// export default {
/*name: 'PlantDetails',
	setup() {

	},*/
/*mixins: [
		// initPageDataMixin,
		tabsMixin(),
		eventHandler(),
		mainInstanceDetailsPage(),
		fetchItemsHelper()
	],*/

/*components: {
		ItemPDMsStatisticBlock: () =>
			import('@/components/itemDetails/ItemPDMsStatisticBlock.vue'),

		ProductionLinesList: () => import('@/views/ProductionLines/ItemsList.vue'),
		MachinesList: () => import('@/views/Machines/ItemsList.vue'),
		AssetsList: () => import('@/views/Assets/ItemsList.vue'),
		EquipmentsLayout: () => import('@/views/Equipments/EquipmentsLayout.vue'),
		MaintenanceListWrapper: () =>
			import('@/components/itemDetails/MaintenanceListWrapper.vue'),
		Counters: () => import('./Counters.vue')
	},*/

/*props: {
		plantItem: { type: Object, required: true },
		additionalModalSettings: Object
	},*/

/*data() {
		return {
			meetingTrackerLoading: false,
			meetingTrackersList: [],

			recommendedActionsTitle: '',
			recommnendedActionsVisible: false,
			recommnendedActionsItemsList: []
		};
	},*/

/*computed: {
		...mapState({
			filters: state => state.plants.statistics_filters,
			production_linesFilters: state => state.production_lines.filters,
			utilitiesFilters: state => state.production_lines.utility_filters,
			machinesFilters: state => state.machines.filters,
			assetsFilters: state => state.assets.filters,
			// equipmentsFilters: state => state.equipments.filters,

			authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Plant'),
				mult: this.$t('Plants')
			};
		},

		instanceDataKey: () => 'plantItem',
		instanceViewName: () => 'Plants',

		PRODUCTION_LINES_TYPES: () => PRODUCTION_LINES_TYPES,

		woFilters: that =>
			Object.freeze({
				...that.predefinedFilters,
				type: MAINTENANCE_TYPES.WORK_ORDER,
				daterange: that.filters.daterange
			}),
		logFilters: that =>
			Object.freeze({
				...that.predefinedFilters,
				type: MAINTENANCE_TYPES.LOG,
				daterange: that.filters.daterange
			}),

		predefinedFilters: that =>
			Object.freeze({
				// productionLineId: that.plantItem.id,
				plantId: that.plantItem.id,
				daterange: that.filters.daterange
			}),

		itemsListsFilters: that =>
			Object.freeze({
				plantId: that.plantItem.id
			}),

		equipmentsListFilters: that =>
			Object.freeze({
				plantId: that.plantItem.id,
				daterange: that.filters.daterange
			}),



		tabsList: that =>
			Object.freeze(
				that.$translate([
					{ title: 'WORK_ORDERS', prop: 'woTab' },
					{ title: 'MAINTENANCE_LOGS', prop: 'logsTab' }
				])
			),

		mainInfoSettingsList: that =>
			Object.freeze(
				that.$translate([
					{
						label: 'Company',
						prop: 'company.name'
					},
					{
						label: 'Region',
						prop: 'region'
					},
					{
						label: 'Address',
						prop: 'address'
					},
					{
						label: 'Billing_Plan_Cost',
						prop: 'billing_plan_cost'
					}
				])
			),

		countersSettings: that =>
			Object.freeze({
				filter: { key: 'productionLineId', valueProp: 'id' },
				items: that.$translate([
					{
						title: 'Machines',
						count: 'machines_count',
						iconName: 'machines',
						sectionClass: '.machines-list'
					},
					{
						title: 'Assets',
						count: 'assets_count',
						iconName: 'assets',
						sectionClass: '.assets-list'
					},
					{
						title: 'Items',
						count: 'equipments_count',
						iconName: 'equipments',
						sectionClass: '.equipments-list'
					}
				])
			}),

		createWOButtonFormSetup: () => Object.freeze([{ formKey: 'plant_id', valKey: 'id' }])
	},*/

/*methods: {
		...mapActions({
			// fetch_item: 'plants/fetch_plant',
			show_edit_modal: 'show_edit_modal',
			set_filters: 'plants/set_statistics_filters',
			set_production_lines_filters: 'production_lines/set_production_lines_filters',
			set_utilities_filters: 'production_lines/set_utilities_filters',
			set_machines_filters: 'machines/set_machines_filters',
			set_assets_filters: 'assets/set_assets_filters',
			// set_equipments_filters: 'equipments/set_equipments_filters',
			// fetch_meeting_tracker_last: 'meeting_trackers/fetch_meeting_tracker_last',
			fetch_meeting_trackers: 'meeting_trackers/fetch_meeting_trackers',
			fetch_locations: 'plants/fetch_locations'
		}),

		setup_navbar(settings) {
			const { meta } = this.$route;
			if ((!meta || !meta.preventSetNavbar) && !this.preventSetNavbar) {
				this.$store.dispatch('setup_navbar', settings);
			}
		},

		viewTable({ iconName }) {
			const filters = this[`${iconName}Filters`];
			this[`set_${iconName}_filters`]({
				...filters,
				isShowList: true
			});

			// console.log(iconName, document.querySelector('.equipments-list'))

			if (iconName == 'equipments') {
				let postfix = '';
				if (!document.querySelector('.equipments-layout')) {
					iconName = 'brand-models';
					postfix = 'list';
				} else {
					postfix = 'layout';
				}
				// console.log(iconName, postfix)
				setTimeout(() => {
					scrollToElement(`.${iconName}-${postfix}`);
				}, 270);
			} else {
				setTimeout(() => {
					scrollToElement(`.${iconName}-list`);
				}, 270);
			}
		}
	},*/

/*beforeMount() {
		this.setup_navbar(this.navbarSettings);
	},

	mounted() {
		// console.log(document.querySelector('.equipments-layout'))
		const { query } = this.$route;

		if (query) {
			if (query.scrollTo) {
				waitForElement(query.scrollTo, () => {
				  scrollToElement(query.scrollTo);
				});
			}
		}
	},*/
// };
</script>
