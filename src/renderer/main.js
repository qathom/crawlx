import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';

// plugins
import './plugins/icons';
import './plugins/log';
import './plugins/bootstrap-vue';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
