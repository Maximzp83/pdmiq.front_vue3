<template>
	<div class="details-page fix-height main-instance-item">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper" v-if="loadContent">
			<div class="mcontainer">
				<div class="nested-view-content-wrapper">
					<div class="view-content-card">
						<div class="section-row header-block">
							<div class="card">
								<div class="card-content flex">
									<!-- <div class="filter-item"> -->
									<Datepicker
										setupDaterangeFilter
										enableShortcuts
										@input="
											range =>
												set_filters({
													...filters,
													daterange: range,
													daterange_setted_at: Date.now()
												})
										"
										:value="filters.daterange"
										clearingTo="last_7_days"
										type="daterange"
									/>
									<!-- </div> -->

									<el-button
										v-if="$hasAccessTo(['edit_dashboard'])"
										@click="editItem"
										type="tertiary"
										class="ml-auto action-button vertical-fluid"
										icon="icomoon icon-pencil"
									/>
								</div>
							</div>
						</div>

						<div class="section-row">
							<div class="mrow flex wrap big-padding">
								<div class="mcol-xs-12 mcol-lg-6">
									<ItemInfoBlock
										:blockTitle="tt('phrases.Production_Line_details')"
										dotsInText
										:itemData="itemData"
										:settingsList="mainInfoSettingsList"
										:countersSettings="countersSettings"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemImagesBlock
										@event="handleEventNew"
										:itemData="itemData"
										showMockSrc="/static/img/prod_line_mock.jpg"
										mockClass="prod-line"
									/>
								</div>

								<div class="mcol-xs-12 mcol-lg-6">
									<ItemPDMsStatisticBlock
										@event="handleEventNew"
										:itemData="itemData"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
										:chartLegendEvents="chartLegendEvents"
									/>
								</div>

								<div
									class="mcol-xs-12 mcol-lg-6"
									v-if="$hasAccessTo(['view_maintenance'])"
								>
									<ItemWOStatisticBlock
										:createWOButtonFormSetup="createWOButtonFormSetup"
										@event="handleEventNew"
										:itemData="itemData"
										:filters="filters"
										:predefinedFilters="predefinedFilters"
									/>
								</div>

								<div class="mcol-xs-12">
									<MachinesList
										@event="handleEventNew"
										preventSetNavbar
										hideDropdownFilterbar
										disableDraggingFeature
										fromDashboard
										fromDetailsPage
										showCardHeader
										:propsFilters="itemsListsFilters"
										:plantId="predefinedFilters.plantId"
									/>
								</div>

								<div class="mcol-xs-12">
									<AssetsList
										@event="handleEventNew"
										preventSetNavbar
										hideDropdownFilterbar
										disableDraggingFeature
										fromDashboard
										fromDetailsPage
										showCardHeader
										:propsFilters="itemsListsFilters"
										:plantId="predefinedFilters.plantId"
									/>
								</div>

								<div class="mcol-xs-12">
									<EquipmentsLayout
										ref="EquipmentsLayout"
										@event="handleEventNew"
										hideDropdownFilterbar
										hideDatepicker
										disableDraggingFeature
										fromDashboard
										fromDetailsPage
										showCardHeader
										preventSetNavbar
										:propsFilters="itemsListsFilters"
										:plantId="predefinedFilters.plantId"
									/>

									<!-- <EquipmentsList
										@event="handleEventNew"
										preventSetNavbar
										hideDropdownFilterbar
										disableDraggingFeature
										fromDashboard
										fromDetailsPage
										showCardHeader
										:propsFilters="itemsListsFilters"
										:plantId="predefinedFilters.plantId"
									/> -->
								</div>

								<MaintenanceListWrapper
									v-if="$hasAccessTo(['view_maintenance'])"
									ref="MaintenanceListWrapper"
									hideDatepicker
									:woFilters="woFilters"
									:logFilters="logFilters"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- <div v-else class="text-center">This asset has not equipments</div> -->
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapActions, mapState } from 'vuex';
// import { getObjectVal } from '@/helpers';

import {
	initPageDataMixin,
	tabsMixin,
	eventHandler,
	mainInstanceDetailsPage
} from '@/mixins';

export default {
	mixins: [
		initPageDataMixin(),
		tabsMixin(),
		eventHandler(),
		mainInstanceDetailsPage()
	],
	name: 'ProductionLineDetailsPage',

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		ItemInfoBlock: () => import('@/components/itemDetails/ItemInfoBlock.vue'),
		ItemImagesBlock: () => import('@/components/itemDetails/ItemImagesBlock.vue'),
		ItemPDMsStatisticBlock: () =>
			import('@/components/itemDetails/ItemPDMsStatisticBlock.vue'),
		ItemWOStatisticBlock: () =>
			import('@/components/itemDetails/ItemWOStatisticBlock.vue'),

		MachinesList: () => import('@/views/Machines/ItemsList.vue'),
		AssetsList: () => import('@/views/Assets/ItemsList.vue'),
		EquipmentsLayout: () => import('@/views/Equipments/EquipmentsLayout.vue'),
		MaintenanceListWrapper: () =>
			import('@/components/itemDetails/MaintenanceListWrapper.vue')
	},

	data() {
		return {
			imgPreviewOpen: false,
			currentImageId: null,
			imagesList: []
		};
	},

	computed: {
		...mapState({
			filters: state => state.production_lines.statistics_filters,
			authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Production_Line'),
				mult: this.$t('Production_Lines')
			};
		},

		instanceViewName: () => 'ProductionLines',

		predefinedFilters: that =>
			Object.freeze({
				productionLineId: that.itemData.id,
				plantId: that.itemData.plant_id
			}),

		itemsListsFilters: that =>
			Object.freeze({
				productionLineId: that.itemData.id
			}),

		navbarSettings() {
			const { itemData } = this;
			if (itemData) {
				return Object.freeze({
					showStandardNavItem: true,
					showCompareButton: true,
					pageTitle: itemData.name || this.$t('phrases.production_line_without_name'),
					showPlantName: { 
						id: itemData.plant ? itemData.plant.id : '',
						name: itemData.plant ? itemData.plant.name : ''
					}
				});
			}

			return {};
		},

		tabsList: that =>
			Object.freeze(
				that.$translate([
					{ title: 'WORK_ORDERS', prop: 'woTab' },
					{ title: 'MAINTENANCE_LOGS', prop: 'logsTab' }
				])
			),

		mainInfoSettingsList: that =>
			Object.freeze([
				{
					prop: 'locations',
					label: that.$t('Locations'),
					meta: {
						fromArray: { subProp: 'name' }
					}
				}
			]),

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
			Object.freeze([{ formKey: 'production_line_id', valKey: 'id' }])
	},

	methods: {
		...mapActions({
			fetch_item: 'production_lines/fetch_production_line',
			show_edit_modal: 'show_edit_modal',
			set_filters: 'production_lines/set_statistics_filters'
		})
	}
};
</script>
