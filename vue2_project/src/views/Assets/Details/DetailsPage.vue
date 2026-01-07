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
										type="daterange"
										clearingTo="last_7_days"
									/>
									<!-- </div> -->

									<el-button
										v-if="$hasAccessTo(['edit_dashboard'])"
										@click="editItem"
										type="tertiary"
										class="ml-auto action-button"
										icon="icomoon icon-pencil"
									/>
								</div>
							</div>
						</div>

						<div class="section-row">
							<div class=" mrow flex wrap big-padding">
								<div class="mcol-xs-12 mcol-lg-6">
									<ItemInfoBlock
										:blockTitle="`${tt('Asset')} ${tt('details')}`"
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
										imagesListKey="brandModels"
										imgObjFitContain
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
	name: 'AssetDetailsPage',

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		ItemInfoBlock: () => import('@/components/itemDetails/ItemInfoBlock.vue'),
		ItemImagesBlock: () => import('@/components/itemDetails/ItemImagesBlock.vue'),
		ItemPDMsStatisticBlock: () =>
			import('@/components/itemDetails/ItemPDMsStatisticBlock.vue'),
		ItemWOStatisticBlock: () =>
			import('@/components/itemDetails/ItemWOStatisticBlock.vue'),

		EquipmentsLayout: () => import('@/views/Equipments/EquipmentsLayout.vue'),
		MaintenanceListWrapper: () =>
			import('@/components/itemDetails/MaintenanceListWrapper.vue')
	},

	data() {
		return {};
	},

	computed: {
		...mapState({
			filters: state => state.assets.statistics_filters,
			authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Asset'),
				mult: this.$t('Assets')
			};
		},

		instanceViewName: () => 'Assets',

		itemsListsFilters: that =>
			Object.freeze({
				assetId: that.itemData.id
			}),

		navbarSettings() {
			const { itemData } = this;
			if (itemData) {
				return Object.freeze({
					showStandardNavItem: true,
					pageTitle: itemData.name || this.$t('phrases.asset_without_name'),
					showCompareButton: true,
					showPlantName: { name: itemData.plant ? itemData.plant.name : '' }
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

		predefinedFilters: that =>
			Object.freeze({
				productionLineId: that.itemData.machine
					? that.itemData.machine.production_line_id
					: null,
				machineId: that.itemData.machine_id,
				assetId: that.itemData.id,
				plantId: that.itemData.plant_id
			}),

		mainInfoSettingsList: that =>
			Object.freeze(
				that.$translate([
					{
						prop: 'productionLine.name',
						label: 'Production_Line'
					},
					{
						prop: 'machine.name',
						label: 'Machine'
					},
					{
						prop: 'location.name',
						label: 'Location'
					},
					/*{
				prop: 'locations',
				label: 'Locations',
				meta: {
					fromArray: { subProp: 'name' }
				}
			},*/
					{
						label: 'part_numbers',
						prop: 'brandModels',
						meta: {
							fromArray: { subProp: 'name' }
						}
					}
				])
			),

		countersSettings: that =>
			Object.freeze({
				filter: { key: 'assetId', valueProp: 'id' },
				items: [
					{
						title: that.$t('Items'),
						count: 'equipments_count',
						iconName: 'equipments',
						sectionClass: '.equipments-list'
					}
				]
			}),

		createWOButtonFormSetup: () =>
			Object.freeze([
				{ formKey: 'production_line_id', valKey: 'machine.production_line_id' },
				{ formKey: 'machine_id', valKey: 'machine_id' },
				{ formKey: 'asset_id', valKey: 'id' }
			])
	},

	methods: {
		...mapActions({
			fetch_item: 'assets/fetch_asset',
			show_edit_modal: 'show_edit_modal',
			set_filters: 'assets/set_statistics_filters'
		})
	}
};
</script>
