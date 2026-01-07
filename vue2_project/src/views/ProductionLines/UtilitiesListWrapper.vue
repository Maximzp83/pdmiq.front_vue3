<template>
	<ProductionLinesList
		@event="handleEventNew"
		:productionLineType="PRODUCTION_LINES_TYPES.UTILITY"
		preventSetNavbar
	/>
</template>

<script>
import { eventHandler } from '@/mixins';

// import { findItemBy } from '@/helpers';
import { PRODUCTION_LINES_TYPES } from '@/constants/global';

export default {
	mixins: [eventHandler()],
	components: {
		ProductionLinesList: () => import('@/views/ProductionLines/ItemsList.vue')
	},

	computed: {
		PRODUCTION_LINES_TYPES: () => PRODUCTION_LINES_TYPES
	}
};
</script>
