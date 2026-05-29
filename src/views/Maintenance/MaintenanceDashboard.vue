<template>
	<div class="view-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card">
				<div class="card-content">
					<div class="mrow flex wrap">
						<div
							v-for="item in linksList"
							:key="item.path"
							class="mcol-xs-12 mcol-sm-6 mcol-md-3"
						>
							<router-link class="card content-row text-center" :to="item.path">
								<div class="card-content">
									<i :class="['section-title icomoon', item.icon]"></i>
									<div class="title" v-text="tt(item.label)"></div>
								</div>
							</router-link>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';

const { tt } = Lang;

defineOptions({
	name: 'MaintenanceDashboard',
});

const globalStore = useGlobalStore();
const linksList = computed(() =>
	Object.freeze([
		{ path: '/maintenance/work-orders', label: 'Work_Orders', icon: 'icon-maintenance' },
		{ path: '/maintenance/logs', label: 'Maintenance_Logs', icon: 'icon-lists' },
		{ path: '/maintenance/work-orders/import', label: 'Import', icon: 'icon-import' },
	])
);

onMounted(() => {
	globalStore.setup_navbar({
		pageTitle: tt('sidebar_menu.work_orders_maintenance_logs'),
		showFilter: true,
	});
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
