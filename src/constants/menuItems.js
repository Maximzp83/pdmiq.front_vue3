import { /*USER_TYPES, USER_ROLES_TYPES, SCOPES*/ } from '@/constants/global';
import { Lang } from '@/localization';

// import store from '@/store';
// import { Lang } from '@/localization';

export const MENU_TYPES = {
	DASHBOARD: 1,
	CUSTOMER_SUCCESS: 2,
	CONTROLLERS: 3,
	OEE: 4,
	COMPANIES: 5,
	PLANTS: 6,
	USERS: 7,
	USERS_TEAMS: 8,
	DISTRIBUTORS: 9,
	VENDORS: 10,
	SETTINGS: 11,
	MAINTENANCE: 12,
	REQUISITIONS: 13,
	REQUISITIONS_ROI_CALCULATOR: 14,
	WORK_ORDER_REQUESTS: 15,
	TASK_PROCEDURES: 16,
	WORK_ORDER_TYPE: 17,
	MISC_PARTS: 18,
	WORK_STATIONS: 19,
	IMPORT_WORK_ORDERS: 20,
	IMPORT_PLANT: 21,
	IMPORT_PLANT_LOGS: 22,
	IMPORT_MASTER: 23,
	LIBRARY: 24,
	BRANDS: 25,
	PART_NUMBERS: 26,
	EQUIPMENT_TYPES: 27,
	EQUIPMENT_TYPES_CATEGORIES: 28,
	APPLICATIONS: 29,
	STOREROOMS: 30,
	USER_ROLES: 31,
	CLIENT_API: 32,
	SENSORS: 33,
};

const menuItems1 = [
	{
		name: 'sidebar_menu.predictive_maintenance',
		category_label: 'predictive_maintenance',
	},
	{
		name: 'sidebar_menu.Dashboard',
		belongs_to_label: 'predictive_maintenance',
		id: MENU_TYPES.DASHBOARD,
		icon: 'icon-dashboard',
		path: '/dashboard',
		meta: { permissions: ['view_dashboard'] },
		enableInCompanyMenuForm: true,
		// roles: ['manager', 'operator']
	},
	/*{
		name: 'Machines',
		belongs_to_label: 'predictive_maintenance',
		id: 8888,
		icon: 'icon-dashboard',
		path: '/dashboard/machines',
		meta: { permissions: ['view_dashboard'] },
		enableInCompanyMenuForm: true,
		// roles: ['manager', 'operator']
	},*/
	// {
	// 	name: 'sidebar_menu.CUSTOMER_SUCCESS',
	// 	belongs_to_label: 'predictive_maintenance',
	// 	id: MENU_TYPES.CUSTOMER_SUCCESS,
	// 	icon: 'icon-dashboard2',
	// 	path: '/success-dashboard',
	// 	meta: { permissions: ['view_customer_success'] },
	// 	enableInCompanyMenuForm: true
	// },
	{
		name: 'Controllers',
		belongs_to_label: 'predictive_maintenance',
		id: MENU_TYPES.CONTROLLERS,
		icon: 'icon-controllers',
		path: '/controllers',
		meta: { permissions: ['view_controllers'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'sidebar_menu.sensors',
		belongs_to_label: 'predictive_maintenance',
		id: MENU_TYPES.SENSORS,
		icon: 'icon-sensors',
		path: '/sensors',
		meta: { permissions: ['view_sensors'] },
		enableInCompanyMenuForm: true
	},

	// {
	// 	name: 'sidebar_menu.OEE',
	// 	belongs_to_label: 'predictive_maintenance',
	// 	id: MENU_TYPES.OEE,
	// 	icon: 'icon-processes',
	// 	path: '/processes',
	// 	meta: { permissions: ['view_oee'] },
	// 	enableInCompanyMenuForm: true
	// },

	{
		name: 'sidebar_menu.System',
		category_label: 'system'
	},
	{
		name: 'Companies',
		belongs_to_label: 'system',
		id: MENU_TYPES.COMPANIES,
		icon: 'icon-companies',
		path: '/companies',
		meta: { permissions: ['view_companies'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'Plants',
		belongs_to_label: 'system',
		id: MENU_TYPES.PLANTS,
		icon: 'icon-plant',
		path: '/plants',
		meta: { permissions: ['view_plants'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'Users',
		belongs_to_label: 'system',
		icon: 'icon-users',
		children: [
			{
				id: MENU_TYPES.USERS,
				name: 'Users',
				path: '/users',
				meta: { permissions: ['view_users'] },
				enableInCompanyMenuForm: true
			},
			{
				id: MENU_TYPES.USERS_TEAMS,
				name: 'Teams',
				path: '/teams',
				meta: { permissions: ['view_users_teams'] }
			}
		]
	},
	{
		name: 'sidebar_menu.user_roles',
		belongs_to_label: 'system',
		id: MENU_TYPES.USER_ROLES,
		icon: 'icon-distributors',
		path: '/user-roles',
		meta: { permissions: ['view_user_roles'] }
	},
	{
		name: 'Distributors',
		belongs_to_label: 'system',
		id: MENU_TYPES.DISTRIBUTORS,
		icon: 'icon-distributors',
		path: '/distributors',
		meta: { permissions: ['view_distributors'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'Vendors',
		belongs_to_label: 'system',
		id: MENU_TYPES.VENDORS,
		icon: 'icon-vendors',
		path: '/plants-vendors',
		meta: { permissions: ['view_vendors'] },
		enableInCompanyMenuForm: true
	},
	// {
	// 	name: 'sidebar_menu.Settings',
	// 	belongs_to_label: 'system',
	// 	id: MENU_TYPES.SETTINGS,
	// 	icon: 'icon-settings',
	// 	path: '/settings',
	// 	meta: { permissions: ['view_settings'] },
	// 	enableInCompanyMenuForm: true
	// },

	{
		name: 'sidebar_menu.CMMS',
		category_label: 'cmms'
	},
	{
		name: 'sidebar_menu.work_orders_maintenance_logs',
		belongs_to_label: 'cmms',
		id: MENU_TYPES.MAINTENANCE,
		icon: 'icon-maintenance',
		path: '/maintenance/dashboard',
		meta: { permissions: ['view_maintenance'] },
		enableInCompanyMenuForm: true,
		children: [
			{
				name: 'maintenance_log',
				path: '/maintenance/logs'
			},
			{
				name: 'work_order',
				path: '/maintenance/work-orders'
			}
		]
	},
	{
		name: 'Requisitions',
		belongs_to_label: 'cmms',
		icon: 'icon-requisitions',
		meta: {
			permissions: ['view_requisitions'],
			conditionSettings: {
				checkMethod: 'some',
				conditions: [
					{
						array_method: 'some',
						prop: 'role.type',
						control_value: [
							USER_ROLES_TYPES.INDUSTRIAL_MATRIX,
							USER_ROLES_TYPES.DEVELOPER
						]
					},
					{
						array_method: 'some',
						prop: 'role.type',
						control_value: [USER_ROLES_TYPES.CUSTOMER],
						next_conditions: [
							{
								prop: 'role.is_fab_shop_manager',
								control_value: true
							}
						]
					}
				]
			}
		},
		children: [
			{
				id: MENU_TYPES.REQUISITIONS,
				name: 'sidebar_menu.Dashboard',
				path: '/requisitions',
				meta: { permissions: ['view_requisitions'] },
				enableInCompanyMenuForm: true
			},
			{
				id: MENU_TYPES.REQUISITIONS_ROI_CALCULATOR,
				name: 'sidebar_menu.cost_savings_calculator',
				path: '/roi-calculator',
				meta: { permissions: ['view_requisitions_roi_calculator'] },
				enableInCompanyMenuForm: true
			}
		]
	},
	// {
	// 	name: 'Requisition',
	// 	belongs_to_label: 'cmms',
	// 	id: MENU_TYPES.REQUISITIONS,
	// 	icon: 'icon-requisitions',
	// 	path: '/requisitions',
	// 	meta: {
	// 		permissions: ['view_requisitions'],
	// 		conditionSettings: {
	// 			checkMethod: 'some',
	// 			conditions: [
	// 				{
	// 					array_method: 'some',
	// 					checkMethod_next: 'some',
	// 					prop: 'role.type',
	// 					control_value: [USER_ROLES_TYPES.CUSTOMER],
	// 					next_conditions: [
	// 						{
	// 							prop: 'role.is_technic',
	// 							control_value: true
	// 						},
	// 						{
	// 							prop: 'role.is_requisitioner',
	// 							control_value: true
	// 						}
	// 						// { prop: 'work_order_role', control_value: WORK_ORDER_ROLES.REQUISITIONER }
	// 					]
	// 				}
	// 			]
	// 		}
	// 	}
	// },
	// {
	// 	name: 'Requisitions',
	// 	belongs_to_label: 'cmms',
	// 	icon: 'icon-requisitions',
	// 	meta: {
	// 		permissions: ['view_requisitions'],
	// 		conditionSettings: {
	// 			checkMethod: 'some',
	// 			conditions: [
	// 				{
	// 					array_method: 'some',
	// 					prop: 'role.type',
	// 					control_value: [
	// 						USER_ROLES_TYPES.INDUSTRIAL_MATRIX,
	// 						USER_ROLES_TYPES.DEVELOPER
	// 					]
	// 				},
	// 				{
	// 					array_method: 'some',
	// 					prop: 'role.type',
	// 					control_value: [USER_ROLES_TYPES.CUSTOMER],
	// 					next_conditions: [
	// 						{
	// 							prop: 'role.is_fab_shop_manager',
	// 							control_value: true
	// 						}
	// 					]
	// 				}
	// 			]
	// 		}
	// 	},
	// 	children: [
	// 		{
	// 			id: MENU_TYPES.REQUISITIONS,
	// 			name: 'sidebar_menu.Dashboard',
	// 			path: '/requisitions',
	// 			meta: { permissions: ['view_requisitions'] },
	// 			enableInCompanyMenuForm: true
	// 		},
	// 		{
	// 			id: MENU_TYPES.REQUISITIONS_ROI_CALCULATOR,
	// 			name: 'sidebar_menu.cost_savings_calculator',
	// 			path: '/roi-calculator',
	// 			meta: { permissions: ['view_requisitions_roi_calculator'] },
	// 			enableInCompanyMenuForm: true
	// 		}
	// 	]
	// },
	{
		name: 'sidebar_menu.work_order_requests',
		belongs_to_label: 'cmms',
		id: MENU_TYPES.WORK_ORDER_REQUESTS,
		icon: 'icon-edit3',
		path: '/maintenance-requests',
		requestCounter: true,
		meta: { permissions: ['view_work_order_requests'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'Requests',
		belongs_to_label: 'cmms',
		icon: 'icon-fix',
		path: '/rfqs',
		meta: { permissions: ['view_rfqs'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'task_Procedures',
		belongs_to_label: 'cmms',
		id: MENU_TYPES.TASK_PROCEDURES,
		icon: 'icon-task_procedures',
		path: '/task-procedures',
		meta: { permissions: ['view_task_procedures'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'work_order_type',
		belongs_to_label: 'cmms',
		id: MENU_TYPES.WORK_ORDER_TYPE,
		icon: 'icon-grid2',
		path: '/maintenance-categories',
		meta: { permissions: ['view_work_order_type'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'sidebar_menu.Misc_Parts',
		belongs_to_label: 'cmms',
		id: MENU_TYPES.MISC_PARTS,
		icon: 'icon-machines2',
		path: '/parts',
		meta: { permissions: ['view_misc_parts'] },
		enableInCompanyMenuForm: true
	},
	// {
	// 	name: 'Work_Stations',
	// 	belongs_to_label: 'cmms',
	// 	id: MENU_TYPES.WORK_STATIONS,
	// 	icon: 'icon-work_stations',
	// 	path: '/work-stations',
	// 	meta: { permissions: ['view_work_stations'] },
	// 	enableInCompanyMenuForm: true
	// },
	/*{
		// name: 'Work Order Import',
		name: 'sidebar_menu.work_order_import',
		belongs_to_label: 'cmms',
		id: MENU_TYPES.IMPORT_WORK_ORDERS,
		icon: 'icon-import-export',
		path: '/maintenance-import',
		meta: {
			userTypes: [USER_TYPES.SUPER_ADMIN, USER_TYPES.PLANT_ADMIN]
		}
	},*/
	// {
	// 	name: 'sidebar_menu.Import',
	// 	belongs_to_label: 'cmms',
	// 	// id: MENU_TYPES.IMPORT_MASTER,
	// 	icon: 'icon-import-export',

	// 	children: [
	// 		{
	// 			id: MENU_TYPES.IMPORT_WORK_ORDERS,
	// 			name: 'sidebar_menu.work_order_import',
	// 			path: '/maintenance-import',
	// 			meta: { permissions: ['view_import_work_orders'] },
	// 			enableInCompanyMenuForm: true
	// 		},
	// 		{
	// 			id: MENU_TYPES.IMPORT_PLANT,
	// 			name: 'sidebar_menu.plant_import',
	// 			path: '/plant-import',
	// 			meta: { permissions: ['view_import_plant'] },
	// 			enableInCompanyMenuForm: true
	// 		},
	// 		{
	// 			id: MENU_TYPES.IMPORT_PLANT_LOGS,
	// 			name: 'sidebar_menu.plant_import_logs',
	// 			path: '/plant-import-logs',
	// 			meta: { permissions: ['view_import_plant_logs'] },
	// 			enableInCompanyMenuForm: true
	// 		},
	// 		{
	// 			id: MENU_TYPES.IMPORT_MASTER,
	// 			name: 'sidebar_menu.master_import',
	// 			path: '/master-import',
	// 			meta: { permissions: ['view_import_master'] },
	// 			enableInCompanyMenuForm: true
	// 		}
	// 	]
	// },

	{
		name: 'sidebar_menu.asset_management',
		category_label: 'asset_management'
	},
	// {
	// 	name: 'sidebar_menu.Library',
	// 	belongs_to_label: 'asset_management',
	// 	id: MENU_TYPES.LIBRARY,
	// 	icon: 'icon-brands',
	// 	path: '/library',
	// 	meta: { permissions: ['view_library'] },
	// 	enableInCompanyMenuForm: true
	// },
	{
		name: 'Brands',
		belongs_to_label: 'asset_management',
		id: MENU_TYPES.BRANDS,
		icon: 'icon-brands',
		path: '/brands',
		meta: { permissions: ['view_brands'] },
		enableInCompanyMenuForm: true
	},
	{
		name: 'part_numbers',
		belongs_to_label: 'asset_management',
		id: MENU_TYPES.PART_NUMBERS,
		icon: 'icon-part-numbers2',
		path: '/brand-models',
		meta: { permissions: ['view_part_numbers'] }
	},
	{
		name: 'item_types',
		belongs_to_label: 'asset_management',
		icon: 'icon-item-types2',

		children: [
			{
				id: MENU_TYPES.EQUIPMENT_TYPES,
				name: 'item_types',
				path: '/equipment-types',
				meta: { permissions: ['view_equipment_types'] }
			},
			{
				id: MENU_TYPES.EQUIPMENT_TYPES_CATEGORIES,
				name: 'sidebar_menu.Categories',
				path: '/equipment-types-categories',
				meta: { permissions: ['view_equipment_types_categories'] }
			}
		]
	},
	{
		name: 'Applications',
		belongs_to_label: 'asset_management',
		id: MENU_TYPES.APPLICATIONS,
		icon: 'icon-applications2',
		path: '/applications',
		meta: { permissions: ['view_applications'] }
	},
	{
		name: 'storerooms',
		belongs_to_label: 'asset_management',
		id: MENU_TYPES.STOREROOMS,
		icon: 'icon-store-room',
		path: '/store-rooms',
		meta: { permissions: ['view_storerooms'] }
	}
];

const menuSectionsList1 = [
	{ id: MENU_TYPES.DASHBOARD, name: 'sidebar_menu.Dashboard' },
	{ id: MENU_TYPES.CUSTOMER_SUCCESS, name: 'sidebar_menu.customer_success' },
	{ id: MENU_TYPES.CONTROLLERS, name: 'controllers' },
	{ id: MENU_TYPES.OEE, name: 'sidebar_menu.oee' },
	{ id: MENU_TYPES.COMPANIES, name: 'companies' },
	{ id: MENU_TYPES.PLANTS, name: 'plants' },
	{ id: MENU_TYPES.USERS, name: 'users' },
	{ id: MENU_TYPES.USERS_TEAMS, name: 'sidebar_menu.users_teams' },
	{ id: MENU_TYPES.USER_ROLES, name: 'sidebar_menu.user_roles' },
	{ id: MENU_TYPES.DISTRIBUTORS, name: 'distributors' },
	{ id: MENU_TYPES.VENDORS, name: 'vendors' },
	{ id: MENU_TYPES.SETTINGS, name: 'sidebar_menu.settings' },
	{
		id: MENU_TYPES.MAINTENANCE,
		name: 'maintenance_logs',
		name_in_form: 'sidebar_menu.work_orders_maintenance_logs',
	},
	{ id: MENU_TYPES.REQUISITIONS, name: 'requisitions' },
	{
		id: MENU_TYPES.REQUISITIONS_ROI_CALCULATOR,
		name: 'sidebar_menu.roi_calculator',
	},
	{ id: MENU_TYPES.WORK_ORDER_REQUESTS, name: 'sidebar_menu.work_order_requests' },
	{ id: MENU_TYPES.TASK_PROCEDURES, name: 'task_Procedures' },
	{ id: MENU_TYPES.WORK_ORDER_TYPE, name: 'work_order_type' },
	{ id: MENU_TYPES.MISC_PARTS, name: 'sidebar_menu.Misc_Parts' },
	{ id: MENU_TYPES.WORK_STATIONS, name: 'Work_Stations' },
	{ id: MENU_TYPES.IMPORT_WORK_ORDERS, name: 'sidebar_menu.work_order_import' },
	{ id: MENU_TYPES.IMPORT_PLANT, name: 'sidebar_menu.plant_import' },
	{ id: MENU_TYPES.IMPORT_PLANT_LOGS, name: 'sidebar_menu.plant_import_logs' },
	{ id: MENU_TYPES.IMPORT_MASTER, name: 'sidebar_menu.import_master' },
	{ id: MENU_TYPES.LIBRARY, name: 'sidebar_menu.library' },
	{ id: MENU_TYPES.BRANDS, name: 'brands' },
	{ id: MENU_TYPES.PART_NUMBERS, name: 'part_numbers' },
	{ id: MENU_TYPES.EQUIPMENT_TYPES, name: 'item_types' },
	{
		id: MENU_TYPES.EQUIPMENT_TYPES_CATEGORIES,
		name: 'sidebar_menu.item_types_categories',
	},
	{ id: MENU_TYPES.APPLICATIONS, name: 'Applications' },
	{ id: MENU_TYPES.STOREROOMS, name: 'storerooms' },
	{ id: MENU_TYPES.CLIENT_API, name: 'API', skipTranslate: true },
];

export const menuItems = () => menuItems1;
export const menuSectionsList = () => Lang.translate(menuSectionsList1);
// export { menuItems, MENU_TYPES };
