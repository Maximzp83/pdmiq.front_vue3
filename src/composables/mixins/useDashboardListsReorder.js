import { computed, watch } from 'vue';
import { getObjectVal } from '@/helpers';
import { MAINTENANCE_TYPES } from '@/constants/global';

export function useDashboardListsReorder({
	tt,
	emit,
	itemsList,
	reorderAction,
	filters,
	itemsLoading,
	globalFilters,
	fromDetailsPage,
	showEditModal,
}) {
	const editInModal = () => true;

	const woFilters = computed(() =>
		Object.freeze({
			plantId: globalFilters?.value ? globalFilters.value.plantId : null,
			type: MAINTENANCE_TYPES.WORK_ORDER,
		}),
	);

	const creationWOModalSettings = computed(() =>
		Object.freeze({
			itemName: tt('Work_Order'),
			editModalProp: 'editModalClassic',
			modalClassName: 'fixed-header-footer small-header small-footer',
			className: 'maintenance-modal',
			formComponentFileLoader: () => import('@/views/Maintenance/MaintenanceFormWrapper.vue'),
			additionalSettings: {
				switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
				...woFilters.value,
			},
		}),
	);

	const reorderHandler = (event) => {
		const { oldIndex, newIndex, dragEvent } = event;

		if (oldIndex !== newIndex) {
			const currentBlock = dragEvent.data.originalSource;
			const list = itemsList?.value || itemsList || [];
			const className = list?.[0]?.className;
			const payload = {
				data: {
					currentId: +currentBlock.dataset.id,
					desiredId: +currentBlock.nextElementSibling.dataset.id,
					className,
				},
			};
			if (typeof reorderAction === 'function') {
				reorderAction(payload);
			} else {
				console.warn('[useDashboardListsReorder] reorderAction is not a function');
			}
		}
	};

	const setupFormSettings = ({ row, formSetup }) => {
		const settings = {};
		formSetup.forEach((fi) => {
			settings[fi.formKey] = getObjectVal(row, fi.valKey);
		});
		return settings;
	};

	const handleCreateWorkOrderButton = (payload) => {
		const settings = {
			...creationWOModalSettings.value,
			show: true,
			formSettings: setupFormSettings(payload),
		};

		if (fromDetailsPage?.value) {
			if (emit) {
				emit('event', {
					eventName: 'handleCreateWorkOrderButton',
					data: { settings },
					onward: true,
				});
			}
		} else if (typeof showEditModal === 'function') {
			showEditModal(settings);
		}
	};

	watch(
		() => filters?.value?.isShowList,
		(show) => {
			if (show && itemsLoading) {
				if ('value' in itemsLoading) {
					itemsLoading.value = true;
				} else {
					itemsLoading = true;
				}
			}
		},
	);

	return {
		editInModal,
		woFilters,
		creationWOModalSettings,
		reorderHandler,
		setupFormSettings,
		handleCreateWorkOrderButton,
	};
}
