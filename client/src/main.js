import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'

import './firebaseInit';

//TODO: Test against various scenarios in the DB - verified to work against admin booking thus far
// import MetaDataHelper from './services/MetaDataHelper';

// MetaDataHelper.isDateAvailable("6c6qWcNvsOhBpF0CgUox4LsG2v62", "2020-01-01").then(res => {
//   alert(res);
// });


Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
