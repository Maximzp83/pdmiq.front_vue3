<template>
	<div class="edit-form-container ">
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			label-position="top"
		>
			<CustomTransition :startingElementIdx="startingElementIdx">
				<div
					:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
					v-show="activeTab.prop == 'mainTab'"
					class="tab-container"
					key="tab-0"
				>
					<el-form-item :label="`${tt('Role')} ${tt('name')}`" prop="name">
						<CustomInput
							required
							v-model="formData.name"
							:placeholder="`${tt('input')} ${tt('name')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('Type')" prop="type" required>
						<CustomSelect
							:optionsList="userRolesTypesList"
							:placeholder="`${tt('Select')} ${tt('type')}`"
							v-model="formData.type"
						/>
					</el-form-item>

					<el-form-item
						:label="`${tt('force_MFA')}`"
						prop="is_forced_mfa"
						:class="'flex align-center right-label'"
					>
						<el-switch
							v-model="formData.is_forced_mfa"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<el-form-item :label="tt('Child_Roles')" prop="child_role_ids">
						<CustomSelect
							filterable
							multiple
							:optionsLoading="userRolesLoading"
							:optionsList="filteredUserRolesList"
							:placeholder="`${tt('add')} ${tt('roles')}`"
							v-model="formData.child_role_ids"
						/>
					</el-form-item>
				</div>

				<div
					v-show="activeTab.prop == 'requisitionTab'"
					class="tab-container"
					key="tab-1"
				>
					<el-form-item
						:label="`${tt('requisitioner')}`"
						prop="is_requisitioner"
						:class="'flex align-center right-label'"
					>
						<el-switch
							@change="
								val => handleMaintenanceRole({ val, key: 'is_requisitioner' })
							"
							:value="formData.is_requisitioner"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<el-form-item
						:label="`${tt('fab_shop_manager')}`"
						prop="is_fab_shop_manager"
						:class="'flex align-center right-label'"
					>
						<el-switch
							@change="
								val => handleMaintenanceRole({ val, key: 'is_fab_shop_manager' })
							"
							:value="formData.is_fab_shop_manager"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<el-form-item
						:label="`${tt('technician')}`"
						prop="is_technic"
						:class="'flex align-center right-label'"
					>
						<el-switch
							@change="val => handleMaintenanceRole({ val, key: 'is_technic' })"
							:value="formData.is_technic"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>
				</div>

				<div
					v-show="activeTab.prop == 'permissionsTab'"
					class="tab-container"
					key="tab-2"
				>
					<el-form-item
						:label="`${tt('Permissions')}:`"
						prop="permissions"
						class="label_padding_top-0 width-75"
					>
						<div class="options-container">
							<div class="content-row">
								<PermissionItem
									class="permission-item content-row"
									ref="PermissionItem"
									v-for="(item, idx) in permissionsItemsList"
									:key="`permission_item-${item.app_section}`"
									:item-data="item"
									:item-index="idx"
								/>
							</div>

							<!-- <div v-if="permissionsItemsList.length" class="content-row">
								<PermissionItem
									class="content-row"
									ref="PermissionItem"
									v-for="(item, idx) in permissionsItemsList"
									:key="`permission_item-${item.id}`"
									:item-data="item"
									:item-index="idx"
									:selectedSections="selectedSections"
									@onRemove="id => removeFormItem(id, 'permissionsItemsList')"
									@ready="blockReady"
									@updateSelectedSections="permissionsSelectionsUpdated++"
								/>
							</div> -->

							<!-- <div class="margin-top-row">
								<el-button
									class="action-button create-button"
									size="mini"
									type="success"
									icon="icomoon icon-cross"
									@click="addFormItem('permissionsItemsList', 'p_i-')"
								/>
							</div> -->
						</div>
					</el-form-item>
				</div>
			</CustomTransition>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
import { required } from '@/constants/validation';
import { userRolesTypesList } from '@/constants/global';
import { menuSectionsList } from '@/constants/menuItems';

import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin()
	],
	components: {
		PermissionItem: () => import('./PermissionItem.vue')
	},

	props: {
		activeTab: {
			type: Object,
			required: true
		},
		tabsList: {
			type: Array,
			required: true
		}
	},

	data() {
		return {
			startingElementIdx: 0,
			permissionsItemsList: [],
			// permissionsSelectionsUpdated: 0,

			userRolesList: [],
			userRolesLoading: false,

			formData: {
				name: '',
				type: null,
				child_role_ids: [],
				is_requisitioner: 0,
				is_fab_shop_manager: 0,
				is_technic: 0,
				permissions: [],
				is_forced_mfa: 0
			},

			rules: {
				name: required
				// plant_id: required
			}
		};
	},

	computed: {
		userRolesTypesList: () => userRolesTypesList(),
	
		subItemsSettings: () => Object.freeze([
			{ ref: 'PermissionItem', targetProp: 'permissions' }
		]),

		requestsToDoList: () => [
			{
				action: 'fetch_user_roles',
				localProp: 'userRolesList',
				localLoadProp: 'userRolesLoading'
			}
		],

		filteredUserRolesList: that =>
			that.userRolesList.filter(item => item.id !== that.itemId),
		menuSectionsList: () => menuSectionsList()

		/*selectedSections() {
			let list = [];

			if (this.permissionsSelectionsUpdated) {
				const refs = this.$refs['PermissionItem'];
				
				refs.forEach(ref => {
					if (ref && ref._data.formData.app_section) list.push(ref._data.formData.app_section);
				});				
			}
			return list;
		}*/
	},

	methods: {
		...mapActions({
			fetch_user_roles: 'user_roles/fetch_user_roles',

			save_item: 'user_roles/save_user_role'
		}),

		handleMaintenanceRole({ val, key }) {
			this.formData[key] = val;
			['is_requisitioner', 'is_fab_shop_manager', 'is_technic'].forEach(k => {
				if (k !== key) this.formData[k] = 0;
			});
		},

		localSetupPage(itemData) {
			/*this.permissionsItemsList = this.setupFormSubItemsList(
					itemData.permissions,
					'p_i'
				);*/

			this.permissionsItemsList = this.menuSectionsList.map(mi => {
				let item = { app_section: mi.id };

				if (itemData && itemData.permissions) {
					const found = itemData.permissions.find(
						p => p.app_section === item.app_section
					);
					if (found) {
						item = { ...found };
					}
				}

				item.name = mi.name_in_form ? this.tt(mi.name_in_form) : mi.name;
				return item;
			});
		}
	}
};
</script>
