<template>
	<div>
		<div class="section-row card-tabs text-center" v-if="!disableTabs">
			<TabsBar
				card
				@switchTab="switchTab"
				:activeTab="activeTab"
				:tabsList="tabsList"
				:buttonsType="'info inverted'"
			/>
		</div>

		<div
			v-if="activeTab.prop == tabsList[0].prop"
			:key="tabsList[0].prop"
			class="tab-container section-row"
		>
			<!-- @submit="handleSubmitForm" -->
			<!-- @onCancel="handleCloseButton" -->
			<WorkOrderForm
				@event="handleEventNew"
				ref="ItemFormComponent"
				fromModal
				:new_item_type="tabsList[0].item_type"
				:itemData="itemData"
				:settings="settings"
				:formSettings="formSettings"
				:additionalSettings="additionalSettings"
				:itemsName="workOrdersName"
			/>
		</div>

		<div
			v-if="activeTab.prop == tabsList[1].prop"
			:key="tabsList[1].prop"
			class="tab-container section-row"
		>
			<WorkOrderForm
				@event="handleEventNew"
				ref="ItemFormComponent"
				fromModal
				isRecurring
				:new_item_type="tabsList[1].item_type"
				:itemData="itemData"
				:settings="settings"
				:formSettings="formSettings"
				:additionalSettings="additionalSettings"
				:itemsName="workOrdersName"
			/>
		</div>

		<div
			v-if="activeTab.prop == tabsList[2].prop"
			:key="tabsList[2].prop"
			class="tab-container section-row"
		>
			<!-- @submit="handleSubmitForm" -->
			<!-- @onCancel="handleCloseButton" -->
			<MaintenanceLogForm
				@event="handleEventNew"
				ref="ItemFormComponent"
				fromModal
				:new_item_type="tabsList[2].item_type"
				:itemData="itemData"
				:settings="settings"
				:formSettings="formSettings"
				:additionalSettings="additionalSettings"
				:itemsName="maintenanceLogsName"
			/>
		</div>

		<!-- <ImagePreviewModal
			hideTitle
			@closeModal="closePreviewModal"
			:imgDialogOpen="imgPreviewOpen"
			:imgId="currentImageId"
			:pictures="imagesList"
		/> -->
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { MAINTENANCE_TYPES } from '@/constants/global';
// import { prepareSubmitData } from '@/helpers';

import { navigation, tabsMixin, eventHandler } from '@/mixins';

export default {
	mixins: [navigation(), tabsMixin(), eventHandler()],
	name: 'MaintenanceFormWrapper',

	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		WorkOrderForm: () => import('./WorkOrders/ItemForm.vue'),
		MaintenanceLogForm: () => import('./Logs/ItemForm.vue')
	},

	props: {
		itemData: {
			type: Object,
			default: () => null
		},
		additionalSettings: {
			type: Object,
			default: () => ({})
		},
		settings: {
			type: Object,
			default: () => ({})
		},
		formSettings: {
			type: Object,
			default: () => ({})
		}
	},

	data() {
		return {
			// disableTabs: false,
			// imgPreviewOpen: false,
			// imagesList: [],
			// currentImageId: null
		};
	},

	computed: {
		// plantId: that => that.additionalSettings.plantId,
		tabsList: that =>
			Object.freeze(
				that.$translate([
					{
						title: 'work_order',
						prop: 'woTab',
						item_type: MAINTENANCE_TYPES.WORK_ORDER
					},
					{
						title: 'Recurring_Work_Order',
						prop: 'recurrTab',
						item_type: MAINTENANCE_TYPES.WORK_ORDER,
						isRecurring: true
					},
					{
						title: 'Maintenance_Log',
						prop: 'logTab',
						item_type: MAINTENANCE_TYPES.LOG
					}
				])
			),
		switchTabTo: that => that.additionalSettings.switchTabTo,

		MAINTENANCE_TYPES: () => MAINTENANCE_TYPES,

		workOrdersName() {
			return {
				one: this.$t('Work_Order'),
				mult: this.$t('Work_Orders')
			};
		},

		maintenanceLogsName() {
			return {
				one: this.$t('Maintenance_Log'),
				mult: this.$t('Maintenance_Logs')
			};
		},

		disableTabs: that => !!that.itemData || that.additionalSettings.disableTabs
	},

	methods: {
		...mapActions({
			// fetch_item: 'maintenance/fetch_maintenance_log',
			show_edit_modal: 'show_edit_modal',

			save_item: 'maintenance/save_maintenance_log'
			// unlock_item: 'maintenance/unlock_work_order'
		}),

		validateForm() {
			const { ItemFormComponent } = this.$refs;
			ItemFormComponent.validateForm();
		},

		handleSubmitForm(payloadArg) {
			let payload = {
				...payloadArg
			};

			/*if (payload) {
				console.log('3', payload)
				return
			}*/
			this.$emit('event', { eventName: 'toggleSaving', data: true });

			this.save_item(payload)
				.then(answer => {
					this.$emit('event', { eventName: 'toggleSaving', data: false });

					try {
						// console.log(3, this.activeItemsTable, this.instanceName);

						// console.log(this, this.filters)
						// this.fetchItems({ ...this.filters, ...this.globalFilters });

						// console.log('successModalSubmit 1')
						this.$emit('event', { eventName: 'successModalSubmit', data: answer });

						if (this.successSubmitCallback) {
							this.successSubmitCallback(answer);
						}

						if (this.propsSuccessSubmitCallback) {
							this.propsSuccessSubmitCallback(answer);
						} else {
							// this.show_edit_modal({ show: false });
						}
					} catch (e) {
						console.warn(e);
					}
					// console.log(this.activeItemsTable, this.instanceName);
				})
				.catch(() => {
					this.$emit('event', { eventName: 'toggleSaving', data: false });
				});
		}

		/*handleUnlockWorkOrder() {
			// console.log(this.itemData)
			this.unlock_item({ itemId: this.itemData.id }).then(() => {
				// this.refetchItemsList();
			});
		},*/

		/*handleCreateRequest({parentLog}) {
			// console.log(parentLog)
			const settings = {
				show: true,
				editModalProp: 'editModalClassicSecond',
				title: 'Create Work Order Request',
				instanceName: 'WorkOrderRequests',
				instanceData: parentLog,
				formSettings: {
					id: null,
					parent_id: parentLog.id
				},
				className: 'maintenance-modal',
				modalClassName: 'fixed-header-footer',

				callback: () => {
					this.show_edit_modal({ show: false, editModalProp: 'editModalClassicSecond' });
				}
			}
			this.show_edit_modal(settings);
		},*/
	}
};
</script>
