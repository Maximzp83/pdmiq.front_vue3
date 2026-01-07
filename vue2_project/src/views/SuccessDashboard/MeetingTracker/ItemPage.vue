<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="item-page-wrapper">
			<div class="form-wrapper " v-if="loadContent">
				<ItemForm
					@event="handleEventNew"
					ref="ItemFormComponent"
					@submit="handleSubmitForm"
					@onCancel="handleCloseButton"
					:itemData="itemData"
					:itemsName="itemsName"
					:plantItem="plantItem"
					:sensorsList="sensorsList"
					:sensorsLoading="sensorsLoading"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import {
	navigation,
	itemPageMixin,
	initPageDataMixin,
	eventHandler
} from '@/mixins';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin(), eventHandler()],
	name: 'SuccessMeetingTrackerPageNew',

	components: {
		ItemForm: () => import('./ItemForm.vue')
	},

	props: {
		plantItem: Object,
		sensorsLoading: Boolean,
		sensorsList: Array
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('Meeting_Tracker'),
				mult: this.$t('Meeting_Trackers')
			};
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'meeting_trackers/fetch_meeting_tracker',
			save_item: 'meeting_trackers/save_meeting_tracker'
		})
	}
};
</script>
