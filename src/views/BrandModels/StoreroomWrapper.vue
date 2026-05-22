<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :itemsName="itemsName.one" />

		<div v-if="loadContent">
			<BrandModelsList
				ref="itemsListContainerRef"
				preventSetNavbar
				isStoreRoomItems
				:plantId="itemData?.plant_id"
				:storeroomItem="itemData"
				:propsFilters="finalBrandModelsFilters"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { ITEMS_GRID_TYPES } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import BrandModelsList from './ItemsList.vue';

const { tt } = Lang;

defineOptions({
	name: 'StoreroomItemsPage',
});

const itemsListContainerRef = ref(null);

const itemsName = computed(() =>
	Object.freeze({
		one: tt('Storeroom'),
		mult: tt('Storerooms'),
		instanceName: 'store_rooms',
	}),
);

const { itemData, itemLoading, loadContent } = useItemPage({
	apiRoute: '/store-rooms',
	itemsName,
	itemFormRef: itemsListContainerRef,
});

const finalBrandModelsFilters = computed(() => {
	if (itemData.value) {
		return Object.freeze({
			isStoreroom: true,
			storeroomId: itemData.value.id,
			brandId: null,
			items_active_grid_type: ITEMS_GRID_TYPES.GRID,
		});
	}

	return {};
});
</script>
