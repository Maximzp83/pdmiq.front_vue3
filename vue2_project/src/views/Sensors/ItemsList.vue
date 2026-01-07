<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:actionButtons="actionButtons"
					/>

					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/>

					<!-- <ItemsTableContainer
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/> -->

					<PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	navigation
	// additionalActionsMixin,
	// nullifyLubeCountMixin
} from '@/mixins';
import { validateBySettings } from '@/helpers';

import {
	not_wifi_icon,
	rebase_wheel,
	rebase_lines,
	sensor_broken_icon,
	lube_level_low,
	lube_level_normal,
	SENSOR_TYPES
} from '@/constants/global';
// import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		navigation()
		// additionalActionsMixin,
		// nullifyLubeCountMixin
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),

		// ItemsTableContainer: () => import('@/components/ItemsTableContainer.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.sensors.filters,
			authUser: state => state.auth.authUser
		}),

		actionButtons() {
			const { authUser } = this;

			// let buttons = [];
			let buttons = [
				{
					id: 1,
					text: 'Banner',
					event: 'createItem',
					args: { path: '/new' },
					permissions: ['create_controllers']
				},
				{
					id: 2,
					text: 'UltraSound',
					event: 'createItem',
					args: { path: '/new_ultra_sound' },
					permissions: ['create_controllers']
				},
				/*{
					id: 3,
					text: 'OEE',
					event: 'createItem',
					args: { path: '/new_count' },
					conditionSettings: bannerRules
				},*/
				{
					id: 4,
					text: 'Delete',
					event: 'handleDeleteItems',
					isDelete: true,
					permissions: ['delete_controllers']
				}
			];

			return this.$translate(
				buttons.filter(bi => {
					if (bi.conditionSettings) {
						return validateBySettings({
							...bi.conditionSettings,
							dataObj: authUser
						});
					}
					return true;
				}),
				{ key: 'text' }
			);
		},

		navbarSettings() {
			return {
				showFilter: true,
				pageTitle: this.$t('Sensors')
			};
		},

		itemsName() {
			return {
				one: this.$t('Sensor'),
				mult: this.$t('Sensors'),
				instanceName: 'sensors'
			};
		},

		tableSettings() {
			return {
				columns: this.$translate([
					/*{	width: '1px',
						prop: 'is_re_baseline_process',
						label: '',
						meta: { 
							cell_class: 're-baseline-sign-cell',
							emptyText: '',
							// displayByCondition: {prop: 'is_re_baseline_process'}, 
							boolean: {
								trueVal: 'Re-Baseline',
								falseVal: 'Re-Baseline'
							}
						}
					},*/
					{
						min_width: '100px',
						prop: 'equipment.machine_name',
						label: 'Machine_name',
						sortable: true,
						additionalData: {
							prop: 'lube_method',
							type: 'tags',
							condition_options: {
								condition_1: {
									prop: 'type',
									value: SENSOR_TYPES.ULTRA_SOUND,
									condition: '=='
								}
							},
							meta: {
								getItemValue: { prop: 'table_label', listName: 'lubeMethodsList' }
							}
						},
						meta: {
							sortBy: 'machine_name',
							emptyText: this.tt('no_name'),
							// icon: {name:'icon-not-wifi', conditionProp:'is_inactive'},
							imgs: [
								{ src: not_wifi_icon, conditionProp: 'is_inactive' },
								{
									src: lube_level_low,
									conditionProp: 'is_lube_low_level',
									condition_options: {
										condition_1: {
											prop: 'type',
											value: SENSOR_TYPES.ULTRA_SOUND,
											condition: '=='
										}
									},
									onClick: { eventName: 'nullifyLubeCount' }
								},
								{
									src: lube_level_normal,
									conditionProp: 'is_lube_low_level',
									condition_options: {
										condition_1: {
											prop: 'type',
											value: SENSOR_TYPES.ULTRA_SOUND,
											condition: '=='
										},
										invert_primary_result: true
									},
									onClick: { eventName: 'nullifyLubeCount' }
								},
								{
									src: rebase_wheel,
									conditionProp: 'is_re_baseline_process',
									class: 'rebase-wheel'
								},
								{
									src: rebase_lines,
									conditionProp: 'is_re_baseline_process',
									class: 'rebase-lines'
								},
								{ src: sensor_broken_icon, conditionProp: 'has_anomaly' }
							]
						}
					},
					/*{
						prop: 'equipment.equipment_type',
						label: 'Type',
						sortable: true,
						meta: {
							sortBy: 'item_type',
							cell_class: 'capitalize',
							getItemValue: { prop: 'name', listName: 'equipmentTypesList' }
						}
					},*/
					{
						prop: 'equipment.asset_number',
						label: 'Asset_Number',
						sortable: true,
						meta: { sortBy: 'asset_number' }
					},
					{
						prop: 'equipment.location_name',
						label: 'Location',
						sortable: true,
						meta: { sortBy: 'location_name' }
					},
					{
						prop: 'equipment.loc_in_machine',
						label: 'Location_on_machine',
						sortable: true,
						meta: { sortBy: 'loc_in_machine', emptyText: '-' }
					},
					{
						prop: 'equipment.production_line_name',
						label: 'Production_line',
						sortable: true,
						meta: { sortBy: 'production_line_name', emptyText: '-' }
					},
					/*{ prop: 'controller', label: 'Controller', sortable: true, meta: { child: 'name', sortBy: 'name' } },*/
					{
						min_width: '100px',
						prop: 'controller.name',
						label: 'Controller',
						sortable: true,
						meta: { sortBy: 'controllerName' }
					},
					/*{ prop: 'controller.name', label: 'Controller', sortable: true, meta: { sortBy: 'controllerName' } },*/
					{
						width: '80px',
						prop: 'pump.radio.position',
						props: ['port_number'],
						label: 'Node',
						sortable: true,
						meta: { emptyText: ' - ' }
					}
				]),
				operations: {
					actions: this.$translate(
						[
							{
								name: 'handleShowStatistics',
								type: 'success',
								icon: 'icomoon icon-graphic',
								tooltip_text: 'Graphs'
							},
							{
								name: 'editItem',
								type: 'success',
								icon: 'icomoon icon-pencil',
								tooltip_text: 'Edit'
							},
							{
								name: 'handleDeleteItems',
								type: 'danger',
								icon: 'icomoon icon-cross',
								tooltip_text: 'Delete'
							}

							// standardTableOperations.edit,
							// standardTableOperations.delete
						],
						{ key: 'tooltip_text' }
					)
				}
			};
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'sensors/fetch_sensors',
			delete_item: 'sensors/delete_sensor',

			set_filters: 'sensors/set_sensors_filters',
			save_pump: 'ultrasound_pumps/save_ultrasound_pump'
		}),

		handleShowStatistics({ row }) {
			this.changeRoute({ path: `/${row.id}/statistics`, addToCurrent: true });
			// console.log(rowData)
		}
	}
};
</script>
