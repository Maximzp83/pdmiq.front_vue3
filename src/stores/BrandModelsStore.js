import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('brand_models_filters'));
const localStorageStoreroomFilters = JSON.parse(localStorage.getItem('storeroom_brand_models_filters'));

export const useBrandModelsStore = defineStore('brandModelsStore', {
	state: () => ({
		...commonStoreMixin.state,
		itemData: null,
		itemsList: [],
		filters: localStorageFilters || { ...commonStoreMixin.state.filters },
		storeroom_brand_models_filters: localStorageStoreroomFilters
			? { ...localStorageStoreroomFilters, isStoreroom: true }
			: { ...commonStoreMixin.state.filters, isStoreroom: true },
		isLoading: false,
		isSaving: false,
		fetchedMeta: {},
	}),
	actions: {
		...commonStoreMixin.actions,
		set_storerooms_filters(filters) {
			this.set_filters(
				'storeroom_brand_models',
				filters || { ...commonStoreMixin.state.filters, isStoreroom: true },
				{ stateProp: 'storeroom_brand_models_filters' },
			);
		},
	},
	getters: {},
});
