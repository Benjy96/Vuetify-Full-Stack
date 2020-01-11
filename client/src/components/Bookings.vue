<template>

    <div>
        <v-row v-for="day in bookings[currentYear][currentMonth]" v-bind:key="'Day' + currentYear + currentMonth + day">
            <v-col>
                {{ day.day }}
            </v-col>
        </v-row>
    </div>
        
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
            alert(JSON.stringify(this.bookings[this.currentYear][this.currentMonth]));
        });
    }
}
</script>