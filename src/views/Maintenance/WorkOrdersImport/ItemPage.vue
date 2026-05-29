<template>
	<div class="view-wrapper item-page-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card">
				<div class="card-content">
					<ImportOptionsContainer />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';

import ImportOptionsContainer from './ImportOptionsContainer.vue';

defineOptions({
	name: 'WorkOrdersImportPage',
});

const globalStore = useGlobalStore();

onMounted(() => {
	globalStore.setup_navbar({
		pageTitle: Lang.tt('Import'),
		showFilter: true,
	});
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
