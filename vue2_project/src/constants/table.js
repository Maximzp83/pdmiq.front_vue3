export const standardTableOperations = {
	edit: {
		name: 'editItem',
		type: 'success',
		icon: 'icomoon icon-pencil',
		tooltip_text: 'Edit'
	},
	delete: {
		name: 'handleDeleteItems',
		type: 'danger',
		icon: 'icomoon icon-cross',
		tooltip_text: 'Delete'
	}
};

export const ITEMS_GRID_TYPES = {
	LIST: 1,
	GRID: 2
};

export const gridTypesList = [
	{ id: ITEMS_GRID_TYPES.LIST, icon: 'icon-lists' },
	{ id: ITEMS_GRID_TYPES.GRID, icon: 'icon-grid' }
];

// export { standardTableOperations, ITEMS_GRID_TYPES, gridTypesList };
