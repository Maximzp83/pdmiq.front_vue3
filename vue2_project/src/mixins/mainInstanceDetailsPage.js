import { getObjectVal, findItemBy } from '@/helpers';
import { scrollToElement } from '@/helpers/specialHelpers';

import { MAINTENANCE_TYPES, alertTypesList } from '@/constants/global';

const mainInstanceDetailsPage = {
	computed: {
		woFilters: that =>
			Object.freeze({
				...that.predefinedFilters,
				type: MAINTENANCE_TYPES.WORK_ORDER,
				daterange: that.filters.daterange
			}),
		logFilters: that =>
			Object.freeze({
				...that.predefinedFilters,
				type: MAINTENANCE_TYPES.LOG,
				daterange: that.filters.daterange
			}),

		creationWOModalSettings: that =>
			Object.freeze({
				itemName: 'Work Order',
				editModalProp: 'editModalClassic',
				modalClassName: 'fixed-header-footer small-header small-footer',
				className: 'maintenance-modal',
				componentPath: 'Maintenance/MaintenanceFormWrapper',
				additionalModalSettings: {
					switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
					...that.woFilters
				}
			}),

		equipmentsFilters() {
			return this.$store.state.equipments.filters;
		},

		chartLegendEvents() {
			return Object.freeze([
				{
					accessor: 'legend.events.itemClick',
					event: this.handleLegendItemClick
				}
			]);
		}
	},

	methods: {
		set_equipments_filters(filters) {
			this.$store.dispatch('equipments/set_equipments_filters', filters);
		},

		editItem() {
			this.show_edit_modal({
				show: true,
				instanceData: this.instanceDataKey
					? this[this.instanceDataKey]
					: this.itemData,
				instanceName: this.instanceViewName,
				itemName: this.itemsName ? this.itemsName.one : '',
				callback: this.successItemSave
			});
		},

		successItemSave() {
			this.initialPageSetup(this.$route);
			this.show_edit_modal({ show: false });
		},

		// ---------------------
		setupFormSettings({ row, formSetup }) {
			let settings = {};
			// console.log(row, formSetup)
			formSetup.forEach(fi => {
				settings[fi.formKey] = getObjectVal(row, fi.valKey);
			});
			return settings;
		},

		handleCreateWorkOrderButton(payload) {
			let { settings, name } = payload;
			let modalSettings;

			if (settings) {
				const woList = this.$refs.MaintenanceListWrapper.$refs.WorkOrdersList;
				if (woList) {
					settings.callback = woList.localModalSettings.callback;
				}
				modalSettings = settings;
			} else if (name) {
				modalSettings = {
					...this.creationWOModalSettings,
					show: true,
					formSettings: this.setupFormSettings(payload)
				};
			}

			this.show_edit_modal(modalSettings);
		},

		showItemsWithSensors() {
			let newFilters = {
				...this.equipmentsFilters,
				alert_types: [],
				page: 1,
				hasSensors: true,
				isShowList: true
			};
			const EquipmentLayout = this.$refs['EquipmentsLayout'];
			// console.log(EquipmentLayout);
			if (EquipmentLayout) {
				EquipmentLayout.alertTypesFilters = [];
				this.set_equipments_filters(newFilters);

				setTimeout(() => {
					scrollToElement('.equipments-layout');
				}, 270);
			}
		},

		handleLegendItemClick(e) {
			e.preventDefault();
			const { key } = e.legendItem;
				// console.log(e)

			// if (key == 'warning' || key == 'alarm' || key == 'lube') {
			const alertType = findItemBy('key', key, alertTypesList());
			const EquipmentLayout = this.$refs['EquipmentsLayout'];

			if (EquipmentLayout && EquipmentLayout.handleAlertTypesFilter) {
				let newFilters = {
					...this.equipmentsFilters,
					page: 1,
					isShowList: true
				};
				this.set_equipments_filters(newFilters);
				if (alertType) {
					EquipmentLayout.handleAlertTypesFilter([alertType.id]);
				} else if (key == 'offline') {
					EquipmentLayout.handleAlertTypesFilter(['offline']);
				} else {
					EquipmentLayout.handleAlertTypesFilter([]);
				}
			}

			setTimeout(() => {
				scrollToElement('.equipments-layout');
			}, 10);

			// }
		}
	}
};

export default () => mainInstanceDetailsPage;
