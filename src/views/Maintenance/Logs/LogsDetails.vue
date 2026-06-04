<template>
	<div class="nested-view-content-wrapper">
		<div class="content-row">
			<BreakdownMachinesList :perPageItems="perPageItems" preventSetNavbar />
		</div>

		<div>
			<ItemsList
				preventSetNavbar
				fromDashboard
				:propsFilters="predefinedFilters"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { MAINTENANCE_TYPES } from '@/constants/global';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import BreakdownMachinesList from './BreakdownMachinesList.vue';
import ItemsList from './ItemsList.vue';

defineOptions({
	name: 'LogsDetails',
});

const emit = defineEmits(['event']);
const predefinedFilters = Object.freeze({ type: MAINTENANCE_TYPES.LOG });
const perPageItems = Object.freeze([
	{ value: 5, label: '5' },
	{ value: 10, label: '10' },
	{ value: 20, label: '20' },
	{ value: 50, label: '50' },
]);

const { handleEvent } = useEventHandler({}, emit);
</script>
