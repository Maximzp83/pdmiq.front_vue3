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
										:blockTitle="`${tt('Machine')} ${tt('details')}`"
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
										showMockSrc="/static/img/machine_mock.jpg"
										mockClass="machine"
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
									<AssetsList
										@event="handleEventNew"
										preventSetNavbar
										hideDropdownFilterbar
										disableDraggingFeature
										fromDashboard
										fromDetailsPage
										showCardHeader
										:propsFilters="itemsListsFilters"
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
	name: 'MachineDetailsPage',

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		ItemInfoBlock: () => import('@/components/itemDetails/ItemInfoBlock.vue'),
		ItemImagesBlock: () => import('@/components/itemDetails/ItemImagesBlock.vue'),
		ItemPDMsStatisticBlock: () =>
			import('@/components/itemDetails/ItemPDMsStatisticBlock.vue'),
		ItemWOStatisticBlock: () =>
			import('@/components/itemDetails/ItemWOStatisticBlock.vue'),
		// ImagePreviewModal: () => import('@/components/common/ImagePreviewModal.vue'),

		AssetsList: () => import('@/views/Assets/ItemsList.vue'),
		EquipmentsLayout: () => import('@/views/Equipments/EquipmentsLayout.vue'),
		MaintenanceListWrapper: () =>
			import('@/components/itemDetails/MaintenanceListWrapper.vue')
		// TabsBar: () => import('@/components/common/TabsBar.vue'),
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
			filters: state => state.machines.statistics_filters,
			authUser: state => state.auth.authUser
		}),

		itemsName() {
			return {
				one: this.$t('Machine'),
				mult: this.$t('Machines')
			};
		},

		instanceViewName: () => 'Machines',

		itemsListsFilters: that =>
			Object.freeze({
				machineId: that.itemData.id
			}),

		navbarSettings() {
			const { itemData } = this;
			if (itemData) {
				return Object.freeze({
					showStandardNavItem: true,
					pageTitle: itemData.name || this.$t('phrases.machine_without_name'),
					showCompareButton: true,
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

		predefinedFilters: that =>
			Object.freeze({
				machineId: that.itemData.id,
				productionLineId: that.itemData.production_line_id,
				plantId: that.itemData.plant_id
			}),

		mainInfoSettingsList: that =>
			Object.freeze(
				that.$translate([
					{
						prop: 'productionLine.name',
						label: 'production_Line'
					},
					{
						prop: 'locations',
						label: 'Locations',
						meta: {
							fromArray: { subProp: 'name' }
						}
					},
					{
						prop: 'application.name',
						label: 'Application'
					}
				])
			),

		countersSettings: that =>
			Object.freeze({
				filter: { key: 'machineId', valueProp: 'id' },
				items: that.$translate([
					// { title: 'Machines', count:'machines_count', iconName: 'machines' },
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
						sectionClass: '.equipments-layout'
					}
				])
			}),

		createWOButtonFormSetup: () =>
			Object.freeze([
				{ formKey: 'production_line_id', valKey: 'production_line_id' },
				{ formKey: 'machine_id', valKey: 'id' }
			])
	},

	methods: {
		...mapActions({
			fetch_item: 'machines/fetch_machine',
			show_edit_modal: 'show_edit_modal',
			set_filters: 'machines/set_statistics_filters'
		})
	}
};
</script>
