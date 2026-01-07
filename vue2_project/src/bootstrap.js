import Vue from 'vue';

// -------Element UI plugin---------
import Select from 'element-ui/lib/select';

// Vue.component('ElTable', () => import(/* webpackChunkName: "ElTable" */ 'element-ui/lib/table'));
// Vue.component('ElTableColumn', () => import(/* webpackChunkName: "ElTableColumn"*/ 'element-ui/lib/table-column'));
Vue.component('ElInput', () =>
	import(/* webpackChunkName: "ElInput"*/ 'element-ui/lib/input')
);
Vue.component('ElCheckbox', () =>
	import(/* webpackChunkName: "ElCheckbox"*/ 'element-ui/lib/checkbox')
);
Vue.component('ElRadioGroup', () =>
	import(/* webpackChunkName: "ElRadioGroup"*/ 'element-ui/lib/radio-group')
);
Vue.component('ElRadioButton', () =>
	import(/* webpackChunkName: "ElRadioButton"*/ 'element-ui/lib/radio-button')
);
// Vue.component('ElSelect', () => import(/* webpackChunkName: "ElSelect"*/ 'element-ui/lib/select'));
Vue.component('ElOption', () =>
	import(/* webpackChunkName: "ElOption"*/ 'element-ui/lib/option')
);
Vue.component('ElMenu', () =>
	import(/* webpackChunkName: "ElMenu"*/ 'element-ui/lib/menu')
);
Vue.component('ElSubmenu', () =>
	import(/* webpackChunkName: "ElSubmenu"*/ 'element-ui/lib/submenu')
);
Vue.component('ElMenuItemGroup', () =>
	import(/* webpackChunkName: "ElMenuItemGroup"*/ 'element-ui/lib/menu-item-group')
);
Vue.component('ElMenuItem', () =>
	import(/* webpackChunkName: "ElMenuItem"*/ 'element-ui/lib/menu-item')
);
Vue.component('ElButton', () =>
	import(/* webpackChunkName: "ElButton"*/ 'element-ui/lib/button')
);
Vue.component('ElPagination', () =>
	import(/* webpackChunkName: "ElPagination"*/ 'element-ui/lib/pagination')
);
Vue.component('ElForm', () =>
	import(/* webpackChunkName: "ElForm"*/ 'element-ui/lib/form')
);
Vue.component('ElFormItem', () =>
	import(/* webpackChunkName: "ElFormItem"*/ 'element-ui/lib/form-item')
);
Vue.component('ElDialog', () =>
	import(/* webpackChunkName: "ElDialog"*/ 'element-ui/lib/dialog')
);
Vue.component('ElInputNumber', () =>
	import(/* webpackChunkName: "ElInputNumber"*/ 'element-ui/lib/input-number')
);
Vue.component('ElSwitch', () =>
	import(/* webpackChunkName: "ElSwitch"*/ 'element-ui/lib/switch')
);
Vue.component('ElButtonGroup', () =>
	import(/* webpackChunkName: "ElButtonGroup"*/ 'element-ui/lib/button-group')
);
// Vue.component('ElDatePicker', () => import(/* webpackChunkName: "ElDatePicker"*/ 'element-ui/lib/date-picker'));
Vue.component('ElTimeSelect', () =>
	import(/* webpackChunkName: "ElTimeSelect"*/ 'element-ui/lib/time-select')
);
Vue.component('ElPopover', () =>
	import(/* webpackChunkName: "ElPopover"*/ 'element-ui/lib/popover')
);
Vue.component('ElTooltip', () =>
	import(/* webpackChunkName: "ElPopover"*/ 'element-ui/lib/tooltip')
);

// import 'element-ui/lib/theme-chalk/index.css';

// import 'element-ui/lib/theme-chalk/table.css';
// import 'element-ui/lib/theme-chalk/table-column.css';
import 'element-ui/lib/theme-chalk/input.css';
import 'element-ui/lib/theme-chalk/checkbox.css';
import 'element-ui/lib/theme-chalk/radio-group.css';
import 'element-ui/lib/theme-chalk/radio-button.css';
import 'element-ui/lib/theme-chalk/select.css';
import 'element-ui/lib/theme-chalk/option.css';
import 'element-ui/lib/theme-chalk/menu.css';
import 'element-ui/lib/theme-chalk/submenu.css';
import 'element-ui/lib/theme-chalk/menu-item-group.css';
import 'element-ui/lib/theme-chalk/menu-item.css';
import 'element-ui/lib/theme-chalk/button.css';
import 'element-ui/lib/theme-chalk/pagination.css';
import 'element-ui/lib/theme-chalk/form.css';
import 'element-ui/lib/theme-chalk/form-item.css';
import 'element-ui/lib/theme-chalk/dialog.css';
import 'element-ui/lib/theme-chalk/input-number.css';
import 'element-ui/lib/theme-chalk/switch.css';
import 'element-ui/lib/theme-chalk/button-group.css';
import 'element-ui/lib/theme-chalk/date-picker.css';
import 'element-ui/lib/theme-chalk/time-picker.css';
import 'element-ui/lib/theme-chalk/time-select.css';
import 'element-ui/lib/theme-chalk/popover.css';
import 'element-ui/lib/theme-chalk/tooltip.css';
import 'element-ui/lib/theme-chalk/icon.css';
import 'element-ui/lib/theme-chalk/upload.css';

// import langEn from 'element-ui/lib/locale/lang/en';
// import locale from 'element-ui/lib/locale';

// locale.use(langEn);

/*import { Lang } from '@/localization';
console.log(Lang)*/

Select.computed.readonly = function() {
	const isIE = !this.$isServer && !Number.isNaN(Number(document.documentMode));

	return !(this.filterable || this.multiple || !isIE) && !this.visible;
};
Vue.use(Select);

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
Vue.component('SimpleSpinner', SimpleSpinner);

import CoverOverlay from '@/components/common/CoverOverlay.vue';
Vue.component('CoverOverlay', CoverOverlay);

import SearchBar from '@/components/common/SearchBar.vue';
Vue.component('SearchBar', SearchBar);

import VueElementLoading from 'vue-element-loading';
Vue.component('VueElementLoading', VueElementLoading);

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
Vue.component('VueElementLoadingWrapper', VueElementLoadingWrapper);

import CustomModal from '@/components/common/CustomModal.vue';
Vue.component('CustomModal', CustomModal);

import CustomSelect from '@/components/form/CustomSelect.vue';
Vue.component('CustomSelect', CustomSelect);

import CustomInput from '@/components/form/CustomInput.vue';
Vue.component('CustomInput', CustomInput);

import CustomTransition from '@/components/common/CustomTransition.vue';
Vue.component('CustomTransition', CustomTransition);

import ButtonWithPopover from '@/components/common/ButtonWithPopover.vue';
Vue.component('ButtonWithPopover', ButtonWithPopover);

// Plugins
import globalMethods from './services/globalMethods';
Vue.use(globalMethods);

/*import Moment from "moment";
import MomentTimeZone from "moment-timezone";
window.moment = Moment;
MomentTimeZone();*/

// -----
// import { Lang } from '@/localization';
// Lang.set(2);

/*import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';

stockInit(Highcharts);
boost(Highcharts);
Vue.use(HighchartsVue);*/
