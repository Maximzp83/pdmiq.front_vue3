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
			<div :class="['el-form-item flex mrow wrap']">
				<div class="mcol-xs-12 mcol-sm-6">
					<div
						class="el-form-item mcol-xs-12 mcol-lg-6"
						v-if="formData.parent_id && settings && settings.parentOrderData"
					>
						<div class="el-form-item__label">{{ tt('Work_Order') }} #</div>
						<div
							class="semi-bold link info-color"
							@click="showParentOrder(settings.parentOrderData)"
						>
							{{ settings.parentOrderData.serial_number }} ({{
								settings.parentOrderData.title
							}})
						</div>
					</div>

					<!-- <el-form-item :label="tt('Status')" prop="status" required
						:class="['mcol-xs-12 mcol-lg-6', { 'showJustInfo': showJustInfo }]"
					>
						<CustomSelect
							:optionsList="workOrdersStatusesList"
							:placeholder="`${tt('select')} ${tt('status')}`"
							v-model="formData.status"
						/>
					</el-form-item> -->
					<div
						class="flex mrow wrap inline-form-items-list inline-labels align-center"
						v-if="!showJustInfo"
					>
						<el-form-item
							prop=""
							class="relative mcol-xs-4 label-to-center"
							:label="`${tt('Time')}`"
						>
							<el-switch v-model="isTotalActive" />
						</el-form-item>

						<div class="mcol-xs-3 semi-bold capitalize el-form-item__label p-0">
							{{ tt('Total') }}
						</div>
					</div>

					<el-form-item
						v-if="isTotalActive"
						prop="total_time"
						:label="tt('Total')"
						required
						class="mt-10"
					>
						<div class="flex mrow align-center small-input-paddings">
							<div class="mcol-xs-3 lh-16">
								<label>{{ tt('hours') }}</label>
								<CustomInput
									class="mini p-0"
									className="text-center"
									v-model="total_hours"
									placeholder="00"
									reactive
									:inputCallback="val => validateTimeInput(val, 'total_hours')"
								/>
							</div>
							<div class="mcol-xs-3 lh-16">
								<label class="capitalize">{{ tt('minutes') }}</label>
								<CustomInput
									class="mini p-0"
									className="text-center"
									reactive
									placeholder="00"
									v-model="total_minutes"
									:inputCallback="val => validateTimeInput(val, 'total_minutes')"
								/>
								<!-- :value="total_minutes" -->
								<!-- @input="val => handleTimeInput(val, 'total_minutes')" -->
							</div>
						</div>
					</el-form-item>

					<el-form-item
						v-else
						prop="finish_time"
						:label="tt('time')"
						required
						:class="['mt-10 small-paddings-time']"
					>
						<div class="flex mrow align-center">
							<div class="mcol-xs-3 mini" v-if="!showJustInfo">
								<!-- :picker-options="startTimePickerOptions" -->
								<el-time-picker
									v-model="formData.start_time"
									value-format="HH:mm"
									format="HH:mm"
									:placeholder="tt('start')"
								>
								</el-time-picker>
							</div>

							<!-- @blur="clearValidate" -->
							<div class="mcol-xs-3 mini" v-if="!showJustInfo">
								<el-time-picker
									v-model="formData.finish_time"
									value-format="HH:mm"
									format="HH:mm"
									:picker-options="endTimePickerOptions"
									:placeholder="tt('finish')"
								>
								</el-time-picker>
							</div>

							<div class="mcol-xs-6" v-else>
								<i class="el-input__icon el-icon-time section-title muted"></i>
								<span class="el-range-input">{{
									`${formData.start_time} - ${formData.finish_time}`
								}}</span>
							</div>

							<div class="mcol-xs-6 form-item">
								<div class="semi-bold span-block el-form-item__label no-paddings">
									<b>{{ tt('phrases.Total_time') }}: </b>
								</div>
								<div class="semi-bold span-block inherit-color">{{ totalTime }}</div>
							</div>
						</div>
					</el-form-item>

					<div class="el-form-item">
						<div class="flex mrow ">
							<el-form-item
								:label="tt('Attachments')"
								prop="attachments"
								class="mcol-xs-6"
							>
								<FileUploadBlock
									ref="AttachmentsUploadBlock"
									multiple
									:enableLinkToFile="!!itemId"
									keepFilePath
									showDeleteButton
									:accept="' '"
									:disabled="showJustInfo"
									:buttonText="tt('phrases.upload_files')"
									:pictures="attachmentsList"
								/>
							</el-form-item>

							<el-form-item
								:label="tt('Images')"
								prop="images"
								class="upload-form-item mcol-xs-6"
							>
								<FileUploadBlock
									ref="ImgUploadBlock"
									multiple
									keepFilePath
									showImageClickOverlay
									:disabled="showJustInfo"
									:pictures="imagesList"
									@onImgClick="togglePreviewModal"
								/>
								<!-- :className="'pointer'" -->
								<!-- :replace-selected-file="true" -->
							</el-form-item>
						</div>
					</div>

					<div :class="['el-form-item', { showJustInfo: showJustInfo }]">
						<div
							class="flex mrow wrap inline-form-items-list inline-labels"
							v-if="!showJustInfo"
						>
							<el-form-item
								prop="is_problem_solved"
								class="relative mcol-xs-6"
								:label="tt('phrases.Problem_Solved')"
							>
								<el-switch
									v-model="formData.is_problem_solved"
									:active-value="1"
									:inactive-value="0"
								/>
							</el-form-item>

							<el-form-item
								prop="reason_type"
								:label="tt('Reason')"
								class="mcol-xs-6"
							>
								<!-- className="mini" -->
								<CustomSelect
									clearable
									:optionsList="maintenanceReasonTypesList"
									:placeholder="tt('none')"
									v-model="formData.reason_type"
								/>
							</el-form-item>

							<el-form-item
								class="mcol-xs-6"
								prop="is_sanitization_equipment"
								:label="tt('phrases.Sanitization_of_Tools')"
							>
								<el-switch
									v-model="formData.is_sanitization_equipment"
									:active-value="1"
									:inactive-value="0"
								/>
							</el-form-item>

							<!-- v-if="isIndustrialMatrix" -->
							<el-form-item
								class="mcol-xs-6"
								prop="is_acknowledge_by_supervisor"
								:label="tt('phrases.Acknowledge_by_supervisor')"
							>
								<el-switch
									v-model="formData.is_acknowledge_by_supervisor"
									:active-value="1"
									:inactive-value="0"
								/>
							</el-form-item>
						</div>

						<!-- <div v-else class="flex wrap mrow">
							<div class="mcol-xs-6">
								<div class="el-form-item__label">
									{{ tt('phrases.Problem_Solved') }}
								</div>
								<div class="semi-bold inherit-color">
									{{ formData.is_problem_solved ? tt('Yes') : tt('No') }}
								</div>
							</div>
							<div class="mcol-xs-6">
								<div class="el-form-item__label">{{ tt('Beakdown') }}</div>
								<div class="semi-bold inherit-color">
									{{ formData.reason_type ? tt('Yes') : tt('No') }}
								</div>
							</div>
							<div class="mcol-xs-6">
								<div class="el-form-item__label">
									{{ tt('phrases.Sanitization_of_Tools') }}
								</div>
								<div class="semi-bold inherit-color">
									{{ formData.is_sanitization_equipment ? tt('Yes') : tt('No') }}
								</div>
							</div>
							<div class="mcol-xs-6">
								<div class="el-form-item__label">
									{{ tt('phrases.Acknowledge_by_supervisor') }}
								</div>
								<div class="semi-bold inherit-color">
									{{ formData.is_acknowledge_by_supervisor ? tt('Yes') : tt('No') }}
								</div>
							</div>
						</div> -->
					</div>

					<!-- v-if="isIndustrialMatrix" -->
					<el-form-item
						:label="`${tt('Supervisor')} ${tt('notes')}`"
						prop="supervisor_notes"
						:class="{ showJustInfo: showJustInfo }"
					>
						<CustomInput v-model="formData.supervisor_notes" placeholder="-" />
					</el-form-item>

					<el-form-item
						:label="tt('Shift')"
						prop="shift"
						:class="{ showJustInfo: showJustInfo }"
					>
						<CustomSelect
							:optionsList="shiftValues"
							:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('shift')}`"
							labelKey="label"
							v-model="formData.shift"
						/>
					</el-form-item>

					<el-form-item
						class="content-row"
						prop="description"
						:label="
							`${tt('phrases.Equipment_Breakdown')} / ${tt('Maintenance_Log')}`
						"
						required
					>
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
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]">
					<div
						:class="[
							'card filled no-shadow el-form-item',
							{ 'has-error': mainInstancesError }
						]"
					>
						<div :class="['card-content']" @click="mainInstancesError = false">
							<div class="semi-bold title article-title">{{ tt('Equipment') }}</div>

							<div class="el-form-item mrow flex">
								<div :class="['mcol-xs-9 fluid']">
									<el-form-item
										:label="tt('Production_Line')"
										prop="production_line_id"
									>
										<CustomSelect
											@focus="mainInstancesError = false"
											filterable
											clearable
											:optionsLoading="productionLinesLoading"
											:optionsList="productionLinesList"
											:placeholder="
												showJustInfo
													? '-'
													: `${tt('select')} ${tt('production_line')}`
											"
											v-model="formData.production_line_id"
											prefixIcon="icomoon icon-production_lines"
										/>
									</el-form-item>

									<el-form-item :label="tt('Machine')" prop="machine_id">
										<CustomSelect
											@focus="mainInstancesError = false"
											filterable
											clearable
											:optionsLoading="machinesLoading"
											:optionsList="machinesList"
											:placeholder="
												showJustInfo ? '-' : `${tt('Select')} ${tt('machine')}`
											"
											v-model="formData.machine_id"
											prefixIcon="icomoon icon-machines"
										/>
									</el-form-item>

									<el-form-item :label="tt('Asset')" prop="asset_id">
										<FetchByQuerySelect
											@focus="mainInstancesError = false"
											:disabled="!formData.machine_id"
											clearable
											filterable
											enableLoadmore
											v-model="formData.asset_id"
											:loadmoreIsActive="!formData.machine_id"
											:optionsLoading.sync="assetsLoading"
											:optionsList.sync="assetsList"
											:settings="assetQueryOptions"
											:placeholder="showJustInfo ? '-' : tt('Asset')"
											prefixIcon="icomoon icon-assets"
										/>
									</el-form-item>

									<el-form-item :label="tt('Item')" prop="equipment_id">
										<FetchByQuerySelect
											@focus="mainInstancesError = false"
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
											prefixIcon="icomoon icon-equipments"
										/>
									</el-form-item>
								</div>

								<div
									class="mcol-xs-4 breakdown-radio-block"
									v-if="formData.reason_type"
								>
									<el-form-item prop="breakdown_type" :label="reasonTypeName">
										<RadioButtonsBlock
											v-if="!showJustInfo"
											v-model="formData.breakdown_type"
											:settings="breakdownTypeRadioOptions"
											:optionsList="breakdownTypesList"
										/>

										<div v-else class="breakdown-radio-block">
											<div class="radio-container ">
												<div
													:class="[
														'semi-bold radio-item',
														{
															visible:
																formData.breakdown_type ==
																BREAKDOWN_TYPES.PRODUCTION_LINE
														}
													]"
												>
													{{ tt('Breakdown') }}
												</div>

												<div
													:class="[
														'semi-bold radio-item',
														{
															visible:
																formData.breakdown_type == BREAKDOWN_TYPES.MACHINE
														}
													]"
												>
													{{ tt('Breakdown') }}
												</div>

												<div
													:class="[
														'semi-bold radio-item',
														{
															visible:
																formData.breakdown_type == BREAKDOWN_TYPES.ASSET
														}
													]"
												>
													{{ tt('Breakdown') }}
												</div>
											</div>
										</div>
									</el-form-item>
								</div>
							</div>
						</div>
					</div>

					<div class="alarm-color content-row" v-show="mainInstancesError">
						{{ tt('phrases.at_least_one_of_these_fields_is_required') }}
					</div>
				</div>
			</div>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>

		<!-- <div class="close-wo-checkbox">
			<el-checkbox v-model="formData.is_closed" :true-label="1" :false-label="0">
				<b>Close Work Order</b>
			</el-checkbox>
		</div> -->
		<div class="section-row" v-if="showJustInfo && selectedTaskProcedure">
			<div class="card">
				<div class="card-header filled bold">{{ tt('TASK_PROCEDURES') }}</div>
				<div class="card-content">
					<div class="content-row article-title">
						{{ selectedTaskProcedure.name }}
					</div>

					<div class=" card">
						<div class="card-content">
							<CustomDataListTable
								ref="ItemsTableContainer"
								disableSelection
								:itemsLoading="taskProceduresLoading"
								:tableData="selectedTaskProcedure.processes"
								:tableSettings="taskProcedureTableSettings"
								:itemsName="taskProceduresName"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

// import Editor from '@tinymce/tinymce-vue';
import {
	MAINTENANCE_TYPES,
	breakdownTypesList,
	BREAKDOWN_TYPES,
	MAINTENANCE_REASON_TYPES,
	maintenanceReasonTypesList
} from '@/constants/global';
import { getTimeDifference, findItemBy } from '@/helpers';

// import { required } from '@/constants/validation';
import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin,
	tabsMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin(),
		tabsMixin()
	],
	components: {
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		ElTimePicker: () =>
			import(/* webpackChunkName: "ElTimePicker" */ 'element-ui/lib/time-picker')
	},
	props: {
		new_item_type: Number
	},

	data() {
		return {
			// editorAPIKey: 'xgs69xurf1xqz1v4omstjgnsocspeoapq2w26uvwdh2c0tgo',
			// timeRange: [],

			// parentWorkOrder: null,
			productionLinesLoading: false,
			productionLinesList: [],
			assetsList: [],
			assetsLoading: false,
			machinesList: [],
			machinesLoading: false,
			equipmentsList: [],
			equipmentsLoading: false,
			taskProceduresList: [],
			taskProceduresLoading: false,
			attachmentsList: [],
			imagesList: [],

			mainInstancesError: false,

			// plant_id: null,
			isTotalActive: false,

			total_hours: '',
			total_minutes: '',

			formData: {
				type: this.new_item_type,
				plant_id: this.plantId,

				// status.PENDING,
				parent_id: null,
				production_line_id: null,
				machine_id: null,
				asset_id: null,
				equipment_id: null,
				start_time: '',
				finish_time: '',
				total_time: 0,
				is_problem_solved: 0,
				reason_type: null,
				breakdown_type: 0,
				is_sanitization_equipment: 0,
				supervisor_notes: '',
				shift: '',
				is_acknowledge_by_supervisor: 0,
				attachments: [],
				images: [],
				description: ''
				// is_closed: 0,
			},

			rules: {}
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,
			plantsLoading: state => state.global.globalPlantsLoading,
			plantsList: state => state.global.globalPlantsList
		}),

		// workOrdersStatusesList: () => workOrdersStatusesList,
		MAINTENANCE_TYPES: () => Object.freeze(MAINTENANCE_TYPES),
		breakdownTypesList: () => Object.freeze(breakdownTypesList()),
		BREAKDOWN_TYPES: () => Object.freeze(BREAKDOWN_TYPES),
		MAINTENANCE_REASON_TYPES: () => Object.freeze(MAINTENANCE_REASON_TYPES),
		maintenanceReasonTypesList: () => Object.freeze(maintenanceReasonTypesList()),

		showJustInfo: that => that.settings && that.settings.showJustInfo,

		plantId: that =>
			that.itemData ? that.itemData.plant_id : that.additionalSettings.plantId,
		// productionLineId: that => that.additionalSettings.productionLineId,
		// machineId: that => that.additionalSettings.machineId,
		// assetId: that => that.additionalSettings.assetId,

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
			const { /*production_line_id,*/ machine_id, asset_id } = this.formData;

			return Object.freeze({
				fetchAction: 'equipments/fetch_equipments',
				params: {
					plantId: this.plantId,
					machineId: machine_id,
					/*productionLineId: production_line_id,*/ assetId: asset_id
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

		breakdownTypeRadioOptions: () =>
			Object.freeze({
				className: 'radio-input',
				hideLabel: true
			}),

		timePickerOptions: () =>
			Object.freeze({
				start: '00:00',
				step: '00:01',
				end: '23:59'
			}),

		/*startTimePickerOptions: that => ({
			selectableRange: `00:00:00 - ${that.formData.finish_time || '23:59'}:00`
		}),*/
		endTimePickerOptions() {
			const { start_time } = this.formData;

			if (start_time) {
				let splitTime = start_time.split(':');
				let newDate = new Date(2000, 0, 1, +splitTime[0], +splitTime[1] + 15);
				const hours = newDate.getHours();
				const minutes = newDate.getMinutes();

				return {
					selectableRange: [
						`00:00:00 - ${splitTime[0]}:${splitTime[1]}:00`,
						`${hours}:${minutes}:00 - 23:59:00`
					]
				};
			}

			return {
				selectableRange: `00:00:00 - 23:59:00`
			};
		},

		selectedTaskProcedure() {
			const { showJustInfo, taskProceduresList, additionalSettings } = this;
			if (
				showJustInfo &&
				additionalSettings.taskProcedure &&
				taskProceduresList.length
			) {
				return Object.freeze(
					findItemBy('id', additionalSettings.taskProcedure.id, taskProceduresList)
				);
			}
			return null;
		},

		taskProcedureTableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						label: 'Name',
						prop: 'name'
					},
					{
						label: 'Notes',
						prop: 'notes'
					},
					{
						label: 'phrases.Expected_Time',
						prop: 'expected_time'
					},
					{
						label: 'Parts',
						prop: 'parts',
						meta: {
							fromArray: { subProp: 'stockPart.part_number', delimeter: ' ' }
						}
					},
					{
						label: '',
						prop: 'parts',
						meta: {
							fromArray: { subProp: 'quantity', delimeter: ' ' }
						}
					}
				])
			});
		},
		taskProceduresName() {
			return {
				one: this.tt('Process'),
				mult: this.tt('Processes')
			};
		},

		requestsToDoList() {
			let list = [];

			const {
				/*isIndustrialMatrix, authUser, parentWorkOrderId*/ formData,
				additionalSettings
			} = this;

			// if (isWithoutParent) {
			// if (isIndustrialMatrix) {
			list.push(
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
							param: 'productionLineId'
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
							param: 'productionLineId'
						},
						{
							prop: 'formData.machine_id',
							param: 'machineId'
						}
					],
					localProp: 'assetsList',
					localLoadProp: 'assetsLoading'
				},
				{
					action: 'fetch_equipments',
					// payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'plantId', param: 'plantId', noFetch: true },
						{
							prop: 'formData.production_line_id',
							param: 'productionLineId'
						},
						{
							prop: 'formData.machine_id',
							param: 'machineId'
						},
						{
							prop: 'formData.asset_id',
							param: 'assetId',
							fetchById: {
								action: 'equipments/fetch_equipment',
								itemId: formData.equipment_id
							}
						}
					],
					localProp: 'equipmentsList',
					localLoadProp: 'equipmentsLoading'
				}
			);
			// } else {

			// }
			if (additionalSettings.taskProcedure) {
				list.push({
					action: 'fetch_task_procedures',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [{ prop: 'plantId', param: 'plantId' }],
					localProp: 'taskProceduresList',
					localLoadProp: 'taskProceduresLoading'
				});
			}

			return Object.freeze(list);
		},
		/*parentWorkOrderId() {
			if (this.formSettings && this.formSettings.parent_id) {
				return +this.formSettings.parent_id;
			}
			return null;
		},*/

		totalTime() {
			const { start_time, finish_time } = this.formData;

			if (start_time && finish_time) {
				// console.log(start_time , finish_time)
				const { hours, minutes } = getTimeDifference({
					from: start_time,
					to: finish_time,
					timeOnly: true,
					nextDayWhenLessZero: true
				});
				if (hours) return `${hours}h ${minutes}min`;

				return `${minutes} minutes`;
			}
			return 0;
		},
		shiftValues: () =>
			Object.freeze([
				{ id: 'Day', label: 'Day' },
				{ id: 'Afternoon', label: 'Afternoon' },
				{ id: 'Night', label: 'Night' }
			]),

		uploadSettings: () => ({
			fileProp: 'images',
			multiple: true
		}),

		subItemsSettings: () => Object.freeze([
			{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments' },
			{ ref: 'ImgUploadBlock', targetProp: 'images' },
		]),

		reasonTypeName() {
			const { reason_type } = this.formData;
			if (reason_type) {
				const reason = findItemBy(
					'id',
					reason_type,
					this.maintenanceReasonTypesList
				);
				return reason ? reason.name : this.tt('none');
			}
			return this.tt('none');
		}
	},

	methods: {
		...mapActions({
			save_item: 'maintenance/save_maintenance_log',

			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_machines: 'machines/fetch_machines',
			fetch_assets: 'assets/fetch_assets',
			fetch_equipments: 'equipments/fetch_equipments',
			fetch_task_procedures: 'task_procedures/fetch_task_procedures',

			show_edit_modal: 'show_edit_modal'
		}),

		handleTimeInput(time, prop) {
			this[prop] = time;
		},

		validateTimeInput(time, prop) {
			if (isNaN(time)) {
				time = time.slice(0, -1);
			}

			if (prop == 'total_minutes') {
				if (Number(time) > 59) time = 59;
			}

			if (time && time.length) {
				if (time.length < 2) {
					time = `0${time}`;
				} else if (time.length > 2 && time[0] == '0') {
					time = time.slice(1);
				}
				/*else if (time.length > 2 ) {
					time = time.slice(0, time.length - 1);
				}*/
			}
			// console.log(time)
			return time;
		},

		calcTotalSec(total_hours, total_minutes) {
			// console.log(total_hours, total_minutes)
			return Number(total_hours) * 3600 + Number(total_minutes) * 60;
		},

		showParentOrder(row) {
			const settings = {
				show: true,
				title: 'See Parent Work Order',
				instanceData: row,
				editModalProp: 'editModalClassicSecond',
				componentPath: 'Maintenance/WorkOrders/ItemDetailsPreview',
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer small-header small-footer',
				additionalModalSettings: {
					plantId: row.plant_id,
					productionLinesList: this.productionLinesList
				},
				hideFooter: true
			};

			this.show_edit_modal(settings);
		},

		togglePreviewModal(data) {
			const payload = {
				eventName: 'togglePreviewModal',
				data: data,
				onward: true
			};
			this.$emit('event', payload);
		},

		downloadFile(dataurl, filename) {
			/*fetch(dataurl)
			.then(response => response.blob())
			.then(blob => {
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.download = filename;
			      // link.click();
			      console.log(link)

			    })
			.catch(console.error);*/
			const link = document.createElement('a');
			link.href = 'data:png/image;base64,' + dataurl;
			link.download = filename;
			link.target = '_blank';
			link.click();
		},

		localSetupPage(item) {
			/*if (this.parentWorkOrderId) {
				// console.log(this.routeQuery)
				this.formData.parent_id = this.parentWorkOrderId;
			}*/

			this.formData.plant_id = this.plantId;

			if (item) {
				if (item.attachments) {
					this.attachmentsList = item.attachments.map(ai => ai);
				}
				if (item.images) {
					this.imagesList = item.images.map(ai => ai);
				}

				if (!item.start_time && !item.finish_time) {
					this.isTotalActive = true;
				}
				if (item.total_time) {
					this.total_hours = Math.floor(item.total_time / 3600);
					this.total_minutes = Math.round((item.total_time % 3600) / 60);
				}
			} else {
				const {
					productionLineId,
					machineId,
					assetId,
					equipmentId
				} = this.additionalSettings;

				this.formData = this.setupForm(
					{
						production_line_id: productionLineId,
						machine_id: machineId,
						asset_id: assetId,
						equipment_id: equipmentId
					},
					this.formData
				);
			}
		},

		localPrepareSubmitData(data) {
			const { isTotalActive, total_hours, total_minutes } = this;

			/*	if (!isIndustrialMatrix) {
				delete data.supervisor_notes;
				delete data.is_acknowledge_by_supervisor;
			}*/

			if (!data.reason_type) {
				delete data.breakdown_type;
			}

			if (isTotalActive) {
				delete data.start_time;
				delete data.finish_time;
				data.total_time = this.calcTotalSec(total_hours, total_minutes);
				// console.log(data.total_time)
			} else {
				delete data.total_time;
			}

			return data;
		},

		preparePayload(payload) {
			payload.data.attachments = payload.data.attachments || [];
			payload.data.images = payload.data.images || [];
			payload.data.production_line_id = payload.data.production_line_id || null;
			payload.data.machine_id = payload.data.machine_id || null;
			payload.data.asset_id = payload.data.asset_id || null;
			payload.data.equipment_id = payload.data.equipment_id || null;

			if (payload.data.attachments.length || payload.data.images.length) {
				const hasNewAttach = payload.data.attachments.some(ai => !!ai.file);
				const hasNewImg = payload.data.images.some(ii => !!ii.file);
				payload.withFile = hasNewAttach || hasNewImg;
			}

			return payload;
		},

		localPreSubmitHook(payload) {
			const { start_time, finish_time, reason_type, breakdown_type } = payload.data;
			let valid = true;

			const validateProps = [
				'production_line_id',
				'machine_id',
				'asset_id',
				'equipment_id'
			];
			if (validateProps.some(prop => !!payload.data[prop])) {
				valid = true;
			} else {
				valid = false;
				this.mainInstancesError = true;
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
			}

			if (start_time && finish_time) {
				const { minutes_total } = getTimeDifference({
					from: start_time,
					to: finish_time,
					timeOnly: true,
					nextDayWhenLessZero: true
				});

				if (minutes_total < 15) {
					valid = false;
					this.$notify({
						type: 'warning',
						title: this.$t('phrases.form_isnt_ready'),
						message: `${this.tt('phrases.total_time_should_be_15_minutes')}!`
					});
				}
				// console.log(payload)
			}

			if (reason_type) {
				const { tt, reasonTypeName } = this;
				let message = '';

				if (!breakdown_type) {
					valid = false;
					message += `${reasonTypeName} ${tt('Type')} `;
				}

				if (!valid) {
					this.$notify({
						type: 'warning',
						title: tt('phrases.form_isnt_ready'),
						message: message + tt(`phrases.should_be_assigned`)
					});
				}
			}

			// console.log(payload)
			if (valid) {
				this.$emit('event', {
					eventName: 'handleSubmitForm',
					data: payload
				});
			}
			return { next: false };
		}
	},

	watch: {
		isTotalActive() {
			this.clearValidate(['finish_time']);
		}
	}
};
</script>
