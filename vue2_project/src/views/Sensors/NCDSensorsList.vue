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
						hideCreate
						hideDelete
						searchbarClass="ml-auto"
					/>

					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						disableSelection
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/>

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
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	navigation,
	exportListToFileMixin
} from '@/mixins';
import { findItemBy } from '@/helpers';

import {
	setupBatteryChargeCell,
	setupConnectionStrengthCell
} from '@/helpers/specialHelpers';
import { SENSOR_TYPES, dataSetsList } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), exportListToFileMixin()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.sensors.filters,
			authUser: state => state.auth.authUser,
			access_token: state => state.auth.access_token
		}),

		predefinedFilters: () =>
			Object.freeze({
				type: SENSOR_TYPES.NCD,
				orderByColumn: 'port_number',
				orderByMethod: 'asc'
			}),

		actionButtons() {
			return Object.freeze([
				{
					id: 5,
					text: this.$t('Export'),
					event: 'handleExportToExel',
					without_icon: true,
					className: 'inverted'
				}
			]);
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
			let settings = {
				columns: this.$translate([
					{
						label: 'Node',
						prop: 'port_number',
						width: 65
					},
					{
						label: 'phrases.Machine_Name',
						prop: 'equipment.asset.machine.name',
						min_width: 150
					},
					{
						label: 'phrases.Asset_Name',
						prop: 'equipment.asset.name',
						min_width: 100
					},
					{
						label: 'Type',
						prop: 'equipment.equipmentType.name'
					},
					{
						label: 'Location',
						prop: 'location_in_equipment'
					},
					{
						label: 'MAC_Address',
						prop: 'mac_address',
						min_width: 180,
						meta: {
							cellComponent: {
								componentPath: 'views/Sensors/SensorTypeTableCell'
							}
						},
						payload: { isMacAddress: true }
					},
					{
						label: 'Sensor_Type',
						prop: 'type',
						min_width: 140,
						meta: {
							cellComponent: {
								componentPath: 'views/Sensors/SensorTypeTableCell'
							}
						},
						payload: {
							dataSetsList: dataSetsList(),
							findItemBy,
							isDataset: true
						}
						/*conditionSettings: {
							conditions: [
								{ prop: 'ncd_data_set', method: '==', control_value_prop: 'data_set' }
							]
						},*/
					},
					{
						label: 'Battery_Charge',
						prop: 'battery_voltage',
						width: 56,
						meta: {
							cell_class: 'text-center',
							prepareValue: { localMethod: setupBatteryChargeCell }
						}
					},
					{
						label: 'Connection_Strength',
						prop: 'rssi',
						width: 76,
						meta: {
							cell_class: 'text-center',
							prepareValue: {
								localMethod: setupConnectionStrengthCell,
								args: {
									noSignalForInactive: 1,
									isArchivedIcon: 1,
									controllerOfflineIcon: 1
								},
								useAllInstanceData: true
							}
						}
					}
				]),
				operations: {
					actions: [
						{
							name: 'handleShowAdditionalDetails',
							type: 'success',
							icon: 'icomoon icon-dots',
							tooltip_text: 'phrases.additional_details'
						},
						{
							name: 'handleShowStatistics',
							type: 'success',
							icon: 'icomoon icon-graphic',
							tooltip_text: 'Graphs'
						}
					]
				}
			};

			if (this.$hasAccessTo(['edit_dashboard'])) {
				settings.operations.actions.push(
					standardTableOperations.edit
					// standardTableOperations.delete
				);
			}

			settings.operations.actions = this.$translate(settings.operations.actions, {
				key: 'tooltip_text'
			});

			return Object.freeze(settings);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'sensors/fetch_sensors',
			// delete_item: 'sensors/delete_sensor',
			show_edit_modal: 'show_edit_modal',
			set_filters: 'sensors/set_sensors_filters'
			// save_pump: 'ultrasound_pumps/save_ultrasound_pump'
		}),

		handleShowAdditionalDetails({ row }) {
			this.show_edit_modal({
				show: true,
				instanceData: row,
				title: `${this.$t('phrases.Additional_Details')}:`,
				editModalProp: 'editModalClassic',
				modalClassName:
					'fixed-header-footer small-header small-footer moderate-paddings',
				componentPath: 'Sensors/sensorForm/AdditionalDetailsNCD',
				hideSubmitButtons: true,
				footerActions: [
					{
						name: 'submitForm',
						button_text: this.$t('SAVE'),
						disablePopover: true,
						type: 'primary',
						className: 'item-action-button'
					},
					{
						name: 'handleCloseEditModal',
						button_text: this.$t('CANCEL'),
						disablePopover: true,
						callInRoot: true,
						className: 'item-action-button'
					}
				],
				callback: this.refetchItemsList
			});
		},

		handleShowStatistics({ row }) {
			this.changeRoute({
				path: `equipments/${row.equipment_id}/details/pdm/${row.id}`
			});
		},

		handleExportToExel() {
			this.handleExportItem({
				url: 'sensors/export',
				skipDaterange: true,
				filters: {
					...this.globalFilters,
					...this.filters,
					...this.predefinedFilters
				}
			});
		}

		/*setupBatteryChargeCell(battery_voltage) {
			let src;

			if (battery_voltage) {
				switch(true) {
					case battery_voltage < NCD_BATTERY_VOLTAGE_TYPES.MODERATE: src = voltage_icon_1; break;
					case battery_voltage < NCD_BATTERY_VOLTAGE_TYPES.HIGH: src = voltage_icon_2; break;
					case battery_voltage >= NCD_BATTERY_VOLTAGE_TYPES.HIGH: src = voltage_icon_3; break;
					default: null;
				}
			}
			return src ? `<span class="table-cell-icon battery-icon"><img src=${src} /></span>` : '-';
		},

		setupConnectionStrengthCell(strength) {
			let src = signal_icon_0;
			// console.log(signal_icon_0)
			let background = false;

			if (strength) {
				background = true;

				switch(true) {
					case strength > NCD_RSSI_TYPES.HIGH: src = signal_icon_1; break;
					case strength >= NCD_RSSI_TYPES.MODERATE: src = signal_icon_2; break;
					case strength >= NCD_RSSI_TYPES.LOW: src = signal_icon_3; break;
					default: null;
				}
			}
			return `<span 
								class="table-cell-icon signal-icon ${background ? 'background' : ''}"
							>
								<img src=${src} />
							</span>`;
		}*/
	},

	watch: {
		'globalFilters.plantId'() {
			this.preventFetch = true;
			this.setFilters({ controllerId: null });

			if (this.$route.query && Object.keys(this.$route.query).length) {
				this.$router.replace(this.$route.path);
			}
		}
	}
};
</script>
