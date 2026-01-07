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
						:hideCreate="!hasAccesToCreate"
						:hideDelete="!hasAccesToDelete"
					>
						<div class="filter-item mcol-xs-12 mcol-sm-auto">
							<Datepicker
								setupDaterangeFilter
								enableShortcuts
								@input="
									range =>
										set_statistics_filters({
											...statistics_filters,
											daterange: range,
											daterange_setted_at: Date.now()
										})
								"
								:value="statistics_filters.daterange"
								type="daterange"
							/>
						</div>
					</Filterbar>

					<ItemsGridContainer
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:itemsList="itemsList"
						:itemsName="itemsName"
						:instanceName="instanceName"
						cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4 process-card-item"
						:operationsSettings="cardActionsSettings"
					/>

					<PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
					/>
				</div>
			</div>

			<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
		</div>
	</div>
</template>

<script>
// import axios from '@/services/api/axiosService';
// import { } from '@/helpers';

import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	requestsListMixin,
	eventHandler,
	navigation,
	webSocketMixin
} from '@/mixins';
import { DOWNTIME_ORIGIN_TYPES } from '@/constants/global';
import { /*prepareRangeParams,*/ getValues } from '@/helpers';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [
		itemsDataMixin(),
		requestsListMixin(),
		eventHandler(),
		navigation(),
		webSocketMixin()
	],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		ItemsGridContainer: () =>
			import('@/components/gridTable/ItemsGridContainer.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	data: () => ({
		state_socket: null,
		state_socket_ready: false
	}),

	computed: {
		...mapState({
			statistics_filters: state => state.processes.statistics_filters,
			filters: state => state.processes.filters,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,

			authUser: state => state.auth.authUser
		}),

		instanceName: () => 'Processes',
		editInModal: () => true,
		daterangeFiltersProp: () => 'statistics_filters',
		daterangeFiltersAction: () => 'set_statistics_filters',

		itemsName() {
			return {
				one: this.$t('Process'),
				mult: this.$t('Processes'),
				instanceName: 'processes'
			};
		},

		/*navbarSettings: that => ({
			showCreateButton: that.hasAccesToDelete,
			showDeleteButton: that.hasAccesToDelete,
			showFilter: true,
			pageTitle: that.itemsName ? that.itemsName.mult : ''
		}),*/

		hasAccesToCreate: that => that.$hasAccessTo(['create_oee']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_oee']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_oee']),

		cardActionsSettings() {
			let actions = [
				{
					name: 'handleShowDetails',
					type: 'info',
					icon: 'icomoon icon-graphic',
					tooltip_text: 'Details'
				}
				/*{
					name: 'clearLogs',
					submit_action: 'submitSite',
					type: 'warning',
					icon: 'icomoon icon-clean',
					tooltip_text: 'Clear logs'
				}*/
			];

			// let additional_actions = [];

			if (this.hasAccesToEdit) {
				actions = actions.concat([
					standardTableOperations.edit
					// standardTableOperations.delete
					/*{
						name: 'showAdditionalActions',
						local_action: true,
						icon: 'icomoon icon-dots',
						className: 'toggle-menu-button'
						// tooltip_text: 'File actions'
					}*/
				]);
			}
			if (this.hasAccesToDelete) {
				actions = actions.concat([standardTableOperations.delete]);
			}
			return Object.freeze({
				// disableActions: this.disableActions,
				actions: actions,
				allowDelete: this.hasAccesToDelete
				// additional_actions: additional_actions
			});
		},

		tableSettings() {
			let actions = [
				{
					name: 'handleShowDetails',
					type: 'success',
					icon: 'icomoon icon-chart2',
					tooltip_text: 'Details'
				}
			];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			let settings = {
				columns: this.$translate([
					{
						prop: 'name',
						label: 'Name',
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					},
					{
						prop: 'plant.name',
						label: 'Plant',
						sortable: true,
						meta: { sortBy: 'plant_id' }
					},
					{
						prop: 'controller.name',
						label: 'Controller',
						sortable: true,
						meta: { sortBy: 'controller_id' }
					}
					/*{
						prop: 'machines_ids',
						label: 'Machines',
						meta: {
							getItemValue: { prop: 'name', listName: 'convertTypesList' }
						}
					}*/
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			};

			return Object.freeze(settings);
		},

		socketChannel() {
			const { authUser } = this;

			if (authUser) {
				return `live.conveyor.processes.${authUser.uuid}`;
			}
			return null;
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'processes/fetch_processes',

			delete_item: 'processes/delete_process',
			set_filters: 'processes/set_processes_filters',
			set_statistics_filters: 'processes/set_statistics_filters',

			ping_socket_endpoint: 'processes/ping_socket_endpoint'
		}),

		handleShowDetails({ row }) {
			// console.log(row)
			this.changeRoute({
				path: `/processes/${row.id}/details`
			});
		},

		localPrepareFilters(filters) {
			let newFilters = {
				...filters,
				...this.statistics_filters
			};
			// console.log(newFilters)
			/*if (newFilters.daterange && newFilters.daterange.length) {
				newFilters = {
					...newFilters,
					...prepareRangeParams(newFilters.daterange)
				};
				delete newFilters.daterange;
			}*/

			return newFilters;
		},

		// ---------
		update_process_data({ process_id, actualCapacity, totalDowntime, downtime }) {
			const modifiedData = {};

			if (actualCapacity) {
				modifiedData.actual_capacity = actualCapacity;
			} else if (totalDowntime) {
				modifiedData.totalDowntime = totalDowntime;
			}

			return this.itemsList.map(processItem => {
				if (processItem.id === process_id) {
					if (downtime && downtime.origin_type === DOWNTIME_ORIGIN_TYPES.DEVIATION) {
						modifiedData.loss_count = processItem.loss_count + downtime.loss_count;
					}

					let new_process = {
						...processItem,
						...modifiedData
					};
					return new_process;
				} else {
					return processItem;
				}
			});
		},

		state_socketCallback(answer) {
			// console.log('state_pusherCallback ', answer);
			const { type } = answer;

			if (type == 'job' || type == 'downtime') {
				this.itemsList = this.update_process_data(answer);
			}
		}
	},

	watch: {
		statistics_filters() {
			this.fetchItems({
				...this.filters,
				...this.globalFilters,
				...this.preventedFilters
			});
		},

		itemsList(list) {
			if (!this.state_socket_ready) {
				if (list.length) {
					const sensorIds = getValues('id', list).join(',');
					// console.log(sensorIds)
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
				const sensorIds = getValues('id', list).join(',');

				if (sensorIds.length) {
					this.webSocketSend({
						socketName: 'state_socket',
						resources: sensorIds
					});
				}
			}
		}

		/*state_socket_ready(isReady) {
			if (isReady && this.itemsList.length) {
				// console.log(this.itemsList.length, this.getSensorsIds(this.itemsList))
				this.webSocketSend({
					socketName: 'state_socket',
					resources: getValues('id', this.itemsList).join(',')
				});
			}
		}*/
	},

	beforeDestroy() {
		this.closeWebSocket({ socketName: 'state_socket' });
	}
};
</script>
