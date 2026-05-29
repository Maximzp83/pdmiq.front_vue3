<template>
	<ProductionLinesList
		:productionLineType="PRODUCTION_LINES_TYPES.UTILITY"
		preventSetNavbar
		@event="handleEvent"
	/>
</template>

<script setup>
import { PRODUCTION_LINES_TYPES } from '@/constants/global';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ProductionLinesList from './ItemsList.vue';

defineOptions({ name: 'UtilitiesListWrapper' });

const emit = defineEmits(['event']);
const { handleEvent } = useEventHandler({}, emit);
</script>
