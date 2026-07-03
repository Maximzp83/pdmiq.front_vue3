<template>
	<div :class="['section-row', route.meta.containerClassName]">
		<ImportContainer
			uploadSubmitActionProp="upload_masterDB"
			:componentFileLoader="() => import('./ImportOptionsContainer.vue')"
		/>
	</div>
</template>

<script setup>
import { onBeforeUnmount, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';

import { useGlobalStore } from '@/stores/GlobalStore';

import ImportContainer from '@/components/Import/ImportContainer.vue';

defineOptions({ name: 'SettingsImportMasterPage' });

const route = useRoute();
const globalStore = useGlobalStore();

onBeforeMount(() => {
	if (route.meta?.navbarSettings) globalStore.setup_navbar(route.meta.navbarSettings);
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
