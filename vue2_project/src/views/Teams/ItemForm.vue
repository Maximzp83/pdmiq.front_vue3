<template>
	<div
		class="edit-form-container "
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Team')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id" v-if="isIndustrialMatrix">
				<SimpleSpinner :active="plantsLoading" />
				<!-- @change="handleCompanyChange" -->
				<el-select
					filterable
					:disabled="!plantsList.length"
					v-model="formData.plant_id"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				>
					<el-option
						v-for="item in plantsList"
						:key="'plant_id-' + item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item :label="tt('Users')" prop="users_ids">
				<SimpleSpinner :active="usersLoading" />
				<div class="flex">
					<div class="relative mcol-xs-10 fluid span-block">
						<el-select
							multiple
							filterable
							collapse-tags
							:disabled="!usersList.length"
							v-model="formData.users_ids"
							:placeholder="`${tt('Select')} ${tt('users')}`"
						>
							<el-option
								v-for="item in usersList"
								:key="'sms_user_id-' + item.id"
								:label="item.full_name"
								:value="item.id"
							/>
						</el-select>
					</div>

					<!-- @click="handleCreateSubItem('init_user_modal', 'userDialogVisible')" -->
					<!-- <el-button
						v-if="!fromAnotherInstance"
						@click="createUser"
						:class="'create-button span-block'"
						:disabled="!itemId"
						size="mini"
						type="danger"
						icon="icomoon icon-plus"
					/> -->
				</div>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { required } from '@/constants/validation';

import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],
	components: {
		// TabsBar: () => import('@/components/common/TabsBar.vue'),
		// ControllersItemForm: () => import('../Controllers/ItemForm.vue'),
		// UsersItemForm: () => import('../Users/ItemForm.vue'),
		// LocationItem: () => import('./LocationItem.vue')
	},
	props: {
		hideCompanies: Boolean
	},

	data() {
		return {
			plantsLoading: false,
			plantsList: [],
			usersLoading: false,
			usersList: [],
			// userSaving: false,

			formData: {
				name: '',
				plant_id: null,
				users_ids: []
			},

			rules: {
				name: required,
				users_ids: required
			}
		};
	},

	computed: {
		...mapState({
			isIndustrialMatrix: state => state.auth.isIndustrialMatrix,
			authUser: state => state.auth.authUser
			// globalFilters: state => state.global.globalFilters
		}),

		requestsToDoList() {
			let items = [
				{
					action: 'fetch_plants',
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				},
				{
					action: 'fetch_users',
					bindTo: [
						{
							prop: 'formData.plant_id',
							param: 'plantId',
							clean_prop: 'formData.users_ids'
						}
					],
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				}
			];

			return items;
		}
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			fetch_machines: 'machines/fetch_machines',

			fetch_users: 'users/fetch_users',
			set_users: 'users/set_users'
			// save_user: 'users/save_user'
		}),

		/*createUser() {
			let modalSettings = {
				show: true,
				instanceName: 'Users',
				instanceData: {
					type: 2,
					company_id: this.formData.company_id,
					plant_id: this.itemId
				},
				settings: {
					hideType: true,
					hidePlants: true,
					hideCompany: true,
					fromAnotherInstance: true,
				},
				title: 'Create User',
				callback: this.userCreated
			};

			this.show_edit_modal(modalSettings);
		},*/

		/*userCreated(answer) {
			const payload = { 
				params: { 
					max: -1,
					forNotifiable: true,
					companyId: this.formData.company_id
				}
			};

			this.doFetchAction(
				'fetch_users',
				'usersList',
				'usersLoading',
				payload
			);

			const { data } = answer;
			// console.log(answer)
			if ((data && data.status === 'created') || answer.id) {
				this.formData.sensor_default_notifications.push(data.data.id);
			}

			this.show_edit_modal({});
		},*/

		localSetupPage() {
			if (!this.isIndustrialMatrix && this.authUser.plant_id) {
				this.formData.plant_id = this.authUser.plant_id;
			}
		}
	}
};
</script>
