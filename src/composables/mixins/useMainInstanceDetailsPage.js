import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getObjectVal, findItemBy } from '@/helpers';
import { scrollToElement } from '@/helpers/specialHelpers';
import { MAINTENANCE_TYPES, alertTypesList } from '@/constants/global';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useGlobalStore } from '@/stores/GlobalStore';

export function useMainInstanceDetailsPage({
	itemData,
	instanceDataKey,
	instanceViewName,
	itemsName,
	predefinedFilters,
	filters,
	initialPageSetup,
	maintenanceListWrapperRef,
	equipmentsLayoutRef,
} = {}) {
	const route = useRoute();
	const equipmentsStore = useEquipmentsStore();
	const globalStore = useGlobalStore();

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const woFilters = computed(() =>
		Object.freeze({
			...(resolve(predefinedFilters) || {}),
			type: MAINTENANCE_TYPES.WORK_ORDER,
			daterange: resolve(filters)?.daterange,
		}),
	);

	const logFilters = computed(() =>
		Object.freeze({
			...(resolve(predefinedFilters) || {}),
			type: MAINTENANCE_TYPES.LOG,
			daterange: resolve(filters)?.daterange,
		}),
	);

	const creationWOModalSettings = computed(() =>
		Object.freeze({
			itemName: 'Work Order',
			editModalProp: 'editModalClassic',
			modalClassName: 'fixed-header-footer small-header small-footer',
			className: 'maintenance-modal',
			formComponentFileLoader: () => import('@/views/Maintenance/MaintenanceFormWrapper.vue'),
			additionalModalSettings: {
				switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
				...woFilters.value,
			},
		}),
	);

	const equipmentsFilters = computed(() => equipmentsStore.filters);

	const chartLegendEvents = computed(() =>
		Object.freeze([
			{
				accessor: 'legend.events.itemClick',
				event: handleLegendItemClick,
			},
		]),
	);

	const set_equipments_filters = (newFilters) => {
		equipmentsStore.set_equipments_filters(newFilters);
	};

	const editItem = () => {
		globalStore.show_edit_modal({
			show: true,
			instanceData: instanceDataKey ? resolve(itemData)?.[instanceDataKey] : resolve(itemData),
			instanceName: instanceViewName,
			itemName: itemsName ? itemsName.one : '',
			successSubmitCallback: successItemSave,
		});
	};

	const successItemSave = () => {
		if (typeof initialPageSetup === 'function') {
			initialPageSetup(route);
		}
		globalStore.show_edit_modal({ show: false });
	};

	const setupFormSettings = ({ row, formSetup }) => {
		const settings = {};
		formSetup.forEach((fi) => {
			settings[fi.formKey] = getObjectVal(row, fi.valKey);
		});
		return settings;
	};

	const handleCreateWorkOrderButton = (payload) => {
		let { settings, name } = payload;
		let modalSettings;

		if (settings) {
			const woList =
				maintenanceListWrapperRef?.value?.$refs?.WorkOrdersList ||
				maintenanceListWrapperRef?.value?.WorkOrdersList;
			if (woList?.localModalSettings?.callback) {
				settings.callback = woList.localModalSettings.callback;
			}
			modalSettings = settings;
		} else if (name) {
			modalSettings = {
				...creationWOModalSettings.value,
				show: true,
				formSettings: setupFormSettings(payload),
			};
		}

		if (modalSettings) {
			globalStore.show_edit_modal(modalSettings);
		}
	};

	const showItemsWithSensors = () => {
		const newFilters = {
			...equipmentsFilters.value,
			alert_types: [],
			page: 1,
			hasSensors: true,
			isShowList: true,
		};
		const layout = equipmentsLayoutRef?.value;
		if (layout) {
			layout.alertTypesFilters = [];
			set_equipments_filters(newFilters);
			setTimeout(() => {
				scrollToElement('.equipments-layout');
			}, 270);
		}
	};

	const handleLegendItemClick = (e) => {
		e.preventDefault();
		const { key } = e.legendItem;

		const alertType = findItemBy('key', key.toLowerCase(), alertTypesList());
		const layout = equipmentsLayoutRef?.value;
		if (layout && layout.handleAlertTypesFilter) {
			const newFilters = {
				...equipmentsFilters.value,
				page: 1,
				isShowList: true,
			};
			// console.log('alertType', alertType, key);
			set_equipments_filters(newFilters);
			if (alertType) {
				layout.handleAlertTypesFilter([alertType.id]);
			} else if (key === 'offline') {
				layout.handleAlertTypesFilter(['offline']);
			} else {
				layout.handleAlertTypesFilter([]);
			}
		}

		setTimeout(() => {
			scrollToElement('.equipments-layout');
		}, 10);
	};

	return {
		woFilters,
		logFilters,
		creationWOModalSettings,
		equipmentsFilters,
		chartLegendEvents,
		set_equipments_filters,
		editItem,
		successItemSave,
		setupFormSettings,
		handleCreateWorkOrderButton,
		showItemsWithSensors,
		handleLegendItemClick,
	};
}
