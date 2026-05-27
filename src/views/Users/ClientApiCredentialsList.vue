<template>
	<div class="view-wrapper view-list-wrapper user-api-credentials-list">
		<div>
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						v-if="canManageCredentials"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						hideDelete
						hideSearchbar
						hidePerPageFilter
						@event="handleEvent"
					/>

					<div v-else class="section-block text-center">
						API credentials are available only in your own account.
					</div>

					<CustomDataListTable
						ref="itemsTableRef"
						disableSelection
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { cleanDateString } from '@/helpers';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useUsersStore } from '@/stores/UsersStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

defineOptions({
	name: 'UsersClientApiCredentialsList',
});

const props = defineProps({
	userId: Number,
	canManageCredentials: Boolean,
});

const itemsTableRef = ref(null);
const usersStore = useUsersStore();
const { client_api_credentials_filters: filters } = storeToRefs(usersStore);

const itemsName = Object.freeze({
	one: 'API credential',
	mult: 'API credentials',
	instanceName: 'users',
});

const { itemsList, itemsLoading, createItem, refetchItemsList } = useItemsData({
	apiRoute: '/client-api-credentials',
	itemsName,
	itemStore: usersStore,
	itemFiltersName: 'users_client_api_credentials',
	options: {
		filtersStateProp: 'client_api_credentials_filters',
		requestOptions: {
			params: { max: -1 },
		},
		tableRef: itemsTableRef,
		editInModal: true,
		formComponentFileLoader: () => import('./ClientApiCredentialItemForm.vue'),
		additionalModalSettings: {
			hideFooter: true,
		},
		localModalSettingsHook: ({ modalSettings }) => ({
			...modalSettings,
			hideFooter: true,
			callback: () => {
				refetchItemsList();
			},
		}),
		localDeleteItem: ({ ids }) =>
			api_request
				.delete('/client-api-credentials', {
					data: { id: ids?.[0] },
				})
				.then(() => refetchItemsList()),
	},
});

const tableSettings = computed(() => {
	const actions = [];

	if (props.canManageCredentials) {
		actions.push({
			name: 'handleDeleteItems',
			type: 'danger',
			icon: 'icomoon icon-cross',
			tooltip_text: 'Remove',
		});
	}

	return Object.freeze({
		columns: [
			{ prop: 'name', label: 'Name' },
			{ prop: 'api_key', label: 'API Key', min_width: 290 },
			{
				prop: 'last_used_at',
				label: 'Last used',
				min_width: 120,
				meta: {
					prepareValue: { localMethod: cleanDateString },
				},
			},
			{
				prop: 'created_at',
				label: 'phrases.Created_at',
				min_width: 120,
				meta: {
					prepareValue: { localMethod: cleanDateString },
				},
			},
		],
		operations: {
			actions,
		},
	});
});

const methodsMap = {
	createItem,
	handleDeleteItems: ({ row }) =>
		api_request
			.delete('/client-api-credentials', {
				data: { id: row?.id },
			})
			.then(() => refetchItemsList()),
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
