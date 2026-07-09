// import './assets/main.css'

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { pinia } from '@/stores/pinia';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import 'element-plus/es/components/message-box/style/css';

Highcharts.setOptions({
	lang: {
		locale: 'en-En',
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
import CustomSelectV2 from '@/components/form/CustomSelectV2.vue';

const app = createApp(App);

app.component('CustomInput', CustomInput);
app.component('CustomSelectV2', CustomSelectV2);

app.use(pinia);
app.use(router);
app.use(HighchartsVue);
// app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.mount('#app');
