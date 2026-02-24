<template>
	<div class="view-wrapper view-list-wrapper equipments-list pt-0">
		<!-- <div class="mcontainer"> -->
		<!-- <button @click="state_pusherCallback(mockCountersData)">update counters</button> -->

		<div
			:class="[
				{ card: !fromLayout },
				'content-row',
				{ 'view-content-card': !fromDetailsPage }
			]"
		>
			<div
				:class="[
					{ 'card-content': !fromLayout },
					{ 'dragndrop-active': !draggingLockedProp }
				]"
			>
				<!-- <div class="warnings-container flex" v-if="showCardHeader">
						<div class="warning-item">
							Warning <span class="warning-color">(12)</span>
						</div>
						<div class="warning-item">
							Alarm <span class="alarm-color">(8)</span>
						</div>
					</div> -->

				<VueElementLoadingWrapper
					class="section-block items-preloader"
					spinner="line-scale"
					:isLoading="itemsLoading"
					:itemsName="itemsName.mult"
				/>

				<transition name="standard-fade" mode="out-in">
					<template v-if="activeGrid == ITEMS_GRID_TYPES.LIST">
						<CustomDataListTable
							v-show="!itemsLoading"
							ref="ItemsTableContainer"
							@event="handleEventNew"
							:tableData="itemsList"
							:tableSettings="tableSettings"
							:itemsName="itemsName"
						/>
					</template>
				</transition>

				<transition name="standard-fade" mode="out-in">
					<template v-if="activeGrid == ITEMS_GRID_TYPES.GRID">
						<ItemsGridContainer
							v-show="!itemsLoading"
							:itemsLoading="isLoadingCards"
							cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4 drag-n-drop-item"
							itemsListClassName="drag-n-drop-list"
							ref="ItemsTableContainer"
							@event="handleEventNew"
							:itemsList="itemsList"
							:itemsName="itemsName"
							:instanceName="instanceName"
							:operationsSettings="cardOperationsSettings"
							componentPath="Equipments/Card/ItemCard"
							:additionalProps="additionalDataForCards"
						/>
					</template>
				</transition>

				<PaginationContainer
					@setFilters="setFilters"
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					scrollTo=".equipments-layout"
					:scrollToTimeout="270"
				/>
			</div>
		</div>

		<el-dialog
			center
			:title="`${tt('phrases.cycles_counter')}`"
			:append-to-body="true"
			:visible.sync="showShotsCounterDialog"
			:class="'small report-item-dialog'"
		>
			<ShotsCounterForm
				v-if="showShotsCounterDialog"
				@closeDialog="showShotsCounterDialog = false"
				:shotsCounterData="shotsCounterData"
				:visible="showShotsCounterDialog"
				@success="shotsCounterUpdated"
			/>
		</el-dialog>
		<!-- </div> -->
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { standardTableOperations, ITEMS_GRID_TYPES } from '@/constants/table';
import { findItemBy, getValues, cloneDeep } from '@/helpers';
import { equipmentCardTitle } from '@/helpers/specialHelpers';
import { LUBE_PROCESSING_STATUSES, LUBE_CYCLE_STATUSES } from '@/constants/ultrasound';
import { SUBJECT_TYPES, FFT_LOCK_STATUSES } from '@/constants/global';

import {
	itemsDataMixin,
	eventHandler,
	navigation,
	actionButtonsMixin,
	webSocketMixin,
	dashboardListsReorderMixin,
	dragNdropSortableMixin
} from '@/mixins';

export default {
	mixins: [
		itemsDataMixin(),
		eventHandler(),
		navigation(),
		actionButtonsMixin(),
		webSocketMixin(),
		dashboardListsReorderMixin(),
		dragNdropSortableMixin()
	],
	components: {
		ItemsGridContainer: () =>
			import('@/components/gridTable/ItemsGridContainer.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		ShotsCounterForm: () => import('./ShotsCounterForm.vue')
	},

	props: {
		disableDraggingFeature: Boolean,
		showCardHeader: Boolean,
		fromDetailsPage: Boolean,
		plantId: Number,
		fromLayout: Boolean,
		draggingLockedProp: Boolean,
		perPageItems: Array,
		activeGrid: Number,
		equipmentTypesList: Array
	},

	data: () => ({
		equipmentItem: null,
		showShotsCounterDialog: false,
		shotsCounterData: null,
		isLoadingCards: false,
		// -----------
		state_socket: null,
		state_socket_ready: false
	}),

	computed: {
		...mapState({
			filters: state => state.equipments.filters,
			// statistics_filters: state => state.sensors.statistics_filters,
			compareList: state => state.global.compareList,
			authUser: state => state.auth.authUser,
			globalSelectedPlant: state => state.global.globalSelectedPlant
		}),

		drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',
		reorderAction: () => 'reorder_equipment',

		preventResetPage: () => true,

		// ALERT_TYPES: () => ALERT_TYPES,
		ITEMS_GRID_TYPES: () => ITEMS_GRID_TYPES,
		instanceName: () => 'Equipments',

		/*equipmentsList() {
			if (this.filters.archivedNodes) {
				return this.itemsList.filter(li => li.dashboardSensors.some(si => si.is_archived) );
			}
			return this.itemsList;
		},*/

		// pickerOptions: () => ({ shortcuts: datePickerShortcuts }),

		navbarSettings: that =>
			Object.freeze({
				showFilter: true,
				showStandardNavItem: true,
				pageTitle: that.itemsName ? that.itemsName.mult : '',
				showCompareButton: true
			}),

		itemsName() {
			return Object.freeze({
				one: this.$t('Item'),
				mult: this.$t('Items'),
				instanceName: 'Equipments'
			});
		},

		tableSettings() {
			let operations = {
				/*secondary_actions: [
					{
						name: 'handleShowDetails',
						type: 'success',
						icon: 'icomoon icon-shopping-cart',
						tooltip_text: 'Quote',
						options: {
							page_path: '/quote'
						}
					},
					{
						name: 'handleShowDetails',
						type: 'success',
						icon: 'icomoon icon-fix',
						tooltip_text: 'Service',
						options: {
							page_path: '/service'
						}
					}
				],*/
				actions: [
					{
						name: 'handleShowDetails',
						type: 'success',
						icon: 'icomoon icon-eye',
						tooltip_text: 'Details',
						options: {
							page_path: ''
						}
					}
				]
			};

			if (this.$hasAccessTo(['create_maintenance'])) {
				operations.actions.unshift({
					name: 'handleCreateWorkOrderButton',
					formSetup: [
						{ formKey: 'production_line_id', valKey: 'production_line_id' },
						{ formKey: 'machine_id', valKey: 'machine_id' },
						{ formKey: 'asset_id', valKey: 'asset_id' },
						{ formKey: 'equipment_id', valKey: 'id' }
					],
					type: 'success',
					tooltip_text: 'phrases.Create_Work_Order',
					button_text: '+WO'
				});
			}

			operations.actions.unshift({
				name: 'handleAddToFavorites',
				type: 'success',
				icon: 'icomoon icon-eye',
				tooltip_text: 'Add To Favorites',
			})

			if (this.$hasAccessTo(['edit_dashboard'])) {
				operations.actions.push({
					...standardTableOperations.edit,
					isDisabled: !this.plantId && !this.globalFilters.plantId
				});
			}

			if (this.$hasAccessTo(['delete_dashboard'])) {
				operations.actions.push(standardTableOperations.delete);
			}

			operations.actions = this.$translate(operations.actions, {
				key: 'tooltip_text'
			});

			return Object.freeze({
				columns: [
					{
						prop: 'machine_name',
						label: this.$t('Machine')
						// sortable: true
					},
					{
						prop: 'asset_name',
						label: this.$t('Asset')
						// sortable: true
					},
					{
						label: this.$t('Brand'),
						meta: {
							additionalActions: [
								{
									linkSettings: {
										linkRoute: 'equipments/:id/details/main',
										linkTextProp: 'brand_name'
									},
									className: 'table-link',
									disablePopover: true
								}
							]
						}
					},
					{
						label: this.$t('Part Number'),
						meta: {
							additionalActions: [
								{
									linkSettings: {
										linkRoute: 'equipments/:id/details/main',
										linkTextProp: 'brand_model_name'
									},
									className: 'table-link',
									disablePopover: true
								}
							]
						}
					},
					{
						prop: 'production_line_name',
						label: this.$t('Production_Line')
						// sortable: true
					},
					{
						prop: 'location_name',
						label: this.$t('Location'),
						sortable: true
					},
					{
						prop: 'equipment_type_name',
						label: this.$t('Item_type')
						// sortable: true
					}
					/*{
						prop: 'sensor_location',
						label: 'Status',
					}*/
					/*{
						prop: 'sensor_location',
						label: 'Sensor Location',
						sortable: true
					}*/
				],

				expandedRowSettings: {
					componentPath: 'views/Equipments/TableExpandedRow'
					// componentName: 'TableExpandedRow'
				},

				operations: operations
			});
		},

		cardOperationsSettings() {
			let settings = {
				titles: [
					{ prop: 'machine_name', className: 'primary-color' },
					{ prop: 'id', className: 'primary-color' }
					// { prop: 'last_asset_name', className: 'primary-color' }
					// { prop: 'machine_name' }
				],
				buttons: [
					{
						// name: 'handleAddToFavorites',
						// tooltip_text: 'Add To Favorites',
						disablePopover: true,
						buttonContent: {
							component: {
								componentPath: 'components/common/addToFavoriteButton'
							}
						}
					}
				]
			};

			if (this.$hasAccessTo(['create_maintenance'])) {
				settings.buttons.push({
					name: 'handleCreateWorkOrderButton',
					formSetup: [
						{ formKey: 'production_line_id', valKey: 'production_line_id' },
						{ formKey: 'machine_id', valKey: 'machine_id' },
						{ formKey: 'asset_id', valKey: 'asset_id' },
						{ formKey: 'equipment_id', valKey: 'id' }
					],
					tooltip_text: this.$t('phrases.Create_Work_Order'),
					className: 'create-wo-button',
					type: 'primary inverted',
					buttonContent: {
						component: {
							componentPath: 'components/itemDetails/CreateWOButton'
						}
					}
				});
			}

			if (this.$hasAccessTo(['edit_dashboard'])) {
				settings.buttons.push({
					name: 'editItem',
					icon: 'icomoon icon-pencil',
					type: 'primary inverted',
					tooltip_text: this.$t('phrases.Edit_Item')
				});

				settings.allowDelete = this.$hasAccessTo(['delete_dashboard']);
			}

			return Object.freeze(settings);
		},

		additionalDataForCards() {
			return Object.freeze({
				equipmentTypesList: this.equipmentTypesList
			});
		},

		localModalSettings: that =>
			Object.freeze({
				callback: () => {
					that.fetchItems({ ...that.filters, ...that.globalFilters });
					that.show_edit_modal({ show: false });
				}
			}),

		predefinedFilters: that =>
			Object.freeze({
				orderByColumn: 'asset_id',
				orderByMethod: 'asc',
				plantId: that.plantId || that.globalFilters.plantId
			}),

		// ----------------
		/*mockCountersData() {
			return {
				type: 'counters',
				data: {
					equipment_id: 55519,
					sensor_id: 379,
					alarmsCount: 1,
					autoProcessCount: 1,
					failuresCyclesCount: 1,
					manualProcessCount: 1,
					processCyclesCount: 1,
					successCyclesCount: 1,
					off_alarm_crashes_count: 1,
					warning_crashes_count: 1,
					alarm_crashes_count: 1,
					critical_alarm_crashes_count: 1,
					custom_crashes_count: 1
				}
			};
		},*/

		socketChannel() {
			const { authUser } = this;

			if (authUser) {
				return `live.sensors.${authUser.uuid}`;
			}
			return null;
		},

		routeQuery() {
			const { query } = this.$route;
			return Object.keys(query).length ? query : null;
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'equipments/fetch_equipments_dashboard',
			delete_item: 'equipments/delete_equipment',
			set_filters: 'equipments/set_equipments_filters',
			set_statistics_filters: 'sensors/set_statistics_filters',
			toggle_ultrasound_command: 'sensors/toggle_ultrasound_command',
			// save_pump: 'ultrasound_pumps/save_ultrasound_pump',
			set_compare_list: 'set_compare_list',
			reorder_equipment: 'equipments/reorder_equipment',
			add_to_favorites_equipment: 'equipments/add_to_favorites_equipment',

			// sensor_rebase_line: 'sensors/sensor_rebase_line',
			ping_socket_endpoint: 'equipments/ping_socket_endpoint',
			reset_sensor_runtime: 'sensors/reset_sensor_runtime',
			forceRerender: 'forceRerender',
			unlock_fft: 'sensors/unlock_fft'
		}),

		toconsole(x) {
			console.log(x);
		},

		// ---------DropDown Filterbar-------

		/*createItem(options = {}) {
			const nestedRef = this.$refs['nestedViewContent'];
			nestedRef.createItem ? nestedRef.createItem(options) : null;
		},
		handleDeleteItems() {
			const nestedRef = this.$refs['nestedViewContent'];
			nestedRef.handleDeleteItems ? nestedRef.handleDeleteItems() : null;
		},*/

		// ----------------------
		handleAddToFavorites({ row, subjectType }) {
			const isPersonal = subjectType === SUBJECT_TYPES.USER;
			const isFavorite = isPersonal ? row.is_my_favorite : row.is_company_favorite;

			/*if (row) {
				console.log('handleAddToFavorites', row, subjectType, {
				itemId: row.id,
				notNotify: true,
				method: isFavorite ? 'DELETE' : 'POST',
				data: { subject_type: subjectType }
			});
				return;
			}*/
			this.isLoadingCards = true;

			this.add_to_favorites_equipment({
				itemId: row.id,
				notNotify: true,
				method: isFavorite ? 'DELETE' : 'POST',
				data: { subject_type: subjectType }
			}).then(response => {
				this.itemsList = this.updateEquipmentCardsFavorites(this.itemsList, {
					...response,
				});
				this.isLoadingCards = false;
			}).catch(e => {
				console.warn(e)
				this.isLoadingCards = false;
			})
		},

		updateEquipmentCardsFavorites(itemsList, response) {
			const { equipment_id, is_my_favorite, is_company_favorite, status } = response.value;
			if (status == 'ok') {
				return itemsList.map(ei => {
					if (ei.id === equipment_id) {
						ei.is_my_favorite = is_my_favorite;
						ei.is_company_favorite = is_company_favorite;
					}
					return ei;
				});
			}
		},

		handleShowDetails(payload) {
			let { row, options, column } = payload;

			if (!options) {
				if (column) {
					options = column.meta.options;
				}
			}
			// console.log(row, options, column)
			this.changeRoute({
				path: `/equipments/${row.id}/details${options.page_path}`
			});
		},

		unblockLube({ row }) {
			// console.log(row)
			this.confirmHelper({
				insertToMessage: `<b>${this.$t('phrases.reset_cycle')}</b>`
			})
				.then(() => {
					const payload = {
						url: `/ultrasound/commands/${row.id}/reset/cycle`,
						resultMessage: { text: '' }
					};

					if (
						row.lube_cycle_status === LUBE_CYCLE_STATUSES.BLOCKED ||
						row.lube_shot_status === LUBE_PROCESSING_STATUSES.UNSUCCESSFUL ||
						row.lube_shot_status === LUBE_PROCESSING_STATUSES.BLOCKED
					) {
						payload.url += '?resetLubeCycle=1';
						payload.resultMessage.text = this.$t('phrases.lube_cycle_was_reset');
					} else if (row.is_lubricator_empty) {
						payload.url += '?resetSpentShots=1&resetLubeCycle=0';
						payload.resultMessage.text = this.$t('phrases.spent_shots_was_reset');
					} else {
						payload.url += '?resetLubeCycle=0&resetSpentShots=1';
						payload.resultMessage.text = this.$t('phrases.grease_pack_was_reset');
					}

					/*if (payload) {
						console.log('unblockLube', payload)
						return
					}*/

					this.toggle_ultrasound_command(payload).then(() => {
						this.fetchItems({
							...this.filters,
							...this.globalFilters,
							...this.preventedFilters
						});
					});
				})
				.catch(() => {});
		},

		handleUnlockFFT({row}) {
			const { tt } = this;
			this.confirmHelper({
				insertToMessage: `<b>${tt('unlock')} FFT</b>`
			})
				.then(() => {
					const payload = {
						sensorId: row.id,
						notNotify: true
					};

					// if (payload) {
					// 	console.log('payload', payload);
						
					// 	this.$emit('event', {
					// 		eventName: 'handleUnlockFFTSuccess',
					// 		data: {},
					// 		onward: true
					// 	});
					// 	return
					// }

					// this.$emit('update:isLoading', true);

					this.unlock_fft(payload)
						.then(({ value }) => {
							// this.$emit('update:isLoading', false);

							if (value.status === FFT_LOCK_STATUSES.UNLOCKED) {
								this.$notify({
									type: 'success',
									title: tt('constants.Success'),
									message: `${tt('phrases.FFT_successfully_unlocked')}`
								});

								this.fetchItems({
									...this.filters,
									...this.globalFilters,
									...this.preventedFilters
								});
							}
						})
						.catch(() => {
							// this.$emit('update:isLoading', false);
						});
				}).catch(() => {
					// Cancelled
				});
		},

		compareClick({ row }) {
			const { compareList } = this;
			// console.log(sensor)
			let newList = compareList.filter(c_sensor => c_sensor !== row.id);
			// console.log(newList, row)
			if (newList.length === compareList.length && newList.length < 5) {
				newList.push(row.id);
			}

			this.set_compare_list(newList);
		},

		/*openSensorStatistics({row}) {
			// console.log(row)
			const path = `/equipments/${row.equipment_id}/details/pdm/${row.id}`;
			// setTimeout(() => {
				// this.forceRerender('DashboardLayoutComponentKey');
			// }, 1000);
			this.changeRoute({ path });
		},*/

		handleChangeShotsCount({ row }) {
			// console.log(row)
			this.shotsCounterData = row;
			this.showShotsCounterDialog = true;
		},

		shotsCounterUpdated(sensor) {
			if (sensor && sensor.id) {
				const equipmentResult = findItemBy(
					'id',
					sensor.equipment_id,
					this.itemsList,
					{ returnIndex: true }
				);
				if (equipmentResult && equipmentResult.index !== undefined) {
					const { index } = findItemBy(
						'id',
						sensor.id,
						this.itemsList[equipmentResult.index].dashboardSensors,
						{ returnIndex: true }
					);

					// console.log(index, sensor, this.itemsList[equipmentResult.index].dashboardSensors[index])
					if (index !== undefined) {
						const newSensorsList = cloneDeep(
							this.itemsList[equipmentResult.index].dashboardSensors
						);
						this.itemsList[equipmentResult.index].dashboardSensors = [];
						newSensorsList[index] = { ...newSensorsList[index], ...sensor };
						setTimeout(() => {
							this.itemsList[
								equipmentResult.index
							].dashboardSensors = newSensorsList;
						}, 10);
					}
				}
			}
		},

		fftClick({ row }) {
			// console.log(row)
			const { sensor_id, id } = row.lastCompletedAutoFFTRequest;
			this.changeRoute({ path: `/ncd/${sensor_id}/fft/${id}` });
		},

		getSensorDialogTitle() {
			const { cardOperationsSettings, equipmentItem, itemsList } = this;
			if (equipmentItem && equipmentItem.sensorData) {
				const { equipment_id } = equipmentItem.sensorData;
				const equipment = findItemBy('id', equipment_id, itemsList);
				return equipmentCardTitle(cardOperationsSettings.titles, equipment);
			}
			return '';
		},

		/*aknowledgeClick({ ['row']: equipment }) {
			// console.log(sensor)
			this.equipmentItem = equipment;
			this.acknowledgeData = equipment.has_breakdown
				? equipment.repairNow
				: equipment;
			this.acknowlaedgeDialogVisible = true;
		},*/

		/*click_re_baseline(sensor) {
			this.$confirm({
				title: 'Warning',
				message: `${tt('phrases.Do_you_really_want_to')} re-baseline? Continue?`,
				confirmButtonText: 'Confirm',
				showCancelButton: true,
				cancelButtonText: 'Cancel',
				iconClass: 'icomoon icon-warning',
				type: 'warning'
			})
				.then(() => {
					this.submitRe_baseline(sensor);
				})
				.catch(() => {
					//
				});
		},

		submitRe_baseline(sensor) {
			const { id } = sensor;

			const payload = {
				itemId: id,
				data: {
					enable: true
				},
				resultMessage: { text: 're-baseline performed' }
			};

			this.sensor_rebase_line(payload).then(() => {
				this.refetchItemsList();
			});
		},*/

		// -----------------
		state_socketCallback(answer) {
			// console.log('state_socketCallback ', answer);
			const { type } = answer;

			if (type == 'counters') {
				this.itemsList = this.updateSensorsCounters(this.itemsList, answer.data);
			}
		},

		getSensorsIds(equipments) {
			let ids = [];

			equipments.forEach(ei => {
				if (ei.dashboardSensors.length) {
					ids = ids.concat(getValues('id', ei.dashboardSensors));
				}
			});

			return ids.join(',');
		},

		updateSensorsCounters(itemsList, data) {
			const { equipment_id, sensor_id } = data;
			// console.log('equipment_id', equipment_id, 'sensor_id', sensor_id)
			return itemsList.map(ei => {
				if (
					(equipment_id && equipment_id === ei.id) ||
					ei.dashboardSensors.some(si => si.id === sensor_id)
				) {
					for (const si of ei.dashboardSensors) {
						if (si.id === sensor_id) {
							delete data.equipment_id;
							delete data.sensor_id;

							for (let prop of Object.keys(data)) {
								if (si[prop] !== undefined) {
									si[prop] += data[prop];
								} else if (si.lubes[prop] !== undefined) {
									if (
										data[prop] > 0 ||
										(prop != 'successCyclesCount' && prop != 'failuresCyclesCount')
									) {
										si.lubes[prop] += data[prop];
									}
								}
							}
							break;
						}
					}
				}
				// console.log('newEquipmentItem', ei)
				return ei;
			});
		},

		resetSensorRuntime(id) {
			this.confirmHelper({
				insertToMessage: `<b>${this.$t('reset')} ${this.$t('runtime')}</b>`
			})
				.then(() => {
					// console.log(id)
					this.reset_sensor_runtime({
						sensorId: id,
						resultMessage: { text: this.$t('phrases.runtime_was_reset') }
					}).then(() => {
						this.refetchItemsList();
					});
				})
				.catch(() => {
					//
				});
		}
	},

	watch: {
		/*activeGrid(x) {
			console.log(x)
		},*/

		'itemsList'(list) {
			if (!this.state_socket_ready) {
				if (list.length && this.socketChannel) {
					const sensorIds = this.getSensorsIds(list);
					if (sensorIds.length) {
						this.setupWebSocket({
							socketName: 'state_socket',
							socketNameReadyProp: 'state_socket_ready',
							socketChannel: this.socketChannel,
							socketCallbackName: 'state_socketCallback',
							resources: sensorIds
						});
					}
				}
			} else if (list.length) {
				const sensorIds = this.getSensorsIds(list);
				if (sensorIds.length) {
					this.webSocketSend({
						socketName: 'state_socket',
						resources: sensorIds
					});
				}
			}
		},

		'filters.hasSensors'(hasSensors) {
			if (!hasSensors) {
				this.preventFetch = true;
				console.log('filters.hasSensors')
				this.setFilters({ sensorType: null, dataSet: null, page: 1 });
			}
		}

		/*state_socket_ready(isReady) {
			if (isReady && this.itemsList.length) {
				// console.log(this.itemsList.length, this.getSensorsIds(this.itemsList))
				this.webSocketSend({
					socketName: 'state_socket',
					resources: this.getSensorsIds(this.itemsList)
				});
			}
		}*/
	},

	/*created() {
		if (this.fromDetailsPage) {
			this.stopFetch = true;
		}
	},*/

	beforeDestroy() {
		this.closeWebSocket({ socketName: 'state_socket' });
	}
};
</script>
