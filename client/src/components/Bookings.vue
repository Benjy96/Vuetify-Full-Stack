<template>

    <div>
        <v-row v-for="booking in bookings" v-bind:key="'Booking' + booking.id">
            <v-col>
                {{ booking.id }}
            </v-col>
        </v-row>
    </div>
        
</template>

<script>
import firebase from 'firebase';

import OwnerService from '../services/OwnerService';

export default {
    name: 'Bookings',
    data() {
        return {
            bookings: [],
            err: ''
        }
    },
    created() {
        OwnerService.getBookings(firebase.auth().currentUser.uid).then((res) => {
            this.bookings = res;
        });
    }
}
</script>