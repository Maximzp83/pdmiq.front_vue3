<template>
	<div :class="['section-row', route.meta.containerClassName]">
		<ImportContainer
			enableProgressbar
			uploadSubmitActionProp="upload_motorIQ"
			:componentFileLoader="() => import('./ImportOptionsContainer.vue')"
		/>
	</div>
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

import { useGlobalStore } from '@/stores/GlobalStore';

import ImportContainer from '@/components/Import/ImportContainer.vue';

defineOptions({ name: 'SettingsPlantImportPage' });

const route = useRoute();
const globalStore = useGlobalStore();

onBeforeMount(() => {
	if (route.meta?.navbarSettings) globalStore.setup_navbar(route.meta.navbarSettings);
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
