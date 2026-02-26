import { ref, computed, onMounted } from 'vue';
import { ITEMS_GRID_TYPES, gridTypesList } from '@/constants/table';

export function useSwitchGridView({
	filters,
	setFilters,
	preventFetch,
	skipCalculatePerPage,
} = {}) {
	const perPageItems = ref([]);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const activeGrid = computed(() => resolve(filters)?.items_active_grid_type);
	const gridSwitcherOptions = computed(() =>
		Object.freeze({
			hideTitle: true,
			buttonType: 'primary',
			group: true,
		}),
	);

	const set_active_grid_type = (val) => {
		if (typeof setFilters === 'function') {
			setFilters({ items_active_grid_type: val });
		}
	};

	const toggleItemsGrid = (val) => {
		set_active_grid_type(val);
	};

	const calculatePerPage = (clientWidth) => {
		const result = [];

		switch (true) {
			case clientWidth < 1280:
				result.push(
					{ value: 6, label: '6' },
					{ value: 12, label: '12' },
					{ value: 18, label: '18' },
				);
				break;

			case clientWidth > 1279 && clientWidth < 1680:
				result.push(
					{ value: 6, label: '6' },
					{ value: 12, label: '12' },
					{ value: 18, label: '18' },
				);
				break;

			case clientWidth > 1679:
				result.push(
					{ value: 8, label: '8' },
					{ value: 16, label: '16' },
					{ value: 24, label: '24' },
				);
				break;

			default:
				result.push(
					{ value: 10, label: '10' },
					{ value: 20, label: '20' },
					{ value: 30, label: '30' },
				);
		}

		return result;
	};

	const gridViewBeforeMount = () => {
		if (skipCalculatePerPage) return;

		perPageItems.value = calculatePerPage(document.documentElement.clientWidth);

		const currentFilters = resolve(filters);
		if (currentFilters?.max) {
			if (!perPageItems.value.some((pp) => pp.value == currentFilters.max)) {
				if (preventFetch && 'value' in preventFetch) {
					preventFetch.value = true;
				}
				if (typeof setFilters === 'function') {
					setFilters({ page: 1, max: perPageItems.value[2].value });
				}
			}
		}
	};

	onMounted(() => {
		if (!activeGrid.value) {
			set_active_grid_type(ITEMS_GRID_TYPES.GRID);
		}
	});

	return {
		perPageItems,
		activeGrid,
		gridTypesList,
		ITEMS_GRID_TYPES,
		gridSwitcherOptions,
		set_active_grid_type,
		toggleItemsGrid,
		calculatePerPage,
		gridViewBeforeMount,
	};
}
