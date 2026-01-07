<template>
	<div
		class="edit-form-container maintenance-form"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<el-form
			:class="['item-edit-form relative section-row bolded-labels']"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			label-position="top"
		>
			<div :class="['el-form-item flex mrow wrap', { showJustInfo: showJustInfo }]">
				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item
						:label="`${tt('Work_Order')} ${tt('Request')} #`"
						v-if="itemData"
						class="showJustInfo"
					>
						<b>{{ itemData.id }}</b>
						<!-- <CustomInput :value="itemData.serial_number" /> -->
					</el-form-item>

					<el-form-item
						:label="`${tt('Name')} ${tt('Work_Order')} ${tt('Request')}`"
						prop="title"
						required
					>
						<CustomInput v-model="formData.title" :placeholder="tt('name')" />
					</el-form-item>

					<!-- ------------------------ -->
					<div class="el-form-item">
						<div class="mrow flex bottom">
							<el-form-item
								:label="tt('Due_Date')"
								prop="finish_date"
								class="mcol-xs-6"
								required
							>
								<Datepicker
									v-model="formData.finish_date"
									:placeholder="`${tt('Select')} ${tt('date')}`"
									className=" "
								/>
							</el-form-item>
						</div>
					</div>

					<el-form-item prop="description" :label="tt('Description')" required>
						<div class="el-form-item el-textarea" v-if="showJustInfo">
							<div
								class="flex align-center el-input__inner el-textarea__inner"
								v-html="formData.description || '-'"
							></div>
						</div>

						<CustomInput
							v-else
							v-model="formData.description"
							:placeholder="tt('text')"
							type="textarea"
							rows="5"
						/>
					</el-form-item>

					<el-form-item
						:label="tt('phrases.Assigned_to')"
						prop="request_recipient_id"
						required
					>
						<CustomSelect
							filterable
							clearable
							:optionsLoading="usersLoading"
							:optionsList="usersList"
							labelKey="full_name"
							:placeholder="`${tt('Select')} ${tt('User')}`"
							v-model="formData.request_recipient_id"
						/>
					</el-form-item>
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item :label="tt('Production_Line')" prop="production_line_id">
						<CustomSelect
							filterable
							clearable
							:optionsLoading="productionLinesLoading"
							:optionsList="productionLinesList"
							:placeholder="
								showJustInfo ? '-' : `${tt('select')} ${tt('production_line')}`
							"
							v-model="formData.production_line_id"
						/>
					</el-form-item>

					<el-form-item :label="tt('Machine')" prop="machine_id">
						<CustomSelect
							filterable
							clearable
							:optionsLoading="machinesLoading"
							:optionsList="machinesList"
							:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('machine')}`"
							v-model="formData.machine_id"
						/>
					</el-form-item>

					<el-form-item :label="tt('Asset')" prop="asset_id">
						<FetchByQuerySelect
							:disabled="!formData.machine_id"
							clearable
							filterable
							enableLoadmore
							v-model="formData.asset_id"
							:loadmoreIsActive="!formData.machine_id"
							:optionsLoading.sync="assetsLoading"
							:optionsList.sync="assetsList"
							:settings="assetQueryOptions"
							:placeholder="showJustInfo ? '-' : tt('asset')"
						/>
					</el-form-item>

					<el-form-item :label="tt('Item')" prop="equipment_id">
						<FetchByQuerySelect
							:disabled="!formData.asset_id"
							clearable
							filterable
							enableLoadmore
							v-model="formData.equipment_id"
							:loadmoreIsActive="!formData.asset_id"
							:optionsLoading.sync="equipmentsLoading"
							:optionsList.sync="equipmentsList"
							:placeholder="showJustInfo ? '-' : tt('item')"
							:settings="equipmentsQueryOptions"
							:setupLabelSettings="equipmentLabelOptions"
						/>
					</el-form-item>
				</div>
			</div>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { USER_ROLES_TYPES /*, workOrdersStatusesList*/ } from '@/constants/global';

import { itemFormMixin, requestsListMixin, actionButtonsMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin(), actionButtonsMixin()],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue')
	},

	props: {
		// new_item_type: Number,
		// plantId: Number,
	},
	data() {
		return {
			productionLinesLoading: false,
			productionLinesList: [],
			assetsList: [],
			assetsLoading: false,
			machinesList: [],
			machinesLoading: false,
			equipmentsList: [],
			equipmentsLoading: false,
			usersList: [],
			usersLoading: false,

			editForm: false,

			formData: {
				plant_id: this.plantId,
				parent_id: null,
				production_line_id: null,
				machine_id: null,
				asset_id: null,
				equipment_id: null,
				finish_date: '',
				title: '',
				description: '',
				request_recipient_id: null
			},

			rules: {}
		};
	},

	computed: {
		...mapState({
			// authUser: state => state.auth.authUser,
			// plantsLoading: state => state.global.globalPlantsLoading,
			// plantsList: state => state.global.globalPlantsList
		}),

		// workOrdersStatusesList: () => workOrdersStatusesList,

		plantId: that =>
			that.itemData ? that.itemData.plant_id : that.additionalSettings.plantId,

		assetQueryOptions() {
			const { production_line_id, machine_id } = this.formData;
			return Object.freeze({
				fetchAction: 'assets/fetch_assets',
				params: {
					plantId: this.plantId,
					machine_id: machine_id,
					production_line_id: production_line_id
				}
			});
		},

		equipmentsQueryOptions() {
			const { production_line_id, machine_id, asset_id } = this.formData;

			return Object.freeze({
				fetchAction: 'equipments/fetch_equipments',
				params: {
					plantId: this.plantId,
					machine_id: machine_id,
					production_line_id: production_line_id,
					asset_id: asset_id
				}
			});
		},
		equipmentLabelOptions: () =>
			Object.freeze({
				accessors: [
					'brand_name',
					'machine_name',
					'production_line_name',
					'location_name'
				],
				delimeter: ','
			}),

		showJustInfo: that =>
			that.settings && that.settings.showJustInfo && !that.editForm,

		requestsToDoList() {
			const { /*isSuperAdmin, authUser, parentWorkOrderId*/ formData } = this;

			let list = [
				{
					action: 'fetch_users',
					payload: {
						params: { type: USER_ROLES_TYPES.CUSTOMER }
					},
					bindTo: [
						{
							prop: 'plantId',
							param: 'plantId',
							clean_prop: 'formData.request_recipient_id'
						}
					],
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				},
				{
					action: 'fetch_production_lines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [{ prop: 'plantId', param: 'plantId' }],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_machines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'plantId', param: 'plantId' },
						{
							prop: 'formData.production_line_id',
							param: 'productionLineId',
							clean_prop: 'formData.machine_id'
						}
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				},
				{
					action: 'fetch_assets',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: formData.asset_id
						? {
								fetchById: {
									action: 'assets/fetch_asset',
									itemId: formData.asset_id
								}
						  }
						: null,
					bindTo: [
						{ prop: 'plantId', param: 'plantId', noFetch: true },
						{
							prop: 'formData.production_line_id',
							param: 'productionLineId',
							clean_prop: 'formData.asset_id'
						},
						{
							prop: 'formData.machine_id',
							param: 'machineId',
							clean_prop: 'formData.asset_id'
						}
					],
					localProp: 'assetsList',
					localLoadProp: 'assetsLoading'
				},
				{
					action: 'fetch_equipments',
					// payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: formData.equipment_id
						? {
								fetchById: {
									action: 'equipments/fetch_equipment',
									itemId: formData.equipment_id
								}
						  }
						: null,
					bindTo: [
						{ prop: 'plantId', param: 'plantId', noFetch: true },
						{
							prop: 'formData.production_line_id',
							param: 'productionLineId',
							clean_prop: 'formData.equipment_id'
						},
						{
							prop: 'formData.machine_id',
							param: 'machineId',
							clean_prop: 'formData.equipment_id'
						},
						{
							prop: 'formData.asset_id',
							param: 'assetId',
							clean_prop: 'formData.equipment_id'
						}
					],
					localProp: 'equipmentsList',
					localLoadProp: 'equipmentsLoading'
				}
			];

			return Object.freeze(list);
		}
	},

	methods: {
		...mapActions({
			convert_item: 'maintenance/convert_maintenance_request',
			save_item: 'maintenance/save_maintenance_request',
			reject_item: 'maintenance/reject_maintenance_request',

			fetch_users: 'users/fetch_users',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_machines: 'machines/fetch_machines',
			fetch_assets: 'assets/fetch_assets',
			fetch_equipments: 'equipments/fetch_equipments',
			get_auth_user: 'auth/get_auth_user'
		}),

		preparePayload(payload) {
			payload.data.plant_id = this.plantId;
			payload.data.production_line_id = payload.data.production_line_id || null;
			payload.data.machine_id = payload.data.machine_id || null;
			payload.data.asset_id = payload.data.asset_id || null;
			payload.data.equipment_id = payload.data.equipment_id || null;

			return payload;
		},

		convertItem() {
			const settings = {
				show: true,
				editModalProp: 'editModalClassicSecond',
				title: 'Convert Work Order Request',
				instanceData: this.itemData,
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer small-header small-footer',
				componentPath: 'WorkOrderRequests/ConvertForm',
				hideSubmitButtons: true,
				footerActions: [
					{
						name: 'validateForm',
						button_text: 'CONVERT',
						disablePopover: true,
						type: 'primary'
					}
				],
				callback: () => {
					// that.fetchItems({ ...that.filters, ...that.globalFilters });
					this.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
					this.show_edit_modal({
						show: false,
						editModalProp: 'editModalClassicSecond'
					});
					this.get_auth_user();
				}
			};
			this.show_edit_modal(settings);
		},

		rejectItem() {
			this.confirmHelper({
				message: 'Reject this Work Order Request?'
			})
				.then(() => {
					this.reject_item({ itemId: this.itemData.id }).then(() => {
						this.$emit('event', 'successModalSubmit');
					});
				})
				.catch(() => {});
		},

		/*editItem() {
			this.editForm = !this.editForm;
		}*/

		editItem(data) {
			// console.log(data)
			this.set_global_state({
				stateProp: 'callMethod',
				value: { name: 'editItem', payload: data }
			});

			setTimeout(() => {
				this.set_global_state({ stateProp: 'callMethod', value: null });
			}, 10);
		}
	}
};
</script>
