<template>
	<div class="details-preview-content maintenance-details-preview">
		<div :class="['section-row flex mrow wrap']">
			<div class="mcol-xs-12 mcol-sm-6">
				<div
					:class="[{ 'details-row': idx }, item.rowClassName]"
					v-for="(item, idx) in column_1_settings"
					:key="`item-${item.label}`"
				>
					<InfoCell
						@event="handleEventNew"
						:class="item.cellClassName"
						tag="div"
						labelPosition="top"
						:valueClassName="item.valueClassName"
						:itemData="itemData"
						:settingItem="item"
					/>
				</div>
			</div>

			<div class="mcol-xs-12 mcol-sm-6 relative">
				<SimpleSpinner :active="equipmentLoading" />

				<div
					class="details-row"
					v-for="item in column_2_settings"
					:key="`item-${item.label}`"
				>
					<InfoCell
						tag="div"
						labelPosition="top"
						:valueClassName="item.valueClassName"
						:itemData="itemData"
						:settingItem="item"
					/>
				</div>
			</div>
		</div>

		<div class="section-row relative" v-if="itemData.task_procedure_id">
			<SimpleSpinner :active="taskProceduresLoading" />
			<TaskProcedureInfo
				v-if="taskProcedureItem"
				:taskProcedure="taskProcedureItem"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { getTimeDifference, setupLabel, convertMsToHours } from '@/helpers';
// import { workOrdersStatusesList} from '@/constants/global';
import { requestsListMixin, eventHandler, itemDetailsPreviewMixin } from '@/mixins';

export default {
	mixins: [requestsListMixin(), eventHandler(), itemDetailsPreviewMixin()],
	components: {
		InfoCell: () => import('@/components/itemDetails/InfoItem.vue')
		// TaskProcedureInfo: () => import('./TaskProcedureInfo.vue'),

		// FormOperationsButtons: () =>
		// import('@/components/form/FormOperationsButtons.vue')
	},

	props: {
		itemData: {
			type: Object,
			default: () => null
		},
		settings: {
			type: Object,
			default: () => ({})
		},
		formSettings: {
			type: Object,
			default: () => ({})
		},
		additionalSettings: {
			type: Object,
			default: () => ({})
		}
	},

	data() {
		return {
			equipmentItem: null,
			equipmentLoading: false,
			taskProcedureItem: null,
			taskProceduresLoading: false
		};
	},

	computed: {
		shiftValues: that =>
			Object.freeze(
				that.$translate([
					{ id: 'Day', label: 'Day' },
					{ id: 'Afternoon', label: 'Afternoon' },
					{ id: 'Night', label: 'Night' }
				])
			),

		column_1_settings() {
			const { itemData, additionalSettings } = this;

			let settings = [
				/*{
					label: 'Work Order Name',
					prop: 'title',
				},*/
				/*{
					label: 'Status',
					prop: 'status',
					meta: {
						getItemValue: { prop: 'name', list: workOrdersStatusesList }
					}
				},*/

				{
					label: 'Attachments',
					prop: 'attachments',
					rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
					cellClassName: 'link under',
					meta: {
						prepareValue: { localMethod: this.setupAttachments }
					}
				},
				{
					label: 'Images',
					prop: 'images',
					rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
					meta: {
						prepareValue: { localMethod: this.setupImages }
					},
					event: { name: 'previewImage' }
				},

				{
					label: 'phrases.Problem_Solved',
					prop: 'is_problem_solved',
					rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
					meta: {
						boolean: { trueVal: this.tt('Yes'), falseVal: this.tt('No') }
					}
				},
				{
					label: 'Reason',
					prop: 'reason_type',
					rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
					meta: {
						getItemValue: {
							prop: 'name',
							list: additionalSettings.maintenanceReasonTypesList
						}
					}
				},
				{
					label: 'phrases.Sanitization_of_Tools',
					prop: 'is_sanitization_equipment',
					rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
					meta: {
						boolean: { trueVal: this.tt('Yes'), falseVal: this.tt('No') }
					}
				},
				{
					label: 'phrases.Acknowledge_by_supervisor',
					prop: 'is_acknowledge_by_supervisor',
					rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
					meta: {
						boolean: { trueVal: this.tt('Yes'), falseVal: this.tt('No') }
					}
				},
				{
					label: 'phrases.Supervisor_notes',
					prop: 'supervisor_notes'
				},
				{
					label: 'Shift',
					prop: 'shift',
					meta: {
						getItemValue: { prop: 'label', list: this.shiftValues }
					}
				}
			];

			if (itemData.parent_id && additionalSettings.parentWO) {
				settings.unshift({
					label: 'Work_Order',
					label_postfix: ' #',
					prop: 'parent_id',
					valueClassName: 'info-color link',
					event: { name: 'showParentOrder' },
					meta: {
						prepareValue: { localMethod: this.setupParentWO }
					}
				});
			}

			if (itemData.start_time && itemData.finish_time) {
				settings = [].concat(
					{
						label: 'phrases.Total_Time',
						prop: 'totalTime',
						rowClassName: 'xs-show-inline mcol-xs-6 vertical-top semi-bold',
						value: { totalTime: this.totalTime },
						prefix_icon: 'el-icon-time'
					},
					{
						label: 'Time',
						props: ['start_time', 'finish_time'],
						rowClassName: 'xs-show-inline mcol-xs-6 vertical-top',
						delimeter: ' - ',
						prefix_icon: 'el-icon-time'
					},
					settings
				);
			} else {
				settings = [].concat(
					{
						label: 'phrases.Total_Time',
						prop: 'totalTime',
						rowClassName: 'xs-show-inline mcol-xs-12 vertical-top details-row',
						value: { totalTime: this.totalTime },
						prefix_icon: 'el-icon-time'
					},
					settings
				);
			}

			return Object.freeze(this.$translate(settings));
		},

		column_2_settings() {
			const { additionalSettings, equipmentLabelOptions, equipmentItem } = this;

			let settings = [
				{
					label: 'Production_Line',
					prop: 'production_line_id',
					meta: {
						getItemValue: {
							prop: 'name',
							list: additionalSettings.productionLinesList
						}
					}
				},
				{
					label: 'Machine',
					prop: 'machine.name'
				},
				{
					label: 'Asset',
					prop: 'asset.name'
				},
				{
					label: 'Item',
					prop: 'equipment',
					value: { equipment: equipmentItem },
					meta: {
						prepareValue: {
							localMethod: setupLabel,
							args: equipmentLabelOptions
						}
					}
				},
				{
					label: `phrases.equipment_breakdown_maintenance_log`,
					prop: 'description'
				}
			];

			return Object.freeze(this.$translate(settings));
		},

		requestsToDoList() {
			let list = [];

			if (this.itemData.task_procedure_id) {
				list.push({
					action: 'fetch_task_procedure',
					payload: { itemId: this.itemData.task_procedure_id },
					localProp: 'taskProcedureItem',
					localLoadProp: 'taskProceduresLoading'
				});
			}

			if (this.itemData.equipment_id) {
				list.push({
					action: 'fetch_equipment',
					payload: { itemId: this.itemData.equipment_id },
					localProp: 'equipmentItem',
					localLoadProp: 'equipmentLoading'
				});
			}
			return Object.freeze(list);
		},

		/*frequenciesList: () => {
			let list = [];
			for (let i = 1; i < 13; i++) {list.push({id: i, name: i})}
			return Object.freeze(list);
		},*/

		totalTime() {
			const { start_time, finish_time, total_time } = this.itemData;

			if (total_time) {
				const { total_hours, total_mins } = convertMsToHours(total_time * 1000);
				return `${total_hours} hr ${total_mins} minutes`;
			}

			if (start_time && finish_time) {
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
		}
	},

	methods: {
		...mapActions({
			fetch_equipment: 'equipments/fetch_equipment',
			fetch_task_procedure: 'task_procedures/fetch_task_procedure',
			set_global_state: 'set_global_state',
			show_edit_modal: 'show_edit_modal'
		}),

		setupParentWO() {
			return `${this.additionalSettings.parentWO.serial_number} (${this.additionalSettings.parentWO.title})`;
		},

		showParentOrder() {
			const settings = {
				show: true,
				title: this.tt('phrases.See_Parent_Work_Order'),
				instanceData: this.additionalSettings.parentWO,
				editModalProp: 'editModalClassicSecond',
				componentPath: 'Maintenance/WorkOrders/ItemDetailsPreview',
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer small-header small-footer',
				additionalModalSettings: {
					productionLinesList: this.additionalSettings.productionLinesList
				},
				hideFooter: true
			};

			this.show_edit_modal(settings);
		},

		handleCreateRequest({ parentLog }) {
			// console.log(parentLog)
			const settings = {
				show: true,
				editModalProp: 'editModalClassicSecond',
				title: this.tt('phrases.create_work_order_request'),
				instanceName: 'WorkOrderRequests',
				instanceData: parentLog,
				formSettings: {
					id: null,
					parent_id: parentLog.id,
					description: ''
				},
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer small-header small-footer',

				callback: () => {
					this.show_edit_modal({
						show: false,
						editModalProp: 'editModalClassicSecond'
					});
				}
			};
			this.show_edit_modal(settings);
		},

		editItem(data) {
			// console.log(data)
			this.set_global_state({
				stateProp: 'callMethod',
				value: { name: 'editItem', payload: data }
			});

			setTimeout(() => {
				this.set_global_state({ stateProp: 'callMethod', value: null });
			}, 10);
		},

		editLogFromWOList(data) {
			// console.log(data)
			this.set_global_state({
				stateProp: 'callMethod',
				value: { name: 'editLogFromWOList', payload: data }
			});

			setTimeout(() => {
				this.set_global_state({ stateProp: 'callMethod', value: null });
			}, 10);
		},

		exportLog(data) {
			// console.log(data)
			this.set_global_state({
				stateProp: 'callMethod',
				value: { name: 'exportLog', payload: data }
			});

			setTimeout(() => {
				this.set_global_state({ stateProp: 'callMethod', value: null });
			}, 10);
		}
	},

	beforeMount() {
		if (this.settings && this.settings.printHTML) {
			if (this.requestsToDoList.length) {
				this.set_global_state({ stateProp: 'mainPreloader', value: true });
			} else {
				this.initialRequestsListResponsesReadyCallback();
			}
		}
	}
};
</script>
