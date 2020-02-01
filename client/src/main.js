import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'

import './firebaseInit';

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App),
  created() {
    this.$vuetify.lang.current = 'es'
  }
}).$mount('#app')