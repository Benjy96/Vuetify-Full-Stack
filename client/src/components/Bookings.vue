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
import BookingService from '../BookingService';

export default {
    name: 'Bookings',
    props: ['project_id'],  //TODO pass in email or some identifier
    data() {
        return {
            bookings: [],
            err: ''
        }
    }, 
    async created() { //run when component is initialized
        try {
            this.bookings = await BookingService.getBookingsByEmail("benjamindickey@hotmail.co.uk");  //this refers to this component instance
        } catch(err) {
            this.err = err.message;
        }
    }
}
</script>