<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div v-if="loadContent">
			<BrandModelsList
				ref="ItemsListContainer"
				@event="handleEventNew"
				preventSetNavbar
				isStoreRoomItems
				:plantId="itemData.plant_id"
				:storeroomItem="itemData"
				:propsFilters="finalBrandModelsFilters"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { ITEMS_GRID_TYPES } from '@/constants/table';
import { eventHandler, initPageDataMixin } from '@/mixins';

export default {
	mixins: [eventHandler(), initPageDataMixin()],
	name: 'StoreroomItemsPage',

	components: {
		BrandModelsList: () => import('@/views/BrandModels/ItemsList.vue')
	},

	data() {
		return {
			// hasError: false
		};
	},

	computed: {
		/*...mapState({
			filters: state => state.brand_models.filters
		}),*/
		itemsName() {
			return {
				one: this.$t('Storeroom'),
				mult: this.$t('Storerooms'),
				instanceName: 'store_rooms'
			};
		},

		finalBrandModelsFilters() {
			if (this.itemData) {
				return Object.freeze({
					isStoreroom: true,
					storeroomId: this.itemData.id,
					// storeroomLocationId: null,
					brandId: null,
					items_active_grid_type: ITEMS_GRID_TYPES.GRID
				});
			}
			return {};
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'store_rooms/fetch_store_room'
		})
	}
};
</script>
