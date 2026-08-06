<template>
	<div class="view-wrapper item-page-wrapper">
		<div v-if="globalFilters.plantId" class="mcontainer">
			<div class="form-wrapper card-content">
				<ImportContainer
					showRevert
					enableProgressbar
					:revertAction="revertImportWorkOrder"
					:uploadSubmitAction="uploadWorkOrder"
					:componentFileLoader="() => import('./ImportOptionsContainer.vue')"
					:plantId="globalFilters.plantId"
				/>
			</div>
		</div>

		<div v-else class="mcontainer">
			<PageMockImg />
		</div>
	</div>
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMaintenance } from '@/composables/useMaintenance';

import ImportContainer from '@/components/Import/ImportContainer.vue';
import PageMockImg from '@/components/common/PageMockImg.vue';

const { tt } = Lang;

defineOptions({
	name: 'WOImportPage',
});

const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { uploadWorkOrder, revertImportWorkOrder } = useMaintenance();

onBeforeMount(() => {
	globalStore.setup_navbar({
		pageTitle: tt('sidebar_menu.work_order_import'),
		showFilter: true,
	});
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
