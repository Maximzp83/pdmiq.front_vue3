import { createRouter, createWebHistory } from 'vue-router';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import { pinia } from '@/stores/pinia';
import { hasAccessTo as hasAccessToUtil } from '@/utils/hasAccessTo';
import { validateBySettings } from '@/utils/condition-validation';
import { getParamsFromUrl } from '@/utils/url-helpers';

import { useNotify } from '@/composables/useNotify';

const LoginWrapper = () => import('@/components/pages/LoginWrapper.vue');
const Login = () => import('@/components/pages/Login.vue');
const NewPasswordForm = () => import('@/components/pages/NewPasswordForm.vue');
const ForgotPasswordForm = () => import('@/components/pages/ForgotPasswordForm.vue');
const RemoteLogin = () => import('@/components/pages/RemoteLogin.vue');

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
		path: '/kruger',
		component: LoginWrapper,
		children: [
			{ path: '', name: 'KrugerLogin', component: Login },
		],
	},
	{
		path: '/login/remote',
		name: 'RemoteLogin',
		component: RemoteLogin,
	},
	{
		path: '/graph/:sensorId',
		name: 'OneChartPage',
		component: () => import('@/views/Sensors/OneChartPage.vue'),
		meta: { auth: true, permissions: ['view_dashboard'] },
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
					{
						path: 'assets',
						name: 'Assets',
						component: () => import('@/views/Assets/ItemsList.vue'),
						meta: { auth: true },
					},
					{
						path: 'equipments',
						name: 'DashboardEquipmentsLayout',
						component: () => import('@/views/Equipments/EquipmentsLayout.vue'),
						meta: { auth: true },
					},
					{
						path: 'production-lines',
						name: 'ProductionLines',
						component: () => import('@/views/ProductionLines/ItemsList.vue'),
						meta: { auth: true },
					},
					{
						path: 'utilities',
						name: 'Utilities',
						component: () => import('@/views/ProductionLines/UtilitiesListWrapper.vue'),
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
			{
				path: 'equipments',
				name: 'EquipmentsLayout',
				component: () => import('@/views/Equipments/EquipmentsLayout.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			// {
			// 	path: 'machines',
			// 	name: 'MachinesList',
			// 	component: () => import('@/views/Machines/ItemsList.vue'),
			// 	meta: { auth: true, permissions: ['view_dashboard'] },
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
			// 	meta: { auth: true, permissions: ['view_dashboard'] },
			// },
			{
				path: 'maintenance',
				name: 'MaintenanceDashboard',
				redirect: '/maintenance/work-orders',
				component: () => import('@/views/Maintenance/MaintenanceDashboard.vue'),
				meta: { auth: true, permissions: ['view_maintenance'] },
				children: [
					{
						path: 'work-orders',
						name: 'WorkOrdersDetails',
						component: () => import('@/views/Maintenance/WorkOrders/WorkOrdersDetails.vue'),
						meta: { auth: true, permissions: ['view_maintenance'] },
					},
					{
						path: 'logs',
						name: 'LogsDetails',
						component: () => import('@/views/Maintenance/Logs/LogsDetails.vue'),
						meta: { auth: true, permissions: ['view_maintenance'] },
					},
				],
			},
			{
				path: 'maintenance-import',
				name: 'WorkOrdersImport',
				component: () => import('@/views/Maintenance/WorkOrdersImport/ItemPage.vue'),
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_import_work_orders', 'create_import_work_orders'],
				},
			},
			{
				path: 'plant-import',
				name: 'PlantImportPage',
				component: () => import('@/views/Settings/Import/Plant/PlantPage.vue'),
				meta: {
					auth: true,
					containerClassName: 'mcontainer pt-20',
					navbarSettings: { showFilter: true, pageTitle: 'Plant Import' },
					permissionsMethod: 'some',
					permissions: ['edit_import_plant', 'create_import_plant'],
				},
			},
			{
				path: 'plant-import-logs',
				name: 'ImportLogs',
				component: () => import('@/views/Settings/Import/Plant/Logs/ItemsList.vue'),
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_import_plant_logs', 'create_import_plant_logs'],
				},
			},
			{
				path: 'plant-import-logs/:id',
				name: 'PlantImportLogErrors',
				component: () => import('@/views/Settings/Import/Plant/Logs/RowsList.vue'),
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_import_plant_logs', 'create_import_plant_logs'],
				},
			},
			{
				path: 'master-import',
				name: 'MasterImportPage',
				component: () => import('@/views/Settings/Import/MasterPage.vue'),
				meta: {
					auth: true,
					containerClassName: 'mcontainer pt-20',
					navbarSettings: { showFilter: true, pageTitle: 'Master Import' },
					permissionsMethod: 'some',
					permissions: ['edit_import_master', 'create_import_master'],
				},
			},
			{
				path: 'maintenance-requests',
				name: 'WorkOrderRequests',
				component: () => import('@/views/WorkOrderRequests/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_work_order_requests'] },
			},
			{
				path: 'success-dashboard',
				name: 'SuccessDashboardContainer',
				redirect: '/success-dashboard/main',
				component: () => import('@/views/SuccessDashboard/DetailsPage.vue'),
				meta: { auth: true, permissions: ['view_customer_success'] },
				children: [
					{
						path: 'main',
						name: 'SuccesMainDashboard',
						component: () => import('@/views/SuccessDashboard/MainDashboard/MainDashboard.vue'),
						meta: { auth: true, permissions: ['view_customer_success'] },
					},
					{
						path: 'meeting-tracker',
						name: 'SuccessMeetingTracker',
						component: () => import('@/views/SuccessDashboard/MeetingTracker/MeetingTracker.vue'),
						meta: { auth: true, permissions: ['view_customer_success'] },
					},
					{
						path: 'roi-one-pager',
						name: 'ROIOnePager',
						component: () => import('@/views/SuccessDashboard/ROIOnePager/ROIOnePager.vue'),
						meta: { auth: true, permissions: ['view_customer_success'] },
					},
					{
						path: 'meeting-tracker/new',
						name: 'SuccessMeetingTrackerCreate',
						component: () => import('@/views/SuccessDashboard/MeetingTracker/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_customer_success'] },
					},
					{
						path: 'meeting-tracker/:id',
						name: 'SuccessMeetingTrackerPage',
						component: () => import('@/views/SuccessDashboard/MeetingTracker/ItemPage.vue'),
						meta: { auth: true, permissions: ['view_customer_success'] },
					},
					{
						path: 'roi-one-pager/new',
						name: 'ROIOnePagerCreate',
						component: () => import('@/views/SuccessDashboard/ROIOnePager/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_customer_success'] },
					},
					{
						path: 'roi-one-pager/:id',
						name: 'ROIOnePagerPage',
						component: () => import('@/views/SuccessDashboard/ROIOnePager/ItemPage.vue'),
						meta: { auth: true, permissions: ['view_customer_success'] },
					},
				],
			},
			{
				path: 'corporate',
				name: 'CorporateDashboard',
				redirect: '/corporate/main',
				component: () => import('@/views/CorporateDashboard/CorporateDashboard.vue'),
				meta: { auth: true, permissions: ['view_corporate'] },
				children: [
					{
						path: 'main',
						name: 'CorporateMain',
						component: () => import('@/views/CorporateDashboard/Details/CorporateMain.vue'),
						meta: { auth: true },
					},
				],
			},
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
			{
				path: 'controllers',
				name: 'Controllers',
				component: () => import('@/views/Controllers/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_controllers'] },
			},
			{
				path: 'controllers/new',
				name: 'ControllerCreate',
				component: () => import('@/views/Controllers/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_controllers'] },
			},
			{
				path: 'controllers/:id',
				name: 'ControllerEdit',
				component: () => import('@/views/Controllers/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_controllers'] },
			},
			{
				path: 'production-lines/new',
				name: 'ProductionLineCreate',
				component: () => import('@/views/ProductionLines/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_dashboard'] },
			},
			{
				path: 'production-lines/:id',
				name: 'ProductionLineEdit',
				component: () => import('@/views/ProductionLines/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_dashboard'] },
			},
			{
				path: 'production-lines/:id/details',
				name: 'ProductionLineDetailsPage',
				component: () => import('@/views/ProductionLines/Details/DetailsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'store-rooms',
				name: 'StoreRooms',
				component: () => import('@/views/StoreRooms/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_storerooms'] },
			},
			{
				path: 'store-rooms/new',
				name: 'StoreRoomCreate',
				component: () => import('@/views/StoreRooms/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_storerooms'] },
			},
			{
				path: 'store-rooms/:id',
				name: 'StoreRoomEdit',
				component: () => import('@/views/StoreRooms/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_storerooms'] },
			},
			{
				path: 'store-rooms/:id/items',
				name: 'StoreRoomItems',
				component: () => import('@/views/BrandModels/StoreroomWrapper.vue'),
				meta: { auth: true, permissions: ['view_storerooms'] },
			},
			{
				path: 'rfqs',
				name: 'RFQS',
				component: () => import('@/views/RFQS/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_rfqs'] },
			},
			{
				path: 'rfqs/new',
				name: 'RFQSCreate',
				component: () => import('@/views/RFQS/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_rfqs'] },
			},
			{
				path: 'rfqs/:id',
				name: 'RFQSPage',
				component: () => import('@/views/RFQS/ItemPage.vue'),
				meta: { auth: true, permissions: ['view_rfqs'] },
			},
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
				path: 'maintenance-categories',
				name: 'MaintenanceCategories',
				component: () => import('@/views/MaintenanceCategories/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_work_order_type'] },
			},
			{
				path: 'maintenance-categories/new',
				name: 'MaintenanceCategoryCreate',
				component: () => import('@/views/MaintenanceCategories/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_work_order_type'] },
			},
			{
				path: 'maintenance-categories/:id',
				name: 'MaintenanceCategoryEdit',
				component: () => import('@/views/MaintenanceCategories/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_work_order_type'] },
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
			{
				path: 'equipments/:id/details',
				name: 'EquipmentsDetails',
				component: () => import('@/views/Equipments/Details/DetailsPage.vue'),
				redirect: (to) => `/equipments/${to.params.id}/details/main`,
				meta: { auth: true, permissions: ['view_dashboard'] },
				children: [
					{
						path: 'main',
						name: 'EquipmentInfoBlock',
						component: () => import('@/views/Equipments/Details/EquipmentInfoBlock.vue'),
						meta: { auth: true, permissions: ['view_dashboard'] },
					},
					{
						path: 'pdm/:sensorId',
						name: 'DetailsStatPage',
						component: () => import('@/views/Sensors/StatisticsPage.vue'),
						meta: { auth: true, permissions: ['view_dashboard'] },
					},
					{
						path: 'manual-route',
						name: 'DetailsManualRouteStatPage',
						component: () => import('@/views/Sensors/ManualRouteStatisticsPage.vue'),
						meta: { auth: true, permissions: ['view_dashboard'] },
					},
					{
						path: 'multi-view/:multiViewId',
						name: 'DetailsMultiViewPage',
						component: () => import('@/views/Sensors/MultiViewStatisticsPage.vue'),
						meta: { auth: true, permissions: ['view_dashboard'] },
					},
					{
						path: 'quote',
						name: 'EquipmentsQuoteTab',
						component: () => import('@/views/Equipments/Details/QuoteTab.vue'),
						meta: { auth: true, permissions: ['view_dashboard'], request_type: 1 },
					},
					{
						path: 'service',
						name: 'EquipmentsServiceTab',
						component: () => import('@/views/Equipments/Details/QuoteTab.vue'),
						meta: { auth: true, permissions: ['view_dashboard'], request_type: 2 },
					},
				],
			},
			{
				path: 'machines/new',
				name: 'MachineCreate',
				component: () => import('@/views/Machines/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_dashboard'] },
			},
			{
				path: 'machines/:id/details',
				name: 'MachineDetails',
				component: () => import('@/views/Machines/Details/DetailsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'machines/:id',
				name: 'MachineEdit',
				component: () => import('@/views/Machines/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_dashboard'] },
			},
			{
				path: 'assets/new',
				name: 'AssetCreate',
				component: () => import('@/views/Assets/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_dashboard'] },
			},
			{
				path: 'assets/:id/details',
				name: 'AssetDetails',
				component: () => import('@/views/Assets/Details/DetailsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'assets/:id',
				name: 'AssetEdit',
				component: () => import('@/views/Assets/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_dashboard'] },
			},
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
			{
				path: 'sensors',
				name: 'SensorsListFull',
				component: () => import('@/views/Sensors/ItemsList.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'sensors/ncd',
				name: 'NCDSensorsList',
				component: () => import('@/views/Sensors/NCDSensorsList.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'sensors/new',
				name: 'SensorCreate',
				component: () => import('@/views/Sensors/ItemPage.vue'),
				meta: { auth: true, permissions: ['create_dashboard'] },
			},
			{
				path: 'sensors/:id',
				name: 'SensorEdit',
				component: () => import('@/views/Sensors/ItemPage.vue'),
				meta: { auth: true, permissions: ['edit_dashboard'] },
			},
			{
				path: 'sensors/:id/fft',
				name: 'SensorFFT',
				component: () => import('@/views/Sensors/FFTStatisticsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'ncd/:id/fft/:fftId',
				name: 'SensorNcdFFT',
				component: () => import('@/views/Sensors/FFTStatisticsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'banner/:id/fft/:fftId',
				name: 'SensorBannerFFT',
				component: () => import('@/views/Sensors/FFTStatisticsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'sensors/:id/stats',
				name: 'SensorStats',
				component: () => import('@/views/Sensors/StatisticsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'sensors/:id/statistics',
				name: 'SensorStatistics',
				component: () => import('@/views/Sensors/StatisticsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
			},
			{
				path: 'sensors/:id/multiview',
				name: 'SensorMultiView',
				component: () => import('@/views/Sensors/MultiViewStatisticsPage.vue'),
				meta: { auth: true, permissions: ['view_dashboard'] },
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
				path: 'processes/:id/details',
				name: 'ProcessDetailsPage',
				component: () => import('@/views/Processes/Details/DetailsPage.vue'),
				meta: { auth: true, permissions: ['view_oee'] },
				children: [
					{
						path: 'dashboard',
						name: 'ProcessDashboard',
						component: () => import('@/views/Processes/Details/DashboardPage.vue'),
						meta: { auth: true, permissions: ['view_oee'], preventSetupNavbar: true },
					},
					{
						path: 'logs',
						name: 'ProcessLogs',
						component: () => import('@/views/Processes/Details/LogsList.vue'),
						meta: { auth: true, permissions: ['view_oee'], preventSetupNavbar: true },
					},
				],
			},
			{
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
					/*conditionSettings: {
						checkMethod: 'some',
						conditions: [{ prop: 'role.is_fab_shop_manager', control_value: true }],
					},*/
				},
			},
			{
				path: 'settings',
				name: 'SettingsPage',
				redirect: '/settings/faults?type=1',
				component: () => import('@/views/Settings/SettingsPage.vue'),
				meta: { auth: true, permissions: ['view_settings'] },
				children: [
					{
						path: 'lube-type',
						name: 'LubeTypes',
						component: () => import('@/views/Settings/LubeTypes/ItemsList.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'lube-type/create',
						redirect: '/settings/lube-type/new',
					},
					{
						path: 'lube-type/new',
						name: 'LubeTypeCreate',
						component: () => import('@/views/Settings/LubeTypes/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_settings'] },
					},
					{
						path: 'lube-type/:id',
						name: 'LubeTypeEdit',
						component: () => import('@/views/Settings/LubeTypes/ItemPage.vue'),
						meta: { auth: true, permissions: ['edit_settings'] },
					},
					{
						path: 'bearing',
						name: 'Bearings',
						component: () => import('@/views/Settings/Bearings/ItemsList.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'bearing/create',
						redirect: '/settings/bearing/new',
					},
					{
						path: 'bearing/new',
						name: 'BearingCreate',
						component: () => import('@/views/Settings/Bearings/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_settings'] },
					},
					{
						path: 'bearing/:id',
						name: 'BearingEdit',
						component: () => import('@/views/Settings/Bearings/ItemPage.vue'),
						meta: { auth: true, permissions: ['edit_settings'] },
					},
					{
						path: 'industrial-services',
						name: 'IndustrialServices',
						component: () => import('@/views/Settings/IndustrialServices/ItemsList.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'industrial-services/create',
						redirect: '/settings/industrial-services/new',
					},
					{
						path: 'industrial-services/new',
						name: 'IndustrialServiceCreate',
						component: () => import('@/views/Settings/IndustrialServices/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_settings'] },
					},
					{
						path: 'industrial-services/:id',
						name: 'IndustrialServiceEdit',
						component: () => import('@/views/Settings/IndustrialServices/ItemPage.vue'),
						meta: { auth: true, permissions: ['edit_settings'] },
					},
					{
						path: 'banner-v2-subtypes',
						name: 'BannerV2Subtypes',
						component: () => import('@/views/Settings/BannerV2Subtype/ItemsList.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'banner-v2-subtypes/create',
						redirect: '/settings/banner-v2-subtypes/new',
					},
					{
						path: 'banner-v2-subtypes/new',
						name: 'BannerV2SubtypeCreate',
						component: () => import('@/views/Settings/BannerV2Subtype/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_settings'] },
					},
					{
						path: 'banner-v2-subtypes/:id',
						name: 'BannerV2SubtypeEdit',
						component: () => import('@/views/Settings/BannerV2Subtype/ItemPage.vue'),
						meta: { auth: true, permissions: ['edit_settings'] },
					},
					{
						path: 'faults',
						name: 'FaultsSettings',
						component: () => import('@/views/Settings/Faults/ItemsList.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'faults/create',
						redirect: '/settings/faults/new',
					},
					{
						path: 'faults/new',
						name: 'FaultCreate',
						component: () => import('@/views/Settings/Faults/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_settings'] },
					},
					{
						path: 'faults/:id',
						name: 'FaultEdit',
						component: () => import('@/views/Settings/Faults/ItemPage.vue'),
						meta: { auth: true, permissions: ['edit_settings'] },
					},
					{
						path: 'faults/ncd/create',
						redirect: '/settings/faults/ncd/new',
					},
					{
						path: 'faults/ncd/new',
						name: 'FaultNcdCreate',
						component: () => import('@/views/Settings/Faults/ItemPage.vue'),
						meta: { auth: true, permissions: ['create_settings'] },
					},
					{
						path: 'faults/ncd/:id',
						name: 'FaultNcdEdit',
						component: () => import('@/views/Settings/Faults/ItemPage.vue'),
						meta: { auth: true, permissions: ['edit_settings'] },
					},
					{
						path: 'custom-formulas',
						name: 'CustomFormulas',
						component: () => import('@/views/Settings/CustomFormulas/FormulasTab.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'backend-registers',
						name: 'BackEndRegisters',
						component: () => import('@/views/Settings/BackEndRegisters/BackEndRegistersTab.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'statistics',
						name: 'StatisticsExport',
						component: () => import('@/views/Settings/Statistics/ExportPage.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
					{
						path: 'import',
						redirect: '/settings/import/logs',
						name: 'ImportTab',
						component: () => import('@/views/Settings/Import/ImportTab.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
						children: [
							{
								path: 'logs',
								name: 'SettingsImportPlant',
								component: () => import('@/views/Settings/Import/Plant/PlantPage.vue'),
								meta: {
									auth: true,
									permissions: ['view_settings', 'view_import_plant'],
								},
							},
							{
								path: 'master',
								name: 'SettingsImportMaster',
								component: () => import('@/views/Settings/Import/MasterPage.vue'),
								meta: {
									auth: true,
									permissions: ['view_settings', 'view_import_master'],
								},
							},
							{
								path: 'history',
								name: 'HistoryPage',
								component: () => import('@/views/Settings/Import/ItemsList.vue'),
								meta: { auth: true, permissions: ['view_settings'] },
							},
						],
					},
					{
						path: 'import/:id',
						name: 'LogsPage',
						component: () => import('@/views/Settings/Import/ItemPage.vue'),
						meta: { auth: true, permissions: ['view_settings'] },
					},
				],
			},
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
				*/
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
		/*if (to.path == '/machines/11/details') {
			debugger
		}*/
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
	const authStore = useAuthStore(pinia);
	const globalStore = useGlobalStore(pinia);
	const { Notify } = useNotify();
	const tt = Lang.tt;

	const nextStep = () => {
		const { hasAccess, reason, authUser } = hasRightsToRoute(to, authStore);
		// console.log('hasAccess', to, hasAccess, reason, authUser);
		if (hasAccess) {
			if (authUser?.role?.is_forced_mfa && !authUser.is_mfa_enabled && to.path !== '/profile') {
				Notify({
					type: 'warning',
					title: tt('phrases.limited_access'),
					message: tt('aliases.mfa_auth_restriction'),
				});
				return next('/profile?enableMfa=true');
			}

			const beforeEachHook = globalStore.beforeEachHook;
			if (beforeEachHook && !beforeEachHook({ from, to })) {
				return next(false);
			}

			return next();
		}

		if (reason === 'limited_access') {
			Notify({
				type: 'warning',
				title: tt('phrases.limited_access'),
				message: tt('phrases.you_do_not_have_permissions_to_view_this_page'),
			});
			return next(from.fullPath);
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
	};

	const params = getParamsFromUrl(to.fullPath);
	if (params.error) {
		Notify({ type: 'error', message: params.error });
		return next('/login');
	}

	if (params.token) {
		return authStore
			.get_auth_user(params.token)
			.then(nextStep)
			.catch(() => next('/login'));
	}

	return nextStep();
});

export default router;
