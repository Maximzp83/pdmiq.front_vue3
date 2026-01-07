import { getObjectVal } from '@/helpers';
import { MAINTENANCE_TYPES } from '@/constants/global';

const dashboardListsReorderMixin = {
	/*data() {
		return {
			draggingLocked: false,
			
		};
	},*/

	computed: {
		editInModal: () => true,

		woFilters: that =>
			Object.freeze({
				plantId: that.globalFilters ? that.globalFilters.plantId : null,
				type: MAINTENANCE_TYPES.WORK_ORDER
			}),
		// logFilters: that => Object.freeze({...that.predefinedFilters, type: MAINTENANCE_TYPES.LOG}),

		creationWOModalSettings: that =>
			Object.freeze({
				itemName: that.tt('Work_Order'),
				editModalProp: 'editModalClassic',
				modalClassName: 'fixed-header-footer small-header small-footer',
				className: 'maintenance-modal',
				componentPath: 'Maintenance/MaintenanceFormWrapper',
				additionalModalSettings: {
					switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
					...that.woFilters
				}
			})
	},

	methods: {
		reorderHandler(event) {
			const { oldIndex, newIndex, dragEvent } = event;

			if (oldIndex !== newIndex) {
				const currentBlock = dragEvent.data.originalSource;
				// console.alog(oldIndex, newIndex, currentId, desiredId)

				const payload = {
					data: {
						currentId: +currentBlock.dataset.id,
						desiredId: +currentBlock.nextElementSibling.dataset.id,
						className: this.itemsList[0].className
					}
				};
				// console.log(payload);
				this[this.reorderAction](payload);
			}
		},

		// -------- WO Creation -------

		setupFormSettings({ row, formSetup }) {
			let settings = {};
			// console.log(row, formSetup)
			formSetup.forEach(fi => {
				settings[fi.formKey] = getObjectVal(row, fi.valKey);
			});
			return settings;
		},

		handleCreateWorkOrderButton(payload) {
			let settings = {
				...this.creationWOModalSettings,
				show: true,
				formSettings: this.setupFormSettings(payload)
			};

			if (this.fromDetailsPage) {
				this.$emit('event', {
					eventName: 'handleCreateWorkOrderButton',
					data: { settings },
					onward: true
				});
			} else {
				this.show_edit_modal(settings);
			}
		}
	},

	watch: {
		'filters.isShowList'(show) {
			if (show) {
				this.itemsLoading = true;
			}
		}
	}
};

export default () => dashboardListsReorderMixin;
