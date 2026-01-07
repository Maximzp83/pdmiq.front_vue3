<template>
	<CustomDataListTable
		ref="ItemsTableContainer"
		@event="handleEventNew"
		disableSelection
		:itemsLoading="false"
		:tableData="itemData"
		:tableSettings="tableSettings"
		:itemsName="itemsName"
	/>
</template>

<script>
import { cleanDateString } from '@/helpers';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
	},

	props: {
		itemData: Array
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('Action'),
				mult: this.$t('Actions')
			};
		},

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						label: 'phrases.Meeting_Tracker_Date',
						prop: 'trackerDate',
						width: 200,
						meta: {
							prepareValue: {
								localMethod: cleanDateString
								// args: [{ withoutTime: true }]
							}
						}
					},
					{
						label: 'Description',
						prop: 'description'
					}
				])
				// operations: {}
			});
		}
	},

	methods: {}
};
</script>
