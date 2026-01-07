import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { store } from './store';

import './assets/sass/app.scss';

require('./bootstrap');

Vue.config.productionTip = false;

/*Vue.use(spaReloader, {
  spaReloaderURL: "ws://" + location.hostname + "/ws",
});*/

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
