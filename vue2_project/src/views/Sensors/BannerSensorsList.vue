<template>
	<div :class="['view-wrapper view-list-wrapper']">
		<div :class="[{'mcontainer': !insideOtherPage}]">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div :class="[{'view-content-card card content-row': !insideOtherPage}]">
				<div :class="[{'card-content': !insideOtherPage}]">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideCreate
						hideDelete
						searchbarClass="ml-auto"
						:actionButtons="actionButtons"
					/>

					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:itemsSaving="rebaselineLoading"
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

		<FFTRequestBlock
			@onSocketSuccess="refetchItemsList"
			ref="FFTRequestBlock"
			:sensorData="sensorDataForFFT"
			:isSending.sync="sendingFFTRequest"
		/>
	</div>
</template>

<script>
/*import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);*/

import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	navigation,
	exportListToFileMixin,
	RebaselineRequestMixin,
	actionButtonsMixin
} from '@/mixins';
import { DATASET, rebase_lines,	rebase_wheel, itemSpeedOptionsList } from '@/constants/global';

import { cloneDeep, findItemBy } from '@/helpers';

import {
	// setupBatteryChargeCell,
	setupConnectionStrengthCell
} from '@/helpers/specialHelpers';
// import { SENSOR_TYPES, /*dataSetsList*/ } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), exportListToFileMixin(), RebaselineRequestMixin(), actionButtonsMixin()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		FFTRequestBlock: () => import('./FilterBlock/FFTRequestBlock.vue')
	},

	props: {
		insideOtherPage: Boolean
	},

	data: () => ({
		sendingFFTRequest: false,
		sensorDataForFFT: null,
		rebaselineLoading: false,
	}),

	computed: {
		...mapState({
			filters: state => state.sensors.filters,
			equipmentsFilters: state => state.equipments.filters,
			authUser: state => state.auth.authUser,
			access_token: state => state.auth.access_token
		}),

		hasAccesToCreate: that => that.$hasAccessTo(['create_dashboard']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_dashboard']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_dashboard']),

		predefinedFilters: () =>
			Object.freeze({
				// type: SENSOR_TYPES.BANNER,
				orderByColumn: 'port_number',
				orderByMethod: 'asc',
				plantId: null
			}),

		/*actionButtons() {
			return Object.freeze([
				{
					id: 5,
					text: this.$t('Export'),
					event: 'handleExportToExel',
					without_icon: true,
					className: 'inverted'
				}
			]);
		},*/

		actionButtons() {
			// const { authUser } = this;
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push({
					id: 1,
					text: 'Add',
					event: 'createItem'
					// args: { path: '/new' }
				});
			}
			if (this.hasAccesToDelete) {
				actions.push({
					id: 2,
					text: 'Delete',
					isDelete: true,
					event: 'handleDeleteItems'
				});
			}

			return Object.freeze(this.$translate(actions, { key: 'text' }));
		},

		/*navbarSettings() {
			return {
				showFilter: false,
				pageTitle: this.$t('Sensors')
			};
		},*/
		
		itemsName() {
			return {
				one: `Banner ${this.$t('Sensor')}`,
				mult: `Banner ${this.$t('Sensors')}`,
				instanceName: 'sensors'
			};
		},

		hasBannerV2Sensors() {
			if (this.itemsList.length) {
				return this.itemsList.some(sensor => {
					return sensor.data_set === DATASET.BANNER_TEMP_VIBE_V2 || sensor.data_set === DATASET.BANNER_V2_GENERIC;
				});
			}
			return false;
		},

		editInModal: () => true,

		localModalSettings() {
			return {
				componentPath: 'Sensors/sensorForm/BannerSensorItemWrapper',
				single: true,
				additionalModalSettings: {
					fromSensorsList: true,
					controllerId: this.propsFilters.controllerId
				},
				callback: () => {
					this.refetchItemsList();
					this.show_edit_modal({ show: false });
				}
			};
		},

		// instanceName: () => 'Sensors/sensorForm',
		tableSettings() {
			let settings = {
				tableClass: 'controller-devices-table',
				columns: [
					{
						label: 'Location',
						prop: 'location_in_equipment'
					}
				],
				operations: {
					actions: [
						
						/*{
							name: 'handleShowStatistics',
							type: 'success',
							icon: 'icomoon icon-graphic',
							tooltip_text: 'Graphs'
						}*/
					]
				}
			};

			if (this.hasBannerV2Sensors) {
				settings.columns.push({
					label: `${this.tt('device')} id`,
					prop: 'device_address_id',
					skipTranslate: true,
				},
				{
					label: `${this.tt('sensor')} id`,
					skipTranslate: true,
					prop: 'fft_sensor_id'
				})
			}

			settings.columns.push(
				{
					label: 'Asset',
					prop: 'equipment.asset.name',
					min_width: 100,
					meta: {
						action: {
							name: 'handleAssetClick',
							className: 'table-link info-color',
							button_text_prop: 'equipment.asset.name',
							disablePopover: true,
							conditionSettings: {
								conditions: [
									{ prop: 'equipment.asset.id', method: '!=', control_value: null }
								]
							}
						}
					}
				},
				{
					label: 'RPM',
					prop: ' ',
					// width: 76,
					meta: {
						cell_class: 'text-center',
						prepareValue: {
							localMethod: this.setupRPMcell,
							useAllInstanceData: true
						}
					}
				},
				/*{
					label: 'Item',
					prop: 'equipment.asset.name',
					min_width: 100
				},*/
				/*{
					label: 'Type',
					prop: 'equipment.equipmentType.name'
				},*/
				{
					label: 'FW',
					prop: 'device_data.SenFwVer',
					skipTranslate: true,
					width: 76,
					meta: {
						cellComponent: {
							componentPath: 'views/Sensors/SensorFirmwareStatusCell'
						}
					},
				},					
				{
					label: 'Status',
					prop: 'rssi',
					width: 76,
					meta: {
						cell_class: 'text-center',
						prepareValue: {
							localMethod: setupConnectionStrengthCell,
							args: {
								noSignalForInactive: 1,
								onSignalForActive: 1
								// isArchivedIcon: 1,
								// controllerOfflineIcon: 1
							},
							useAllInstanceData: true
						}
					}
				},
				{
					label: 'Chart',
					width: 55,
					meta: {
						action: {
							linkSettings: {
								linkRoute: 'equipments/:equipment_id/details/pdm/:id',
							},
							className: 'el-button action-button sensor-statistics-button gray mini',
							icon: 'icomoon icon-chart3',
							disablePopover: true
						}
					}
				},
			)

			settings.columns = this.$translate(settings.columns);

			if (this.$hasAccessTo(['edit_dashboard'])) {
				settings.operations.actions.push(
					{
						name: 'makeFFTrequest',
						// type: 'secondary',
						// icon: 'icomoon icon-fft',
						tooltip_text: 'fft',
						conditionSettings: {
							conditions: [
								{
									prop: 'data_set',
									array_method: 'some',
									control_value: [
										DATASET.NCD_ALL_IN_ONE_TEMP_VIBE,
										DATASET.NCD_WIRED_TEMP_VIBE,
										DATASET.NCD_TEMP_VIBE_CURRENT,
										DATASET.BANNER_TEMP_VIBE_V2,
										DATASET.BANNER_TEMP_VIBE_V2_1
									],
								},
								/*{
									prop: 'lastWorkerFFTRequest.remaining_action_time',
									method: '<',
									control_value: 1
								}*/
							]
						},
						buttonContent: {
							component: {
								componentPath: 'views/Sensors/SensorFFTRequestButton'
							}
						}
					},
					{
						name: 'makeRebaseline',
						tooltip_text: 'rebaseline',
						className: 'rebaselineButton',
						img: rebase_wheel,
						second_img: rebase_lines,
						conditionSettings: {
							conditions: [
								{
									prop: 'data_set',
									method: '!=',
									control_value: [
										DATASET.NCD_ENVIRONMENTAL,
										DATASET.HUMIDITY,
									],
								}
							]
						}
					},
					standardTableOperations.edit
					// standardTableOperations.delete
				);
			}

			if (this.$hasAccessTo(['delete_dashboard'])) {
				settings.operations.actions.push(
					standardTableOperations.delete
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
			delete_item: 'sensors/delete_sensor',
			show_edit_modal: 'show_edit_modal',
			set_filters: 'sensors/set_sensors_filters',
			set_equipments_filters: 'equipments/set_equipments_filters',

			sensor_rebase_line: 'sensors/sensor_rebase_line',
			// save_pump: 'ultrasound_pumps/save_ultrasound_pump'
		}),

		/*createItem() {
			this.editItem({ row: {id:'new'} });
		},*/

		/*editItem({ row }) {
			this.changeRoute({ path: `/banner-sensors/${row.id}` });
		},*/

		setupRPMcell(sensor) {
			const { rpmSources, equipment } = sensor;
			if (rpmSources && equipment) {
				const option = findItemBy('id', equipment.rpm_source_item, itemSpeedOptionsList());

				if (option) {
					return `${option.name} - ${rpmSources[option.source_key]}`;
				}
			}

			return ''
		},

		handleAssetClick({row}) {
			// console.log(e)
			let newFilters = {
				...this.equipmentsFilters,
				page: 1,
				isShowList: true,
				assetId: row.equipment.asset.id
			};
			this.set_equipments_filters(newFilters);
			this.changeRoute({path: '/dashboard/plant', query: 'scrollTo=.equipments-layout'});
		},

		makeFFTrequest({row}) {
			if (!row.is_fft_processing) {
				this.sensorDataForFFT = cloneDeep(row);
				// console.log(this.$refs.FFTRequestBlock, this.$refs)
				setTimeout(() => {
					this.$refs.FFTRequestBlock.confirmFFTRequest();
				}, 50);				
			}
		},

		makeRebaseline({row}) {
			this.sensorData = cloneDeep(row);
			this.click_re_baseline();
		},

		/*handleExportToExel() {
			this.handleExportItem({
				url: 'sensors/export',
				skipDaterange: true,
				filters: {
					...this.globalFilters,
					...this.filters,
					...this.predefinedFilters
				}
			});
		}*/

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
