<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div class="view-content-card card content-row">
				<div class="card-content">
					<SimpleSpinner :active="exportingInProgress" />

					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:actionButtons="actionButtons"
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

			<!-- <div class="pagination content-row card" v-if="!controllersLoading">
				<PaginationContainer @setFilters="setFilters" :itemsName="itemsName" :filters="filters" :meta="meta" />
			</div> -->
		</div>

		<el-dialog
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="`${tt('Delete')} ${tt('Controller')}`"
			:visible.sync="deleteControllerDialogOpen"
		>
			<div class="deleting-controller-dialog" v-if="deletingController">
				<div class="content-row text-center">
					<div v-text="`${tt('Controller')} '${deletingController.name}'`"></div>
					<div v-text="`${tt('has')} ${deletingController.sensors_count} ${tt('phrases.devices_attached_to_it')}.`"></div>
					<div v-text="`${tt('phrases.Would_you_like_to_delete_it_anyway')}?`"></div>
					<div v-html="`${tt('phrases.Please_type')} <b>'delete'</b> ${tt('phrases.to_confirm')}.`"></div>
				</div>
				<div class="content-row">
					<CustomInput
						v-model="deletingConfirmQuery"
						:placeholder="tt('phrases.Type_delete_here')"
						className="placeholder-lowercase"
					/>
				</div>
			</div>

			<div slot="footer" class="dialog-footer section-row text-center ">
				<el-button
					@click="deleteControllerDialogOpen = false"
					>{{ tt('Cancel') }}</el-button
				>

				<el-button
					type="primary"
					@click="handleConfirmDelete"
					class="capitalize"
					>OK</el-button
				>
			</div>
		</el-dialog>

		<FFTRequestBlock
			@event="handleEventNew"
			ref="FFTRequestBlock"
		/>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
	itemsDataMixin,
	eventHandler,
	actionButtonsMixin,
	navigation
} from '@/mixins';
import { validateBySettings /*checkByRolePermissions*/ } from '@/helpers';
import { prepareParams, setupGetParamsStr } from '@/services/api/api_helpers';
import { hasAccessTo } from '@/utils/hasAccessTo';

import {
	CONTROLLER_CONNECTION_TYPES,
	CONTROLLER_TYPES,
	controller_offline_icon,
	rebase_lines,
	rebase_wheel
} from '@/constants/global';
import axios from '@/services/api/axiosService';

import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), actionButtonsMixin(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		// ItemsTableContainer: () => import('@/components/ItemsTableContainer.vue'),

		PaginationContainer: () => import('@/components/common/PaginationContainer.vue'),
		FFTRequestBlock: () => import('@/views/Sensors/FilterBlock/FFTRequestBlock.vue')
	},

	data: () => ({
		exportingInProgress: false,
		deleteControllerDialogOpen: false,
		deletingController: null,
		deletingConfirmQuery: ''
	}),

	computed: {
		...mapState({
			filters: state => state.controllers.filters,
			authUser: state => state.auth.authUser,
			access_token: state => state.auth.access_token
		}),

		// hasAccessMap: that => that.$store.getters['auth/hasAccessMap'],
		// hasAccessTo: that => that.$store.getters['auth/hasAccessTo'](['create_controller']),
		// hasAccess: that => that.$store.getters['auth/hasAccessTo']['create_controller'],

		abc: that => that.tt('phrases.Type_delete_here'),

		actionButtons() {
			const { authUser } = this;

			// let buttons = [];
			let buttons = [
				{
					id: 1,
					text: 'PDM',
					event: 'createItem',
					args: { path: `/new?type=${CONTROLLER_TYPES.BANNER}` },
					permissions: ['create_controllers']
				},
				{
					id: 2,
					text: 'Lubematrix',
					event: 'createItem',
					args: { path: `/new?type=${CONTROLLER_TYPES.ULTRA_SOUND}` },
					permissions: ['create_controllers']
				},
				{
					id: 3,
					text: 'sidebar_menu.OEE',
					event: 'createItem',
					args: { path: `/new?type=${CONTROLLER_TYPES.COUNTER}` },
					permissions: ['create_controllers']
				},
				{
					id: 6,
					text: 'NCD',
					event: 'createItem',
					args: { path: `/new?type=${CONTROLLER_TYPES.NCD}` },
					permissions: ['create_controllers']
				},

				/*{
					id: 4,
					text: 'Delete',
					event: 'handleDeleteItems',
					isDelete: true,
					permissions: ['delete_controllers']
				},*/

				{
					id: 5,
					text: 'Export',
					event: 'handleExport',
					without_icon: true,
					className: 'inverted'
				}
			];

			return this.$translate(
				buttons.filter(bi => {
					let checks = [];
					if (bi.permissions) {
						checks.push(
							hasAccessTo({ role: authUser.role, permissionKeys: bi.permissions })
						);
					}
					if (bi.conditionSettings) {
						checks.push(
							validateBySettings({
								...bi.conditionSettings,
								dataObj: authUser
							})
						);
					}
					return checks.every(c => c);
				}),
				{ key: 'text' }
			);
		},

		navbarSettings() {
			return {
				pageTitle: this.$t('Controllers'),
				showFilter: true
			};
		},

		itemsName() {
			return {
				one: this.$t('Controller'),
				mult: this.$t('Controllers'),
				instanceName: 'controllers'
			};
		},

		tableSettings() {
			let settings = {
				columns: [
					{ prop: 'name', label: this.$t('Name'), sortable: true, min_width: 110 },
					{
						prop: 'company.name',
						label: this.$t('Company'),
						sortable: true,
						min_width: 110,
						meta: { sortBy: 'company' }
					},
					{
						prop: 'plant.name',
						label: this.$t('Plant'),
						sortable: true,
						min_width: 110,
						meta: { sortBy: 'plant' }
					},
					{ prop: 'mac_address', label: this.$t('MAC_Address'), max_width: 200 },
					// { prop: 'id', label: 'Id', sortable: true, max_width: 50, min_width: 50 },

					{
						label: ' ',
						prop: 'is_inactive',
						width: 55,
						conditionSettings: {
							conditions: [{ prop: 'type', control_value: CONTROLLER_TYPES.NCD }]
						},
						meta: {
							cell_class: 'text-center',
							prepareValue: { localMethod: this.setupStatusCell }
						}
					}

					/*{
						// prop: 'configure_file_link',
						label: 'XML',
						min_width: 110,

						conditionSettings: {
							conditions: [{ prop: 'configure_file_link', method: 'notEmpty' }]
						},
						meta: {
							additionalActionsClassName: 'first-child-ellipsis',
							additionalActions: [
								{
									linkSettings: {
										linkHrefProp: 'configure_file_link',
										linkTextProp: 'configure_file_name',
										target: '_blank'
									},
									className: 'table-link',
									disablePopover: true
								},
								{
									name: 'newConfig',
									type: 'success',
									icon: 'icomoon icon-upload',
									tooltip_text: 'New Config'
								}
							],
							emptyText: ' '
							// eventName: 'handleNewConfig'
						}
					},
					{
						// prop: 'sb_file_link',
						label: 'Script',
						min_width: 110,
						conditionSettings: {
							conditions: [{ prop: 'sb_file_link', method: 'notEmpty' }]
						},
						meta: {
							additionalActionsClassName: 'first-child-ellipsis',
							additionalActions: [
								{
									linkSettings: {
										linkHrefProp: 'sb_file_link',
										linkTextProp: 'sb_file_name',
										target: '_blank'
									},
									className: 'table-link',
									disablePopover: true
								},
								{
									name: 'newSB',
									type: 'success',
									icon: 'icomoon icon-upload',
									tooltip_text: 'New Script'
								}
							],
							emptyText: ' '
						}
					}*/
				],
				operations: {
					// columnWidth: '177',
					actions: this.$translate(
						[
							{
								name: 'handleMultipleFFT',
								// type: 'secondary',
								icon: 'icomoon icon-fft',
								tooltip_text: 'fft',
								conditionSettings: {
									conditions: [
										{
											prop: 'type',
											method: '==',
											control_value: CONTROLLER_TYPES.BANNER
										}
									]
								}
							},
							{
								name: 'handleMultipleRebaseline',
								tooltip_text: 'rebaseline',
								className: 'rebaselineButton',
								img: rebase_wheel,
								second_img: rebase_lines,
								conditionSettings: {
									conditions: [
										{
											prop: 'type',
											array_method: 'some',
											control_value: [CONTROLLER_TYPES.BANNER, CONTROLLER_TYPES.NCD],
										}
									]
								}
							},

							{
								name: 'reconnect',
								type: 'info',
								icon: 'icomoon icon-reboot',
								tooltip_text: 'Reconnect',
								conditionSettings: {
									conditions: [
										{
											prop: 'connection_type',
											method: '==',
											control_value: CONTROLLER_CONNECTION_TYPES.MULTIHOP
										}
									]
								}
							},
							{
								name: 'showSensors',
								type: 'success',
								icon: 'icomoon icon-eye',
								tooltip_text: 'phrases.View_Sensors',
								conditionSettings: {
									conditions: [
										{
											prop: 'type',
											method: '==',
											control_value: CONTROLLER_TYPES.NCD
										}
									]
								}
							},
							/*{
								name: 'clearLogs',
								type: 'info',
								icon: 'icomoon icon-clean',
								tooltip_text: 'Clear Logs'
							},
							{
								name: 'rebootController',
								type: 'warning',
								icon: 'icomoon icon-reboot',
								tooltip_text: 'Reboot'
							},*/
							standardTableOperations.edit,
							{
								name: 'handleDeleteItemsLocal',
								type: 'danger',
								icon: 'icomoon icon-cross',
								tooltip_text: 'Delete'
							}
						],
						{ key: 'tooltip_text' }
					)
				}
			};

			return Object.freeze(settings);
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'controllers/fetch_controllers',
			delete_item: 'controllers/delete_controller',
			// save_controller: 'controllers/save_controller',
			controller_cmd: 'controllers/controller_cmd',
			export_controllers: 'controllers/export_controllers',
			set_filters: 'controllers/set_controllers_filters',

			controller_multiple_fft: 'controllers/controller_multiple_fft',
			sensor_multiple_rebaseline: 'sensors/sensor_multiple_rebaseline',

		}),

		setupStatusCell(is_inactive) {
			if (is_inactive) {
				return `<span class="table-cell-icon controller-offline-icon">
									<img src=${controller_offline_icon} />
								</span>`;
			}
			return ' ';
		},

		showSensors({ row }) {
			this.changeRoute({ path: `/ncd-sensors?controllerId=${row.id}` });
		},

		handleExport() {
			let params = prepareParams(
				this.prepareFilters({
					...this.globalFilters,
					...this.filters
				})
			);

			params.token = this.access_token;
			// let url = window.location.origin + `/controllers/export`;
			const { baseURL } = axios.defaults;
			let url = `${baseURL}/controllers/export`;
			// let url = 'https://api.testmatrix.assetmatrix.com/api/controllers/export';

			url = setupGetParamsStr(url, params);
			// console.log(url)
			const link = document.createElement('a');
			link.href = url;
			link.target = '_blank';
			link.click();
		},

		getConfirmMessage({ row, title }) {
			const { tt } = this;

			return `${tt('phrases.Do_you_really_want_to')} ${tt(
				'phrases.do_this_action_for'
			)} "${row[title] || row.name || row.title}". ${tt('Continue')}?`;
		},

		handleDeleteItemsLocal(data) {
			// console.log(row)
			const { row } = data;
			if (row.sensors_count > 0) {
				this.deletingController = row;
				this.deletingConfirmQuery = '';
				this.deleteControllerDialogOpen = true;
			} else {
				this.handleDeleteItems(data);
			}
		},

		handleConfirmDelete() {
			if (this.deletingConfirmQuery === 'delete') {
				this.deleteItem({ ids: [this.deletingController.id]});
				this.deleteControllerDialogOpen = false;
			} else {
				this.$notify({
					type: 'warning',
					message: this.$t('phrases.Please_type_delete_to_confirm')
				});
			}
		},

		/*rebootController(rowData) {
			this.confirmHelper({
				message: this.getConfirmMessage(rowData)
			})
				.then(() => {
					this.submitControllerAction({
						actionName: 'rebootController',
						row: rowData.row
					});
				})
				.catch(() => {});
		},

		clearLogs(rowData) {
			this.confirmHelper({
				message: this.getConfirmMessage(rowData)
			})
				.then(() => {
					this.submitControllerAction({ actionName: 'clearLogs', row: rowData.row });
				})
				.catch(() => {});
		},

		newConfig(rowData) {
			this.confirmHelper({
				message: this.getConfirmMessage(rowData)
			})
				.then(() => {
					this.submitControllerAction({ actionName: 'newConfig', row: rowData.row });
				})
				.catch(() => {});
		},

		newSB(rowData) {
			this.confirmHelper({
				message: this.getConfirmMessage(rowData)
			})
				.then(() => {
					this.submitControllerAction({ actionName: 'newSB', row: rowData.row });
				})
				.catch(() => {});
		},*/

		handleMultipleFFT(rowData) {
			// console.log(rowData)
			const { tt } = this;

			this.confirmHelper({ message: `${tt('aliases.mult_fft_confirm')} <b>${rowData.row.name}</b>?` })
				.then(() => {
					/*if (rowData) {
						console.log(rowData)
						return
					}*/
					this.controller_multiple_fft({
						controllerId: rowData.row.id,
						resultMessage: {
							text: `${tt('controller')} ${tt('phrases.multiple_fft')} ${tt('success')}`
						}
					});
				})
				.catch(() => {});
		},

		// ----multiple FFT with fft dialog----
		/*handleMultipleFFT(rowData) {
			console.log(this.$refs.FFTRequestBlock, this.$refs)
			setTimeout(() => {
				this.$refs.FFTRequestBlock.confirmFFTRequest({forController: rowData.row});
				// this.$refs.FFTRequestBlock.confirmFFTRequest();
			}, 50);
		},*/

		/*sendMultipleFFT(payload) {
			const { tt } = this;
			const {controllerData, data} = payload;

			this.confirmHelper({ message: `${tt('aliases.mult_fft_confirm')} <b>${controllerData.name}</b>?` })
				.then(() => {
					// if (payload) {
					// 	console.log(payload)
					// 	return
					// }
					this.controller_multiple_fft({
						controllerId: controllerData.id,
						data,
						resultMessage: {
							text: `${tt('controller')} ${tt('phrases.multiple_fft')} ${tt('success')}`
						}
					});
				})
				.catch(() => {});
		},*/

		// -----------------------

		handleMultipleRebaseline(rowData) {
			const { tt } = this;

			this.confirmHelper({ message: `${tt('aliases.mult_rebaseline_confirm')} <b>${rowData.row.name}</b>?` })
				.then(() => {
					this.sensor_multiple_rebaseline({
						data: {
							controller_id: rowData.row.id,
						},
						resultMessage: {
							text: `${tt('rebaseline')} ${tt('phrases.for_sensors_on_controller')} ${rowData.row.name} ${tt('started')}`
						}
					});
				})
				.catch(() => {});
		},

		reconnect(rowData) {
			this.confirmHelper({
				message: this.getConfirmMessage(rowData)
			})
				.then(() => {
					this.submitControllerAction({ actionName: 'reconnect', row: rowData.row });
				})
				.catch(() => {});
		},

		submitControllerAction({ actionName, row }) {
			let formData = {};
			const { tt } = this;
			let resultMessage;

			switch (actionName) {
				case 'rebootController': {
					formData = { is_reboot: true };
					resultMessage = {
						text: `${tt('controller')} ${tt('reboot')} ${tt('success')}`
					};
					break;
				}
				case 'clearLogs': {
					formData = { is_clear_logs: true };
					resultMessage = {
						text: `${tt('controller')} ${tt('phrases.clear_logs')} ${tt('success')}`
					};
					break;
				}
				case 'newConfig': {
					formData = { is_new_configure: true };
					resultMessage = {
						text: `${tt('controller')} ${tt('phrases.new_configure')} ${tt(
							'success'
						)}`
					};
					break;
				}
				case 'newSB': {
					formData = { is_new_sb: true };
					resultMessage = {
						text: `${tt('controller')} ${tt('phrases.new_script')} ${tt('success')}`
					};
					break;
				}
				case 'reconnect': {
					formData = { is_reconnect: true };
					resultMessage = {
						text: `${tt('controller')} ${tt('reconnection')} ${tt('success')}`
					};
					break;
				}

			}

			const payload = {
				itemId: row.id,
				data: formData,
				resultMessage: resultMessage
			};

			// console.log(payload);
			this.controller_cmd(payload);
		}
	}
};
</script>