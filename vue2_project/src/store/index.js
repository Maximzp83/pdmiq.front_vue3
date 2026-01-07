import Vue from 'vue';
import Vuex from 'vuex';

import global from './modules/global';
import auth from './modules/auth';
import dashboard from './modules/dashboard';
import users from './modules/users';
import companies from './modules/companies';
import controllers from './modules/controllers';
import plants from './modules/plants';
import sensors from './modules/sensors';
import testing from './modules/testing';
import equipments from './modules/equipments';
import lubricators from './modules/lubricators';
import ultrasound_pumps from './modules/ultrasound_pumps';
import ultrasound_radios from './modules/ultrasound_radios';
import solenoids from './modules/solenoids';
import distributors from './modules/distributors';

import applications from './modules/applications';
import brands from './modules/brands';
import brand_models from './modules/brand_models';
import production_lines from './modules/production_lines';
import equipment_types from './modules/equipment_types';
import machines from './modules/machines';
import assets from './modules/assets';
import store_rooms from './modules/store_rooms';
import plants_vendors from './modules/plants_vendors';
import rfqs from './modules/rfqs';
import processes from './modules/processes';
import equipment_types_categories from './modules/equipment_types_categories';

import teams from './modules/teams';
import maintenance from './modules/maintenance';
import maintenance_categories from './modules/maintenance_categories';
import work_orders from './modules/work_orders';
import bearings from './modules/bearings';
import industrial_services from './modules/industrial_services';
import lube_types from './modules/lube_types';
import plant_requisitions from './modules/plant_requisitions';
import plant_work_stations from './modules/plant_work_stations';

import parts from './modules/parts';
import task_procedures from './modules/task_procedures';

import meeting_trackers from './modules/meeting_trackers';
import roi_one_pagers from './modules/roi_one_pagers';
import library from './modules/library';
import user_roles from './modules/user_roles';
import banner_v2_subtypes from './modules/banner_v2_subtypes';

import { getObjectVal } from '@/helpers';

Vue.use(Vuex);

export const store = new Vuex.Store({
	modules: {
		global,
		auth,
		users,
		companies,
		controllers,
		plants,
		sensors,
		testing,
		equipments,
		dashboard,
		lubricators,
		ultrasound_pumps,
		ultrasound_radios,
		solenoids,
		distributors,
		applications,
		brands,
		production_lines,
		equipment_types,
		brand_models,
		machines,
		assets,
		store_rooms,
		plants_vendors,
		rfqs,
		processes,
		equipment_types_categories,
		teams,
		maintenance,
		work_orders,
		bearings,
		industrial_services,
		lube_types,
		plant_requisitions,
		plant_work_stations,
		parts,
		task_procedures,
		meeting_trackers,
		roi_one_pagers,
		maintenance_categories,
		library,
		user_roles,
		banner_v2_subtypes
	}
});

// export const setHttpToken = token => setHttpToken1(token);
// console.log(store)

export const storeGetter = (accessor, settings) =>
	getObjectVal(store.state, accessor, settings);
export const dispatchGetter = (action, payload) => store.dispatch(action, payload);
