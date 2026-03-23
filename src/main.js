// import './assets/main.css'

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';

Highcharts.setOptions({
	lang: {
		locale: 'ru-RU',
		decimalPoint: '.',
		thousandsSep: ' ',
	},
});

// import ElementPlus from 'element-plus'

// import 'element-plus/theme-chalk/el-button.css'
// import 'element-plus/theme-chalk/el-input.css'
// import 'element-plus/theme-chalk/el-select-v2.css'
// import 'element-plus/dist/index.css';
	
import './assets/sass/app.scss';


import CustomInput from '@/components/form/CustomInput.vue';
import CustomSelectV from '@/components/form/CustomSelectV2.vue';

const app = createApp(App);

app.component('CustomInput', CustomInput);
app.component('CustomSelectV', CustomSelectV);

app.use(createPinia());
app.use(router);
app.use(HighchartsVue);
// app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.mount('#app');
