import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'

import './firebaseInit';

// import CalendService from './services/CalendarService';

/* var x = CalendService.createBooking('6c6qWcNvsOhBpF0CgUox4LsG2v62', "2020", "01", "17", "15:00", "16:00");

x.then((msg) => {
  alert(msg);
}) */

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
