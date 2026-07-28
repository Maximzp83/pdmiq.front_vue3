import { MENU_TYPES } from '@/constants/menuItems';
import { USER_ROLES_TYPES } from '@/constants/global';

const rolesHasAccessToMap = {
	view_dashboard: { app_section: MENU_TYPES.DASHBOARD, permissions: ['is_viewing'] },
	view_customer_success: {
		app_section: MENU_TYPES.CUSTOMER_SUCCESS,
		permissions: ['is_viewing']
	},
	view_controllers: {
		app_section: MENU_TYPES.CONTROLLERS,
		permissions: ['is_viewing']
	},
	view_oee: { app_section: MENU_TYPES.OEE, permissions: ['is_viewing'] },
	view_companies: { app_section: MENU_TYPES.COMPANIES, permissions: ['is_viewing'] },
	view_plants: { app_section: MENU_TYPES.PLANTS, permissions: ['is_viewing'] },
	view_users: { app_section: MENU_TYPES.USERS, permissions: ['is_viewing'] },
	view_users_teams: {
		app_section: MENU_TYPES.USERS_TEAMS,
		permissions: ['is_viewing']
	},
	view_distributors: {
		app_section: MENU_TYPES.DISTRIBUTORS,
		permissions: ['is_viewing']
	},
	view_vendors: { app_section: MENU_TYPES.VENDORS, permissions: ['is_viewing'] },
	view_settings: { app_section: MENU_TYPES.SETTINGS, permissions: ['is_viewing'] },
	view_maintenance: {
		app_section: MENU_TYPES.MAINTENANCE,
		permissions: ['is_viewing']
	},
	view_requisitions: {
		app_section: MENU_TYPES.REQUISITIONS,
		permissions: ['is_viewing']
	},
	view_requisitions_roi_calculator: {
		app_section: MENU_TYPES.REQUISITIONS_ROI_CALCULATOR,
		permissions: ['is_viewing']
	},
	view_work_order_requests: {
		app_section: MENU_TYPES.WORK_ORDER_REQUESTS,
		permissions: ['is_viewing']
	},
	view_task_procedures: {
		app_section: MENU_TYPES.TASK_PROCEDURES,
		permissions: ['is_viewing']
	},
	view_work_order_type: {
		app_section: MENU_TYPES.WORK_ORDER_TYPE,
		permissions: ['is_viewing']
	},
	view_misc_parts: {
		app_section: MENU_TYPES.MISC_PARTS,
		permissions: ['is_viewing']
	},
	view_work_stations: {
		app_section: MENU_TYPES.WORK_STATIONS,
		permissions: ['is_viewing']
	},
	view_import_work_orders: {
		app_section: MENU_TYPES.IMPORT_WORK_ORDERS,
		permissions: ['is_viewing']
	},
	view_import_plant: {
		app_section: MENU_TYPES.IMPORT_PLANT,
		permissions: ['is_viewing']
	},
	view_import_plant_logs: {
		app_section: MENU_TYPES.IMPORT_PLANT_LOGS,
		permissions: ['is_viewing']
	},
	view_import_master: {
		app_section: MENU_TYPES.IMPORT_MASTER,
		permissions: ['is_viewing']
	},
	view_library: { app_section: MENU_TYPES.LIBRARY, permissions: ['is_viewing'] },
	view_brands: { app_section: MENU_TYPES.BRANDS, permissions: ['is_viewing'] },
	view_part_numbers: {
		app_section: MENU_TYPES.PART_NUMBERS,
		permissions: ['is_viewing']
	},
	view_equipment_types: {
		app_section: MENU_TYPES.EQUIPMENT_TYPES,
		permissions: ['is_viewing']
	},
	view_equipment_types_categories: {
		app_section: MENU_TYPES.EQUIPMENT_TYPES_CATEGORIES,
		permissions: ['is_viewing']
	},
	view_applications: {
		app_section: MENU_TYPES.APPLICATIONS,
		permissions: ['is_viewing']
	},
	view_storerooms: {
		app_section: MENU_TYPES.STOREROOMS,
		permissions: ['is_viewing']
	},
	view_user_roles: {
		app_section: MENU_TYPES.USER_ROLES,
		permissions: ['is_viewing']
	},
	view_client_api: {
		app_section: MENU_TYPES.CLIENT_API,
		permissions: ['is_viewing']
	},
	view_corporate: {
		app_section: MENU_TYPES.CORPORATE_ANALYTICS,
		permissions: ['is_viewing']
	},
	// 'view_user_roles': { user_role_types: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX] },

	// --------------- Operate ------------
	'create_dashboard': { app_section: MENU_TYPES.DASHBOARD, permissions: ['is_creating'] },
	'edit_dashboard': { app_section: MENU_TYPES.DASHBOARD, permissions: ['is_updating'] },
	'delete_dashboard': { app_section: MENU_TYPES.DASHBOARD, permissions: ['is_deleting'] },

	'create_customer_success': { app_section: MENU_TYPES.CUSTOMER_SUCCESS, permissions: ['is_creating'] },
	'edit_customer_success': { app_section: MENU_TYPES.CUSTOMER_SUCCESS, permissions: ['is_updating'] },
	'delete_customer_success': { app_section: MENU_TYPES.CUSTOMER_SUCCESS, permissions: ['is_deleting'] },

	'create_controllers': { app_section: MENU_TYPES.CONTROLLERS, permissions: ['is_creating'] },
	'edit_controllers': { app_section: MENU_TYPES.CONTROLLERS, permissions: ['is_updating'] },
	'delete_controllers': { app_section: MENU_TYPES.CONTROLLERS, permissions: ['is_deleting'] },

	'create_oee': { app_section: MENU_TYPES.OEE, permissions: ['is_creating'] },
	'edit_oee': { app_section: MENU_TYPES.OEE, permissions: ['is_updating'] },
	'delete_oee': { app_section: MENU_TYPES.OEE, permissions: ['is_deleting'] },

	create_companies: {
		app_section: MENU_TYPES.COMPANIES,
		permissions: ['is_creating']
	},
	edit_companies: {
		app_section: MENU_TYPES.COMPANIES,
		permissions: ['is_updating']
	},
	delete_companies: {
		app_section: MENU_TYPES.COMPANIES,
		permissions: ['is_deleting']
	},
	archive_companies: { app_section: MENU_TYPES.COMPANIES, permissions: ['is_archiving'] },

	create_plants: { app_section: MENU_TYPES.PLANTS, permissions: ['is_creating'] },
	edit_plants: { app_section: MENU_TYPES.PLANTS, permissions: ['is_updating'] },
	delete_plants: { app_section: MENU_TYPES.PLANTS, permissions: ['is_deleting'] },
	archive_plants: { app_section: MENU_TYPES.PLANTS, permissions: ['is_archiving'] },

	'create_users': { app_section: MENU_TYPES.USERS, permissions: ['is_creating'] },
	'edit_users': { app_section: MENU_TYPES.USERS, permissions: ['is_updating'] },
	'delete_users': { app_section: MENU_TYPES.USERS, permissions: ['is_deleting'] },

	'create_users_teams': { app_section: MENU_TYPES.USERS_TEAMS, permissions: ['is_creating'] },
	'edit_users_teams': { app_section: MENU_TYPES.USERS_TEAMS, permissions: ['is_updating'] },
	'delete_users_teams': { app_section: MENU_TYPES.USERS_TEAMS, permissions: ['is_deleting'] },

	'create_distributors': { app_section: MENU_TYPES.DISTRIBUTORS, permissions: ['is_creating'] },
	'edit_distributors': { app_section: MENU_TYPES.DISTRIBUTORS, permissions: ['is_updating'] },
	'delete_distributors': { app_section: MENU_TYPES.DISTRIBUTORS, permissions: ['is_deleting'] },

	'create_vendors': { app_section: MENU_TYPES.VENDORS, permissions: ['is_creating'] },
	'edit_vendors': { app_section: MENU_TYPES.VENDORS, permissions: ['is_updating'] },
	'delete_vendors': { app_section: MENU_TYPES.VENDORS, permissions: ['is_deleting'] },

	'create_settings': { app_section: MENU_TYPES.SETTINGS, permissions: ['is_creating'] },
	'edit_settings': { app_section: MENU_TYPES.SETTINGS, permissions: ['is_updating'] },
	'delete_settings': { app_section: MENU_TYPES.SETTINGS, permissions: ['is_deleting'] },

	'create_maintenance': { app_section: MENU_TYPES.MAINTENANCE, permissions: ['is_creating'] },
	'edit_maintenance': { app_section: MENU_TYPES.MAINTENANCE, permissions: ['is_updating'] },
	'delete_maintenance': { app_section: MENU_TYPES.MAINTENANCE, permissions: ['is_deleting'] },

	'create_requisitions': { app_section: MENU_TYPES.REQUISITIONS, permissions: ['is_creating'] },
	'edit_requisitions': { app_section: MENU_TYPES.REQUISITIONS, permissions: ['is_updating'] },
	'delete_requisitions': { app_section: MENU_TYPES.REQUISITIONS, permissions: ['is_deleting'] },

	'create_requisitions_roi_calculator': { app_section: MENU_TYPES.REQUISITIONS_ROI_CALCULATOR, permissions: ['is_creating'] },
	'edit_requisitions_roi_calculator': { app_section: MENU_TYPES.REQUISITIONS_ROI_CALCULATOR, permissions: ['is_updating'] },
	'delete_requisitions_roi_calculator': { app_section: MENU_TYPES.REQUISITIONS_ROI_CALCULATOR, permissions: ['is_deleting'] },

	'create_work_order_requests': { app_section: MENU_TYPES.WORK_ORDER_REQUESTS, permissions: ['is_creating'] },
	'edit_work_order_requests': { app_section: MENU_TYPES.WORK_ORDER_REQUESTS, permissions: ['is_updating'] },
	'delete_work_order_requests': { app_section: MENU_TYPES.WORK_ORDER_REQUESTS, permissions: ['is_deleting'] },

	'create_task_procedures': { app_section: MENU_TYPES.TASK_PROCEDURES, permissions: ['is_creating'] },
	'edit_task_procedures': { app_section: MENU_TYPES.TASK_PROCEDURES, permissions: ['is_updating'] },
	'delete_task_procedures': { app_section: MENU_TYPES.TASK_PROCEDURES, permissions: ['is_deleting'] },

	'create_work_order_type': { app_section: MENU_TYPES.WORK_ORDER_TYPE, permissions: ['is_creating'] },
	'edit_work_order_type': { app_section: MENU_TYPES.WORK_ORDER_TYPE, permissions: ['is_updating'] },
	'delete_work_order_type': { app_section: MENU_TYPES.WORK_ORDER_TYPE, permissions: ['is_deleting'] },

	'create_misc_parts': { app_section: MENU_TYPES.MISC_PARTS, permissions: ['is_creating'] },
	'edit_misc_parts': { app_section: MENU_TYPES.MISC_PARTS, permissions: ['is_updating'] },
	'delete_misc_parts': { app_section: MENU_TYPES.MISC_PARTS, permissions: ['is_deleting'] },

	'create_work_stations': { app_section: MENU_TYPES.WORK_STATIONS, permissions: ['is_creating'] },
	'edit_work_stations': { app_section: MENU_TYPES.WORK_STATIONS, permissions: ['is_updating'] },
	'delete_work_stations': { app_section: MENU_TYPES.WORK_STATIONS, permissions: ['is_deleting'] },

	'create_import_work_orders': { app_section: MENU_TYPES.IMPORT_WORK_ORDERS, permissions: ['is_creating'] },
	'edit_import_work_orders': { app_section: MENU_TYPES.IMPORT_WORK_ORDERS, permissions: ['is_updating'] },
	'delete_import_work_orders': { app_section: MENU_TYPES.IMPORT_WORK_ORDERS, permissions: ['is_deleting'] },

	create_import_plant: {
		app_section: MENU_TYPES.IMPORT_PLANT,
		permissions: ['is_creating']
	},
	edit_import_plant: {
		app_section: MENU_TYPES.IMPORT_PLANT,
		permissions: ['is_updating']
	},
	delete_import_plant: {
		app_section: MENU_TYPES.IMPORT_PLANT,
		permissions: ['is_deleting']
	},

	'create_import_plant_logs': { app_section: MENU_TYPES.IMPORT_PLANT_LOGS, permissions: ['is_creating'] },
	'edit_import_plant_logs': { app_section: MENU_TYPES.IMPORT_PLANT_LOGS, permissions: ['is_updating'] },
	'delete_import_plant_logs': { app_section: MENU_TYPES.IMPORT_PLANT_LOGS, permissions: ['is_deleting'] },

	'create_import_master': { app_section: MENU_TYPES.IMPORT_MASTER, permissions: ['is_creating'] },
	'edit_import_master': { app_section: MENU_TYPES.IMPORT_MASTER, permissions: ['is_updating'] },
	'delete_import_master': { app_section: MENU_TYPES.IMPORT_MASTER, permissions: ['is_deleting'] },

	'create_library': { app_section: MENU_TYPES.LIBRARY, permissions: ['is_creating'] },
	'edit_library': { app_section: MENU_TYPES.LIBRARY, permissions: ['is_updating'] },
	'delete_library': { app_section: MENU_TYPES.LIBRARY, permissions: ['is_deleting'] },

	'create_brands': { app_section: MENU_TYPES.BRANDS, permissions: ['is_creating'] },
	'edit_brands': { app_section: MENU_TYPES.BRANDS, permissions: ['is_updating'] },
	'delete_brands': { app_section: MENU_TYPES.BRANDS, permissions: ['is_deleting'] },

	'create_part_numbers': { app_section: MENU_TYPES.PART_NUMBERS, permissions: ['is_creating'] },
	'edit_part_numbers': { app_section: MENU_TYPES.PART_NUMBERS, permissions: ['is_updating'] },
	'delete_part_numbers': { app_section: MENU_TYPES.PART_NUMBERS, permissions: ['is_deleting'] },

	'create_equipment_types': { app_section: MENU_TYPES.EQUIPMENT_TYPES, permissions: ['is_creating'] },
	'edit_equipment_types': { app_section: MENU_TYPES.EQUIPMENT_TYPES, permissions: ['is_updating'] },
	'delete_equipment_types': { app_section: MENU_TYPES.EQUIPMENT_TYPES, permissions: ['is_deleting'] },

	'create_equipment_types_categories': { app_section: MENU_TYPES.EQUIPMENT_TYPES_CATEGORIES, permissions: ['is_creating'] },
	'edit_equipment_types_categories': { app_section: MENU_TYPES.EQUIPMENT_TYPES_CATEGORIES, permissions: ['is_updating'] },
	'delete_equipment_types_categories': { app_section: MENU_TYPES.EQUIPMENT_TYPES_CATEGORIES, permissions: ['is_deleting'] },

	'create_applications': { app_section: MENU_TYPES.APPLICATIONS, permissions: ['is_creating'] },
	'edit_applications': { app_section: MENU_TYPES.APPLICATIONS, permissions: ['is_updating'] },
	'delete_applications': { app_section: MENU_TYPES.APPLICATIONS, permissions: ['is_deleting'] },

	'create_storerooms': { app_section: MENU_TYPES.STOREROOMS, permissions: ['is_creating'] },
	'edit_storerooms': { app_section: MENU_TYPES.STOREROOMS, permissions: ['is_updating'] },
	'delete_storerooms': { app_section: MENU_TYPES.STOREROOMS, permissions: ['is_deleting'] },

	'create_user_roles': { app_section: MENU_TYPES.USER_ROLES, permissions: ['is_creating'] },
	'edit_user_roles': { app_section: MENU_TYPES.USER_ROLES, permissions: ['is_updating'] },
	'delete_user_roles': { app_section: MENU_TYPES.USER_ROLES, permissions: ['is_deleting'] },
	// 'create_user_roles': { user_role_types: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX] },
	// 'edit_user_roles': { user_role_types: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX] },
	// 'delete_user_roles': { user_role_types: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX] },

	// 'view_profile': { user_role_types: [USER_ROLES_TYPES.PLANT_USER] },
	view_rnd: { user_role_types: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX] },
	view_prodlines_admin: { user_role_types: [USER_ROLES_TYPES.DEVELOPER] }
};

const getPermission = (key, role) => {
	// if (role.id === 1) return true;

	const item = rolesHasAccessToMap[key];
	if (item) {
		// console.log(key, item, role)
		if (item.user_role_types) {
			return item.user_role_types.includes(role.type);
		}

		if (role.permissions) {
			const permissionItem = role.permissions.find(
				(permission) => permission.app_section === item.app_section,
			);
			if (permissionItem) {
				return item.permissions.every(pk => permissionItem[pk]);
			}
		}
	}
	return false; //todo
};

const hasAccessTo1 = ({ role, permissionKeys, method = 'every' }) => {
	if (role.type === USER_ROLES_TYPES.DEVELOPER) return true;
	return permissionKeys.map(key => getPermission(key, role))[method](ri => ri);
};

const setupPermissionsMap1 = role => {
	let result = {};
	// console.log(role.permissions)
	for (const key in rolesHasAccessToMap) {
		result[key] = getPermission(key, role);
	}

	return result;
};

/*export const roleHasAccessTo = ({role, key}) => {
	console.log('roleHasAccessTo')
	if (role.id === 1) return true;

	const item = rolesHasAccessToMap[key];
	if (item) {
		const permissionItem = findItemBy('app_section', item.app_section, role.permissions);
		if (permissionItem) {
			return item.permissions.every(pk => permissionItem[pk]); 
		}
	}
	return false;
}*/

export const setupPermissionsMap = role => setupPermissionsMap1(role);
export const hasAccessTo = payload => hasAccessTo1(payload);
