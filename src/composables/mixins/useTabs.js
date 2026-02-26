import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { findItemBy } from '@/helpers';

export function useTabs({
	tabsList,
	hideTabsBar,
	switchTabTo,
	localTabSetup,
	initialTab,
} = {}) {
	const route = useRoute();
	const activeTab = ref(initialTab || {});

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const switchTab = (tab) => {
		activeTab.value = tab;
	};

	onBeforeMount(() => {
		const list = resolve(tabsList) || [];

		if (hideTabsBar) {
			activeTab.value = activeTab.value.prop ? activeTab.value : list[0];
		}

		if (route.query?.activeTab) {
			if (localTabSetup) {
				localTabSetup(route.query.activeTab);
			}
		}

		if (switchTabTo) {
			const { key, value } = switchTabTo;
			const tab = findItemBy(key, value, list);
			if (tab) {
				activeTab.value = tab;
			}
		}
	});

	return { activeTab, switchTab };
}
