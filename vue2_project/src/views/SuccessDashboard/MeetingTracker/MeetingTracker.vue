<template>
	<ItemsList @event="handleEventNew" preventSetNavbar :plantItem="plantItem" />
</template>

<script>
// import { mapActions } from 'vuex';
import { eventHandler } from '@/mixins';
// import { findItemBy, prepareSubmitData /*getValues*/ } from '@/helpers';
// import { required /*number*/ } from '@/constants/validation';

// import { EQUIPMENT_IMG_TYPES, rfqsTypesList, RFQS_TYPES } from '@/constants/global';

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
