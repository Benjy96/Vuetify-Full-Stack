<template>

    <div>
        <v-row v-for="booking in bookings" v-bind:key="booking">
            <v-col>
                {{ booking.id }}
            </v-col>
        </v-row>
    </div>
        
</template>

<script>
import firebase from 'firebase';

import BookingService from './BookingService';

export default {
    name: 'Bookings',
    data() {
        return {
            bookings: [],
            err: ''
        }
    },
    created() {
        BookingService.getBookings(firebase.auth().currentUser.uid).then((res) => {
            this.bookings = res;
        });
    }
}
</script>