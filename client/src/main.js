import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import languageSwitcher from './plugins/languageSwitcher';

import './firebaseInit';

Vue.config.productionTip = false

Vue.use(languageSwitcher);

new Vue({
  vuetify,
  router,
  render: h => h(App),
  created() {
    this.$setLocale('es');
  }
}).$mount('#app')