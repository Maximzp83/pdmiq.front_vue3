<template>
	<div class="details-preview-content maintenance-details-preview">
		<div :class="['section-row flex mrow wrap']">
			<div class="mcol-xs-12 mcol-sm-6">
				<div
					:class="['details-row', item.rowClassName]"
					v-for="item in column_1_settings"
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
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { cleanDateString, setupLabel } from '@/helpers';
import {
	workOrdersStatusesList,
	periodsTypesList,
	PERIOD_TYPES
} from '@/constants/global';
import { requestsListMixin, eventHandler, itemDetailsPreviewMixin } from '@/mixins';

export default {
	mixins: [requestsListMixin(), eventHandler(), itemDetailsPreviewMixin()],
	components: {
		InfoCell: () => import('@/components/itemDetails/InfoItem.vue')

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
		},
		editModal: Object
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
		column_1_settings() {
			const { itemData } = this;

			let settings = [
				{
					label: 'Work Order Name',
					prop: 'title'
				},
				{
					label: 'Status',
					prop: 'status',
					meta: {
						getItemValue: { prop: 'name', list: workOrdersStatusesList() }
					}
				},

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
				}
			];

			if (itemData.is_periodic) {
				if (itemData.period_type) {
					settings.push(
						{
							label: 'Period',
							prop: 'period_type',
							meta: {
								getItemValue: { prop: 'name', list: periodsTypesList }
							}
						},
						{
							label: 'Frequency',
							prop: 'period_frequency',
							meta: {
								getItemValue: { prop: 'name', list: this.frequenciesList }
							}
						},
						{
							label: 'Period Range',
							props: ['period_started_at', 'period_finished_at'],
							delimeter: ' - ',
							prefix_icon: 'el-icon-date'
						}
					);
				} else if (itemData.period_dates) {
					settings.push({
						label: 'Period Dates',
						prop: 'period_dates',
						prefix_icon: 'el-icon-date',
						meta: {
							fromArray: { justValue: true }
						}
					});
				}
			} else if (itemData.snooze_alert) {
				settings.push({
					label: 'Snooze',
					props: ['snooze_alert.date_start', 'snooze_alert.date_finish'],
					delimeter: ' - ',
					prefix_icon: 'el-icon-date',
					meta: {
						prepareValue: {
							localMethod: cleanDateString,
							args: { withoutTime: true, splitBy: ' ' }
						}
					}
				});
			}

			settings.push(
				{
					label: 'Description',
					prop: 'description'
				},
				{
					label: 'Parts',
					prop: 'parts',
					valueClassName: 'mcol-xs-5',

					meta: {
						emptyText: '-',
						prepareValue: {
							localMethod: this.setupParts
						}
					}
				}
			);

			return Object.freeze(settings);
		},

		column_2_settings() {
			const { additionalSettings, equipmentLabelOptions, equipmentItem } = this;

			let settings = [
				{
					label: 'Production Line',
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
				}
			];

			return Object.freeze(settings);
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

		frequenciesList: () => {
			let list = [];
			for (let i = 1; i < 13; i++) {
				const postfix = i == 1 ? '' : 's';
				const idx = i == 1 ? '' : i;
				list.push({
					id: i,
					name: i,
					[PERIOD_TYPES.WEEKLY]: `Every ${idx} week${postfix}`,
					[PERIOD_TYPES.MONTHLY]: `Every ${idx} month${postfix}`,
					[PERIOD_TYPES.YEARLY]: `Every ${idx} year${postfix}`
				});
			}
			return Object.freeze(list);
		}

		/*selectedTaskProcedure() {
			const { taskProceduresList, itemData } = this;
			if (itemData.task_procedure_id && taskProceduresList.length) {
				return Object.freeze(findItemBy('id', itemData.task_procedure_id, taskProceduresList));
			}
			return null;
		},*/
	},

	methods: {
		...mapActions({
			fetch_equipment: 'equipments/fetch_equipment',
			fetch_task_procedure: 'task_procedures/fetch_task_procedure',
			set_global_state: 'set_global_state',
			show_edit_modal: 'show_edit_modal',
			unlock_work_order: 'maintenance/unlock_work_order'
		}),

		setupParts(parts) {
			let html = '';
			if (parts) {
				parts.forEach(pi => {
					html += `<div class="flex ">
										<span>${pi.stock.part_number}</span>
									  <span class="ml-auto">${pi.quantity}</span>
									 </div>`;
				});
			}
			return html;
		},

		handleUnlockWorkOrder() {
			// console.log(this.itemData, this.editModal.callback)
			this.unlock_work_order({ itemId: this.itemData.id }).then(() => {
				if (this.editModal.callback) {
					this.editModal.callback();
				}
			});
		},

		/*handlePrintWO(data) {
			// console.log(data)
			this.set_global_state({
				stateProp: 'callMethod',
				value: { name: 'handlePrintWO', payload: { ...data, forPrint: true } }
			});

			setTimeout(() => {
				this.set_global_state({	stateProp: 'callMethod', value: null });
			}, 10);
		},*/

		/*exportLog(data) {
			// console.log(data)
			this.set_global_state({
				stateProp: 'callMethod',
				value: { name: 'exportLog', payload: data }
			});

			setTimeout(() => {
				this.set_global_state({	stateProp: 'callMethod', value: null });
			}, 10);
		},*/

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
