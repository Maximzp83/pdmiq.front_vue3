import { createRouter, createWebHistory } from 'vue-router';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { hasAccessTo as hasAccessToUtil } from '@/utils/hasAccessTo';
import { validateBySettings } from '@/helpers';
import { getParamsFromUrl } from '@/utils/url-helpers';

import { useNotify } from '@/composables/useNotify';

const LoginWrapper = () => import('@/components/pages/LoginWrapper.vue');
const Login = () => import('@/components/pages/Login.vue');
const NewPasswordForm = () => import('@/components/pages/NewPasswordForm.vue');
const ForgotPasswordForm = () => import('@/components/pages/ForgotPasswordForm.vue');

const DashboardLayout = () => import('@/components/layout/DashboardLayout.vue');
const Dashboard = () => import('@/views/Dashboard/Dashboard.vue');

const routes = [
	{
		path: '/login',
		component: LoginWrapper,
		redirect: '/login/sign-in',
		children: [
			// { path: '', redirect: '/login/sign-in' },
			{ path: 'sign-in', name: 'Login', component: Login },
			{
				path: 'password/reset/:token',
				name: 'PasswordReset',
				component: NewPasswordForm,
				meta: { guest: true },
			},
			
			{
				path: 'password/forgot',
				name: 'PasswordForgot',
				component: ForgotPasswordForm,
				meta: { guest: true },
			},
		],
	},
	{
		path: '/',
		component: DashboardLayout,
		children: [
			{
				path: '/dashboard',
				name: 'Dashboard',
				redirect: '/dashboard/plant',
				meta: { auth: true, permissions: ['view_dashboard'] },
				component: Dashboard,
				children: [
					{
						path: 'plant',
						name: 'PlantDetails',
						component: () => import('@/views/Plants/Details/DetailsPage.vue'),
						meta: { auth: true },
					},
					{
						path: 'machines',
						name: 'Machines',
						component: () => import('@/views/Machines/ItemsList.vue'),
						meta: { auth: true },
					},
				],
			},
			{
				path: 'companies',
				name: 'Companies',
				component: () => import('@/views/Companies/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_companies'] },
			},
			{
				path: 'companies/new',
				name: 'CompanyCreate',
				component: () => import('@/views/Companies/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_companies'] },
			},
			{
				path: 'companies/:id',
				name: 'CompanyEdit',
				component: () => import('@/views/Companies/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_companies'] },
			},
			{
				path: 'companies/:id/info',
				name: 'CompanyInfo',
				component: () => import('@/views/Companies/InfoPage.vue'),
				meta: { auth: true, permissions: ['view_companies'] },
			},
			{
				path: 'users',
				name: 'Users',
				component: () => import('@/views/Users/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_users'] },
			},
			{
				path: 'users/new',
				name: 'UserCreate',
				component: () => import('@/views/Users/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_users'] },
			},
			{
				path: 'users/:id',
				name: 'UserEdit',
				component: () => import('@/views/Users/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_users'] },
			},
			{
				path: 'profile',
				name: 'Profile',
				component: () => import('@/views/Users/ItemPage.vue'),
				meta: { auth: true },
			},
			{
				path: 'user-roles',
				name: 'UserRoles',
				component: () => import('@/views/UserRoles/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_user_roles'] },
			},
			{
				path: 'user-roles/new',
				name: 'UserRoleCreate',
				component: () => import('@/views/UserRoles/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_user_roles'] },
			},
			{
				path: 'user-roles/:id',
				name: 'UserRoleEdit',
				component: () => import('@/views/UserRoles/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_user_roles'] },
			},
			{
				path: 'distributors',
				name: 'Distributors',
				component: () => import('@/views/Distributors/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_distributors'] },
			},
			{
				path: 'distributors/new',
				name: 'DistributorCreate',
				component: () => import('@/views/Distributors/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_distributors'] },
			},
			{
				path: 'distributors/:id',
				name: 'DistributorEdit',
				component: () => import('@/views/Distributors/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_distributors'] },
			},
			{
				path: 'teams',
				name: 'Teams',
				component: () => import('@/views/Teams/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_users_teams'] },
			},
			{
				path: 'teams/:id',
				name: 'TeamEdit',
				component: () => import('@/views/Teams/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_users_teams'] },
			},
			// {
			// 	path: 'equipments',
			// 	name: 'EquipmentsLayout',
			// 	component: () => import('@/views/Equipments/EquipmentsLayout.vue'),
			// 	meta: { auth: true, permissions: ['view_items'] },
			// },
			// {
			// 	path: 'machines',
			// 	name: 'MachinesList',
			// 	component: () => import('@/views/Machines/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_machines'] },
			// },
			{
				path: 'plants',
				name: 'PlantsList',
				component: () => import('@/views/Plants/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_plants'] },
			},
			{
				path: 'plants-vendors',
				name: 'PlantsVendors',
				component: () => import('@/views/PlantsVendors/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_vendors'] },
			},
			{
				path: 'plants-vendors/:id',
				name: 'PlantsVendorEdit',
				component: () => import('@/views/PlantsVendors/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_vendors'] },
			},
			// {
			// 	path: 'sensors',
			// 	name: 'SensorsList',
			// 	component: () => import('@/views/Sensors/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_sensors'] },
			// },
			// {
			// 	path: 'maintenance/logs',
			// 	name: 'MaintenanceLogs',
			// 	component: () => import('@/views/Maintenance/Logs/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_maintenance'] },
			// },
			// {
			// 	path: 'maintenance/work-orders',
			// 	name: 'WorkOrders',
			// 	component: () => import('@/views/Maintenance/WorkOrders/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_maintenance'] },
			// },
			// {
			// 	path: 'maintenance/work-orders/import',
			// 	name: 'WorkOrdersImport',
			// 	component: () => import('@/views/Maintenance/WorkOrdersImport/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['view_import_work_orders'] },
			// },
			// {
			// 	path: 'maintenance/dashboard',
			// 	name: 'MaintenanceDashboard',
			// 	component: () => import('@/views/Maintenance/MaintenanceDashboard.vue'),
			// 	meta: { auth: true, permissions: ['view_maintenance'] },
			// },
			// {
			// 	path: 'maintenance/logs/:id',
			// 	name: 'MaintenanceLogDetails',
			// 	component: () => import('@/views/Maintenance/Logs/LogsDetails.vue'),
			// 	meta: { auth: true, permissions: ['view_maintenance'] },
			// },
			// {
			// 	path: 'maintenance/work-orders/:id',
			// 	name: 'WorkOrdersDetails',
			// 	component: () => import('@/views/Maintenance/WorkOrders/WorkOrdersDetails.vue'),
			// 	meta: { auth: true, permissions: ['view_maintenance'] },
			// },
			{
				path: 'brands',
				name: 'Brands',
				component: () => import('@/views/Brands/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_brands'] },
			},
			{
				path: 'brands/new',
				name: 'BrandCreate',
				component: () => import('@/views/Brands/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_brands'] },
			},
			{
				path: 'brands/:id',
				name: 'BrandEdit',
				component: () => import('@/views/Brands/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_brands'] },
			},
			{
				path: 'applications',
				name: 'Applications',
				component: () => import('@/views/Applications/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_applications'] },
			},
			{
				path: 'applications/new',
				name: 'ApplicationCreate',
				component: () => import('@/views/Applications/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_applications'] },
			},
			{
				path: 'applications/:id',
				name: 'ApplicationEdit',
				component: () => import('@/views/Applications/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_applications'] },
			},
			// {
			// 	path: 'store-rooms',
			// 	name: 'StoreRooms',
			// 	component: () => import('@/views/StoreRooms/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_storerooms'] },
			// },
			// {
			// 	path: 'store-rooms/create',
			// 	name: 'StoreRoomCreate',
			// 	component: () => import('@/views/StoreRooms/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['create_storerooms'] },
			// },
			// {
			// 	path: 'store-rooms/:id',
			// 	name: 'StoreRoomEdit',
			// 	component: () => import('@/views/StoreRooms/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['edit_storerooms'] },
			// },
			{
				path: 'parts',
				name: 'Parts',
				component: () => import('@/views/Parts/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_misc_parts'] },
			},
			{
				path: 'parts/new',
				name: 'PartCreate',
				component: () => import('@/views/Parts/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_misc_parts'] },
			},
			{
				path: 'parts/:id',
				name: 'PartEdit',
				component: () => import('@/views/Parts/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_misc_parts'] },
			},
			{
				path: 'task-procedures',
				name: 'TaskProcedures',
				component: () => import('@/views/TaskProcedures/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_task_procedures'] },
			},
			{
				path: 'task-procedures/new',
				name: 'TaskProcedureCreate',
				component: () => import('@/views/TaskProcedures/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_task_procedures'] },
			},
			{
				path: 'task-procedures/:id',
				name: 'TaskProcedureEdit',
				component: () => import('@/views/TaskProcedures/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_task_procedures'] },
			},
			{
				path: 'brand-models',
				name: 'BrandModels',
				component: () => import('@/views/BrandModels/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_part_numbers'] },
			},
			{
				path: 'brand-models/new',
				name: 'BrandModelCreate',
				component: () => import('@/views/BrandModels/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_part_numbers'] },
			},
			{
				path: 'brand-models/:id',
				name: 'BrandModelEdit',
				component: () => import('@/views/BrandModels/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_part_numbers'] },
			},
			{
				path: 'brand-models/:id/details',
				name: 'BrandModelDetailsPage',
				component: () => import('@/views/BrandModels/Details/DetailsPage.vue'),
				meta: { auth: true, permissions: ['view_part_numbers'] },
			},
			{
				path: 'equipment-types',
				name: 'EquipmentTypes',
				component: () => import('@/views/EquipmentTypes/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_equipment_types'] },
			},
			{
				path: 'equipment-types/new',
				name: 'EquipmentTypeCreate',
				component: () => import('@/views/EquipmentTypes/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_equipment_types'] },
			},
			{
				path: 'equipment-types/:id',
				name: 'EquipmentTypeEdit',
				component: () => import('@/views/EquipmentTypes/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_equipment_types'] },
			},
			{
				path: 'equipment-types-categories',
				name: 'EquipmentTypesCategories',
				component: () => import('@/views/EquipmentTypesCategories/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_equipment_types_categories'] },
			},
			{
				path: 'equipment-types-categories/new',
				name: 'EquipmentTypeCategoryCreate',
				component: () => import('@/views/EquipmentTypesCategories/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_equipment_types_categories'] },
			},
			{
				path: 'equipment-types-categories/:id',
				name: 'EquipmentTypeCategoryEdit',
				component: () => import('@/views/EquipmentTypesCategories/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_equipment_types_categories'] },
			},
			// {
			// 	path: 'brand-models',
			// 	name: 'BrandModels',
			// 	component: () => import('@/views/BrandModels/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_part_numbers'] },
			// },
			// {
			// 	path: 'brand-models/create',
			// 	name: 'BrandModelCreate',
			// 	component: () => import('@/views/BrandModels/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['create_part_numbers'] },
			// },
			// {
			// 	path: 'brand-models/:id',
			// 	name: 'BrandModelEdit',
			// 	component: () => import('@/views/BrandModels/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['edit_part_numbers'] },
			// },
			// {
			// 	path: 'equipments/:id/details',
			// 	name: 'EquipmentsDetails',
			// 	component: () => import('@/views/Equipments/Details/DetailsPage.vue'),
			// 	meta: { auth: true, permissions: ['view_items'] },
			// },
			// {
			// 	path: 'equipments/:id/details/info',
			// 	name: 'EquipmentsInfoBlock',
			// 	component: () => import('@/views/Equipments/Details/EquipmentInfoBlock.vue'),
			// 	meta: { auth: true, permissions: ['view_items'] },
			// },
			// {
			// 	path: 'equipments/:id/details/quote',
			// 	name: 'EquipmentsQuoteTab',
			// 	component: () => import('@/views/Equipments/Details/QuoteTab.vue'),
			// 	meta: { auth: true, permissions: ['view_items'] },
			// },
			// {
			// 	path: 'machines/:id/details',
			// 	name: 'MachineDetails',
			// 	component: () => import('@/views/Machines/Details/DetailsPage.vue'),
			// 	meta: { auth: true, permissions: ['view_machines'] },
			// },
			// {
			// 	path: 'machines/:id',
			// 	name: 'MachineEdit',
			// 	component: () => import('@/views/Machines/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['edit_machines'] },
			// },
			{
				path: 'plants/new',
				name: 'PlantCreate',
				component: () => import('@/views/Plants/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_plants'] },
			},
			{
				path: 'plants/:id/details',
				name: 'PlantDetailsPage',
				component: () => import('@/views/Plants/Details/DetailsPage.vue'),
				meta: { auth: true, permissions: ['view_plants'] },
			},
			{
				path: 'plants/:id',
				name: 'PlantEdit',
				component: () => import('@/views/Plants/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_plants'] },
			},
			// {
			// 	path: 'plants/create',
			// 	name: 'PlantCreate',
			// 	component: () => import('@/views/Plants/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['create_plants'] },
			// },
			// {
			// 	path: 'sensors',
			// 	name: 'SensorsListFull',
			// 	component: () => import('@/views/Sensors/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_sensors'] },
			// },
			// {
			// 	path: 'sensors/ncd',
			// 	name: 'NCDSensorsList',
			// 	component: () => import('@/views/Sensors/NCDSensorsList.vue'),
			// 	meta: { auth: true, permissions: ['view_sensors'] },
			// },
			// {
			// 	path: 'sensors/:id',
			// 	name: 'SensorEdit',
			// 	component: () => import('@/views/Sensors/ItemPage.vue'),
			// 	meta: { auth: true, permissions: ['edit_sensors'] },
			// },
			// {
			// 	path: 'sensors/:id/fft',
			// 	name: 'SensorFFT',
			// 	component: () => import('@/views/Sensors/FFTStatisticsPage.vue'),
			// 	meta: { auth: true, permissions: ['view_sensors'] },
			// },
			// {
			// 	path: 'sensors/:id/stats',
			// 	name: 'SensorStats',
			// 	component: () => import('@/views/Sensors/StatisticsPage.vue'),
			// 	meta: { auth: true, permissions: ['view_sensors'] },
			// },
			// {
			// 	path: 'sensors/:id/multiview',
			// 	name: 'SensorMultiView',
			// 	component: () => import('@/views/Sensors/MultiViewStatisticsPage.vue'),
			// 	meta: { auth: true, permissions: ['view_sensors'] },
			// },
			// {
			// 	path: 'sensors/:id/chart',
			// 	name: 'SensorOneChart',
			// 	component: () => import('@/views/Sensors/OneChartPage.vue'),
			// 	meta: { auth: true, permissions: ['view_sensors'] },
			// },
			// {
			// 	path: 'requisitions',
			// 	name: 'Requisitions',
			// 	component: () => import('@/views/Requisitions/RequisitionsDashboard.vue'),
			// 	meta: {
			// 		auth: true,
			// 		permissions: ['view_requisitions'],
			// 		conditionSettings: {
			// 			checkMethod: 'some',
			// 			conditions: [
			// 				{ array_method: 'some', prop: 'type', control_value: [1] },
			// 				{ prop: 'role.is_requisitioner', control_value: true },
			// 				{ prop: 'role.is_fab_shop_manager', control_value: true },
			// 				{ prop: 'role.is_technic', control_value: true },
			// 			],
			// 		},
			// 	},
			// },
			// {
			// 	path: 'requisitions/:id',
			// 	name: 'RequisitionPage',
			// 	component: () => import('@/views/Requisitions/ItemPage.vue'),
			// 	meta: {
			// 		auth: true,
			// 		permissionsMethod: 'some',
			// 		permissions: ['edit_requisitions', 'create_requisitions'],
			// 	},
			// },
			// {
			// 	path: 'roi-calculator',
			// 	name: 'ROICalculator',
			// 	component: () => import('@/views/Requisitions/ROICalculator/ROICalculatorContainer.vue'),
			// 	meta: {
			// 		auth: true,
			// 		permissions: ['view_requisitions_roi_calculator'],
			// 		conditionSettings: {
			// 			checkMethod: 'some',
			// 			conditions: [{ prop: 'role.is_fab_shop_manager', control_value: true }],
			// 		},
			// 	},
			// },
			// {
			// 	path: 'maintenance/logs/details/:id',
			// 	redirect: '/maintenance/logs/:id',
			// },
			// {
			// 	path: 'plants/details/:id',
			// 	redirect: '/plants/:id/details',
			// },
			// -----------------------
			/*{
				path: 'requisitions',
				name: 'Requisitions',
				component: () => import('@/views/Requisitions/RequisitionsDashboard.vue'),
				meta: {
					auth: true,
					permissions: ['view_requisitions'],
					conditionSettings: {
						checkMethod: 'some',
						conditions: [
							{ array_method: 'some', prop: 'role.type', control_value: [1] },
							{ prop: 'role.is_requisitioner', control_value: true },
							{ prop: 'role.is_fab_shop_manager', control_value: true },
							{ prop: 'role.is_technic', control_value: true },
						],
					},
				},
			},
			{
				path: 'requisitions/:id',
				name: 'RequisitionPage',
				component: () => import('@/views/Requisitions/ItemPage.vue'),
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_requisitions', 'create_requisitions'],
				},
			},
			{
				path: 'roi-calculator',
				name: 'ROICalculator',
				component: () => import('@/views/Requisitions/ROICalculator/ROICalculatorContainer.vue'),
				meta: {
					auth: true,
					permissions: ['view_requisitions_roi_calculator'],
					conditionSettings: {
						checkMethod: 'some',
						conditions: [{ prop: 'role.is_fab_shop_manager', control_value: true }],
					},
				},
			},
			{
				path: 'processes',
				name: 'Processes',
				component: () => import('@/views/Processes/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_oee'] },
			},
			{
				path: 'processes/new',
				name: 'ProcessCreate',
				component: () => import('@/views/Processes/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_oee'] },
			},
			{
				path: 'processes/:id',
				name: 'ProcessEdit',
				component: () => import('@/views/Processes/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_oee'] },
			},
			{
				path: 'settings/lube-type',
				name: 'LubeTypes',
				component: () => import('@/views/Settings/LubeTypes/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/lube-type/create',
				name: 'LubeTypeCreate',
				component: () => import('@/views/Settings/LubeTypes/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_settings'] },
			},
			{
				path: 'settings/lube-type/:id',
				name: 'LubeTypeEdit',
				component: () => import('@/views/Settings/LubeTypes/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_settings'] },
			},
			{
				path: 'settings/bearing',
				name: 'Bearings',
				component: () => import('@/views/Settings/Bearings/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/bearing/create',
				name: 'BearingCreate',
				component: () => import('@/views/Settings/Bearings/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_settings'] },
			},
			{
				path: 'settings/bearing/:id',
				name: 'BearingEdit',
				component: () => import('@/views/Settings/Bearings/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_settings'] },
			},
			{
				path: 'settings/industrial-services',
				name: 'IndustrialServices',
				component: () => import('@/views/Settings/IndustrialServices/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/industrial-services/create',
				name: 'IndustrialServiceCreate',
				component: () => import('@/views/Settings/IndustrialServices/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_settings'] },
			},
			{
				path: 'settings/industrial-services/:id',
				name: 'IndustrialServiceEdit',
				component: () => import('@/views/Settings/IndustrialServices/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_settings'] },
			},
			{
				path: 'settings/banner-v2-subtypes',
				name: 'BannerV2Subtypes',
				component: () => import('@/views/Settings/BannerV2Subtype/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/banner-v2-subtypes/create',
				name: 'BannerV2SubtypeCreate',
				component: () => import('@/views/Settings/BannerV2Subtype/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_settings'] },
			},
			{
				path: 'settings/banner-v2-subtypes/:id',
				name: 'BannerV2SubtypeEdit',
				component: () => import('@/views/Settings/BannerV2Subtype/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_settings'] },
			},
			{
				path: 'settings/faults',
				name: 'FaultsSettings',
				component: () => import('@/views/Settings/Faults/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/faults/create',
				name: 'FaultCreate',
				component: () => import('@/views/Settings/Faults/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_settings'] },
			},
			{
				path: 'settings/faults/:id',
				name: 'FaultEdit',
				component: () => import('@/views/Settings/Faults/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_settings'] },
			},
			{
				path: 'settings/faults/ncd/create',
				name: 'FaultNcdCreate',
				component: () => import('@/views/Settings/Faults/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_settings'] },
			},
			{
				path: 'settings/faults/ncd/:id',
				name: 'FaultNcdEdit',
				component: () => import('@/views/Settings/Faults/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_settings'] },
			},
			{
				path: 'settings/import',
				redirect: '/settings/import/logs',
				name: 'SettingsImport',
				component: () => import('@/views/Settings/Import/ImportTab.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
				children: [
					{
						path: 'logs',
						name: 'SettingsImportPlant',
						component: () => import('@/views/Settings/Import/Plant/PlantPage.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'master',
						name: 'SettingsImportMaster',
						component: () => import('@/views/Settings/Import/MasterPage.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'history',
						name: 'SettingsImportHistory',
						component: () => import('@/views/Settings/Import/ItemsList.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
				],
			},
			{
				path: 'plant-import-logs',
				name: 'PlantImportLogs',
				component: () => import('@/views/Settings/Import/Plant/Logs/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'plant-import-logs/:id',
				name: 'PlantImportLogErrors',
				component: () => import('@/views/Settings/Import/Plant/Logs/RowsList.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/import/:id',
				name: 'SettingsImportLogDetails',
				component: () => import('@/views/Settings/Import/ItemPage.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/custom-formulas',
				name: 'CustomFormulas',
				component: () => import('@/views/Settings/CustomFormulas/FormulasTab.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/backend-registers',
				name: 'BackEndRegisters',
				component: () => import('@/views/Settings/BackEndRegisters/BackEndRegistersTab.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},
			{
				path: 'settings/statistics',
				name: 'StatisticsExport',
				component: () => import('@/views/Settings/Statistics/ExportPage.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
			},*/
		],
	},
	{ path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/components/pages/NotFoundPage.vue') },
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	scrollBehavior: () => ({ top: 0 }),
});

const hasRightsToRoute = (to, authStore) => {
	const isAuth = authStore.isAuthenticated;
	const authUser = authStore.authUser;
	const { meta = {} } = to;
	// console.log('to', to);
	if (meta.auth && !isAuth) {
		return { hasAccess: false, reason: 'not_auth', authUser };
	}

	if (meta.permissions) {
		const method = meta.permissionsMethod || undefined;
		const hasAccess =
			authStore.hasAccessTo?.(meta.permissions, method) ||
			hasAccessToUtil({
				role: authUser?.role,
				permissionKeys: meta.permissions,
				method,
			});
		if (!hasAccess) {
			return { hasAccess: false, reason: 'limited_access', authUser };
		}
	}

	if (meta.conditionSettings) {
		if (!validateBySettings({ ...meta.conditionSettings, dataObj: authUser })) {
			return { hasAccess: false, reason: 'limited_access', authUser };
		}
	}

	return { hasAccess: true, reason: '', authUser };
};

router.beforeEach((to, from, next) => {
	const authStore = useAuthStore();
	const { Notify } = useNotify();
	const tt = Lang.tt;

	const params = getParamsFromUrl(to.fullPath);
	if (params.error) {
		Notify({ type: 'error', message: params.error });
		return next('/login');
	}

	const { hasAccess, reason, authUser } = hasRightsToRoute(to, authStore);

	if (hasAccess) {
		if (authUser?.role?.is_forced_mfa && !authUser.is_mfa_enabled && to.path !== '/profile') {
			Notify({
				type: 'warning',
				title: tt('phrases.limited_access'),
				message: tt('aliases.mfa_auth_restriction'),
			});
			return next('/profile?enableMfa=true');
		}
		return next();
	}

	if (reason === 'limited_access') {
		Notify({
			type: 'warning',
			title: tt('phrases.limited_access'),
			message: tt('phrases.you_do_not_have_permissions_to_view_this_page'),
		});
		authStore.set_redirect_to?.(to.fullPath);
		return next('/login');
	}

	if (reason === 'not_auth') {
		Notify({
			type: 'warning',
			title: tt('phrases.limited_access'),
			message: tt('phrases.you_are_not_authorized_to_view_this_page'),
		});

		authStore.set_redirect_to?.(to.fullPath);
		return next('/login');
	}

	authStore.set_redirect_to?.(to.fullPath);
	return next('/login');
});

export default router;
