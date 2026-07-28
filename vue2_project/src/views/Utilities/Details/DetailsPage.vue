<template>
	<div class="details-page fix-height main-instance-item">
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div class="view-wrapper item-page-wrapper" v-if="loadContent">
			<div class="mcontainer">
				<div class="nested-view-content-wrapper">
					<div class="view-content-card">
						<div class="content-row header-block">
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

						<div class="content-row mrow flex wrap big-padding">
							<div class="mcol-xs-12 mcol-lg-6">
								<ItemInfoBlock
									:blockTitle="`${tt('Production_Line')} ${tt('details')}`"
									dotsInText
									:itemData="itemData"
									:settingsList="mainInfoSettingsList"
									:countersSettings="countersSettings"
								/>
							</div>

							<div class="mcol-xs-12 mcol-lg-6">
								<ItemImagesBlock @event="handleEventNew" :itemData="itemData" />
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
									:itemData="itemData"
									:filters="filters"
									:predefinedFilters="predefinedFilters"
								/>
							</div>

							<div class="mcol-xs-12">
								<MachinesList
									preventSetNavbar
									hideDropdownFilterbar
									disableDraggingFeature
									fromDashboard
									showCardHeader
									:propsFilters="itemsListsFilters"
								/>
							</div>

							<div class="mcol-xs-12">
								<AssetsList
									preventSetNavbar
									hideDropdownFilterbar
									disableDraggingFeature
									fromDashboard
									showCardHeader
									:propsFilters="itemsListsFilters"
								/>
							</div>

							<div class="mcol-xs-12">
								<EquipmentsList
									preventSetNavbar
									hideDropdownFilterbar
									disableDraggingFeature
									fromDashboard
									showCardHeader
									:propsFilters="itemsListsFilters"
								/>
							</div>

							<MaintenanceListWrapper
								v-if="$hasAccessTo(['view_maintenance'])"
								:woFilters="woFilters"
								:logFilters="logFilters"
							/>
							<!-- :propsFilters="itemsListsFilters" -->
						</div>
					</div>
				</div>

				<!-- <div v-else class="text-center">This asset has not equipments</div> -->
			</div>
		</div>

		<ImagePreviewModal
			@closeModal="imgPreviewOpen = false"
			:imgDialogOpen="imgPreviewOpen"
			:imgId="currentImageId"
			:pictures="imagesList"
		/>
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapActions, mapState } from 'vuex';
import { MAINTENANCE_TYPES } from '@/constants/global';

import { initPageDataMixin, tabsMixin, eventHandler } from '@/mixins';

export default {
	mixins: [initPageDataMixin(), tabsMixin(), eventHandler()],
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
		EquipmentsList: () => import('@/views/Equipments/ItemsList.vue')
		// WorkOrdersList: () => import('@/views/MaintenanceLogs/ItemsList.vue'),
		// TabsBar: () => import('@/components/common/TabsBar.vue'),
	},

	/*data() {
		return {};
	},*/

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

		woFilters: that =>
			Object.freeze({
				...that.predefinedFilters,
				type: MAINTENANCE_TYPES.WORK_ORDER
			}),
		logFilters: that =>
			Object.freeze({ ...that.predefinedFilters, type: MAINTENANCE_TYPES.LOG }),

		instanceViewName: () => 'ProductionLines',

		itemsListsFilters: that =>
			Object.freeze({
				productionLineId: that.itemData.id
			}),

		navbarSettings() {
			const { itemData } = this;
			if (itemData) {
				return Object.freeze({
					showStandardNavItem: true,
					pageTitle:
						itemData.name || this.$t('phrases.Production_Line_without_name'),
					showPlantName: { 
						id: itemData.plant ? itemData.plant.id : '',
						name: itemData.plant ? itemData.plant.name : ''
					}
				});
			}

			return {};
		},

		tabsList: () =>
			Object.freeze([
				{ title: 'WORK ORDERS', prop: 'woTab' },
				{ title: 'MAINTENANCE LOGS', prop: 'logsTab' }
			]),

		predefinedFilters: that =>
			Object.freeze({
				productionLineId: that.itemData.id,
				plantId: that.itemData.plant_id
			}),

		mainInfoSettingsList: that =>
			Object.freeze(
				that.$translate([
					{
						prop: 'locations',
						label: 'Locations',
						meta: {
							fromArray: { subProp: 'name' }
						}
					}
				])
			),

		countersSettings: that =>
			Object.freeze({
				filter: { key: 'productionLineId', valueProp: 'id' },
				items: that.$translate([
					{ title: 'Machines', count: 'machines_count', iconName: 'machines' },
					{ title: 'Assets', count: 'assets_count', iconName: 'assets' },
					{ title: 'Items', count: 'equipments_count', iconName: 'equipments' }
				])
			})
	},

	methods: {
		...mapActions({
			fetch_item: 'production_lines/fetch_production_line',
			show_edit_modal: 'show_edit_modal',
			set_filters: 'production_lines/set_statistics_filters'
		}),

		editItem() {
			this.show_edit_modal({
				show: true,
				instanceData: this.itemData,
				instanceName: this.instanceViewName,
				itemName: this.itemsName ? this.itemsName.one : '',
				callback: this.successItemSave
			});
		},

		successItemSave() {
			this.initialPageSetup(this.$route);
			this.show_edit_modal({ show: false });
		}
	}
};
</script>
