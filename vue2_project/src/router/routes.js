// import Login from '@/components/pages/Login.vue';
// import DashboardLayout from '@/layout/DashboardLayout.vue';
/*import {
	// USER_TYPES,
	// USER_ROLES_TYPES,
	// RFQS_TYPES,
} from '@/constants/global';*/
// import { MENU_TYPES } from '@/constants/menuItems';

const Login = () =>
	import(/* webpackChunkName: "loginWrapper" */ '@/components/pages/LoginWrapper.vue');

const Navbar = () =>
	import(/* webpackChunkName: "navbar" */ '@/components/TopNavbar.vue');
const Sidebar = () =>
	import(/* webpackChunkName: "sidebar" */ '@/components/Sidebar/Sidebar.vue');
// const ItemEditNavbar = () => import(/* webpackChunkName: "navbar" */ '@/components/ItemEditNavbar.vue');

const routes = [
	{
		path: '/login',
		name: 'Login',
		redirect: '/login/sign-in',
		component: Login,
		children: [
			{
				path: 'sign-in',
				name: 'login',
				component: () =>
					import(/* webpackChunkName: "login" */ '@/components/pages/Login.vue'),
			},
			{
				path: 'password/reset/:token',
				name: 'passwordReset',
				component: () =>
					import(/* webpackChunkName: "passwordReset" */ '@/components/pages/NewPasswordForm.vue'),
			},
			{
				path: 'password/forgot',
				name: 'passwordForgot',
				component: () =>
					import(/* webpackChunkName: "passwordForgot" */ '@/components/pages/ForgotPasswordForm.vue'),
			},
		]
	},
	{
		path: '/kruger',
		// name: 'Login',
		component: Login
	},
	{
		path: '/login/remote',
		name: 'RemoteLogin',
		component: () =>
			import(
				/* webpackChunkName: "RemoteLogin" */ '@/components/pages/RemoteLogin.vue'
			)
		// meta: { auth: false }
	},
	{
		path: '/graph/:sensorId',
		name: 'OneChartPage',
		component: () =>
			import(
				/* webpackChunkName: "OneChartPage" */ '@/views/Sensors/OneChartPage.vue'
			)
		// meta: { auth: false }
	},
	{
		path: '/',
		component: () =>
			import(
				/* webpackChunkName: "DashboardLayout" */ '@/layout/DashboardLayout.vue'
			),
		// DashboardLayout,
		/*components: {
			default: DashboardLayout,
			navbar: Navbar,
			sidebar: Sidebar
		},*/
		// redirect: '/dashboard',
		// meta: { auth: true /*userTypes:[ USER_TYPES.USER, USER_TYPES.SUPER_ADMIN ]*/ },
		children: [
			{
				path: 'dashboard',
				name: 'PlantDashboard',
				redirect: '/dashboard/plant',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
					// app_section: MENU_TYPES.DASHBOARD,
					/*userTypes: [
						USER_TYPES.SUPER_ADMIN,
						USER_TYPES.DISTRIBUTOR,
						USER_TYPES.PLANT_ADMIN,
						USER_TYPES.PLANT_USER,
						USER_TYPES.PLANT_SUPERINTENDENT
					]*/
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "dashboard" */ '@/views/Dashboard/Dashboard.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				},
				children: [
					{
						path: 'plant',
						name: 'PlantDetails',
						component: () =>
							import(
								/* webpackChunkName: "PlantDetails" */ '@/views/Plants/Details/DetailsPage.vue'
							),
						meta: {
							auth: true
						}
					},
					{
						path: 'production-lines',
						name: 'ProductionLines',
						component: () =>
							import(
								/* webpackChunkName: "ProductionLines" */ '@/views/ProductionLines/ItemsList.vue'
							),
						meta: {
							auth: true
						}
					},
					{
						path: 'utilities',
						name: 'Utilities',
						component: () =>
							import(
								/* webpackChunkName: "ProductionLines" */ '@/views/ProductionLines/UtilitiesListWrapper.vue'
							),
						meta: {
							auth: true
						}
					},
					{
						path: 'machines',
						name: 'Machines',
						component: () =>
							import(
								/* webpackChunkName: "Machines" */ '@/views/Machines/ItemsList.vue'
							),
						meta: { auth: true }
					},
					{
						path: 'assets',
						name: 'Assets',
						component: () =>
							import(
								/* webpackChunkName: "Assets" */ '@/views/Assets/ItemsList.vue'
							),
						meta: { auth: true }
					},
					{
						// path: 'items',
						path: 'equipments',
						// name: 'EquipmentsLayout',
						component: () =>
							import(
								/* webpackChunkName: "EquipmentsLayout" */ '@/views/Equipments/EquipmentsLayout.vue'
							),
						meta: {
							auth: true
						}
					}
				]
			},
			{
				path: 'corporate',
				name: 'CorporateDashboard',
				redirect: '/corporate/main',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "CorporateDashboard" */ '@/views/CorporateDashboard/CorporateDashboard.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				},
				children: [
					{
						path: 'main',
						name: 'CorporateMain',
						component: () =>
							import(
								/* webpackChunkName: "CorporateMain" */ '@/views/CorporateDashboard/Details/CorporateMain.vue'
							),
						meta: {
							auth: true
						}
					},
				]
			},
			{
				path: '/users',
				name: 'Users',
				meta: {
					auth: true,
					permissions: ['view_users']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "Users" */ '@/views/Users/ItemsList.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/user-roles',
				name: 'UserRoles',
				meta: {
					auth: true,
					permissions: ['view_user_roles'] //todo
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "UserRoles" */ '@/views/UserRoles/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/teams',
				name: 'Teams',
				meta: {
					auth: true,
					permissions: ['view_users_teams']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "Teams" */ '@/views/Teams/ItemsList.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},

			{
				path: '/maintenance-requests',
				name: 'WorkOrderRequests',
				meta: {
					auth: true,
					permissions: ['view_work_order_requests']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "WorkOrderRequests" */ '@/views/WorkOrderRequests/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/maintenance-categories',
				name: 'WorkOrderTypes',
				meta: {
					auth: true,
					permissions: ['view_work_order_type']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "WorkOrderTypes" */ '@/views/MaintenanceCategories/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/requisitions',
				name: 'Requisitions',
				meta: {
					auth: true,
					permissions: ['view_requisitions'],

					// work_order_role: WORK_ORDER_ROLES.REQUISITIONER,
					conditionSettings: {
						checkMethod: 'some',
						conditions: [
							{
								array_method: 'some',
								prop: 'type',
								// control_value: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX]
								control_value: [1]
							},
							{ prop: 'role.is_requisitioner', control_value: true },
							{ prop: 'role.is_fab_shop_manager', control_value: true },
							{ prop: 'role.is_technic', control_value: true }
						]
					}
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Requisitions" */ '@/views/Requisitions/RequisitionsDashboard.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/roi-calculator',
				name: 'ROICalculator',
				meta: {
					auth: true,
					permissions: ['view_requisitions_roi_calculator'],
					// work_order_role: WORK_ORDER_ROLES.REQUISITIONER,
					conditionSettings: {
						checkMethod: 'some',
						conditions: [{ prop: 'role.is_fab_shop_manager', control_value: true }]
					}
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Requisitions" */ '@/views/Requisitions/ROICalculator/ROICalculatorContainer.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: 'companies',
				name: 'Companies',
				meta: {
					auth: true,
					permissions: ['view_companies']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Companies" */ '@/views/Companies/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/parts',
				name: 'Parts',
				meta: {
					auth: true,
					permissions: ['view_misc_parts']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "Parts" */ '@/views/Parts/ItemsList.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/task-procedures',
				name: 'TaskProcedures',
				meta: {
					auth: true,
					permissions: ['view_task_procedures']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "TaskProcedures" */ '@/views/TaskProcedures/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/controllers',
				name: 'Controllers',
				meta: {
					auth: true,
					permissions: ['view_controllers']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Controllers" */ '@/views/Controllers/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/plants',
				name: 'Plants',
				meta: {
					auth: true,
					permissions: ['view_plants']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "Plants" */ '@/views/Plants/ItemsList.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			// {
			// 	path: '/sensors',
			// 	name: 'Sensors',
			// 	meta: {
			// 		auth: true,
			// 		userTypes: [
			// 			USER_TYPES.SUPER_ADMIN,
			// 			USER_TYPES.DISTRIBUTOR,
			// 			USER_TYPES.PLANT_USER
			// 		]
			// 	},
			// 	components: {
			// 		default: () =>
			// 			import(
			// 				/* webpackChunkName: "Sensors" */ '@/views/Sensors/ItemsList.vue'
			// 			),
			// 		navbar: Navbar,
			// 		sidebar: Sidebar
			// 	}
			// },
			{
				path: '/ncd-sensors',
				name: 'NCDSensors',
				meta: {
					auth: true,
					permissions: ['view_controllers']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "NCDSensors" */ '@/views/Sensors/NCDSensorsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/distributors',
				name: 'Distributors',
				meta: { auth: true, permissions: ['view_distributors'] },
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Distributors" */ '@/views/Distributors/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/applications',
				name: 'Applications',
				meta: {
					auth: true,
					permissions: ['view_applications']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Applications" */ '@/views/Applications/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/brands',
				name: 'Brands',
				meta: {
					auth: true,
					permissions: ['view_brands']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "Brands" */ '@/views/Brands/ItemsList.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/equipment-types',
				name: 'EquipmentTypes',
				meta: {
					auth: true,
					permissions: ['view_equipment_types']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "EquipmentTypes" */ '@/views/EquipmentTypes/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/brand-models',
				name: 'BrandModels',
				meta: {
					auth: true,
					permissions: ['view_part_numbers']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "BrandModels" */ '@/views/BrandModels/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/store-rooms',
				name: 'StoreRooms',
				meta: {
					auth: true,
					permissions: ['view_storerooms']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "StoreRooms" */ '@/views/StoreRooms/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/plants-vendors',
				name: 'PlantsVendors',
				meta: {
					auth: true,
					permissions: ['view_vendors']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "PlantsVendors" */ '@/views/PlantsVendors/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/rfqs',
				name: 'RFQS',
				meta: {
					auth: true,
					permissions: ['view_rfqs']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "RFQS" */ '@/views/RFQS/ItemsList.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/processes',
				// name: 'RFQS',
				meta: { auth: true, permissions: ['view_oee'] },
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Processes" */ '@/views/Processes/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/success-dashboard',
				name: 'SuccessDashboardContainer',
				meta: {
					auth: true,
					permissions: ['view_customer_success']
				},
				redirect: '/success-dashboard/main',
				components: {
					default: () =>
						import(
							/* webpackChunkName: "SuccessDashboard" */ '@/views/SuccessDashboard/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				},
				children: [
					{
						path: 'main',
						name: 'SuccesMainDashboard',
						component: () =>
							import(
								/* webpackChunkName: "SuccesMainDashboard" */ '@/views/SuccessDashboard/MainDashboard/MainDashboard.vue'
							)
					},
					{
						path: 'meeting-tracker',
						name: 'SuccessMeetingTracker',
						component: () =>
							import(
								/* webpackChunkName: "SuccessMeetingTracker" */ '@/views/SuccessDashboard/MeetingTracker/MeetingTracker.vue'
							)
					},
					{
						path: 'roi-one-pager',
						name: 'ROIOnePager',
						component: () =>
							import(
								/* webpackChunkName: "ROIOnePager" */ '@/views/SuccessDashboard/ROIOnePager/ROIOnePager.vue'
							)
					},
					// --------------------
					{
						path: 'meeting-tracker/:id',
						name: 'SuccessMeetingTrackerPage',
						component: () =>
							import(
								/* webpackChunkName: "SuccessMeetingTrackerPage" */ '@/views/SuccessDashboard/MeetingTracker/ItemPage.vue'
							)
					},
					{
						path: 'roi-one-pager/:id',
						name: 'ROIOnePagerPage',
						component: () =>
							import(
								/* webpackChunkName: "ROIOnePagerPage" */ '@/views/SuccessDashboard/ROIOnePager/ItemPage.vue'
							)
					}
				]
			},
			{
				path: '/equipment-types-categories',
				name: 'EquipmentTypesCategories',
				meta: {
					auth: true,
					permissions: ['view_equipment_types_categories']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "EquipmentTypesCategories" */ '@/views/EquipmentTypesCategories/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/work-stations',
				name: 'WorkStations',
				meta: {
					auth: true,
					permissions: ['view_work_stations']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "WorkStations" */ '@/views/WorkStations/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/library',
				name: 'Library',
				meta: {
					auth: true,
					permissions: ['view_library']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "Library" */ '@/views/Library/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},

			// ---------- IDS --------
			{
				path: '/profile',
				name: 'UserPageProfile',
				meta: {
					auth: true
					// userTypes: [USER_TYPES.PLANT_USER]
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "UserPage" */ '@/views/Users/ItemPage.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/users/:id',
				name: 'UserPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_users', 'create_users']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "UserPage" */ '@/views/Users/ItemPage.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/user-roles/:id',
				name: 'UserRolesPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_user_roles', 'create_user_roles']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "UserRolesPage" */ '@/views/UserRoles/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/teams/:id',
				name: 'TeamPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_users_teams', 'create_users_teams']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "TeamPage" */ '@/views/Teams/ItemPage.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/companies/:id',
				name: 'CompanyPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_companies', 'create_companies']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "CompanyPage" */ '@/views/Companies/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
				// component: () => import(/* webpackChunkName: "users" */ '@/views/Companies/CompanyPage.vue')
			},
			{
				path: '/controllers/:id',
				name: 'ControllerPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_controllers', 'create_controllers']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "ControllerPage" */ '@/views/Controllers/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},

			{
				path: '/parts/:id',
				name: 'PartPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_misc_parts', 'create_misc_parts']
				},
				components: {
					default: () =>
						import(/* webpackChunkName: "PartPage" */ '@/views/Parts/ItemPage.vue'),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/task-procedures/:id',
				name: 'TaskProcedurePage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_task_procedures', 'create_task_procedures']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "TaskProcedurePage" */ '@/views/TaskProcedures/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/plants/:id',
				name: 'PlantPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_plants', 'create_plants']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "PlantPage" */ '@/views/Plants/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},

			{
				path: '/ncd-sensors/:id',
				name: 'NCDSensorPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_dashboard', 'create_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "NCDSensorPage" */ '@/views/Sensors/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/banner-sensors/:id',
				// name: 'NCDSensorPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_dashboard', 'create_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "NCDSensorPage" */ '@/views/Sensors/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/ncd/:id/fft/:fftId',
				name: 'FFTStatPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "FFTStatPage" */ '@/views/Sensors/FFTStatisticsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/banner/:id/fft/:fftId',
				// name: 'FFTStatPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "FFTStatPage" */ '@/views/Sensors/FFTStatisticsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/distributors/:id',
				name: 'DistributorPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_distributors', 'create_distributors']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "DistributorPage" */ '@/views/Distributors/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/applications/:id',
				name: 'ApplicationPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_applications', 'create_applications']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "ApplicationPage" */ '@/views/Applications/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/brands/:id',
				name: 'BrandPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_brands', 'create_brands']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "BrandPage" */ '@/views/Brands/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/equipment-types/:id',
				name: 'EquipmentTypePage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_equipment_types', 'create_equipment_types']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "EquipmentTypePage" */ '@/views/EquipmentTypes/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/brand-models/:id',
				name: 'BrandModelPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_part_numbers', 'create_part_numbers']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "BrandModelPage" */ '@/views/BrandModels/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/store-rooms/:id',
				name: 'StoreRoomsPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_storerooms', 'create_storerooms']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "StoreRoomsPage" */ '@/views/StoreRooms/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/store-rooms/:id/items',
				name: 'StoreroomItemsPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['view_storerooms']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "StoreroomItemsPage" */ '@/views/BrandModels/StoreroomWrapper.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/plants-vendors/:id',
				name: 'PlantsVendorsPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_vendors', 'create_vendors']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "PlantsVendorsPage" */ '@/views/PlantsVendors/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			// {
			// 	path: '/rfqs/:id',
			// 	name: 'RFQSPage',
			// 	meta: { auth: true },
			// 	components: {
			// 		default: () =>
			// 			import(/* webpackChunkName: "RFQSPage" */ '@/views/RFQS/ItemPage.vue'),
			// 		navbar: Navbar,
			// 		sidebar: Sidebar
			// 	}
			// },
			{
				path: '/processes/:id',
				name: 'ProcessPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_oee', 'view_oee']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "ProcessPage" */ '@/views/Processes/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/equipment-types-categories/:id',
				name: 'EquipmentTypeCategoryPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: [
						'edit_equipment_types_categories',
						'create_equipment_types_categories'
					]
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "EquipmentTypeCategoryPage" */ '@/views/EquipmentTypesCategories/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/requisitions/:id',
				name: 'RequisitionPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_requisitions', 'create_requisitions']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "RequisitionPage" */ '@/views/Requisitions/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/maintenance-categories/:id',
				name: 'WOTypePage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_work_order_type', 'create_work_order_type']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "WOTypePage" */ '@/views/MaintenanceCategories/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/maintenance-import',
				name: 'WOImportPage',
				meta: {
					auth: true,
					permissionsMethod: 'some',
					permissions: ['edit_import_work_orders', 'create_import_work_orders']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "WOImportPage" */ '@/views/Maintenance/WorkOrdersImport/ItemPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/plant-import',
				name: 'PlantImportPage',
				meta: {
					auth: true,
					containerClassName: 'mcontainer pt-20',
					navbarSettings: { showFilter: true, pageTitle: 'Plant Import' },
					permissionsMethod: 'some',
					permissions: ['edit_import_plant', 'create_import_plant']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "PlantImportPage" */ '@/views/Settings/Import/Plant/PlantPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/plant-import-logs',
				name: 'ImportLogs',
				meta: {
					auth: true,
					// containerClassName: 'mcontainer pt-20',
					// navbarSettings: { showFilter: true, pageTitle: 'Import' },
					permissionsMethod: 'some',
					permissions: ['edit_import_plant_logs', 'create_import_plant_logs']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "ImportLogs" */ '@/views/Settings/Import/Plant/Logs/ItemsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/plant-import-logs/:id',
				name: 'PlantImportLogErrors',
				meta: {
					auth: true,
					// containerClassName: 'mcontainer pt-20',
					// navbarSettings: { showFilter: true, pageTitle: 'Import' },
					permissionsMethod: 'some',
					permissions: ['edit_import_plant_logs', 'create_import_plant_logs']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "ImportLogs" */ '@/views/Settings/Import/Plant/Logs/RowsList.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			// {
			// 	path: '/import-log',
			// 	name: 'ImportLogPage',
			// 	meta: {
			// 		auth: true,
			// 		containerClassName: 'mcontainer pt-20',
			// 		navbarSettings: { showFilter: true, pageTitle: 'Import' },
			// 		userTypes: [USER_TYPES.SUPER_ADMIN, USER_TYPES.PLANT_ADMIN]
			// 	},
			// 	components: {
			// 		default: () =>
			// 			import(
			// 				/* webpackChunkName: "ImportLogPage" */ '@/views/Settings/Import/ImportLogPage.vue'
			// 			),
			// 		navbar: Navbar,
			// 		sidebar: Sidebar
			// 	}
			// },
			{
				path: '/master-import',
				name: 'MasterImportPage',
				meta: {
					auth: true,
					containerClassName: 'mcontainer pt-20',
					navbarSettings: { showFilter: true, pageTitle: 'Master Import' },
					permissionsMethod: 'some',
					permissions: ['edit_import_master', 'create_import_master']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "MasterImportPage" */ '@/views/Settings/Import/MasterPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},

			// --------------
			{
				path: '/sensors/:id/statistics',
				name: 'SensorStatPage',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "SensorStatPage" */ '@/views/Sensors/StatisticsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/companies/:id/info',
				name: 'CompanyInfoPage',
				meta: {
					auth: true,
					permissions: ['view_companies']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "CompanyInfoPage" */ '@/views/Companies/InfoPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			// -----------------
			{
				path: '/production-lines/:id/details',
				// redirect: '/production-lines/:id/details/main',
				name: 'ProductionLineDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "ProductionLineDetailsPage" */ '@/views/ProductionLines/Details/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/machines/:id/details',
				name: 'MachineDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "MachineDetailsPage" */ '@/views/Machines/Details/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/assets/:id/details',
				name: 'AssetDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "AssetDetailsPage" */ '@/views/Assets/Details/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/equipments/:id/details',
				redirect: '/equipments/:id/details/main',
				name: 'EequipmentDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "AssetDetailsPage" */ '@/views/Equipments/Details/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				},

				children: [
					{
						path: 'main',
						name: 'EquipmentInfoBlock',
						component: () =>
							import(
								/* webpackChunkName: "EquipmentInfoBlock" */ '@/views/Equipments/Details/EquipmentInfoBlock.vue'
							),
						meta: {
							auth: true
						}
					},
					{
						path: 'pdm/:sensorId',
						name: 'DetailsStatPage',
						meta: {
							auth: true /*userTypes: [USER_TYPES.SUPER_ADMIN, USER_TYPES.DISTRIBUTOR, USER_TYPES.PLANT_USER]*/
						},
						component: () =>
							import(
								/* webpackChunkName: "SensorStatPage" */ '@/views/Sensors/StatisticsPage.vue'
							)
					},
					{
						path: 'multi-view/:multiViewId',
						name: 'DetailsMultiViewPage',
						meta: {
							auth: true
						},
						component: () =>
							import(
								/* webpackChunkName: "MultiViewStatPage" */ '@/views/Sensors/MultiViewStatisticsPage.vue'
							)
					},
					{
						path: 'quote',
						name: 'QuoteTab',
						component: () =>
							import(
								/* webpackChunkName: "QuoteTab" */ '@/views/Equipments/Details/QuoteTab.vue'
							),
						meta: {
							auth: true,
							// request_type:/ RFQS_TYPES.FOR_BUY
							request_type: 1
						}
					},
					{
						path: 'service',
						name: 'ServiceTab',
						component: () =>
							import(
								/* webpackChunkName: "QuoteTab" */ '@/views/Equipments/Details/QuoteTab.vue'
							),
						meta: {
							auth: true,
							// request_type: RFQS_TYPES.FOR_SERVICE
							request_type: 2
						}
					}
				]
			},
			{
				path: '/maintenance',
				redirect: '/maintenance/work-orders',
				// name: 'EequipmentDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_maintenance']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "MaintenanceDashboard" */ '@/views/Maintenance/MaintenanceDashboard.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				},

				children: [
					{
						path: 'work-orders',
						name: 'WorkOrdersDetails',
						component: () =>
							import(
								/* webpackChunkName: "WorkOrdersDetails" */ '@/views/Maintenance/WorkOrders/WorkOrdersDetails.vue'
							),
						meta: {
							auth: true
						}
					},
					{
						path: 'logs',
						name: 'LogsDetails',
						component: () =>
							import(
								/* webpackChunkName: "LogsDetails" */ '@/views/Maintenance/Logs/LogsDetails.vue'
							),
						meta: {
							auth: true
						}
					}
				]
			},
			{
				path: '/processes/:id/details',
				// redirect: '/processes/:id/details/logs',
				name: 'ProcessDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_oee']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "ProcessDetailsPage" */ '@/views/Processes/Details/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				},

				children: [
					{
						path: 'dashboard',
						name: 'ProcessDashboard',
						component: () =>
							import(
								/* webpackChunkName: "ProcessDashboard" */ '@/views/Processes/Details/DashboardPage.vue'
							),
						meta: {
							auth: true
						}
					},
					{
						path: 'logs',
						name: 'LogsTab',
						component: () =>
							import(
								/* webpackChunkName: "LogsTab" */ '@/views/Processes/Details/LogsList.vue'
							),
						meta: {
							auth: true
						}

						/*children: [
							{
								path: ':logId',
								name: 'LogPage',
								component: () =>
									import(
										 webpackChunkName: "LogPage"  '@/views/Processes/Details/LogsList.vue'
									),
								meta: {
									auth: true,
								}
							},
						]*/
					}
				]
			},
			{
				path: '/utilities/:id/details',
				// redirect: '/production-lines/:id/details/main',
				name: 'UtilityDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_dashboard']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "UtilityDetailsPage" */ '@/views/Utilities/Details/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			{
				path: '/brand-models/:id/details',
				name: 'BrandModelsDetailsPage',
				meta: {
					auth: true,
					permissions: ['view_part_numbers']
				},
				components: {
					default: () =>
						import(
							/* webpackChunkName: "BrandModelsDetailsPage" */ '@/views/BrandModels/Details/DetailsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				}
			},
			// -------------
			{
				path: '/settings',
				name: 'SettingsPage',
				meta: { auth: true, permissions: ['view_settings'] },
				components: {
					default: () =>
						import(
							/* webpackChunkName: "SettingsPage" */ '@/views/Settings/SettingsPage.vue'
						),
					navbar: Navbar,
					sidebar: Sidebar
				},
				children: [
					// {
					// 	path: '/settings/emails',
					// 	name: 'EmailsTab',
					// 	meta: { auth: true },
					// 	component: () =>
					// 		import(
					// 			/* webpackChunkName: "EmailsTab" */ '@/views/Settings/Emails/EmailsTab.vue'
					// 		)
					// },
					{
						path: '/settings/backend-registers',
						name: 'BackEndRegisters',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "BackEndRegisters" */ '@/views/Settings/BackEndRegisters/BackEndRegistersTab.vue'
							)
					},
					{
						path: '/settings/faults',
						name: 'FaultsTab',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "Faults" */ '@/views/Settings/Faults/ItemsList.vue'
							)
					},
					{
						path: '/settings/import',
						redirect: '/settings/import/logs',
						name: 'ImportTab',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "ImportTab" */ '@/views/Settings/Import/ImportTab.vue'
							),
						children: [
							{
								path: 'logs',
								// name: 'FaultsTab',
								meta: {
									auth: true,
									permissions: ['view_settings', 'view_import_plant']
								},
								component: () =>
									import(
										/* webpackChunkName: "ImportForm" */ '@/views/Settings/Import/Plant/PlantPage.vue'
									)
							},
							{
								path: 'master',
								// name: 'FaultsTab',
								meta: {
									auth: true,
									permissions: ['view_settings', 'view_import_master']
								},
								component: () =>
									import(
										/* webpackChunkName: "MasterPage" */ '@/views/Settings/Import/MasterPage.vue'
									)
							},
							{
								path: 'history',
								name: 'HistoryPage',
								meta: { auth: true },
								component: () =>
									import(
										/* webpackChunkName: "HistoryPage" */ '@/views/Settings/Import/ItemsList.vue'
									)
							}
						]
					},
					{
						path: '/settings/import/:id',
						name: 'LogsPage',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "LogsPage" */ '@/views/Settings/Import/ItemPage.vue'
							)
					},
					{
						path: '/settings/custom-formulas',
						name: 'FormulasTab',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "CustomFormulas" */ '@/views/Settings/CustomFormulas/FormulasTab.vue'
							)
					},
					{
						path: '/settings/bearing',
						name: 'BearingTab',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "BearingTab" */ '@/views/Settings/Bearings/ItemsList.vue'
							)
					},
					{
						path: '/settings/lube-type',
						name: 'LubeTypeTab',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "LubeTypeTab" */ '@/views/Settings/LubeTypes/ItemsList.vue'
							)
					},
					{
						path: '/settings/industrial-services',
						name: 'IndustrialServicesTab',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "IndustrialServicesTab" */ '@/views/Settings/IndustrialServices/ItemsList.vue'
							)
					},
					{
						path: '/settings/statistics',
						name: 'StatisticsTab',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "StatisticsTab" */ '@/views/Settings/Statistics/ExportPage.vue'
							)
					},
					{
						path: '/settings/banner-v2-subtypes',
						name: 'BannerV2SubtypesPage',
						meta: { auth: true },
						component: () =>
							import(
								/* webpackChunkName: "BannerV2SubtypesPage" */ '@/views/Settings/BannerV2Subtype/ItemsList.vue'
							)
					}
				]
			}
		]
	},
	// {
	// 	path: '/production-lines/:id',
	// 	name: 'ProductionLinePage',
	// 	meta: { auth: true /*userTypes: [USER_TYPES.SUPER_ADMIN]*/ },
	// 	components: {
	// 		default: () =>
	// 			import(
	// 				/* webpackChunkName: "ProductionLinePage" */ '@/views/ProductionLines/ItemPage.vue'
	// 			),
	// 		navbar: Navbar,
	// 		sidebar: Sidebar
	// 	}
	// },
	// 
	// {
	// 	path: '/machines/:id',
	// 	name: 'MachinePage',
	// 	meta: { auth: true /*userTypes: [USER_TYPES.SUPER_ADMIN]*/ },
	// 	components: {
	// 		default: () =>
	// 			import(
	// 				/* webpackChunkName: "MachinePage" */ '@/views/Machines/ItemPage.vue'
	// 			),
	// 		navbar: Navbar,
	// 		sidebar: Sidebar
	// 	}
	// },
	// {
	// 	path: '/assets/:id',
	// 	name: 'AssetPage',
	// 	meta: { auth: true /*userTypes: [USER_TYPES.SUPER_ADMIN]*/ },
	// 	components: {
	// 		default: () =>
	// 			import(
	// 				/* webpackChunkName: "AssetPage" */ '@/views/Assets/ItemPage.vue'
	// 			),
	// 		navbar: Navbar,
	// 		sidebar: Sidebar
	// 	}
	// },
	// {
	// 	path: '/equipments/:id',
	// 	name: 'EquipmentPage',
	// 	meta: { auth: true /*userTypes: [USER_TYPES.SUPER_ADMIN]*/ },
	// 	components: {
	// 		default: () =>
	// 			import(
	// 				/* webpackChunkName: "EquipmentPage" */ '@/views/Equipments/ItemPage.vue'
	// 			),
	// 		navbar: Navbar,
	// 		sidebar: Sidebar
	// 	}
	// },
	// {
	// 	path: '/sensors/:id',
	// 	name: 'SensorPage',
	// 	meta: {
	// 		auth: true,
	// 		userTypes: [USER_TYPES.SUPER_ADMIN, USER_TYPES.DISTRIBUTOR]
	// 	},
	// 	components: {
	// 		default: () =>
	// 			import(
	// 				/* webpackChunkName: "SensorPage" */ '@/views/Sensors/ItemPage.vue'
	// 			),
	// 		navbar: Navbar,
	// 		sidebar: Sidebar
	// 	}
	// },
	// -----
	{
		path: '*',
		name: 'NotFoundPage',
		component: () =>
			import(
				/* webpackChunkName: "notFound" */ '@/components/pages/NotFoundPage.vue'
			)
	}
];

export default Object.freeze(routes);
