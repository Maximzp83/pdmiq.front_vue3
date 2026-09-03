<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="!hasAccessToCreate"
						:hideDelete="!hasAccessToDelete"
						@event="handleEvent"
					>
						<template v-if="authStore.hasAccessTo(['archive_companies', 'archive_plants'], 'some')">
							<div class="filter-item checkbox-item ml-auto">
								<el-checkbox
									:model-value="filters.archived"
									:true-value="1"
									:false-value="null"
									@change="(value) => setFilters({ archived: value ? 1 : null })"
								>
									{{ tt('phrases.show_archived') }}
								</el-checkbox>
							</div>
						</template>

						<template v-if="authStore.isIndustrialMatrix" #middle>
							<div class="filter-item mcol-xs-4 mcol-sm-2">
								<CustomSelectV2
									clearable
									:optionsList="userRolesTypesList()"
									:placeholder="`${tt('role')} ${tt('type')}`"
									:model-value="filters.type"
									@change="(id) => setFilters({ type: id })"
								/>
							</div>

							<div class="filter-item mcol-xs-4 mcol-sm-2">
								<CustomSelectV2
									clearable
									:optionsLoading="userRolesLoading"
									:optionsList="userRolesList"
									:placeholder="`${tt('role')}`"
									:model-value="filters.role_id"
									@change="(id) => setFilters({ role_id: id })"
								/>
							</div>
						</template>
					</Filterbar>

					<CustomDataListTable
						ref="itemsTableRef"
						:disableSelection="!hasAccessToDelete"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						@event="handleEvent"
					/>

					<PaginationContainer
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
						@setFilters="setFilters"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { setupTrueFalseCellIcon } from '@/helpers/specialHelpers';
import { userRolesTypesList } from '@/constants/global';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useUsersStore } from '@/stores/UsersStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'UsersList',
});

const itemsTableRef = ref(null);
const userRolesList = ref([]);
const userRolesLoading = ref(false);

const usersStore = useUsersStore();
const { filters } = storeToRefs(usersStore);
const authStore = useAuthStore();
const { authUser } = storeToRefs(authStore);
const { changeRoute } = useNavigation();

const usersEntity = ENTITIES.Users;
const userRolesEntity = ENTITIES.UserRoles;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([usersEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([usersEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([usersEntity.permissions.delete]));

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'Users',
	itemStore: usersStore,
	options: {
		tableRef: itemsTableRef,
	},
});

const tableSettings = computed(() => {
	const actions = [];

	actions.push({
		name: 'handleEditUser',
		type: 'success',
		icon: 'icomoon icon-pencil',
		tooltip_text: tt('Edit'),
		conditionSettings: {
			checkMethod: 'some',
			conditions: [
				{ data_value: authStore.isDeveloper, control_value: true },
				{ prop: 'id', method: '==', control_value: authUser.value?.id },
				{
					data_value: hasAccessToEdit.value,
					control_value: true,
					checkMethod_next: 'some',
					next_conditions: [
						{ prop: 'role_id', method: '==', control_value: authUser.value?.role_id },
						{
							array_method: 'some',
							prop: 'role_id',
							control_value: authUser.value?.role?.child_role_ids || [],
						},
					],
				},
			],
		},
	});

	if (hasAccessToDelete.value) {
		actions.push({
			name: 'handleDeleteItems',
			type: 'danger',
			icon: 'icomoon icon-cross',
			tooltip_text: tt('Delete'),
			conditionSettings: {
				checkMethod: 'some',
				conditions: [
					{ data_value: authStore.isDeveloper, control_value: true },
					{
						data_value: hasAccessToDelete.value,
						control_value: true,
						checkMethod_next: 'some',
						next_conditions: [
							{ prop: 'role_id', method: '==', control_value: authUser.value?.role_id },
							{
								array_method: 'some',
								prop: 'role_id',
								control_value: authUser.value?.role?.child_role_ids || [],
							},
						],
					},
				],
			},
		});
	}

	return Object.freeze({
		columns: translate([
			{ prop: 'full_name', label: 'Full_name', sortable: true, min_width: '100px', max_width: '160px' },
			{ prop: 'email', label: 'Email', sortable: true, min_width: '145px' },
			{ prop: 'phone_number', label: 'Phone', min_width: 130 },
			{ prop: 'role.name', label: 'Role', min_width: 130 },
			{
				prop: 'is_mfa_enabled',
				label: 'MFA',
				skipTranslate: true,
				width: 70,
				meta: {
					cell_class: 'text-center',
					prepareValue: { localMethod: setupTrueFalseCellIcon },
				},
			},
			{
				prop: 'company.name',
				label: 'Company',
				min_width: 130,
				sortable: true,
				meta: { emptyText: ' ', sortBy: 'company' },
			},
		]),
		operations: {
			actions,
		},
	});
});

const handleEditUser = ({ row }) => {
	if (row?.id != null && String(row.id) === String(authUser.value?.id)) {
		return changeRoute({ path: '/profile' });
	}

	return editItem({ row });
};

const methodsMap = {
	fetch_user_roles: createGetRequest(userRolesEntity.apiBase),
	setFilters,
	createItem,
	handleEditUser,
	handleDeleteItems,
};

useRequestsList({
	methodsMap,
	requestsToDoList: computed(() =>
		Object.freeze([
			{
				action: methodsMap.fetch_user_roles,
				localProp: userRolesList,
				localLoadProp: userRolesLoading,
				notFetch: !authStore.isIndustrialMatrix,
				payload: {
					params: { max: -1 },
				},
			},
		]),
	),
});

const { handleEvent } = useEventHandler(methodsMap);
</script>
