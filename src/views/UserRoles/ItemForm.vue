<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<CustomTransition :startingElementIdx="0">
				<div
					v-show="activeTab?.prop === 'mainTab'"
					:key="'tab-main'"
					:class="['tab-container', { 'half-width': !fromAnotherInstance && !isMobile }]"
				>
					<el-form-item :label="`${tt('Role')} ${tt('name')}`" prop="name">
						<CustomInput
							v-model="formData.name"
							required
							:placeholder="`${tt('input')} ${tt('name')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('Type')" prop="type" required>
						<CustomSelectV2
							v-model="formData.type"
							:optionsList="userRolesTypesOptions"
							:placeholder="`${tt('Select')} ${tt('type')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('force_MFA')" prop="is_forced_mfa" class="right-label">
						<el-switch
							v-model="formData.is_forced_mfa"
							:active-value="1"
							:inactive-value="0"
						/>
					</el-form-item>

					<el-form-item :label="tt('Child_Roles')" prop="child_role_ids">
						<CustomSelectV2
							v-model="formData.child_role_ids"
							multiple
							filterable
							collapse-tags
							:optionsLoading="userRolesLoading"
							:optionsList="filteredUserRolesList"
							:placeholder="`${tt('add')} ${tt('roles')}`"
						/>
					</el-form-item>
				</div>

				<div
					v-show="activeTab?.prop === 'requisitionTab'"
					:key="'tab-requisition'"
					class="tab-container"
				>
					<el-form-item :label="tt('requisitioner')" prop="is_requisitioner" class="right-label">
						<el-switch
							:model-value="formData.is_requisitioner"
							:active-value="1"
							:inactive-value="0"
							@change="(val) => handleMaintenanceRole({ val, key: 'is_requisitioner' })"
						/>
					</el-form-item>

					<el-form-item :label="tt('fab_shop_manager')" prop="is_fab_shop_manager" class="right-label">
						<el-switch
							:model-value="formData.is_fab_shop_manager"
							:active-value="1"
							:inactive-value="0"
							@change="(val) => handleMaintenanceRole({ val, key: 'is_fab_shop_manager' })"
						/>
					</el-form-item>

					<el-form-item :label="tt('technician')" prop="is_technic" class="right-label">
						<el-switch
							:model-value="formData.is_technic"
							:active-value="1"
							:inactive-value="0"
							@change="(val) => handleMaintenanceRole({ val, key: 'is_technic' })"
						/>
					</el-form-item>
				</div>

				<div
					v-show="activeTab?.prop === 'permissionsTab'"
					:key="'tab-permissions'"
					class="tab-container"
				>
					<el-form-item :label="`${tt('Permissions')}:`" prop="permissions" class="label_padding_top-0 width-75">
						<div class="options-container">
							<div class="content-row">
								<div
									v-for="(item, idx) in permissionsItemsList"
									:key="`permission_item-${item.app_section}`"
									class="permission-item content-row relative"
								>
									<div class="flex mrow align-center">
										<div class="el-form-item mcol-xs-12 mcol-sm-3 capitalize">
											{{ item.name }}
										</div>

										<el-form-item class="mcol-xs-12 mcol-sm-1">
											<el-switch
												v-model="permissionsItemsList[idx].is_viewing"
												:active-value="1"
												:inactive-value="0"
												@change="(val) => handleIsView(val, idx)"
											/>
										</el-form-item>

										<el-form-item
											v-if="permissionsItemsList[idx].is_viewing && !isApiSection(item.app_section)"
											class="mcol-xs-12 mcol-sm-2"
										>
											<el-checkbox
												v-model="permissionsItemsList[idx].is_creating"
												:true-value="1"
												:false-value="0"
											>
												{{ tt('creating') }}
											</el-checkbox>
										</el-form-item>

										<el-form-item
											v-if="permissionsItemsList[idx].is_viewing && !isApiSection(item.app_section)"
											class="mcol-xs-12 mcol-sm-2"
										>
											<el-checkbox
												v-model="permissionsItemsList[idx].is_updating"
												:true-value="1"
												:false-value="0"
											>
												{{ tt('updating') }}
											</el-checkbox>
										</el-form-item>

										<el-form-item
											v-if="permissionsItemsList[idx].is_viewing && !isApiSection(item.app_section)"
											class="mcol-xs-12 mcol-sm-2"
										>
											<el-checkbox
												v-model="permissionsItemsList[idx].is_deleting"
												:true-value="1"
												:false-value="0"
											>
												{{ tt('deleting') }}
											</el-checkbox>
										</el-form-item>

										<el-form-item
											v-if="permissionsItemsList[idx].is_viewing && canArchive(item.app_section)"
											class="mcol-xs-12 mcol-sm-2"
										>
											<el-checkbox
												v-model="permissionsItemsList[idx].is_archiving"
												:true-value="1"
												:false-value="0"
											>
												{{ tt('archiving') }}
											</el-checkbox>
										</el-form-item>
									</div>
								</div>
							</div>
						</div>
					</el-form-item>
				</div>
			</CustomTransition>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { userRolesTypesList } from '@/constants/global';
import { MENU_TYPES, menuSectionsList } from '@/constants/menuItems';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { buildProps, useItemForm } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import CustomTransition from '@/components/common/CustomTransition.vue';

const { tt } = Lang;

defineOptions({
	name: 'UserRolesItemForm',
});

const props = defineProps(buildProps({
	activeTab: { type: Object, default: null },
	tabsList: { type: Array, default: () => [] },
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const userRolesLoading = ref(false);
const userRolesList = shallowRef([]);
const permissionsItemsList = ref([]);

const userRolesEntity = ENTITIES.UserRoles;

const formData = ref({
	name: '',
	type: null,
	child_role_ids: [],
	is_requisitioner: 0,
	is_fab_shop_manager: 0,
	is_technic: 0,
	permissions: [],
	is_forced_mfa: 0,
});

const rules = {
	name: required,
};

const userRolesTypesOptions = computed(() => userRolesTypesList());

const filteredUserRolesList = computed(() =>
	(userRolesList.value || []).filter((item) => item.id !== itemId.value)
);

const requestsToDoList = computed(() => [
	{
		action: methodsMap.fetch_user_roles,
		localProp: userRolesList,
		localLoadProp: userRolesLoading,
		payload: {
			params: {
				max: -1,
				orderByColumn: 'name',
				orderByMethod: 'asc',
			},
		},
	},
]);

const createPermissionItem = (item = {}) => ({
	app_section: item.app_section ?? null,
	name: item.name ?? '',
	is_viewing: item.is_viewing ?? 0,
	is_creating: item.is_creating ?? 0,
	is_updating: item.is_updating ?? 0,
	is_deleting: item.is_deleting ?? 0,
	is_archiving: item.is_archiving ?? 0,
});

const isApiSection = (sectionId) => sectionId === MENU_TYPES.CLIENT_API;
const canArchive = (sectionId) =>
	sectionId === MENU_TYPES.COMPANIES || sectionId === MENU_TYPES.PLANTS;

const handleIsView = (val, idx) => {
	if (!val && permissionsItemsList.value[idx]) {
		permissionsItemsList.value[idx].is_creating = 0;
		permissionsItemsList.value[idx].is_updating = 0;
		permissionsItemsList.value[idx].is_deleting = 0;
		permissionsItemsList.value[idx].is_archiving = 0;
	}
};

const handleMaintenanceRole = ({ val, key }) => {
	formData.value[key] = val;
	['is_requisitioner', 'is_fab_shop_manager', 'is_technic'].forEach((propKey) => {
		if (propKey !== key) {
			formData.value[propKey] = 0;
		}
	});
};

const localSetupPage = (itemData) => {
	formData.value.child_role_ids = itemData?.child_role_ids
		|| itemData?.child_roles?.map((item) => item.id)
		|| [];

	permissionsItemsList.value = menuSectionsList().map((menuItem) => {
		let currentItem = { app_section: menuItem.id };

		if (itemData?.permissions?.length) {
			const found = itemData.permissions.find((permission) => permission.app_section === menuItem.id);
			if (found) {
				currentItem = { ...found };
			}
		}

		return createPermissionItem({
			...currentItem,
			name: menuItem.name_in_form ? tt(menuItem.name_in_form) : menuItem.name,
		});
	});
};

const localPrepareSubmitData = (data) => ({
	...data,
	permissions: permissionsItemsList.value.map((item) => ({
		app_section: item.app_section,
		is_viewing: item.is_viewing || 0,
		is_creating: item.is_creating || 0,
		is_updating: item.is_updating || 0,
		is_deleting: item.is_deleting || 0,
		is_archiving: item.is_archiving || 0,
	})),
});

const methodsMap = {
	fetch_user_roles: createGetRequest(userRolesEntity.apiBase),
};

const { isMobile, itemId, validateForm, handleCancel } = useItemForm({
	entityKey: 'UserRoles',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	localPrepareSubmitData,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
});
</script>
