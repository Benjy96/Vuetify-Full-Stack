<template>
    <v-container>
        <v-row v-for="(bookingArray, dayKey) in bookings[currentYear][currentMonth]" v-bind:key="'Day' + currentYear + currentMonth + dayKey">
            <v-col>
                <v-sheet>
                    {{ dayKey }}/{{ currentMonth }}/{{ currentYear }}
                    <!-- Content -->
                    <v-container>
                    <v-row v-for="(booking, index2) in bookingArray" v-bind:key="'Booking' + index2">
                        <v-col>
                            {{ booking.from }} - {{ booking.to }}
                        </v-col>
                        <v-col>
                            <v-btn icon @click="cancelBooking(booking, currentYear, currentMonth, dayKey)">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
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

import BusinessService from '../services/BusinessService';
import { DateUtils } from '../DateUtils';

export default {
    name: 'Bookings',
    data() {
        return {
            bookings: {},
            err: '',
            currentYear: null,
            currentMonth: null,
            dayLimit: 7,
            uid: null
        }
    },
    created() {
        this.currentYear = DateUtils.getCurrentYearString();
        this.currentMonth = DateUtils.getCurrentMonthString();
        this.uid = firebase.auth().currentUser.uid;

        BusinessService.getUpcomingBookings(firebase.auth().currentUser.uid, this.dayLimit).then((res) => {
            this.bookings = res;
        });
    },
    methods: {
        cancelBooking(booking, year, month, day) {
            BusinessService.cancelBooking(this.uid, `${year}-${month}-${day}`, booking).then(res => {
                if(res.length == 0) {
                    this.bookings[year][month] = null;
                } else { 
                    this.bookings[year][month][day] = res;
                }
            });
        }
    }
}
</script>