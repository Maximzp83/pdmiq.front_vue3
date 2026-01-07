<template>
	<div
		:class="[
			'edit-form-container maintenance-form',
			{ 'work-order-details-item card content-row': !fromModal }
		]"
	>
		<SimpleSpinner :active="processing" />

		<div class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
		</div>

		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<div :class="['card-content', { 'flex wrap top': !fromModal }]">
			<div class="header-block flex align-center" v-if="!fromModal">
				<div class="step-number bold span-block">
					<span>{{ progress }}</span>
				</div>
			</div>
			<!-- :validate="" -->
			<el-form
				:class="[
					'item-edit-form relative section-row mcol-xs-12',
					{ 'showJustInfo bolded-values': showJustInfo }
				]"
				label-width="150px"
				ref="itemForm"
				:model="formData"
				:label-position="isMobile || fromModal ? 'top' : 'left'"
			>
				<!-- :label-position="(isMobile || !fromModal) ? 'top' : 'left'" -->
				<div class="flex mrow wrap">
					<div class="mcol-xs-12 mcol-sm-6">
						<el-form-item :label="tt('Work_Station')" prop="work_station_id">
							<CustomSelect
								v-if="!showJustInfo"
								filterable
								clearable
								:optionsLoading="workStationsLoading"
								:optionsList="workStationsList"
								:placeholder="`${tt('Select')} ${tt('station')}`"
								v-model="formData.work_station_id"
							/>
							<div v-else class="semi-bold">
								{{ itemData.workStation ? itemData.workStation.name : '-' }}
							</div>
						</el-form-item>

						<el-form-item
							:label="tt('phrases.estimated_start_date')"
							prop="estimated_started_at"
						>
							<Datepicker
								className=" "
								v-model="formData.estimated_started_at"
								:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('date')}`"
							/>
							<!-- :picker-options="pickerOptionsStart" -->
						</el-form-item>

						<el-form-item
							:label="tt('phrases.estimated_completion_date')"
							prop="estimated_finished_at"
						>
							<Datepicker
								className=" "
								v-model="formData.estimated_finished_at"
								:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('date')}`"
							/>
							<!-- :picker-options="pickerOptionsFinish" -->
						</el-form-item>

						<el-form-item label="PO #" prop="po_number ">
							<CustomInput
								v-model="formData.po_number"
								:placeholder="showJustInfo ? '-' : tt('text')"
							/>
						</el-form-item>

						<el-form-item
							v-if="fromModal"
							:label="tt('Price')"
							required
							prop="actual_cost"
						>
							<!-- <CustomInput v-model="formData.price" placeholder="0"/> -->
							<div class="flex align-center">
								<el-input-number
									v-show="editActualCost"
									v-model="formData.actual_cost"
									:precision="2"
									:min="0"
								/>
								<div
									v-show="!editActualCost"
									class="bold value-instead-input"
									v-text="'$' + formData.actual_cost"
								></div>
								<div
									class="link underline value-instead-input toggle-link"
									v-text="editActualCost ? 'Close' : 'Edit'"
									@click="editActualCost = !editActualCost"
								></div>
							</div>
						</el-form-item>
					</div>

					<div class="mcol-xs-12 mcol-sm-6">
						<el-form-item :label="tt('Technicians')" prop="technicians_ids">
							<CustomSelect
								v-if="!showJustInfo"
								filterable
								multiple
								:optionsLoading="usersLoading"
								:optionsList="usersList"
								:placeholder="`${tt('select')} ${tt('technician')}`"
								labelKey="full_name"
								v-model="formData.technicians_ids"
							/>
							<!-- <div v-else class="semi-bold">
								{{ itemData.technicalExecutor ? itemData.technicalExecutor.full_name : ''}}
							</div> -->
						</el-form-item>

						<el-form-item
							:label="tt('Hours')"
							prop="actual_time"
							required
							class="mcol-xs-7"
						>
							<!-- v-model="formData.actual_time" -->
							<div class="flex mrow" v-if="!showJustInfo">
								<CustomInput
									:value="actual_hours"
									placeholder="00"
									@input="val => handleTimeInput(val, 'actual_hours')"
								/>
								<div>:</div>
								<CustomInput
									:value="actual_minutes"
									placeholder="00"
									@input="val => handleTimeInput(val, 'actual_minutes')"
								/>
							</div>
							<div v-else class="semi-bold">{{ formData.actual_time }}</div>
						</el-form-item>

						<el-form-item
							:label="tt('Materials')"
							prop="proposed_materials"
							v-show="fromModal"
						>
							<div class="inline-form-items-list inline-labels">
								<div class="content-row">
									<MaterialItem
										fromModal
										ref="MaterialItem"
										v-for="(item, idx) in materialsItemsList"
										:key="`material_item-${item.id}`"
										:item-data="item"
										:item-index="idx"
										@onCreate="addFormItem('materialsItemsList', 'm_i-')"
										@onRemove="id => removeFormItem(id, 'materialsItemsList')"
										@calcActualPrice="calcActualPrice"
										:isLast="materialsItemsList.length == idx + 1"
									/>
								</div>

								<!-- <div class="margin-top-row">
									<el-button
										class="action-button create-button"
										size="mini"
										type="success"
										icon="icomoon icon-cross"
										@click="addFormItem('materialsItemsList', 'm_i-')"
									/>
								</div> -->
							</div>
						</el-form-item>

						<el-form-item
							:label="`${tt('Additional')} ${tt('phrases.Work_Order_Details')}`"
							prop="fab_shop_manager_notes"
							required
						>
							<el-input
								v-if="!showJustInfo"
								v-model="formData.fab_shop_manager_notes"
								type="textarea"
								rows="5"
							/>
							<div v-else class="semi-bold">
								{{ itemData.fab_shop_manager_notes }}
							</div>
						</el-form-item>
					</div>
				</div>

				<div class="el-form-item form-info-block " v-if="!fromModal">
					<div class="mrow flex wrap">
						<div class="mcol-xs-12 mcol-sm-6">
							<div class="card inverted">
								<div class="card-header">
									<div class="title semi-bold">{{ tt('Fab_Shop_Budget') }}</div>
								</div>

								<div class="card-content main filled">
									<ul class="dots-in-text">
										<li
											v-for="item in itemData.proposedMaterials"
											:key="`pm-${item.id}`"
										>
											<span class="label" v-text="item.name"></span>
											<span class="value" v-text="`$${item.price}`"></span>
										</li>
									</ul>
								</div>

								<div class="card-content filled">
									<ul class="dots-in-text bold">
										<li>
											<span class="label">{{ tt('Technicians') }}</span>
											<span class="value" v-text="`$${techniciansCost}`"></span>
											<!-- <span class="value" v-text="`${itemData.actual_cost}$`"></span> -->
										</li>
									</ul>
								</div>

								<div
									class="card-content with-form"
									v-if="/*!isCompleted &&*/ isFabManager"
								>
									<el-form-item
										:label="tt('fab_shop_budget')"
										class="flex align-center space-between"
									>
										<el-input-number
											v-model="formData.actual_cost"
											:precision="2"
											:min="0"
										/>
									</el-form-item>
								</div>

								<div class="card-content filled" v-else>
									<ul class="dots-in-text bold">
										<li>
											<span class="label">{{ tt('Fab_Shop_Budget') }}</span>
											<span class="value" v-text="`$${itemData.actual_cost}`"></span>
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-6" v-if="isConcluded || true">
							<div class="card">
								<div class="card-header filled">
									<div class="title semi-bold">{{ tt('Running_Total') }}</div>
								</div>

								<div class="card-content main with-form" v-if="!showJustInfo">
									<el-form-item
										label=""
										prop="actual_materials"
										class="without-margin"
									>
										<div class="inline-form-items-list">
											<div class="content-row">
												<div class="el-form flex mrow relative content-row">
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content">
															{{ tt('Materials') }}
														</div>
													</div>
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content">{{ tt('cost') }}</div>
													</div>
												</div>

												<MaterialItem
													ref="ActualMaterialItem"
													v-for="(item, idx) in actualMaterialsItemsList"
													:key="`ac_material_item-${item.id}`"
													:item-data="item"
													:item-index="idx"
													@onCreate="
														addFormItem('actualMaterialsItemsList', 'am_i-')
													"
													@onRemove="
														id => removeFormItem(id, 'actualMaterialsItemsList')
													"
													@calcActualPrice="calcActualPrice"
													:isLast="actualMaterialsItemsList.length == idx + 1"
													targetPropName="actual_materials"
												/>

												<div class="el-form flex mrow relative content-row">
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content">
															{{ tt('Technicians') }}
														</div>
													</div>
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content semi-bold">
															{{ itemData.execution_technicians_cost }}$
														</div>
													</div>
												</div>
											</div>
										</div>
									</el-form-item>
								</div>
								<div v-else class="card-content main">
									<ul class="dots-in-text">
										<li
											v-for="item in itemData.actualMaterials"
											:key="`acm-${item.id}`"
										>
											<span class="label" v-text="item.name"></span>
											<span class="value" v-text="`$${item.price}`"></span>
										</li>
									</ul>
								</div>

								<!-- <div class="card-content with-form" v-if="!showJustInfo">
									<el-form-item
										label="Running Total"
										class="flex align-center space-between"
									>
										<el-input-number
											v-model="formData.execution_cost"
											:precision="2"
											:min="0"
										/>
									</el-form-item>
								</div> -->

								<div class="card-content" v-if="showJustInfo">
									<ul class="dots-in-text bold">
										<li>
											<span class="label capitalize">{{ tt('Technicians') }}</span>
											<span
												class="value"
												v-text="`$${executionTechniciansCost}`"
											></span>
											<!-- <span class="value" v-text="`${itemData.actual_cost}$`"></span> -->
										</li>
									</ul>
								</div>

								<div class="card-content">
									<ul class="dots-in-text bold">
										<li>
											<span class="label">{{ tt('Running_Total') }}</span>
											<span
												class="value"
												v-text="`${itemData.execution_cost}$`"
											></span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					:class="[{ 'dialog-decorate-footer ': fromModal }, 'no-left-margin']"
					v-if="!showJustInfo || isFabManager"
				>
					<el-form-item class="FormOperationsButtons">
						<el-button
							@click="handleReset"
							native-type="button"
							class="item-action-button"
						>
							<span class="uppercase">{{ tt('RESET') }}</span>
						</el-button>

						<el-button
							@click="validateForm"
							type="primary"
							native-type="button"
							class="item-action-button"
						>
							<span class="uppercase">{{ tt('SAVE') }}</span>
						</el-button>
					</el-form-item>

					<!-- <FormOperationsButtons @onCancel="handleCancel" @onSave="validateForm" /> -->
				</div>
				<div class="FormOperationsButtons" v-else-if="actionButtons.length">
					<el-button
						v-for="item in actionButtons"
						:key="`button-${item.id}`"
						@click="event(item.event, item.args)"
						native-type="button"
						type="primary"
						:class="['item-action-button pointer-events-all', item.className]"
					>
						<span>{{ item.text }}</span>
					</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import {
	setObjectVal,
	formatTime,
	findItemBy,
	convertTimeToNumberValue
} from '@/helpers';
// import { calcFabShopBudget } from '@/helpers/specialHelpers';

import { USER_ROLES_TYPES } from '@/constants/global';

import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin()
	],
	components: {
		/*FormOperationsButtons: () =>
			import('@/components/form/FormOperationsButtons.vue'),*/
		MaterialItem: () => import('./MaterialItem.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		progress: Number,
		title: String,
		showJustInfo: Boolean,
		actionButtons: {
			type: Array,
			default: () => []
		},
		isConcluded: Boolean,
		isCompleted: Boolean,
		isFabManager: Boolean
	},

	data() {
		return {
			workStationsList: [],
			workStationsLoading: false,
			usersList: [],
			usersLoading: false,
			processing: false,
			editActualCost: false,

			actual_hours: '',
			actual_minutes: '',

			materialsItemsList: [],
			actualMaterialsItemsList: [],

			formData: {
				work_station_id: null,
				technicians_ids: [],
				actual_time: '',
				fab_shop_manager_notes: '',
				actual_cost: 0,
				actual_materials: [],
				proposed_materials: [],
				execution_cost: 0,

				estimated_started_at: '',
				estimated_finished_at: '',

				po_number: ''
				// proposed_cost: 0,
			}
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'MaterialItem', targetProp: 'proposed_materials' },
			{ ref: 'ActualMaterialItem', targetProp: 'actual_materials' },
		]),

		requestsToDoList() {
			if (!this.showJustInfo) {
				return Object.freeze([
					{
						action: 'fetch_work_stations',
						payload: { params: { plantId: this.authUser.plant_id } },
						localProp: 'workStationsList',
						localLoadProp: 'workStationsLoading'
					},
					{
						action: 'fetch_users',
						payload: {
							params: {
								type: USER_ROLES_TYPES.CUSTOMER,
								plantId: this.itemData.fabrication_plant_id
							}
						},
						localProp: 'usersList',
						localLoadProp: 'usersLoading'
					}
				]);
			}
			return [];
		},
		// actualCost: that => calcFabShopBudget({ cellValue: that.itemData }),

		selectedTechnicians() {
			const { formData, usersList, itemData } = this;

			if (
				itemData &&
				itemData.technicalProcesses &&
				itemData.technicalProcesses.length
			) {
				return itemData.technicalProcesses.map(pi => pi.technician);
			}

			if (formData.technicians_ids && usersList.length) {
				let technicians = [];

				formData.technicians_ids.forEach(id => {
					const technician = findItemBy('id', id, usersList);
					if (technician) {
						technicians.push(technician);
					}
				});

				return technicians;
			}
			return null;
		},

		techniciansCost() {
			const time = convertTimeToNumberValue(
				`${this.actual_hours}:${this.actual_minutes}`
			);

			return time * 35;

			/*if (this.selectedTechnicians) {
				const time = convertTimeToNumberValue(
					`${this.actual_hours}:${this.actual_minutes}`
				);

				let cost = 0;

				this.selectedTechnicians.forEach(ti => {
					cost += ti.hourly_rate * time
				})
				return cost;
			}*/
			// return 0;
		},

		executionTechniciansCost() {
			const { selectedTechnicians, itemData } = this;
			const { technicalProcesses } = itemData;
			if (itemData && technicalProcesses.length && selectedTechnicians) {
				let cost = 0;

				technicalProcesses.forEach(tpi => {
					const { total_cost } = tpi;
					cost += total_cost;
					/*executionTimes.forEach(ti => {
						const time = convertTimeToNumberValue(ti.time);
						// console.log(time, technician.hourly_rate, cost)
						cost += technician.hourly_rate * time;
					});*/
				});

				return cost;
			}
			return 0;
		}

		/*pickerOptionsStart: () =>
			Object.freeze({
				disabledDate(date) {
					const start = new Date();
					const today = start.getTime() - 3600000 * 24;
					const dateMs = date.getTime();

					return dateMs < today;
				}
			})*/
		/*pickerOptionsFinish() {
			const startDate = new Date(this.formData.estimated_started_at).getTime();
			return {
				disabledDate(date) {
					return startDate > date.getTime();
				}
			}
		}*/
		// formatTime: () => formatTime,
	},

	methods: {
		...mapActions({
			fetch_work_stations: 'plant_work_stations/fetch_work_stations',
			fetch_users: 'users/fetch_users',

			save_item: 'plant_requisitions/approve_requisition'
		}),

		event(name, data) {
			this.$emit('event', name, data);
		},

		handleTimeInput(time, prop) {
			this[prop] = time;
			this.calcActualPrice();
			// this.formData.actual_time = formatTime(time, 'H:m');
		},

		calcActualPrice() {
			setTimeout(() => {
				const ref = this.fromModal ? 'MaterialItem' : 'ActualMaterialItem';
				const costProp = !this.fromModal
					? 'formData.execution_cost'
					: 'formData.actual_cost';
				let cost = 0;

				if (this.$refs[ref]) {
					this.$refs[ref].forEach(mi => {
						cost += Number(mi._data.formData.price);
					});

					if (ref == 'MaterialItem') {
						cost += this.techniciansCost;
					}

					setObjectVal(this, costProp, cost);
				}
			}, 10);
		},

		localSetupPage(itemData) {
			/*if (this.showJustInfo) {
				console.log(itemData)
			}*/

			if (itemData) {
				if (itemData.actual_time) {
					this.formData.actual_time = formatTime(itemData.actual_time, 'H:m');
					let timeArray = this.formData.actual_time.split(':');
					this.actual_hours = timeArray[0];
					this.actual_minutes = timeArray[1];
				}
			}

			if (itemData.proposedMaterials && itemData.proposedMaterials.length) {
				this.materialsItemsList = this.setupFormSubItemsList(
					itemData.proposedMaterials,
					'm_i'
				);
			} else {
				this.addFormItem('materialsItemsList', 'm_i-');
			}

			if (itemData.actualMaterials && itemData.actualMaterials.length) {
				this.actualMaterialsItemsList = this.setupFormSubItemsList(
					itemData.actualMaterials,
					'am_i'
				);
			} else {
				this.addFormItem('actualMaterialsItemsList', 'am_i-');
			}
		},

		handleReset() {
			this.$emit('event', 'handleReset');
		},

		localSubmit(data) {
			let payload = {
				itemId: this.itemData.id,
				data: data
				// method: 'PUT'
			};
			// console.log(data)
			if (!data.proposed_materials.some(mi => !!mi.price && !!mi.name)) {
				data.proposed_materials = [];
			}
			if (
				!data.actual_materials ||
				!data.actual_materials.some(mi => !!mi.price && !!mi.name)
			) {
				data.actual_materials = [];
			}

			data.actual_time = `${this.actual_hours}:${this.actual_minutes}`;

			/*if (!this.fromModal) {
				data.actual_cost = this.new_cost;
			}*/

			// delete payload.data.id;

			/*if (payload) {
				console.log(2, payload)
				return
			}*/
			this.processing = true;

			this.save_item(payload)
				.then(() => {
					this.$emit('event', 'reloadPage');
					// this.handleCancel();
					this.processing = false;
				})
				.catch(() => {
					this.processing = false;
				});
		}

		/*successSubmitCallback() {
			this.$emit('event', 'reloadPage');
			this.handleCancel();
		}*/
	},

	watch: {
		selectedTechnicians() {
			this.calcActualPrice();
		}
	}
};
</script>
