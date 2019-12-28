<template>
    <v-app>
        <v-container fluid>
        <v-row dense>
            {{bookings}}
        </v-row>
        </v-container>
    </v-app>
</template>

<script>
import firebase from 'firebase';
import BookingService from '../services/BookingService';

export default {
    name: 'Bookings',
    data() {
        return {
            bookings: [],
            err: ''
        }
    }, 
    async created() { //run when component is initialized
        try {
            this.bookings = await BookingService.getBookingsByEmail(firebase.auth().currentUser.email);  //this refers to this component instance
        } catch(err) {
            this.err = err.message;
        }
    }
}
</script>