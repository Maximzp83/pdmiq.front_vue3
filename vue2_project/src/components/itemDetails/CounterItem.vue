<template>
	<div :class="['counter-item mcol-xs-311 fluid pointer']" @click="scrollTo">
		<div class="card relative">
			<!-- <SimpleSpinner :active="countersLoading" /> -->

			<div class="card-content">
				<div class="flex align-center item-img">
					<i :class="['icomoon', `icon-${counterData.iconName}`]" />
				</div>
				<div class="label uppercase semi-bold">{{ counterData.title }}</div>
				<div class="count">{{ counterData.count }}</div>
			</div>
		</div>
	</div>
</template>

<script>
// import { mapState, mapActions } from 'vuex';
// import {  } from '@/helpers';
// import { navigation } from '@/mixins';
import { scrollToElement } from '@/helpers/specialHelpers';

export default {
	// mixins: [navigation],
	props: {
		counterData: {
			type: Object,
			required: true
			// default: () => ({})
		},
		countersLoading: Boolean
	},

	computed: {
		/*...mapState({
			// globalFilters: state => state.global.globalFilters,
			// activeItemsTable: state => state.global.activeItemsTable,
			// selectedCompany: state => state.global.selectedCompany,
			// authUser: state => state.auth.authUser
		}),*/
	},

	methods: {
		/*...mapActions({
			show_edit_modal: 'show_edit_modal',
			set_global_state: 'set_global_state'
		}),*/
		scrollTo() {
			scrollToElement(this.counterData.sectionClass);
		}
	}
};
</script>
