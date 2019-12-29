<template>
  <v-app>
    <v-app-bar app> <!-- was <div id="nav" ></v-app> -->
        <v-btn to="/" class="router-button">Home</v-btn>
          <!-- v-btn extends router-link -->
        <v-btn to="/about" class="router-button">About</v-btn>
      <v-spacer></v-spacer>
        <!-- <v-btn v-if="!currentUser" to="/register" class="mr-2">Register</v-btn> -->
        <v-btn v-if="currentUser" to="/bookings">Dashboard</v-btn>
        <v-btn v-if="!currentUser" to="/register">Register</v-btn>
        <v-btn v-if="!currentUser" to="/login">Login</v-btn>
        <v-btn v-else v-on:click="logout">Logout</v-btn>
    </v-app-bar>

    <v-content>
      <v-container> <!-- https://vuetifyjs.com/en/components/grids -->
        <router-view/> <!-- Render the matched component for this path (paths in src/router/index.js) --> 
      </v-container>
    </v-content>
    
  </v-app>
</template>

<script>
import firebase from 'firebase'

export default {
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user;
        this.$router.push('/');
      } else if (this.currentUser != null) {
        this.currentUser = null;
        this.$router.push('/login');
      } else {
        this.currentUser = null;
      }
    });
  },
  data() {
    return {
      currentUser: null
    }
  },
  methods: {
    logout() {
      firebase.auth().signOut();
    }
  },
}
</script>

<style lang="scss">
#app {
  text-align: center;
}
</style>
