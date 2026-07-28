// import './assets/main.css'

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { pinia } from '@/stores/pinia';
import 'element-plus/es/components/message-box/style/css';

// import ElementPlus from 'element-plus'

// import 'element-plus/theme-chalk/el-button.css'
// import 'element-plus/theme-chalk/el-input.css'
// import 'element-plus/theme-chalk/el-select-v2.css'
// import 'element-plus/dist/index.css';
	
import './assets/sass/app.scss';

const app = createApp(App);

app.use(pinia);
app.use(router);
// app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.mount('#app');
