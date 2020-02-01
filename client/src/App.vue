<template>
  <v-app>
    <v-app-bar app> <!-- was <div id="nav" ></v-app> -->
        <v-btn to="/" class="router-button mr-4">Inicio</v-btn>
          <!-- v-btn extends router-link -->
      <v-spacer class="navbar"></v-spacer>
        <v-btn v-if="!currentUser" @click="cancelDialog = !cancelDialog">Cancelar reserva</v-btn>
        <v-btn v-if="currentUser" :to="'/businesses/' + currentUser.uid" class="ml-4">Mi Calendario</v-btn>
        <v-btn v-if="currentUser" to="/dashboard" class="ml-4">Administración</v-btn>
        <v-btn v-if="!currentUser" to="/register" class="ml-4">Registrar como empresa</v-btn>
        <v-btn v-if="!currentUser" to="/login" class="ml-4">Iniciar Sesión</v-btn>
        <v-btn v-else v-on:click="logout" class="ml-4">Salir</v-btn>
    </v-app-bar>

    <v-dialog v-model="cancelDialog" max-width="400">
        <v-card>
          <v-container>
            <v-form @submit.prevent="cancelBooking" ref="cancelForm">
              <v-text-field required :rules="cancelRules" 
              label="Booking reference"
              v-model="bookingReference"/>
              <v-btn type="submit" color="primary">
                Cancelar reserva
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="cancelConfirmationDialog" max-width="400">
        <v-card>
          <v-container>
            <p>Tu reserva ha sido cancelada</p>
            <v-btn type="submit" color="primary" 
            @click="cancelConfirmationDialog = !cancelConfirmationDialog">
              Vale
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
      currentUser: null,
      cancelDialog: false,
      cancelConfirmationDialog: false,
      cancelRules: [
        value => !!value || 'Requerido'
      ],
      bookingReference: ''
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
    }
  },
}
</script>

<style lang="scss">
#app {
  text-align: center;
}
</style>
