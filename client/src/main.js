import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Initialise Firebase
import './firebaseInit';

// Plugins
import vuetify from './plugins/vuetify';
import languageSwitcher from './plugins/languageSwitcher';

// Globally register our generic components
import './globalComponents';

Vue.config.productionTip = false

Vue.use(languageSwitcher);

new Vue({
  vuetify,
  router,
  render: h => h(App),
  created() {
    this.$setLocale('en');
  },
}).$mount('#app')

