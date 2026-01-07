<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="!hasAccesToCreate"
						:hideDelete="!hasAccesToDelete"
					>	
						<template v-if="$hasAccessTo(['archive_companies', 'archive_plants'], 'some')">
							<div class="filter-item checkbox-item ml-auto">
								<el-checkbox
									:value="filters.archived"
									:false-label="null"
									@change="val => setFilters({ archived: val })"
								>{{ $t('phrases.show_archived') }}
								</el-checkbox>
							</div>
						</template>

						<template v-slot:middle v-if="isIndustrialMatrix">
							<div class="filter-item">
								<CustomSelect
									clearable
									:optionsList="userRolesTypesList"
									:placeholder="`${tt('role')} ${tt('type')}`"
									:value="filters.type"
									@change="id => setFilters({ type: id })"
								/>
							</div>

							<div class="filter-item">
								<CustomSelect
									clearable
									:optionsLoading="userRolesLoading"
									:optionsList="userRolesList"
									:placeholder="`${tt('role')}`"
									:value="filters.role_id"
									@change="id => setFilters({ role_id: id })"
								/>
							</div>
						</template>
					</Filterbar>

					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:disableSelection="!hasAccesToDelete"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/>

					<PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { userRolesTypesList } from '@/constants/global';
import { setupTrueFalseCellIcon } from '@/helpers/specialHelpers';

import {
	itemsDataMixin,
	eventHandler,
	navigation,
	fetchItemsHelper
} from '@/mixins';
// import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation(), fetchItemsHelper()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	data: () => ({
		userRolesList: [],
		userRolesLoading: false
	}),

	computed: {
		...mapState({
			filters: state => state.users.filters,
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,
			isDeveloper: state => state.auth.isDeveloper,
			authUser: state => state.auth.authUser
		}),

		userRolesTypesList: () => userRolesTypesList(),

		itemsName() {
			return {
				one: this.$t('User'),
				mult: this.$t('Users'),
				instanceName: 'users'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_users']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_users']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_users']),

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'full_name',
						label: 'Full_name',
						sortable: true,
						min_width: '100px',
						max_width: '160px'
					},
					{ prop: 'email', label: 'Email', sortable: true, min_width: '145px' },
					{ prop: 'phone_number', label: 'Phone', min_width: 130 },
					{
						label: 'Role',
						prop: 'role.name',
						min_width: 130,
					},
					{
						label: 'MFA',
						prop: 'is_mfa_enabled',
						skipTranslate: true,
						width: 70,
						meta: {
							cell_class: 'text-center',
							prepareValue: {
								localMethod: setupTrueFalseCellIcon
							}
						}
					},
					{
						prop: 'company.name',
						label: 'Company',
						min_width: 130,
						sortable: true,
						meta: { emptyText: ' ', sortBy: 'company' }
					}
				]),
				operations: {
					actions: [
						{
							name: 'editItem',
							type: 'success',
							icon: 'icomoon icon-pencil',
							tooltip_text: this.tt('Edit'),
							conditionSettings: {
								checkMethod: 'some',
								conditions: [
									{ data_value: this.isDeveloper, control_value: true },
									// { prop: 'id', method: '==', control_value: this.authUser.id },
									/*{
										prop: 'role_id',
										method: '==',
										control_value: this.authUser.role_id
									},*/
									{
										data_value: this.hasAccesToEdit,
										control_value: true,
										checkMethod_next: 'some',
										next_conditions: [
											{
												prop: 'role_id',
												method: '==',
												control_value: this.authUser.role_id
											},
											{
												array_method: 'some',
												prop: 'role_id',
												control_value: this.authUser.role.child_role_ids
											}
										]
									}
								]
							}
						},
						{
							name: 'handleDeleteItems',
							type: 'danger',
							icon: 'icomoon icon-cross',
							tooltip_text: this.tt('Delete'),
							conditionSettings: {
								checkMethod: 'some',
								conditions: [
									{ data_value: this.isDeveloper, control_value: true },
									// { prop: 'id', method: '==', control_value: this.authUser.id },
									/*{
										prop: 'role_id',
										method: '==',
										control_value: this.authUser.role_id
									},*/
									{
										data_value: this.hasAccesToDelete,
										control_value: true,
										checkMethod_next: 'some',
										next_conditions: [
											{
												prop: 'role_id',
												method: '==',
												control_value: this.authUser.role_id
											},
											{
												array_method: 'some',
												prop: 'role_id',
												control_value: this.authUser.role.child_role_ids
											}
										]
									}
								]
							}
						}
					]
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'users/fetch_users',
			delete_item: 'users/delete_user',
			fetch_user_roles: 'user_roles/fetch_user_roles',

			set_filters: 'users/set_users_filters'
		}),

		fetchUserRoles() {
			this.doFetchAction('fetch_user_roles', 'userRolesList', 'userRolesLoading', {
				params: { max: -1 }
			});
		}
	},

	created() {
		if (this.isIndustrialMatrix) {
			this.fetchUserRoles();
		}
	}
};
</script>
