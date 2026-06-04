<template>
	<div class="view-wrapper maintenance-dashboard">
		<div class="mcontainer">
			<div class="content-row 1flex">
				<ButtonsNavbar card inline bold :itemsList="navbarList" />
			</div>

			<div class="content-row relative">
				<router-view v-slot="{ Component }">
					<transition name="standard-fade" mode="out-in">
						<component
							:is="Component"
							:key="detailsComponentKey"
							:rootFilters="filters"
							@event="handleEvent"
						/>
					</transition>
				</router-view>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMaintenanceStore } from '@/stores/MaintenanceStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ButtonsNavbar from '@/components/common/ButtonsNavbar.vue';

defineOptions({
	name: 'MaintenanceDashboard',
});

const globalStore = useGlobalStore();
const maintenanceStore = useMaintenanceStore();
const { filters } = storeToRefs(maintenanceStore);
const detailsComponentKey = ref(1);
const emit = defineEmits(['event']);

const navbarList = computed(() =>
	Object.freeze(
		Lang.translate([
			{ id: 1, path: '/maintenance/work-orders', label: 'Work_Orders' },
			{ id: 2, path: '/maintenance/logs', label: 'Maintenance_Logs' },
		])
	)
);

onMounted(() => {
	globalStore.setup_navbar({
		pageTitle: Lang.tt('sidebar_menu.work_orders_maintenance_logs'),
		showFilter: true,
	});
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});

const { handleEvent } = useEventHandler({}, emit);
</script>
