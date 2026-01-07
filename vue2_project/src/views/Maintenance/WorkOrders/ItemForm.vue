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
						:label="`# ${tt('Work_Order')}`"
						v-if="itemData && !showJustInfo"
						class="showJustInfo"
					>
						<b>{{ itemData.serial_number }}</b>
						<!-- <CustomInput :value="itemData.serial_number" /> -->
					</el-form-item>
					<el-form-item :label="tt('phrases.Work_Order_Name')" prop="title" required>
						<CustomInput v-model="formData.title" :placeholder="tt('Name')" />
					</el-form-item>

					<el-form-item :label="tt('Status')" prop="status" required>
						<CustomSelect
							:optionsList="filteredWorkOrdersStatusesList"
							:placeholder="`${tt('select')} ${tt('status')}`"
							v-model="formData.status"
						/>
					</el-form-item>

					<div class="el-form-item">
						<div class="flex mrow ">
							<!-- hidePreview -->
							<el-form-item
								:label="tt('Attachments')"
								prop="attachments"
								class="mcol-xs-6"
							>
								<FileUploadBlock
									ref="AttachmentsUploadBlock"
									multiple
									enableLinkToFile
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

					<el-form-item :label="tt('Work_Order_Type')" prop="category_id">
						<div class="flex">
							<div class="relative mcol-xs-10 fluid span-block">
								<CustomSelect
									filterable
									clearable
									:optionsLoading="woTypesLoading"
									:optionsList="woTypesList"
									:placeholder="tt('type')"
									v-model="formData.category_id"
								/>
							</div>

							<el-button
								v-if="!fromAnotherInstance"
								@click="createWOType"
								:class="'create-button span-block'"
								size="mini"
								type="primary inverted"
								icon="icomoon icon-plus"
							/>
						</div>
					</el-form-item>

					<!-- --------Recurring------- -->
					<template v-if="isRecurring && formData.is_periodic">
						<el-form-item label="" v-if="!showJustInfo">
							<RadioButtonsBlock
								v-model="period_method"
								:settings="periodMethodRadioOptions"
								:optionsList="periodMethodsList"
							/>

							<!-- <div class="" v-else>
								<b v-if="period_method == PERIOD_METHODS.PERIOD_TYPE">Period</b>
								<b v-if="period_method == PERIOD_METHODS.PERIOD_DATES">Period Dates</b>
							</div> -->
						</el-form-item>

						<div
							class="el-form-item"
							v-if="period_method == PERIOD_METHODS.PERIOD_TYPE"
						>
							<el-form-item :label="tt('Period')" prop="period_type" required>
								<CustomSelect
									:optionsList="periodsTypesList"
									:placeholder="`${tt('select')} ${tt('period')}`"
									v-model="formData.period_type"
								/>
							</el-form-item>

							<el-form-item
								:label="tt('Frequency')"
								prop="period_frequency"
								required
								v-show="formData.period_type"
							>
								<CustomSelect
									:optionsList="frequenciesList"
									:placeholder="`${tt('select')} ${tt('frequency')}`"
									v-model="formData.period_frequency"
									:labelKey="`${formData.period_type}`"
								/>
							</el-form-item>

							<el-form-item :label="tt('Period_Range')" required>
								<Datepicker
									v-model="periodDateRange"
									type="daterange"
									:pickerOptions="periodsPickerOptions"
								/>
							</el-form-item>
						</div>

						<div
							class="el-form-item"
							v-if="period_method == PERIOD_METHODS.PERIOD_DATES"
						>
							<el-form-item :label="tt('Period_Dates')" prop="period_dates">
								<div class="options-container relative">
									<div v-if="datesItemsList.length" class="content-row">
										<DateItem
											ref="DateItem"
											v-for="(item, idx) in datesItemsList"
											:key="`date_item-${item.id}`"
											:item-data="item"
											:item-index="idx"
											:pickerOptions="periodsPickerOptions"
											@onRemove="id => removeFormItem(id, 'datesItemsList')"
										/>
									</div>

									<b class="" v-else-if="showJustInfo">-</b>

									<div class="create-button-container content-row">
										<el-button
											class="action-button create-button"
											size="mini"
											type="success"
											icon="icomoon icon-cross"
											@click="addFormItem('datesItemsList', 'd_i-')"
										/>
									</div>
								</div>
							</el-form-item>
						</div>
					</template>

					<!-- ------------------------ -->
					<div class="el-form-item" v-else>
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
							<el-form-item
								label=""
								prop="snooze"
								class="mcol-xs-6"
								v-if="!showJustInfo"
							>
								<el-checkbox v-model="snooze"
									><b>{{ tt('phrases.Snooze_Alerts') }}</b></el-checkbox
								>
							</el-form-item>
						</div>
					</div>

					<div class="el-form-item " v-if="!formData.is_periodic" v-show="snooze">
						<!-- <div class="mrow flex bottom"> -->
						<el-form-item
							class="period-block"
							:label="tt('Snooze')"
							prop="time_period"
						>
							<div class="flex mrow align-center">
								<div class="daterange " v-show="!changeSnoozeRange">
									<i class="el-icon-date span-block"></i>
									<b class="span-block">{{
										prepareRangeStr(formData.snooze_alert)
									}}</b>
								</div>
								<div
									v-if="
										!hasSnoozeAlert || (changeSnoozeRange && formData.snooze_alert)
									"
								>
									<CustomSelect
										:optionsList="snoozeRangeTypesList"
										:placeholder="`${tt('Select')} ${tt('range')}`"
										v-model="formData.snooze_alert.time_period"
									/>
								</div>

								<div
									class="mcol-xs-3"
									v-if="/*has_breakdown &&*/ hasSnoozeAlert && !showJustInfo"
								>
									<span
										class="link underline"
										@click="changeSnoozeRange = !changeSnoozeRange"
										>{{ changeSnoozeRange ? tt('Cancel') : tt('Change') }}</span
									>
								</div>
							</div>
						</el-form-item>

						<el-form-item
							class=""
							label=""
							prop="daterange"
							v-if="
								snooze &&
									(!hasSnoozeAlert || (changeSnoozeRange && formData.snooze_alert))
							"
						>
							<div
								v-show="
									formData.snooze_alert &&
										formData.snooze_alert.time_period ===
											SNOOZE_RANGE_TYPES.CUSTOM_RANGE
								"
							>
								<Datepicker v-model="snoozeDateRange" type="daterange" />
							</div>
						</el-form-item>
						<!-- </div> -->
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

					<el-form-item :label="tt('Parts')" prop="parts" class="parts">
						<div class="flex part-create-button">
							<el-button
								v-if="!fromAnotherInstance"
								@click="createPart"
								:class="'create-button span-block'"
								size="mini"
								type="primary inverted"
								icon="icomoon icon-plus"
							/>
						</div>

						<div class="options-container relative">
							<div v-if="partsItemsList.length" class="content-row">
								<PartItem
									ref="PartItem"
									v-for="(item, idx) in partsItemsList"
									:key="`pv_item-${item.id}`"
									:item-data="item"
									:item-index="idx"
									:partsList="partsList"
									:showJustInfo="showJustInfo"
									@onRemove="id => removeFormItem(id, 'partsItemsList')"
								/>
							</div>
							<b v-else-if="showJustInfo" class="el-range-input">-</b>

							<div class="create-button-container content-row">
								<el-button
									class="action-button create-button"
									size="mini"
									type="success"
									icon="icomoon icon-cross"
									@click="addFormItem('partsItemsList', 'p_i-')"
								/>
							</div>
						</div>
					</el-form-item>

					<div class="el-form-item" v-if="selectedTaskProcedure && taskHasParts">
						<div class="muted">
							{{ tt('phrases.Parts_from_procedure') }} "{{
								selectedTaskProcedure.name
							}}":
						</div>
						<ul class="muted disc">
							<InfoCell
								v-for="item in selectedTaskProcedure.processes"
								:key="`proc_info-${item.id}`"
								labelDisabled
								:valueMethod="getTaskProcedureParts"
								:settingItem="{}"
								:itemData="item"
							/>
						</ul>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item
						:label="tt('Task_Procedures')"
						prop="task_procedure_id"
						v-if="!showJustInfo"
						class="relative"
					>
						<CustomSelect
							filterable
							clearable
							:optionsLoading="taskProceduresLoading"
							:optionsList="taskProceduresList"
							:placeholder="tt('Select') + ' ' + tt('Task')"
							v-model="formData.task_procedure_id"
						/>

						<div
							v-if="!itemData"
							v-show="selectedTaskProcedure"
							@click="taskProceduresDialogVisible = true"
							class="input-sub-label info-color link semi-bold"
						>
							{{ tt('Show_procedures') }}
						</div>
					</el-form-item>

					<div
						:class="[
							'card filled no-shadow el-form-item ',
							{ 'has-error': mainInstancesError }
						]"
					>
						<div :class="['card-content']" @click="mainInstancesError = false">
							<div class="semi-bold title article-title">{{ tt('Equipment') }}</div>
							<el-form-item :label="tt('Production_Line')" prop="production_line_id">
								<CustomSelect
									@focus="mainInstancesError = false"
									filterable
									clearable
									:optionsLoading="productionLinesLoading"
									:optionsList="productionLinesList"
									:placeholder="showJustInfo ? '-' : tt('Line')"
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
									:placeholder="showJustInfo ? '-' : tt('machine')"
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
									:placeholder="showJustInfo ? '-' : tt('Item')"
									:settings="equipmentsQueryOptions"
									:setupLabelSettings="equipmentLabelOptions"
									prefixIcon="icomoon icon-equipments"
								/>
							</el-form-item>
						</div>
					</div>

					<div class="alarm-color content-row" v-show="mainInstancesError">
						{{ tt('phrases.At_least_one_of_these_fields_is_required') }}
					</div>

					<el-form-item :label="tt('Technicians')" v-if="showJustInfo">
						<div class="el-range-input" v-if="formData.users_ids.length">
							{{ assignedUsers }}
						</div>
						<div class="el-range-input" v-else-if="itemData.team">
							{{ itemData.team.name }}
						</div>
						<b class="el-range-input" v-else>-</b>
					</el-form-item>

					<el-form-item
						:label="tt('phrases.Assigned_to')"
						class="content-row"
						v-else
					>
						<div class="content-row underline-tabs full-width">
							<TabsBar
								@switchTab="switchTab"
								:activeTab="activeTab"
								:tabsList="tabsList"
								:buttonsType="'primary'"
								buttonsClass="text-center"
							/>
						</div>

						<div
							v-show="activeTab.prop == 'usersTab'"
							key="usersTab"
							class="content-row tab-container"
						>
							<el-form-item prop="users_ids">
								<SimpleSpinner :active="usersLoading" />
								<div class="flex">
									<div class="relative mcol-xs-10 fluid span-block">
										<CustomSelect
											filterable
											clearable
											multiple
											collapse-tags
											:optionsLoading="usersLoading"
											:optionsList="usersList"
											:placeholder="`${tt('Select')} ${tt('Users')}`"
											labelKey="full_name"
											v-model="formData.users_ids"
										/>
									</div>
								</div>
							</el-form-item>
						</div>

						<div
							v-show="activeTab.prop == 'teamsTab'"
							key="teamsTab"
							class="content-row tab-container"
						>
							<el-form-item prop="team_id" class="">
								<CustomSelect
									filterable
									clearable
									:optionsLoading="teamsLoading"
									:optionsList="teamsList"
									:placeholder="`${tt('Select')} ${tt('team')}`"
									v-model="formData.team_id"
								/>
							</el-form-item>
						</div>
					</el-form-item>
				</div>
			</div>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>

		<div class="section-row" v-if="showJustInfo && selectedTaskProcedure">
			<TaskProcedureInfo
				:isLoading="taskProceduresLoading"
				:taskProcedure="selectedTaskProcedure"
			/>
		</div>

		<!-- <div class="close-wo-checkbox" v-if="!showJustInfo && itemData && itemData.id">
			<el-checkbox v-model="formData.:is_closed" tt(':true-label="1"') :false-label="0">
				<b>Close Work Order</b>
			</el-checkbox>
		</div> -->

		<el-dialog
			center
			:show-close="false"
			:append-to-body="true"
			:visible.sync="taskProceduresDialogVisible"
			:class="'small rounded hide-header hide-body'"
		>
			<TaskProcedureInfo
				@closeDialog="taskProceduresDialogVisible = false"
				:isLoading="taskProceduresLoading"
				:taskProcedure="selectedTaskProcedure"
				showClose
			/>
		</el-dialog>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

// import Editor from '@tinymce/tinymce-vue';
import {
	MAINTENANCE_TYPES,
	SNOOZE_RANGE_TYPES,
	PERIOD_METHODS,
	WORK_ORDER_STATUSES_TYPES,
	PERIOD_TYPES,
	periodMethodsList,
	snoozeRangeTypesList,
	workOrdersStatusesList,
	periodsTypesList
} from '@/constants/global';
import {
	getLocaleStringDateRange,
	getYmdDateString,
	getDateRange,
	getItemValue,
	findItemBy
} from '@/helpers';

// import { required } from '@/constants/validation';
import {
	itemFormMixin,
	requestsListMixin,
	tabsMixin,
	subItemsListMixin,
	actionButtonsMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		tabsMixin(),
		subItemsListMixin(),
		actionButtonsMixin()
	],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		PartItem: () => import('@/views/TaskProcedures/PartItem.vue'),
		DateItem: () => import('./DateItem.vue'),
		TaskProcedureInfo: () => import('./TaskProcedureInfo.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		InfoCell: () => import('@/components/itemDetails/InfoItem.vue'),
		FileUploadBlock: () => import('@/components/form/uploadBlock/FileUploadBlock.vue'),
		// editor: Editor
	},

	props: {
		new_item_type: Number,
		isRecurring: Boolean
		// plantId: Number,
	},
	data() {
		return {
			// editorAPIKey: 'xgs69xurf1xqz1v4omstjgnsocspeoapq2w26uvwdh2c0tgo',
			taskProceduresDialogVisible: false,
			partsItemsList: [],
			datesItemsList: [],
			period_method: PERIOD_METHODS.PERIOD_TYPE,
			mainInstancesError: false,

			taskProceduresLoading: false,
			taskProceduresList: [],
			productionLinesLoading: false,
			productionLinesList: [],
			assetsList: [],
			assetsLoading: false,
			machinesList: [],
			machinesLoading: false,
			equipmentsList: [],
			equipmentsLoading: false,
			teamsList: [],
			teamsLoading: false,
			usersList: [],
			usersLoading: false,
			partsList: [],
			partsLoading: false,
			woTypesList: [],
			woTypesLoading: false,
			imagesList: [],
			attachmentsList: [],

			formData: {
				type: this.new_item_type,
				plant_id: this.plantId,
				title: '',
				finish_date: '',
				description: '',
				production_line_id: null,
				machine_id: null,
				asset_id: null,
				equipment_id: null,
				task_procedure_id: null,
				team_id: null,
				users_ids: [],
				status: WORK_ORDER_STATUSES_TYPES.PENDING,

				attachments: [],
				images: [],

				snooze_alert: {
					time_period: 1
				},
				parts: [],
				// is_closed: 0,
				category_id: null,

				// ----Recurring---
				is_periodic: 0,
				period_type: null,
				period_frequency: null,
				period_started_at: '',
				period_finished_at: '',

				period_dates: []
			},

			snooze: false,
			hasSnoozeAlert: false,
			changeSnoozeRange: false,
			snoozeDateRange: [],
			periodDateRange: [],

			rules: {}
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,
			// isPlantAdmin: state => state.auth.isPlantAdmin,
			mainPreloader: state => state.global.mainPreloader
			// plantsLoading: state => state.global.globalPlantsLoading,
			// plantsList: state => state.global.globalPlantsList
		}),

		snoozeRangeTypesList: () => Object.freeze(snoozeRangeTypesList()),

		SNOOZE_RANGE_TYPES: () => SNOOZE_RANGE_TYPES,
		MAINTENANCE_TYPES: () => MAINTENANCE_TYPES,
		// workOrdersStatusesList: () => workOrdersStatusesList,
		filteredWorkOrdersStatusesList: that =>
			Object.freeze(
				workOrdersStatusesList().filter(si =>
					si.userTypes
						? si.userTypes.some(type => {
								return (
									that.isIndustrialMatrix ||
									(that.authUser.role && that.authUser.role.type === type)
								);
						  })
						: true
				)
			),
		periodsTypesList: that => that.$translate(periodsTypesList),
		PERIOD_METHODS: () => PERIOD_METHODS,
		periodMethodsList: that => that.$translate(periodMethodsList),

		periodsPickerOptions: () => ({
			disabledDate(date) {
				// const start = new Date();
				const today = getDateRange('today');
				const dateMs = date.getTime();
				// console.log(dateMs , today[1].getTime())
				return dateMs <= today[1].getTime();
			}
		}),

		frequenciesList: that => {
			let list = [];
			for (let i = 1; i < 13; i++) {
				const every = that.$t('every');
				const week = that.$t('week');
				const month = that.$t('month');
				const year = that.$t('year');

				const postfix = i == 1 ? '' : 's';
				const idx = i == 1 ? '' : i;
				list.push({
					id: i,
					name: i,
					[PERIOD_TYPES.WEEKLY]: `${every} ${idx} ${week}${postfix}`,
					[PERIOD_TYPES.MONTHLY]: `${every} ${idx} ${month}${postfix}`,
					[PERIOD_TYPES.YEARLY]: `${every} ${idx} ${year}${postfix}`
				});
			}
			return Object.freeze(list);
		},

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

		periodMethodRadioOptions: () =>
			Object.freeze({
				className: 'radio-input',
				inline: true
				// hideLabel: true
			}),

		showJustInfo: that => that.settings && that.settings.showJustInfo,

		assignedUsers() {
			const { usersList, showJustInfo, itemData } = this;

			if (showJustInfo && itemData && usersList.length) {
				let users = '';

				itemData.users_ids.forEach((id, idx) => {
					const name = getItemValue(id, 'full_name', usersList);
					// console.log(id, name, usersList)
					if (name) {
						if (idx != 0) users += ', ';
						users += name;
					}
				});

				return users;
			}
			return '';
		},

		selectedTaskProcedure() {
			const { taskProceduresList, formData } = this;
			if (formData.task_procedure_id && taskProceduresList.length) {
				return Object.freeze(
					findItemBy('id', formData.task_procedure_id, taskProceduresList)
				);
			}
			return null;
		},

		taskHasParts() {
			if (this.selectedTaskProcedure) {
				const { processes } = this.selectedTaskProcedure;
				return processes.some(pi => !!pi.parts.length);
			}
			return false;
		},

		tabsList: that =>
			Object.freeze([
				{ title: that.$t('phrases.technician_users'), prop: 'usersTab' },
				{ title: that.$t('phrases.teams_in_the_plant'), prop: 'teamsTab' }
			]),

		requestsToDoList() {
			const {
				/*isIndustrialMatrix, authUser, parentWorkOrderId*/ formData,
				plantId
			} = this;

			let list = [
				{
					action: 'fetch_task_procedures',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [{ prop: 'plantId', param: 'plantId' }],
					localProp: 'taskProceduresList',
					localLoadProp: 'taskProceduresLoading'
				},
				{
					action: 'fetch_teams',
					bindTo: [
						{
							prop: 'plantId',
							param: 'plantId',
							clean_prop: 'formData.team_id'
						}
					],
					localProp: 'teamsList',
					localLoadProp: 'teamsLoading'
				},
				{
					action: 'fetch_users',
					bindTo: [
						{
							prop: 'plantId',
							param: 'plantId',
							clean_prop: 'formData.users_ids'
						}
					],
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				},
				{
					action: 'fetch_parts',
					payload: { params: { plantId: plantId } },
					/*bindTo: [
						{
							prop: 'formData.production_line_id',
							param: 'productionLineId'
						}
					],*/
					localProp: 'partsList',
					localLoadProp: 'partsLoading'
				},
				{
					action: 'fetch_work_order_types',
					bindTo: [
						{
							prop: 'plantId',
							param: 'plantId',
							clean_prop: 'formData.category_id'
						}
					],
					localProp: 'woTypesList',
					localLoadProp: 'woTypesLoading'
				}
			];

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
							clean_prop: 'formData.equipment_id',
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

			return Object.freeze(list);
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'PartItem', targetProp: 'parts' },
			{ ref: 'DateItem', targetProp: 'period_dates' },
			{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments' },
			{ ref: 'ImgUploadBlock', targetProp: 'images' },
		]),
	},

	methods: {
		...mapActions({
			save_item: 'maintenance/save_maintenance_log',
			set_global_state: 'set_global_state',

			fetch_teams: 'teams/fetch_teams',
			fetch_users: 'users/fetch_users',
			fetch_task_procedures: 'task_procedures/fetch_task_procedures',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_machines: 'machines/fetch_machines',
			fetch_assets: 'assets/fetch_assets',
			fetch_equipments: 'equipments/fetch_equipments',
			fetch_parts: 'parts/fetch_parts',
			fetch_work_order_types: 'maintenance_categories/fetch_maintenance_categories'
		}),

		getTaskProcedureParts(arg = {}, data) {
			arg ? null : null; // shitcode i know
			let result = '<div>';

			data.parts.forEach(pi => {
				result += `${pi.stockPart.part_number} - ${pi.quantity}`;
			});
			return result + '</div>';
		},

		createPart() {
			let modalSettings = {
				editModalProp: 'editModalClassicSecond',
				show: true,
				instanceName: 'Parts',
				size: 'small',
				instanceData: {
					plant_id: this.additionalSettings.plantId
				},
				settings: {
					fromAnotherInstance: true,
					disablePlant: true
				},
				title: this.$t('phrases.Create_Part'),
				callback: this.partCreated
				// closeCallback: this.applicationFormClose,
			};

			this.show_edit_modal(modalSettings);
		},

		partCreated({ data }) {
			this.startFetchAction(this.requestsToDoList[3]);

			if (data && data.data) {
				this.addFormItem('partsItemsList', 'p_i-', {
					formData: { part_id: data.data.id }
				});
			}
			this.show_edit_modal({ show: false, editModalProp: 'editModalClassicSecond' });
		},

		createWOType() {
			let modalSettings = {
				editModalProp: 'editModalClassicSecond',
				show: true,
				instanceName: 'MaintenanceCategories',
				size: 'small',
				settings: {
					fromAnotherInstance: true
				},
				title: this.$t('phrases.Create_Work_Order_Type'),
				callback: this.woTypeCreated
				// closeCallback: this.applicationFormClose,
			};

			this.show_edit_modal(modalSettings);
		},

		woTypeCreated() {
			this.startFetchAction(this.requestsToDoList[4]);

			this.show_edit_modal({ show: false, editModalProp: 'editModalClassicSecond' });
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

		prepareRangeStr(data) {
			if (data && data.date_start) {
				return getLocaleStringDateRange([data.date_start, data.date_finish]);
			}
			return '';
		},

		localSetupPage(item) {
			// console.log('1', this.isRecurring)
			this.formData.is_periodic = this.isRecurring ? 1 : 0;
			this.formData.plant_id = this.plantId;

			if (item) {
				if (item.attachments /*&& item.attachments.length*/) {
					this.attachmentsList = item.attachments.map(ai => ai);
				}
				if (item.images /*&& item.attachments.length*/) {
					this.imagesList = item.images.map(ai => ai);
				}

				if (item.snooze_alert) {
					this.snooze = true;
					this.hasSnoozeAlert = true;

					if (item.snooze_alert.time_period === SNOOZE_RANGE_TYPES.CUSTOM_RANGE) {
						this.snoozeDateRange[0] = item.snooze_alert.date_start;
						this.snoozeDateRange[1] = item.snooze_alert.date_finish;
					}
				}
				if (this.isRecurring) {
					if (item.period_type) {
						this.periodDateRange[0] = item.period_started_at;
						this.periodDateRange[1] = item.period_finished_at;
					} else {
						this.period_method = PERIOD_METHODS.PERIOD_DATES;
						this.datesItemsList = this.setupFormSubItemsList(
							item.period_dates,
							'd_i'
						);
					}
				}

				this.partsItemsList = this.setupFormSubItemsList(item.parts, 'p_i');

				if (item.team_id) {
					this.switchTab(this.tabsList[1]);
				}
			}
		},

		localPrepareSubmitData(data) {
			const {
				hasSnoozeAlert,
				changeSnoozeRange,
				snooze,
				isRecurring,
				snoozeDateRange,
				periodDateRange,
				// isIndustrialMatrix,
				// isPlantAdmin,
				period_method
			} = this;

			let formData = { ...data };

			/*if (!isPlantAdmin && !isIndustrialMatrix) {
				formData = removeObjProps(formData, [
					'supervisor_notes',
					'is_acknowledge_by_supervisor'
				]);
			}*/

			if (snooze) {
				if ((hasSnoozeAlert && changeSnoozeRange) || !hasSnoozeAlert) {
					if (
						formData.snooze_alert.time_period === SNOOZE_RANGE_TYPES.CUSTOM_RANGE
					) {
						formData.snooze_alert.date_start = snoozeDateRange[0];
						formData.snooze_alert.date_finish = snoozeDateRange[1];
					}
				} else {
					formData.snooze_alert.date_start = getYmdDateString({
						ms: formData.snooze_alert.date_start
					});
					formData.snooze_alert.date_finish = getYmdDateString({
						ms: formData.snooze_alert.date_finish
					});
				}
			} else {
				delete formData.snooze_alert;
			}

			if (isRecurring) {
				if (period_method == PERIOD_METHODS.PERIOD_TYPE) {
					formData.period_started_at = periodDateRange[0];
					formData.period_finished_at = periodDateRange[1];
					delete formData.period_dates;
				} else if (period_method == PERIOD_METHODS.PERIOD_DATES) {
					delete formData.period_started_at;
					delete formData.period_finished_at;
					delete formData.period_frequency;
					delete formData.period_type;
				}

				delete formData.finish_date;
			} else {
				delete formData.period_started_at;
				delete formData.period_finished_at;
				delete formData.period_frequency;
				delete formData.period_type;
				delete formData.period_dates;
			}

			if (formData.users_ids.length) {
				delete formData.team_id;
			} else if (formData.team_id) {
				delete formData.users_ids;
			}

			return formData;
		},

		preparePayload(payload) {
			payload.data.attachments = payload.data.attachments || [];
			payload.data.images = payload.data.images || [];
			// payload.data.plant_id = payload.data.plant_id;
			payload.data.production_line_id = payload.data.production_line_id || null;
			payload.data.machine_id = payload.data.machine_id || null;
			payload.data.asset_id = payload.data.asset_id || null;
			payload.data.equipment_id = payload.data.equipment_id || null;

			if (payload.data.attachments.length || payload.data.images.length) {
				const hasNewAttach = payload.data.attachments.some(ai => !!ai.file);
				const hasNewImg = payload.data.images.some(ii => !!ii.file);
				payload.withFile = hasNewAttach || hasNewImg;
			}
			// console.log(payload.data.attachments, payload)
			return payload;
		},

		localSubmit(data) {
			// console.log('localSubmit', data)

			const validateProps = [
				'production_line_id',
				'machine_id',
				'asset_id',
				'equipment_id'
			];
			const payload = this.preparePayload({ data: data });

			if (!payload.data.plant_id) {
				this.$notify({
					type: 'warning',
					title: this.$t('form_isnt_ready'),
					message: this.$t(`phrases.Select_plant_first`)
				});
				return false;
			}

			if (validateProps.some(prop => !!data[prop])) {
				if (this.itemId && this.isRecurring) {
					this.confirmHelper({
						message:
							this.$t(
								'phrases.Apply_this_action_to_all_reccurring_orders_or_only_this_one'
							) + '?',
						confirmButtonText: this.$t('phrases.To_all'),
						cancelButtonText: this.$t('phrases.Only_this_one'),
						cancelButtonClass: 'el-button--primary',
						distinguishCancelAndClose: true
					})
						.then(() => {
							this.$emit('event', {
								eventName: 'handleSubmitForm',
								data: {
									withFile: payload.withFile,
									data: { ...payload.data, with_siblings: true }
								}
							});
						})
						.catch(action => {
							if (action === 'cancel') {
								this.$emit('event', {
									eventName: 'handleSubmitForm',
									data: {
										withFile: payload.withFile,
										data: payload.data
									}
								});
							} else {
								//
							}
						});
				} else {
					this.$emit('event', {
						eventName: 'handleSubmitForm',
						data: payload
					});
				}
			} else {
				this.mainInstancesError = true;
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
			}
		}

		/*initialRequestsListResponsesReadyCallback() {
			if (this.settings && this.settings.printHTML) {
				this.set_global_state({	stateProp: 'mainPreloader',	value: false });
				// console.log(this.mainPreloader)
				setTimeout(() => {
					this.$emit('event', {
						eventName: 'printHTML',
						data: { querySelector: '.custom-dialog-wrapper.active' },
						onward: true
					});

					this.show_edit_modal({
						editModalProp: 'editModalClassic',
						hideModal: true
					});
				}, 50);
			}
		}*/
	},

	beforeMount() {
		/*if (this.settings && this.settings.printHTML) {
			this.set_global_state({	stateProp: 'mainPreloader',	value: true });
		}*/
	}
};
</script>
