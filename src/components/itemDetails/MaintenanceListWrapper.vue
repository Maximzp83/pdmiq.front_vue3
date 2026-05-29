<template>
	<div class="mcol-xs-12 relative">
		<TabsBar
			notRound
			className="like-in-browser-tabs radio-container"
			:activeTab="activeTab"
			:tabsList="tabsList"
			:height="40"
			:buttonsType="'secondary'"
			:initialAutoSelect="0"
			@switchTab="switchTab"
		/>

		<div v-if="activeTab.prop === tabsList[0].prop" :key="tabsList[0].prop" class="tab-container">
			<div class="card-content text-center gray-color">
				{{ Lang.tt('WORK_ORDERS') }}
			</div>
		</div>

		<div v-if="activeTab.prop === tabsList[1].prop" :key="tabsList[1].prop" class="tab-container">
			<div class="card-content text-center gray-color">
				{{ Lang.tt('MAINTENANCE_LOGS') }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';

import { Lang } from '@/localization';
import { useTabs } from '@/composables/mixins/useTabs';

const TabsBar = defineAsyncComponent(() => import('@/components/common/TabsBar.vue'));

defineProps({
	woFilters: { type: Object, default: () => ({}) },
	logFilters: { type: Object, default: () => ({}) },
	hideDatepicker: Boolean,
	fromPlantDashboard: Boolean,
});

const tabsList = computed(() =>
	Object.freeze(
		Lang.translate([
			{ title: 'WORK_ORDERS', prop: 'woTab' },
			{ title: 'MAINTENANCE_LOGS', prop: 'logsTab' },
		])
	)
);

const { activeTab, switchTab } = useTabs({ tabsList });
</script>
