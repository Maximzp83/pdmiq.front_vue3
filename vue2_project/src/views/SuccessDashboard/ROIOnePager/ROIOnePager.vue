<template>
	<ItemsList @event="handleEventNew" preventSetNavbar :plantItem="plantItem" />
</template>

<script>
// import { mapActions } from 'vuex';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	// name: 'QuoteTab',
	components: {
		ItemsList: () => import('./ItemsList.vue')
	},

	props: {
		plantItem: Object
	}
};
</script>
