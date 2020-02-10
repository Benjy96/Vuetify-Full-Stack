<template>
    <v-container>
        <v-row v-for="(bookingArray, dayKey) in bookings[currentYear][currentMonth]" v-bind:key="'Day' + currentYear + currentMonth + dayKey">
            <v-col>
                <v-sheet>
                    {{ dayKey }}/{{ currentMonth }}/{{ currentYear }}   
                    <v-container>
                    <v-row v-for="(booking, index2) in bookingArray" v-bind:key="'Booking' + index2">
                        <v-col>{{ booking.bookerName }}</v-col>
                        <v-col>
                            {{ booking.from }} - {{ booking.to }}
                        </v-col>
                        <v-col>
                            <v-btn @click="cancelBooking(booking, currentYear, currentMonth, dayKey)">
                                {{$getLanguageMsg('cancel')}}
                                <v-icon right>mdi-cancel</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    </v-container>
                </v-sheet>
            </v-col>
        </v-row>

        <v-dialog v-model="confirmCancelBookingDialog" max-width="400">
            <v-card>
            <v-container>
                <p>{{$getLanguageMsg('confirmCancelBooking')}}</p>
                <v-btn type="submit" color="error" 
                @click="confirmCancelBooking">
                {{$getLanguageMsg('cancel')}}
                </v-btn>
            </v-container>
            </v-card>
        </v-dialog>

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
            confirmCancelBookingDialog: false,
            bookings: {},
            err: '',
            currentYear: null,
            currentMonth: null,
            dayLimit: 7,
            uid: null,
            yearOfBookingToCancel: null,
            monthOfBookingToCancel: null,
            dayOfBookingToCancel: null,
            bookingToCancel: null
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
            this.bookingToCancel = booking;
            this.yearOfBookingToCancel = year;
            this.monthOfBookingToCancel = month;
            this.dayOfBookingToCancel = day;

            this.confirmCancelBookingDialog = true;
        },
        confirmCancelBooking() {
            this.confirmCancelBookingDialog = false;

            BusinessService.cancelBooking(this.uid, `${this.yearOfBookingToCancel}-${this.monthOfBookingToCancel}-${this.dayOfBookingToCancel}`, this.bookingToCancel)
            .then(res => {
                if(res == null) {
                    this.bookings[this.yearOfBookingToCancel][this.monthOfBookingToCancel] = null;
                } else { 
                    this.bookings[this.yearOfBookingToCancel][this.monthOfBookingToCancel][this.dayOfBookingToCancel] = res;
                }
            });
        }
    }
}
</script>