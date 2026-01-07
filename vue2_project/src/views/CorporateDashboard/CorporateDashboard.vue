<template>
	<div class="corporate-dashboard">
		<!-- <VueElementLoadingWrapper
			:isLoading="true"
			:itemsName="itemsName.one"
		/> -->

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer"
				v-if="companyId && selectedCompany"			
			>
				
				<!-- <div class="content-row ">
					<ButtonsNavbar card inline bold :itemsList="navbarList" />
				</div> -->

				<div class="content-row nested-view-content-wrapper">
					<transition name="standard-fade" mode="out-in">
						<router-view
							ref="nestedViewContent"
							@event="handleEventNew"
							:key="detailsComponentKey"
							:companyData="selectedCompany"
							:companyId="companyId"
							preventSetNavbar
						/>
					</transition>
				</div>
			</div>

			<div v-else class="mcontainer">
				<PageMockImg :text="tt('phrases.select_company_first')"/>
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
import { findItemBy } from '@/helpers';
import { LANGUAGE_TYPES } from '@/localization/utils';

import { localeMonths, localeMonthsFull, weekdays } from '@/constants/date_time';

// import { getBrandModelImgByType } from '@/helpers/specialHelpers';

import {
	navigation,
	eventHandler
	// requestsListMixin
} from '@/mixins';

export default {
	mixins: [
		navigation(),
		eventHandler()
		// requestsListMixin
	],
	name: 'CorporateDashboard',

	components: {
		// ButtonsNavbar: () => import('@/components/common/ButtonsNavbar.vue'),
		PageMockImg: () => import('@/components/common/PageMockImg.vue')
	},

	data() {
		return {
			detailsComponentKey: 1
		};
	},

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			// plantsLoading: state => state.global.globalPlantsLoading,
			// plantsList: state => state.global.globalPlantsList,
			companiesList: state => state.global.globalCompaniesList,
			authUser: state => state.auth.authUser
		}),

		// plantId: that => (that.authUser.isCustomer && that.authUser.plant_id) || that.globalFilters.plantId,

		itemsName() {
			return {
				one: this.$t('Plant'),
				mult: this.$t('Plants')
			};
		},

		navbarSettings() {
			return Object.freeze({
				// navigateButton: { history: true, steps: -1 },
				// showStandardNavItem: true,
				// showFilter: true,
				// pageTitle: this.$t('sidebar_menu.Corporate_View'),
				// enableCompaniesFilter: this.authUser && !this.authUser.company_id,
				enableCompaniesFilter: true,

				datepickerSettings: {
					label: `${this.tt('phrases.statistics_for_period')}:`,
					setFiltersAction: 'plants/set_statistics_filters',
					filtersState: 'plants.statistics_filters'
				},

				printButtonSettings: {
					querySelector: '.corporate-dashboard .corporate-for-print-container',
					icon: 'icomoon icon-pdf'
				}
			});
		},

		companyId() {
			return this.authUser.company_id || this.globalFilters.companyId || null;
		},

		selectedCompany() {
			if (this.companyId && this.companiesList) {
				return findItemBy('id', this.companyId, this.companiesList);
			}
			return null;
		}
	},

	methods: {
		...mapActions({
			// set_filters: 'plants/set_statistics_filters',
			set_global_filters: 'set_global_filters',

			// fetch_plants: 'plants/fetch_plants',
			// fetch_sensors: 'sensors/fetch_sensors'
			// show_edit_modal: 'show_edit_modal',
		}),

		setup_navbar(settings) {
			const { meta } = this.$route;
			if ((!meta || !meta.preventSetupNavbar) && !this.preventSetupNavbar) {
				this.$store.dispatch('setup_navbar', settings);
			}
		},

		setGlobalFilters({ id, filterName }) {
			const newFilters = { ...this.globalFilters, [filterName]: id };
			this.set_global_filters(newFilters);
		},
	},

	watch: {

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

		this.setup_navbar(this.navbarSettings);
		// const { id } = this.$route.params;
		// this.displayMainSection = this.$route.name == 'EquipmentsDetailsPage';
	},

	beforeDestroy() {
		if (!this.preventDestroyNavbar) {
			this.setup_navbar({});
		}

		this.setGlobalFilters({ id: null, filterName: 'companyId' });
	}
};
</script>
