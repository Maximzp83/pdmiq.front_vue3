<template>
	<!-- <div class=""> -->
	<CustomDataListTable
		disableSelection
		ref="ItemsTableContainer"
		@event="handleEventNew"
		:tableData="itemsList"
		:tableSettings="tableSettings"
		:itemsName="itemsName"
	>
	</CustomDataListTable>
	<!-- </div> -->
</template>

<script>
// import { mapState, mapActions } from 'vuex';
import { cleanDateString } from '@/helpers';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
	},

	props: {
		itemsList: {
			type: Array,
			default: null
		}
	},

	computed: {
		itemsName() {
			return {
				one: `${this.$t('Move')} ${this.$t('History')}`,
				mult: `${this.$t('Move')} ${this.$t('History')}`
				// instanceName: 'analogues'
			};
		},

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						label: 'Date',
						prop: 'created_at',
						// sortable: true,
						min_width: 120,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						label: 'User',
						prop: 'user.full_name'
					},
					{
						label: 'Actions',
						prop: ' ',
						meta: {
							prepareValue: {
								localMethod: this.setupActionsCell,
								useAllInstanceData: true
							}
						}
					}
				])
				// operations: {}
			});
		}
	},

	methods: {
		setupActionsCell({ asset_name, storeroom }, args = null, idx) {
			if (args) {
				//
			}

			if (idx == 0) {
				return `${this.$t('Created')}`;
			}

			if (asset_name) {
				return `${this.$t('Asset')}: ${asset_name}`;
			}

			if (storeroom) {
				return `${this.$t('Storeroom')}: ${storeroom.name}`;
			}
			return '-';
		}
	}
};
</script>
