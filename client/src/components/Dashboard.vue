<template>
    <v-container>

        <!-- Availability Box -->
        <!-- How to fucking format the rows and cols? -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Regular Availability</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters>
                        <v-col>
                            <v-container>
                                <TimeRangePicker v-on:saved-time-range="getRanges($event)" :id="id"/>
                            </v-container>
                        </v-col>
                        <v-col>
                            <v-container>
                                <v-simple-table>
                                    <template v-slot:default>
                                    <thead>
                                        <tr>
                                            <th class="text-center">Day</th>
                                            <th class="text-center">Regular Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="day in daysOfWeek" :key="'day' + day">
                                            <td>{{day}}</td>
                                            <td>
                                                <v-list-item v-for="range in ranges[day]" :key="'dayRange' + day + range.from + range.to">
                                                    {{range.from + " - " + range.to}}
                                                    <v-list-item-action>
                                                        <v-btn icon @click="deleteTimeRange(day, range)">
                                                            <v-icon>mdi-close</v-icon>
                                                        </v-btn>
                                                    </v-list-item-action>
                                                </v-list-item> 
                                            </td>
                                        </tr>
                                    </tbody>
                                    </template>
                                </v-simple-table>


                                <!-- Days of Week
                                <v-row class="red lighten-1" v-for="day in daysOfWeek" :key="'day' + day">
                                    <v-col class="red lighten-2">
                                        {{day}}
                                    </v-col>

                                    <v-col class="red lighten-3">
                                        <v-list-item v-for="range in ranges[day]" :key="'dayRange' + day + range.from + range.to">
                                            {{range.from + " - " + range.to}}
                                            <v-list-item-action>
                                                <v-btn icon @click="deleteTimeRange(day, range)">
                                                    <v-icon>mdi-close</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-col>
                                </v-row> -->

                            </v-container> 
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Exceptional Availability Box -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Exceptional Availability</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters>
                        <v-col>
                            <v-container>
                                <DateRangePicker v-on:saved-admin-booking="createAdminBooking($event)"/>
                            </v-container>
                        </v-col>
                        <v-col>
                            <v-container>
                                <v-card-title>Unavailable</v-card-title>
                                <!-- Days of Week -->
                                <v-row>
                                    <!-- Day -->
                                    <v-col>
                                        <v-list-item v-for="(adminBooking, index) in adminBookings" :key="'adminBooking' + index">
                                            {{adminBooking}}
                                            <v-list-item-action>
                                                <v-btn icon @click="deleteAdminBooking(adminBooking)">
                                                    <v-icon>mdi-close</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-col>
                                </v-row>
                            </v-container> 
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Bookings Box -->
        <v-row>
            <v-col>
                <v-card>
                <v-card-title>Upcoming Bookings</v-card-title>
                <v-row>
                    <v-col>
                        <v-container>
                            <Bookings/>
                        </v-container>
                    </v-col>
                </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { db } from '../firebaseInit';
import { daysOfWeek } from '../DateUtils';

import firebase from 'firebase';
import Bookings from './Bookings';
import TimeRangePicker from './TimeRangePicker';
import DateRangePicker from './DateRangePicker';
import BusinessService from '../services/BusinessService';

export default {
    name: 'Dashboard',
    components: {
        Bookings,
        TimeRangePicker,
        DateRangePicker
    },
    data() {
        return {
            id: null,
            ranges: {
                "Monday": [],
                "Tuesday": [],
                "Wednesday": [],
                "Thursday": [],
                "Friday": [],
                "Saturday": [],
                "Sunday": []
            },
            adminBookings: null,
            daysOfWeek: daysOfWeek
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
        this.getRanges();
        this.getAdminBookings();
    },
    methods: {
        deleteTimeRange(day, range) {
            let dayRef = db.collection(`businesses/${this.id}/availability`).doc('regular');
            //Return everything that doesn't have the same to or from - we then set the db WITHOUT the "Matched" values
            //- matched by EXCLUSION
            let dayArray = this.ranges[day].filter(item => ((item.from !== range.from) || (item.to !== range.to)));
            this.ranges[day] = dayArray;

            dayRef.update({
                [day]: dayArray
            });
        },
        getRanges() {
            db.collection(`businesses/${this.id}/availability/`).doc('regular').get().then((snapshot) => {
                let regularDoc = snapshot.data();
                this.daysOfWeek.forEach(day => {
                    let weekday = day;
                    this.ranges[weekday] = [];
                    if(regularDoc[weekday]){
                        regularDoc[weekday].forEach(range => {
                            this.ranges[weekday].push(range);
                        });
                    }
                })
            });
        },
        getAdminBookings() {
            BusinessService.getAdminBookings(this.id).then(res => {
                this.adminBookings = res;
            });
        },
        createAdminBooking(adminBooking) {
            this.adminBookings.push(adminBooking);
            BusinessService.createAdminBooking(this.id, adminBooking);
        },
        deleteAdminBooking(adminBooking) {
            BusinessService.deleteAdminBooking(this.id, adminBooking).then(res => {
                this.adminBookings = res;
            });
        }
    }
}
</script>