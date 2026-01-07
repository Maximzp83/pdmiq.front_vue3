import { ITEMS_GRID_TYPES, gridTypesList } from '@/constants/table';

const switchGridViewMixin = {
	data: () => ({
		// activeGrid: ITEMS_GRID_TYPES.LIST,
		perPageItems: []
	}),

	computed: {
		activeGrid() {
			return this.filters.items_active_grid_type;
		},
		gridTypesList: () => gridTypesList,
		ITEMS_GRID_TYPES: () => ITEMS_GRID_TYPES,

		/*tableRefName() {
			return this.activeGrid === ITEMS_GRID_TYPES.LIST
				? 'ItemsTableContainer'
				: 'ItemsGridContainer';
		},*/

		gridSwitcherOptions: () =>
			Object.freeze({
				hideTitle: true,
				buttonType: 'primary',
				group: true
			})

		/*perPageItems:() => [
			{ value: 6, label: '6' },
			{ value: 12, label: '12' },
			{ value: 18, label: '18' },
			// { value: -1, label: 'all' }
		],*/
	},

	methods: {
		set_active_grid_type(val) {
			this.setFilters({ items_active_grid_type: val });
		},

		toggleItemsGrid(val) {
			this.set_active_grid_type(val);
		},

		calculatePerPage(clientWidth) {
			// console.log(clientWidth)
			let result = [];

			switch (true) {
				case clientWidth < 1280:
					result.push(
						{ value: 6, label: '6' },
						{ value: 12, label: '12' },
						{ value: 18, label: '18' }
					);
					break;

				case clientWidth > 1279 && clientWidth < 1680:
					result.push(
						{ value: 6, label: '6' },
						{ value: 12, label: '12' },
						{ value: 18, label: '18' }
					);
					break;

				case clientWidth > 1679:
					result.push(
						{ value: 8, label: '8' },
						{ value: 16, label: '16' },
						{ value: 24, label: '24' }
					);
					break;

				/*case clientWidth >= 1920:
					result.push(
						{ value: 8, label: '8' },
						{ value: 16, label: '16' },
						{ value: 24, label: '24' }
					);
					break;*/

				default:
					result.push(
						{ value: 10, label: '10' },
						{ value: 20, label: '20' },
						{ value: 30, label: '30' }
					);
			}

			return result;
		},

		gridViewBeforeMount() {
			if (this.skipCalculatePerPage) return;

			this.perPageItems = this.calculatePerPage(
				document.documentElement.clientWidth
			);

			const { perPageItems, filters } = this;

			if (filters.max) {
				if (!perPageItems.some(pp => pp.value == filters.max)) {
					// console.log(filters, perPageItems)
					this.preventFetch = true;
					this.setFilters({ page: 1, max: perPageItems[2].value });
				}
			}
		}
	},

	created() {
		if (!this.activeGrid) {
			this.set_active_grid_type(ITEMS_GRID_TYPES.GRID);
		}
	},

	beforeMount() {
		// this.perPageItems = this.calculatePerPage(document.documentElement.clientWidth);
	}
};

export default () => switchGridViewMixin;
