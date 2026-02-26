<template>
	<div class="view-wrapper view-list-wrapper plants-list">
		<div v-if="itemsLoading">Loading...</div>
		<div v-else class="plants-list-container">
			<div class="plants-list-item" v-for="item in itemsList" :key="item.id">
				{{ item.name }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { storeToRefs } from 'pinia';

import { useItemsData } from '@/composables/mixins/useItemsData';
import { usePlantsStore } from '@/stores/PlantsStore';

defineOptions({
	name: 'PlantsList',
});

const plantsStore = usePlantsStore();
const { filters } = storeToRefs(plantsStore);

const { itemsList, itemsLoading, meta } = useItemsData({
	apiRoute: '/plants',
	filters,
});

void meta;
</script>
