<template>
	<div>
		<VueElementLoadingWrapper :isLoading="itemLoading" :isSaving="itemSaving" :itemsName="itemsName.one" />

		<div id="workOrderPage" class="workOrderPage view-wrapper item-page-wrapper requisitions-dashboard">
			<div class="mcontainer">
				<div v-if="loadContent" class="content-row mrow flex wrap">
					<div class="mcol-xs-12 mcol-sm-4">
						<InfoBlock :itemData="itemData" />
					</div>

					<div class="mcol-xs-12 mcol-sm-8">
						<ListItemDetailsBlock :itemData="itemData" />
					</div>
				</div>

				<div v-if="loadContent" class="content-row">
					<WorkOrderDetails :itemData="itemData" @event="handleEvent" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';

import { useItemPage } from '@/composables/mixins/useItemPage';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import InfoBlock from './InfoBlock.vue';
import ListItemDetailsBlock from './ListItemDetailsBlock.vue';
import WorkOrderDetails from './WorkOrderDetails.vue';

defineOptions({ name: 'RequisitionPage' });

const itemFormRef = ref(null);

const {
	itemData,
	itemLoading,
	loadContent,
	itemSaving,
	itemsName,
	fetchPageData,
} = useItemPage({
	entityKey: 'Requisitions',
	itemFormRef,
	additionalNavbarSettings: {
		pageTitle: 'Work Order Details',
		printButtonSettings: {
			querySelector: '.work-order-details .work-order-for-print-container',
		},
	},
});

const { handleEvent } = useEventHandler({
	fetchPageData,
});
</script>
