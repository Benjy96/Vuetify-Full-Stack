<template>
  <v-app :key="locale">

    <!-- Hidden Nav Drawer -->
    <v-navigation-drawer v-model="drawerRight" app right dark>
      <template v-slot:prepend v-if="currentUser">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{currentUser.email}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
      </template>

      <v-divider v-if="currentUser"></v-divider>

      <v-list class="text-left">
        <v-list-item link v-if="currentUser" to="/">
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('home')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="currentUser" :to="'/businesses/' + currentUser.uid">
          <v-list-item-action>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('Calendar')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="currentUser" to="/dashboard">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('Booking Management')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="currentUser" to="/profile">
          <v-list-item-action>
            <v-icon>mdi-account</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('Profile Settings')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="!currentUser" to="/register">
          <v-list-item-action>
            <v-icon>mdi-account-edit</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('Register')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="!currentUser" to="/login">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('Login')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-else v-on:click="logout">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{$getLanguageMsg('Logout')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link v-if="environment == 'development'" to="/TheTestLab">
          <v-list-item-action>
            <v-icon>mdi-beaker-outline</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>Test Lab</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App bar -->
    <v-app-bar app dark>
        <!-- Customer-related actions -->
        <v-btn icon to="/" class="router-button ml-1">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-menu offset-x>
          <template v-slot:activator="{ on }">
            <v-btn class="ml-2" icon v-on="on">
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

      <v-btn v-if="!currentUser" @click="cancelDialog = !cancelDialog" icon class="ml-2">
        <v-icon color="white">mdi-cancel</v-icon>
      </v-btn>
    
      <!-- Business Related Actions -->
      <v-spacer class="navbar"></v-spacer>
      <!-- Open hidden drawer -->
      <v-app-bar-nav-icon color="white" @click.stop="drawerRight = !drawerRight" class="mr-1"/>
    </v-app-bar>

    <!-- TODO: vm.$emit( eventName, […args] ) -->
    <!-- https://vuejs.org/v2/api/#vm-emit -->
    <v-dialog v-model="genericDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">{{genericDialogTitle}}</v-card-title>
        <v-card-text>{{genericDialogText}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="genericDialogTitle == 'Information'" color="primary" @click="genericDialog = false">{{$getLanguageMsg('Ok')}}</v-btn>
          <v-btn v-else color="error darken-1" @click="genericDialog = false">{{$getLanguageMsg('Ok')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cancelDialog" max-width="400">
        <v-card>
          <v-container>
            <v-form @submit.prevent="cancelBooking" ref="cancelForm">
              <v-text-field required :rules="cancelRules" 
              :label="$getLanguageMsg('Booking reference')"
              v-model="bookingReference"/>
              <v-btn type="submit" color="primary">
                {{$getLanguageMsg('Cancel reservation')}}
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="cancelConfirmationDialog" max-width="400">
        <v-card>
          <v-container>
            <p>{{$getLanguageMsg('Your reservation has been canceled')}}</p>
            <v-btn type="submit" color="primary" 
            @click="cancelConfirmationDialog = !cancelConfirmationDialog">
              {{$getLanguageMsg('Ok')}}
            </v-btn>
          </v-container>
        </v-card>
      </v-dialog>

    <!-- Main content -->
    <!-- https://vuetifyjs.com/en/components/grids -->
    <v-content>
        <v-container>
          <v-fade-transition mode="out-in">
          <router-view v-on:open-generic-dialog="openGenericDialog($event)"/> <!-- Render the matched component for this path (paths in src/router/index.js) --> 
          </v-fade-transition>
        </v-container>
    </v-content>
    
  </v-app>
</template>

<script>
import firebase from 'firebase'
import CustomerService from '@/services/CustomerService';
import BusinessService from '@/services/BusinessService';

export default {
  props: ["cancelDialog"],
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      //TODO: get rid of flickering
      if (user) {
        this.currentUser = user;
        if(this.$route.name != 'home') this.$router.push({name: 'home'});
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
      environment: process.env.NODE_ENV,
      genericDialog: false,
      genericDialogTitle: "Information",
      genericDialogText: "",
      locale: this.$getLocale(), // Gets global, 'en', by default
      drawerRight: false,
      currentUser: null,
      // cancelDialog: false,
      cancelConfirmationDialog: false,
      cancelRules: [
        value => !!value || this.$getLanguageMsg('Required')
      ],
      bookingReference: '',
      languages: [
        { text: 'English', value: 'en' },
        { text: 'Español', value: 'es' }
      ]
    }
  },
  watch: {
    currentUser: function() {
      if(this.currentUser) {
        this.loadLocale();
      }    
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
      //Sets the global locale object to the new language so other components can see it
      if(locale) {
        this.$setLocale(locale);

        //Makes Vue re-render as this.locale is a key on the app
        this.locale = this.$getLocale();

        //If logged in, saves locale to the db
        if(this.currentUser) {
          BusinessService.setLocale(this.currentUser.uid, locale);
        }
      }
    },
    async loadLocale() {
      //If logged in, loads the locale and sets it globally
      let locale = await BusinessService.getLocale(this.currentUser.uid);
      if(locale) this.setLocale(locale);
    },
    openGenericDialog(event) {
      //TODO: Can we make an enum/something to enforce the words im gonna use
      this.genericDialogTitle = event[0];
      this.genericDialogText = event[1];
      this.genericDialog = true;
    }
  } // methods
}
</script>

<style lang="scss">
#app {
  text-align: center;
}
</style>
