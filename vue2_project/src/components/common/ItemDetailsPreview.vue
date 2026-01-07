<template>
	<div>
		dfgdh
	</div>
</template>

<script>
// import { mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
// import { requestsListMixin } from '@/mixins';

export default {
	// mixins: [requestsListMixin],
	components: {
		// FormOperationsButtons: () =>
		// import('@/components/form/FormOperationsButtons.vue')
	},

	props: {
		itemData: {
			type: Object,
			default: () => null
		},
		settings: {
			type: Object,
			default: () => ({})
		},
		formSettings: {
			type: Object,
			default: () => ({})
		},
		additionalSettings: {
			type: Object,
			default: () => ({})
		}
	},

	data() {
		return {};
	},

	computed: {
		requestsToDoList: () => [
			/*{
				action: 'fetch_plants',
				localProp: 'plantsList',
				localLoadProp: 'plantsLoading'
			}*/
		]
	},

	methods: {}
};
</script>
