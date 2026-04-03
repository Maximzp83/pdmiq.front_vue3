<template>
	<div class="view-wrapper view-list-wrapper user-api-credentials-list">
		<div>
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						v-if="canManageCredentials"
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideDelete="true"
						:hideSearchbar="true"
						:hidePerPageFilter="true"
						:hideCreate="false"
					/>

					<div v-else class="section-block text-center">
						API credentials are available only in your own account.
					</div>

					<CustomDataListTable
						ref="ItemsTableContainer"
						disableSelection
						@event="handleEventNew"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import {
	itemsDataMixin,
	eventHandler,
	navigation,
	actionButtonsMixin
} from '@/mixins';
import { standardTableOperations } from '@/constants/table';
import { cleanDateString } from '@/helpers';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), actionButtonsMixin()],

	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
	},

	props: {
		userId: Number,
		canManageCredentials: Boolean
	},

	computed: {
		...mapState({
			filters: state => state.users.client_api_credentials_filters
		}),

		itemsName() {
			return {
				one: 'API credential',
				mult: 'API credentials',
				instanceName: 'users'
			};
		},

		fetchItemsPayload() {
			return Object.freeze({
				params: {
					max: -1
				}
			});
		},

		editInModal: () => true,
		// stopFetch: that => !that.canManageCredentials,

		localModalSettings() {
			return {
				componentPath: 'Users/ClientApiCredentialItemForm',
				single: true,
				itemName: 'API credential',
				hideFooter: true,
				callback: () => {
					this.refetchItemsList();
				}
			};
		},

		tableSettings() {
			const actions = [];

			if (this.canManageCredentials) {
				actions.push({
					...standardTableOperations.delete,
					tooltip_text: 'Remove'
				});
			}

			return Object.freeze({
				columns: [
					{
						prop: 'name',
						label: this.$t('Name')
					},
					{
						prop: 'api_key',
						label: 'API Key',
						min_width: 290,
					},
					{
						prop: 'last_used_at',
						label: 'Last used',
						min_width: 120,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'created_at',
						label: this.$t('phrases.Created_at'),
						min_width: 120,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					}
				],
				operations: {
					actions
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'users/fetch_client_api_credentials',
			delete_item: 'users/delete_client_api_credential',
			set_filters: 'users/set_client_api_credentials_filters'
		}),

		deleteItem(data) {
			this.delete_item({ data: { id: data.ids[0] } }).then(() => {
				this.refetchItemsList();
			});
		}
	}
};
</script>
