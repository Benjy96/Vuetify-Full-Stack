import Vue from 'vue'
import VueRouter from 'vue-router'
import App from "../App.vue";
import Home from '../components/pages/TheHome.vue'
import Calendar from '../components/Calendar.vue'
import Login from '../components/pages/TheLogin.vue'
import Register from '../components/pages/TheRegister.vue'
import Dashboard from '../components/pages/TheDashboard.vue'
import Profile from '../components/pages/TheProfile.vue'

import firebase from 'firebase'

Vue.use(VueRouter)

//TODO: Look up routing / lazy-loading for making the URL pretty? Route level code-splitting or something
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/cancel',
    component: App,
    props: { cancelDialog: true }
  },
  {
    path: '/businesses/:id',
    name: 'business',
    component: Calendar,
    props: true
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: {
      requiresAuth: true
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

// Nav Guards

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    // Check if not logged in
    if(!firebase.auth().currentUser){
      next({
        path: '/login',
        query: {
          redirect: to.fullPath
        }
      });
    } else {
      next();
    }
  } else if(to.matched.some(record => record.meta.requiresGuest)) {
    // Check if logged in
    if(firebase.auth().currentUser){
      next({
        path: '/',
        query: {
          redirect: to.fullPath
        }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router