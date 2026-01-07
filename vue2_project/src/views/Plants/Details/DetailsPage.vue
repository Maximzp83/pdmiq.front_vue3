<template>
	<div class="plant-details details-page fix-height main-instance-item">
		<div class="view-content-card" v-if="plantItem">
			<!-- <div class="section-row header-block">
				<div class="card">
					<div class="card-content moderate-paddings flex">
						<Datepicker
							setupDaterangeFilter
							enableShortcuts
							@input="range => set_filters({ ...filters, daterange: range })"
							:value="filters.daterange"
							clearingTo="last_7_days"
							type="daterange"
						/>

						<div class="mcol-lg-3 ml-auto logo-img-as-row-item">
							<ItemImagesBlock
								@event="handleEventNew"
								title="Logo"
								blockType="no-card"
								:itemData="plantItem"
								showMockSrc="/static/img/plant_logo_mock.jpg"
							/>
						</div>
					</div>
				</div>
			</div> -->

			<div class="section-row">
				<div class="mrow flex wrap big-padding">
					<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
						<!-- <div class="flex column big-padding vertical-fluid"> -->
						<!-- <div class="content-row"> -->
						<ItemPDMsStatisticBlock
							:title="tt('phrases.overall_asset_health')"
							@event="handleEventNew"
							:itemData="plantItem"
							:filters="filters"
							:predefinedFilters="predefinedFilters"
							:chartLegendEvents="chartLegendEvents"
						/>
						<!-- </div> -->

						<!-- <div class="content-row mrow flex" v-if="hasPermissions">
								<div class="mcol-xs-6 vertical-fluid">
									<div class="card block-item ">
										<div class="card-header filled flex align-center">
											<div class="title semi-bold uppercase">
												{{tt('phrases.data_driven_recommended_actions')}}
											</div>
										</div>

										<div class="card-content relative">
											<SimpleSpinner :active="meetingTrackerLoading" />
											<div class="content-row flex semi-bold">
												<div class="">{{
													tt('phrases.last_3_months')
												}}</div>
												<div
													class="ml-auto pointer article-title"
													@click="
														openRecommendedActionsModal(
															dataDrivenRecommendedActions.last3months,
															Data_Driven_Recommended_Actions_text
														)
													"
												>
													{{ dataDrivenRecommendedActions.last3months.length }}
												</div>
											</div>
											<div class="content-row flex semi-bold">
												<div class="">{{tt('phrases.ydt')}}</div>
												<div
													class="ml-auto pointer article-title"
													@click="
														openRecommendedActionsModal(
															dataDrivenRecommendedActions.ydt,
															Data_Driven_Recommended_Actions_text
														)
													"
												>
													{{ dataDrivenRecommendedActions.ydt.length }}
												</div>
											</div>
											<div class="content-row flex semi-bold">
												<div class="">{{tt('phrases.last_12_months')}}</div>
												<div
													class="ml-auto pointer article-title"
													@click="
														openRecommendedActionsModal(
															dataDrivenRecommendedActions.last12months,
															Data_Driven_Recommended_Actions_text
														)
													"
												>
													{{ dataDrivenRecommendedActions.last12months.length }}
												</div>
											</div>
										</div>
									</div>
								</div>
								
								<div class="mcol-xs-6 vertical-fluid">
									<div class="card block-item">
										<div class="card-header filled flex align-center">
											<div class="title semi-bold uppercase">
												{{tt('phrases.data_driven_issues_resolved')}}
											</div>
										</div>

										<div class="card-content relative">
											<SimpleSpinner :active="meetingTrackerLoading" />
											<div class="content-row flex semi-bold">
												<div class="">{{tt('phrases.last_3_months')}}</div>
												<div
													class="ml-auto pointer article-title"
													@click="
														openRecommendedActionsModal(
															dataDrivenRecommendedActions.last3monthsResolved,
															Data_Driven_Issues_Resolved_text
														)
													"
												>
													{{ dataDrivenRecommendedActions.last3monthsResolved.length }}
												</div>
											</div>
											<div class="content-row flex semi-bold">
												<div class="">{{tt('phrases.ydt')}}</div>
												<div
													class="ml-auto pointer article-title"
													@click="
														openRecommendedActionsModal(
															dataDrivenRecommendedActions.ydtResolved,
															Data_Driven_Issues_Resolved_text
														)
													"
												>
													{{ dataDrivenRecommendedActions.ydtResolved.length }}
												</div>
											</div>
											<div class="content-row flex semi-bold">
												<div class="">{{tt('phrases.last_12_months')}}</div>
												<div
													class="ml-auto pointer article-title"
													@click="
														openRecommendedActionsModal(
															dataDrivenRecommendedActions.last12monthsResolved,
															Data_Driven_Issues_Resolved_text
														)
													"
												>
													{{
														dataDrivenRecommendedActions.last12monthsResolved.length
													}}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div> -->

						<!-- <div class="section-row" v-if="hasPermissions">
								
							</div> -->
						<!-- </div> -->
					</div>

					<div class="mcol-xs-12 mcol-sm-6 mcol-md-12 mcol-lg-6">
						<Counters @event="handleEventNew" />
					</div>

					<!-- <div class="mcol-xs-12 mcol-lg-6">
						<ROIStatisticsContainer
							standardIconBlock
							:enableLabelClickEvent="!isPlantUser"
							:plantItem="plantItem"
							:predefinedFilters="predefinedFilters"
						/>
					</div> -->

					<!-- <div class="mcol-xs-12 mcol-lg-6">
						<ItemImagesBlock
							@event="handleEventNew"
							title="Logo"
							:itemData="plantItem"
							showMockSrc="/static/img/plant_logo_mock.jpg"
						/>
					</div> -->

					<!-- <div class="mcol-xs-12 mcol-lg-6">
						<ItemWOStatisticBlock
							@event="handleEventNew"
							:itemData="plantItem"
							:filters="filters"
							:predefinedFilters="predefinedFilters"
						/>
					</div> -->
					<div class="mcol-xs-12">
						<EquipmentsLayout
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
						/>
					</div>

					<div class="mcol-xs-12">
						<!-- hideDropdownFilterbar -->
						<AssetsList
							@event="handleEventNew"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
						/>
					</div>

					<div class="mcol-xs-12">
						<!-- hideDropdownFilterbar -->
						<MachinesList
							@event="handleEventNew"
							fromDashboard
							fromDetailsPage
							showCardHeader
							showToggleListButton
							preventSetNavbar
							:additionalModalSettings="additionalModalSettings"
							:propsFilters="itemsListsFilters"
							:plantId="predefinedFilters.plantId"
						/>
					</div>

					<div class="mcol-xs-12">
						<!-- hideDropdownFilterbar -->
						<ProductionLinesList
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
						/>
					</div>

					<div class="mcol-xs-12">
						<!-- hideDropdownFilterbar -->
						<ProductionLinesList
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
						/>
					</div>

					<MaintenanceListWrapper
						v-if="$hasAccessTo(['view_maintenance'])"
						ref="MaintenanceListWrapper"
						:woFilters="woFilters"
						:logFilters="logFilters"
						hideDatepicker
						fromPlantDashboard
					/>
				</div>
			</div>
		</div>

		<!-- <el-dialog
			top
			:append-to-body="true"
			:visible.sync="recommnendedActionsVisible"
			:title="recommendedActionsTitle"
			:class="'small rounded'"
		>
			<RecommendedActionsList
				@event="handleEventNew"
				:itemsList="recommnendedActionsItemsList"		
			/>
		</el-dialog> -->

		<!-- <ImagePreviewModal
			@closeModal="imgPreviewOpen = false"
			:imgDialogOpen="imgPreviewOpen"
			:imgId="currentImageId"
			:pictures="imagesList"
		/> -->
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);
import { mapActions, mapState } from 'vuex';
/*import {
	// findItemBy,
	getDateRange,
	prepareRangeParams,
	decomposeDate,
	mergeArrays
} from '@/helpers';*/
import { scrollToElement, waitForElement } from '@/helpers/specialHelpers';

import { PRODUCTION_LINES_TYPES, MAINTENANCE_TYPES } from '@/constants/global';

import {
	// initPageDataMixin,
	tabsMixin,
	eventHandler,
	mainInstanceDetailsPage,
	fetchItemsHelper
} from '@/mixins';

export default {
	mixins: [
		// initPageDataMixin,
		tabsMixin(),
		eventHandler(),
		mainInstanceDetailsPage(),
		fetchItemsHelper()
	],
	name: 'PlantDetails',

	components: {
		ItemPDMsStatisticBlock: () =>
			import('@/components/itemDetails/ItemPDMsStatisticBlock.vue'),

		ProductionLinesList: () => import('@/views/ProductionLines/ItemsList.vue'),
		MachinesList: () => import('@/views/Machines/ItemsList.vue'),
		AssetsList: () => import('@/views/Assets/ItemsList.vue'),
		EquipmentsLayout: () => import('@/views/Equipments/EquipmentsLayout.vue'),
		MaintenanceListWrapper: () =>
			import('@/components/itemDetails/MaintenanceListWrapper.vue'),
		Counters: () => import('./Counters.vue')
		/*ROIStatisticsContainer: () =>
			import('@/views/SuccessDashboard/MainDashboard/ROIStatisticsContainer.vue')*/
	},

	props: {
		plantItem: { type: Object, required: true },
		additionalModalSettings: Object
	},

	data() {
		return {
			// imgPreviewOpen: false,
			// currentImageId: null,
			// imagesList: [],

			meetingTrackerLoading: false,
			meetingTrackersList: [],

			recommendedActionsTitle: '',
			recommnendedActionsVisible: false,
			recommnendedActionsItemsList: []
		};
	},

	computed: {
		...mapState({
			filters: state => state.plants.statistics_filters,
			production_linesFilters: state => state.production_lines.filters,
			utilitiesFilters: state => state.production_lines.utility_filters,
			machinesFilters: state => state.machines.filters,
			assetsFilters: state => state.assets.filters,
			// equipmentsFilters: state => state.equipments.filters,

			authUser: state => state.auth.authUser
		}),

		// hasAccessMap: that => that.$store.getters['auth/hasAccessMap'],
		// hasAccessTo: that => that.$store.getters['auth/hasAccessTo'](['create-controller']),

		/*Data_Driven_Recommended_Actions_text: that => that.tt('phrases.data_driven_recommended_actions'),
		Data_Driven_Issues_Resolved_text: that => that.tt('phrases.data_driven_issues_resolved'),*/

		itemsName() {
			return {
				one: this.$t('Plant'),
				mult: this.$t('Plants')
			};
		},

		instanceDataKey: () => 'plantItem',
		instanceViewName: () => 'Plants',

		PRODUCTION_LINES_TYPES: () => PRODUCTION_LINES_TYPES,

		// instanceViewName: () => 'ProductionLines',

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

		navbarSettings() {
			// const { plantItem } = this;
			// if (plantItem) {
			return Object.freeze({
				// showStandardNavItem: true,
				showFilter: true,
				showCompareButton: true,
				datepickerSettings: {
					label: `${this.tt('phrases.statistics_for_period')}:`,
					setFiltersAction: 'plants/set_statistics_filters',
					filtersState: 'plants.statistics_filters'
				}
			});
			// }

			// return {};
		},

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
						/*meta: {
					fromArray: { subProp: 'name' }
				}*/
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

		createWOButtonFormSetup: () =>
			Object.freeze([{ formKey: 'plant_id', valKey: 'id' }])

		/*dataDrivenRecommendedActions() {
			const { meetingTrackersList } = this;
			let result = {
				last3months: [],
				ydt: [],
				last12months: [],

				ydtResolved: [],
				last3monthsResolved: [],
				last12monthsResolved: []
			};

			if (meetingTrackersList.length) {
				meetingTrackersList.forEach(tracker => {
					const { year: currYear } = decomposeDate();
					const { year } = decomposeDate(tracker.created_at);
					const newActions = tracker.recommended_actions.map(ai => ({
						...ai,
						trackerDate: tracker.created_at
					}));

					if (year) {
						let last3months = getDateRange('last_3_months');
						if (Date.parse(last3months[0]) < Date.parse(tracker.created_at)) {
							result.last3months = mergeArrays(result.last3months, newActions);
							result.last3monthsResolved = mergeArrays(
								result.last3monthsResolved,
								newActions.filter(li => li.is_completed)
							);
						}
						if (year == currYear) {
							result.ydt = mergeArrays(result.ydt, newActions);
							result.ydtResolved = mergeArrays(
								result.ydtResolved,
								newActions.filter(li => li.is_completed)
							);
						}
						result.last12months = mergeArrays(result.last12months, newActions);
						result.last12monthsResolved = mergeArrays(
							result.last12monthsResolved,
							newActions.filter(li => li.is_completed)
						);
					}
				});

				// console.log(allRecommendedActions)
			}

			return Object.freeze(result);
		},*/
	},

	methods: {
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

		/*fetchMeetingTrackers() {
			const daterange = getDateRange('last_12_months', {
				getDateString: true
			});

			this.doFetchAction(
				'fetch_meeting_trackers',
				'meetingTrackersList',
				'meetingTrackerLoading',
				{
					params: {
						max: -1,
						plantId: this.plantItem.id,
						...prepareRangeParams(daterange)
					}
				}
			);
		},*/

		/*openRecommendedActionsModal(actions, title) {
			let settings = {
				show: true,
				editModalProp: 'editModalClassic',
				modalClassName: 'fixed-header-footer small-header small-footer',
				componentPath: 'SuccessDashboard/MeetingTracker/RecommendedActionsList',
				title: title,
				hideFooter: true,
				hideSubmitButtons: true,
				instanceData: actions
			};

			// console.log('1', settings)
			this.show_edit_modal(settings);
		}*/
	},

	beforeMount() {
		this.setup_navbar(this.navbarSettings);

		/*if (this.hasPermissions) {
			this.fetchMeetingTrackers();
		}*/
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
	},

	/*mounted() {
		window.testEndTime();
	},*/

	beforeDestroy() {
		/*if (!this.preventDestroyNavbar) {
			this.setup_navbar({});
		}*/
	}
};
</script>
