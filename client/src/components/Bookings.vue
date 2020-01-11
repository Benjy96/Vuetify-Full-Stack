<template>
    <v-container class="red lighten-1">
        <v-row v-for="day in bookings[currentYear][currentMonth]" v-bind:key="'Day' + currentYear + currentMonth + day.day">
            <v-col>
                <v-sheet>
                    {{ day.day }}/{{ currentMonth }}/{{ currentYear }}
                    <!-- Content -->
                    <v-container>
                    <v-row v-for="(booking, index) in day.customer_bookings" v-bind:key="'Bookings' + day.day + index">
                        <v-col>
                            <v-row v-for="(fromTo, index2) in booking" :key="'Booking' + day.day + index2">
                                <v-col>
                                    text to go here
                                </v-col>
                                <v-col>
                                    {{ fromTo.from }} - {{ fromTo. to }}
                                </v-col>
                                <v-col>
                                    text to go here
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    </v-container>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import firebase from 'firebase';

import OwnerService from '../services/OwnerService';
import { DateUtils } from '../DateUtils';

export default {
    name: 'Bookings',
    data() {
        return {
            bookings: {},
            err: '',
            currentYear: null,
            currentMonth: null
        }
    },
    created() {
        this.currentYear = DateUtils.getCurrentYearString();
        this.currentMonth = DateUtils.getCurrentMonthString();

        OwnerService.getUpcomingBookings(firebase.auth().currentUser.uid).then((res) => {
            this.bookings = res;
        });
    }
}
</script>