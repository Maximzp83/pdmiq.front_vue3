<template>
	<div class="details-page fix-height success-dashboard">
		<VueElementLoadingWrapper
			:isLoading="plantsLoading"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<!--  -->

			<div class="mcontainer" v-if="plantItem && plantItem.id">
				<div class="content-row ">
					<ButtonsNavbar card inline bold :itemsList="navbarList" />
				</div>

				<div class="content-row nested-view-content-wrapper">
					<transition name="standard-fade" mode="out-in">
						<router-view
							ref="nestedViewContent"
							@event="handleEventNew"
							:key="detailsComponentKey"
							:plantItem="plantItem"
							:sensorsList="sensorsList"
							:sensorsLoading="sensorsLoading"
							preventSetNavbar
						/>
					</transition>
				</div>
			</div>

			<div v-else-if="!plantsLoading" class="mcontainer">
				<PageMockImg />
			</div>
		</div>
	</div>
</template>

<script>
import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
import annotations from 'highcharts/modules/annotations';
highchartsMore(Highcharts);
stockInit(Highcharts);
boost(Highcharts);
annotations(Highcharts);

import { mapActions, mapState } from 'vuex';
// import { findItemBy } from '@/helpers';
import { LANGUAGE_TYPES } from '@/localization/utils';

import { localeMonths, localeMonthsFull, weekdays } from '@/constants/date_time';

// import { getBrandModelImgByType } from '@/helpers/specialHelpers';

import {
	fetchItemsHelper,
	navigation,
	eventHandler
	// requestsListMixin
} from '@/mixins';

export default {
	mixins: [
		fetchItemsHelper(),
		navigation(),
		eventHandler()
		// requestsListMixin
	],
	name: 'SuccessDashboardContainer',

	components: {
		ButtonsNavbar: () => import('@/components/common/ButtonsNavbar.vue'),
		PageMockImg: () => import('@/components/common/PageMockImg.vue')
	},

	data() {
		return {
			plantItem: null,
			plantsLoading: false,
			sensorsList: [],
			sensorsLoading: false,

			detailsComponentKey: 1
		};
	},

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			// plantsLoading: state => state.global.globalPlantsLoading,
			// plantsList: state => state.global.globalPlantsList,
			authUser: state => state.auth.authUser
		}),

		plantId: that => (that.authUser.isCustomer && that.authUser.plant_id) || that.globalFilters.plantId,

		itemsName() {
			return {
				one: this.$t('Item'),
				mult: this.$t('Items')
			};
		},

		/*pageTitle() {
			if (this.itemData) {
				return `${this.itemData.name}`;
			}
			return '';
		},*/

		navbarList() {
			return Object.freeze(
				this.$translate([
					{ id: 1, path: '/success-dashboard/main', label: 'main_dashboard' },
					{
						id: 2,
						path: '/success-dashboard/meeting-tracker',
						label: 'Meeting_Tracker'
					},
					// { id: 3, path: '/success-dashboard/roi-analysis', label: 'ROI Analysis' },
					{ id: 4, path: '/success-dashboard/roi-one-pager', label: 'ROI_One_Pager' }
				])
			);
		},

		navbarSettings() {
			return Object.freeze({
				// navigateButton: { history: true, steps: -1 },
				showStandardNavItem: true,
				showFilter: true,
				pageTitle: this.$t('Customer_Success_Dashboard')
			});
		}

		/*requestsToDoList() {
			// const { id } = this.$route.params;

			let items = [];

			if (this.plantId) {
				items.push({
					action: 'fetch_plant',
					payload: { itemId: this.plantId },					
					localProp: 'plantItem',
					localLoadProp: 'plantsLoading'
				})
			}

			return Object.freeze(items);
		},*/
	},

	methods: {
		...mapActions({
			fetch_plant: 'plants/fetch_plant',
			fetch_sensors: 'sensors/fetch_sensors'
			// show_edit_modal: 'show_edit_modal',
		}),

		fetchPlant(plantId) {
			const payload = { itemId: plantId };

			this.doFetchAction('fetch_plant', 'plantItem', 'plantsLoading', payload);
		},

		fetchSensors(plantId) {
			const payload = { params: { max: -1, plantId: plantId } };

			this.doFetchAction('fetch_sensors', 'sensorsList', 'sensorsLoading', payload);
		},

		setup_navbar(settings) {
			const { meta } = this.$route;
			if ((!meta || !meta.preventSetupNavbar) && !this.preventSetupNavbar) {
				this.$store.dispatch('setup_navbar', settings);
			}
		}

		/*localBeforeMountRequestsList() {
			if (!this.plantId) {
				this.$notify({
					type: 'warning',
					title: "Can't load page",
					message: `Select plant first`
				});
			}
			return;
		}*/
	},

	watch: {
		/*'globalFilters.plantId'() {
			// this.plantItem = findItemBy('id', id, this.plantsList);
			// this.detailsComponentKey++;
		},*/

		plantId(id) {
			this.plantItem = null;
			this.sensorsList = [];

			if (id) {
				this.fetchPlant(id);
				this.fetchSensors(id);
			}
		}
		/*'$route'({name}) {
			this.displayMainSection = name == 'EquipmentsDetailsPage';
		},*/

		/*plantsList(list) {
			this.plantItem = findItemBy('id', this.plantId, list);
		}*/
	},

	beforeMount() {
		if (Highcharts) {
			if (this.$Lang.currentLangId === LANGUAGE_TYPES.SPANISH) {
				Highcharts.setOptions({
					lang: {
						months: this.$translate(localeMonthsFull()),
						weekdays: this.$translate(weekdays()),
						shortMonths: this.$translate(localeMonths(true))
					}
				});
			}
		}

		if (this.plantId) {
			this.fetchPlant(this.plantId);
			this.fetchSensors(this.plantId);
		} /* else {
			this.$notify({
				type: 'warning',
				title: "Can't load page",
				message: `Select plant first`
			});
		}*/

		this.setup_navbar(this.navbarSettings);
		// const { id } = this.$route.params;
		// this.displayMainSection = this.$route.name == 'EquipmentsDetailsPage';
	},

	beforeDestroy() {
		if (!this.preventDestroyNavbar) {
			this.setup_navbar({});
		}
	}
};
</script>
