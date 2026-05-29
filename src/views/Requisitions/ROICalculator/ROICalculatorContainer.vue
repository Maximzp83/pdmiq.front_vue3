<template>
	<div class="view-wrapper requisitions-dashboard">
		<div class="mcontainer">
			<ROICalculatorBlock />
			<ItemsList />
		</div>
	</div>
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount } from 'vue';

import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';

import ROICalculatorBlock from './ROICalculatorBlock.vue';
import ItemsList from './ItemsList.vue';

const { tt } = Lang;

defineOptions({ name: 'ROICalculator' });

const globalStore = useGlobalStore();

onBeforeMount(() => {
	globalStore.setup_navbar({
		pageTitle: tt('sidebar_menu.cost_savings_calculator'),
		showFilter: true,
	});
});
onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
