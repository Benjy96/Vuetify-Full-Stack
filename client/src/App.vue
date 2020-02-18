<template>
  <v-app :key="locale">

    <!-- Hidden Nav Drawer -->
    <v-navigation-drawer v-model="drawerRight" app right>
      <template v-slot:prepend v-if="currentUser">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{currentUser.email}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
      </template>

      <v-divider v-if="currentUser"></v-divider>

      <v-list>
        <v-list-item link v-if="currentUser" to="/dashboard">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('administration')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="currentUser" :to="'/businesses/' + currentUser.uid">
          <v-list-item-action>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('myCalendar')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="!currentUser" to="/register">
          <v-list-item-action>
            <v-icon>mdi-account-edit</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('registerBusiness')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="!currentUser" to="/login">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('login')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-else v-on:click="logout">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('logout')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App bar -->
    <v-app-bar app color="primary">
        <v-btn to="/" class="router-button ml-1 mr-1">{{$getLanguageMsg('home')}}</v-btn>
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-btn class="ml-4" icon v-on="on">
              <v-icon color="white">mdi-earth</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="language in languages"
              :key="language.text"
              @click="setLocale(language.value)"
            >
              <v-list-item-title>{{ language.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
    
      <v-spacer class="navbar"></v-spacer>
      <v-btn v-if="!currentUser" @click="cancelDialog = !cancelDialog" icon class="mr-4">
        <v-icon color="white">mdi-cancel</v-icon>
      </v-btn>
      <!-- Open hidden drawer -->
      <v-app-bar-nav-icon color="white" @click.stop="drawerRight = !drawerRight" class="mr-1"/>
    </v-app-bar>

    <v-dialog v-model="cancelDialog" max-width="400">
        <v-card>
          <v-container>
            <v-form @submit.prevent="cancelBooking" ref="cancelForm">
              <v-text-field required :rules="cancelRules" 
              :label="$getLanguageMsg('bookingReference')"
              v-model="bookingReference"/>
              <v-btn type="submit" color="primary">
                {{$getLanguageMsg('cancelReservation')}}
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="cancelConfirmationDialog" max-width="400">
        <v-card>
          <v-container>
            <p>{{$getLanguageMsg('reservationCanceled')}}</p>
            <v-btn type="submit" color="primary" 
            @click="cancelConfirmationDialog = !cancelConfirmationDialog">
              {{$getLanguageMsg('ok')}}
            </v-btn>
          </v-container>
        </v-card>
      </v-dialog>

    <v-content>
      <v-container> <!-- https://vuetifyjs.com/en/components/grids -->
        <router-view/> <!-- Render the matched component for this path (paths in src/router/index.js) --> 
      </v-container>
    </v-content>
    
  </v-app>
</template>

<script>
import firebase from 'firebase'
import CustomerService from './services/CustomerService';
import BusinessService from './services/BusinessService';

export default {
  props: ["cancelDialog"],
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      //TODO: get rid of flickering
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
  // https://vuejs.org/v2/api/#updated
  updated() {
      document.title = this.$getLanguageMsg('title');
  },
  data() {
    return {
      locale: this.$getLocale(),
      drawerRight: false,
      currentUser: null,
      // cancelDialog: false,
      cancelConfirmationDialog: false,
      cancelRules: [
        value => !!value || this.$getLanguageMsg('required')
      ],
      bookingReference: '',
      languages: [
        { text: 'English', value: 'en' },
        { text: 'Español', value: 'es' }
      ]
    }
  },
  methods: {
    logout() {
      firebase.auth().signOut();
    },
    cancelBooking() {
      if(this.$refs.cancelForm.validate()) {
        this.cancelDialog = false;
        this.cancelConfirmationDialog = true;

        CustomerService.cancelBooking(this.bookingReference);
      }
    },
    setLocale(locale) {
      //Sets the global locale object to the new language
      this.$setLocale(locale);
      //Makes Vue re-render as this.locale is a key on the app
      this.locale = locale;

      if(this.currentUser) {
        BusinessService.setLocale(this.currentUser.uid, locale);
      }
    }
  },
}
</script>

<style lang="scss">
#app {
  text-align: center;
}
</style>
