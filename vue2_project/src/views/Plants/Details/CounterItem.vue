<template>
	<div :class="['counter-item fluid']">
		<div class="card relative">
			<!-- <SimpleSpinner :active="countersLoading" /> -->

			<div class="card-content">
				<div class="flex mrow align-center">
					<!-- <div class="item-img">
						<i :class="['icomoon', `icon-${counterData.iconName}`]" />
					</div> -->
					<!-- <a
						@click.prevent="linkClick"
						:href="`/dashboard/${counterData.path}`"
						class="absolute stretch"
					>
					</a> -->

					<div>
						<div class="label uppercase semi-bold">{{ tt(counterData.title) }}</div>
						<div class="view-all-button" @click="handleViewAll" v-if="!disableViewAll">
							{{ tt('phrases.View_All') }}
						</div>
					</div>
					<div class="count">{{ counterData.count }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// import { mapState, mapActions } from 'vuex';
// import {  } from '@/helpers';
// import { scrollToElement } from '@/helpers/specialHelpers';
import { navigation } from '@/mixins';

export default {
	mixins: [navigation()],
	props: {
		counterData: {
			type: Object,
			required: true
			// default: () => ({})
		},
		countersLoading: Boolean,
		disableViewAll: Boolean
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
		linkClick() {
			this.changeRoute({ path: `/dashboard/${this.counterData.path}` });
		},

		handleViewAll() {
			this.$emit('event', {
				eventName: 'viewTable',
				data: this.counterData,
				onward: true
			});
		}
		/*...mapActions({
			show_edit_modal: 'show_edit_modal',
			set_global_state: 'set_global_state'
		}),*/
		/*scrollTo() {
			scrollToElement(this.counterData.sectionClass);
		}*/
	}
};
</script>
