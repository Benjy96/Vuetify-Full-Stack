<template>
    <v-container>

    <v-dialog v-model="confirmDeleteAdminBookingDialog" max-width="400">
        <v-card>
        <v-container>
            <p>{{$getLanguageMsg('confirmRemove')}}</p>
            <v-btn color="error" 
            @click="confirmDeleteAdminBooking">
            {{$getLanguageMsg('yes')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" 
            @click="cancelDelete">
            {{$getLanguageMsg('cancel')}}
            </v-btn>
        </v-container>
        </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteTimeRangeDialog" max-width="400">
        <v-card>
        <v-container>
            <p>{{$getLanguageMsg('confirmRemove')}}</p>
            <v-btn color="error" class="mr-4"
            @click="confirmDeleteTimeRange">
            {{$getLanguageMsg('yes')}}
            </v-btn>
            <v-btn color="primary" 
            @click="cancelDelete">
            {{$getLanguageMsg('cancel')}}
            </v-btn>
        </v-container>
        </v-card>
    </v-dialog>

        <!-- Availability Box -->
        <!-- How to fucking format the rows and cols? -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{$getLanguageMsg('workingHours')}}</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters>
                        <v-col>
                            <v-container>
                                <RegularAvailabilityPicker v-on:saved-time-range="getRanges($event)" :id="id"/>
                            </v-container>
                        </v-col>
                        <v-col>
                            <v-container>
                                <v-simple-table>
                                    <template v-slot:default>
                                    <thead>
                                        <tr>
                                            <th class="text-center">{{$getLanguageMsg('day')}}</th>
                                            <th class="text-center">{{$getLanguageMsg('hours')}}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="day in daysOfWeek" :key="'day' + day">
                                            <td>{{$getLanguageMsg(day)}}</td>
                                            <td>
                                                <v-list-item v-for="range in ranges[day]" :key="'dayRange' + day + range.from + range.to">
                                                    <v-list-item-content>
                                                        {{range.from + " - " + range.to}}
                                                    </v-list-item-content>

                                                    <v-list-item-action>
                                                        <v-btn @click="deleteTimeRangeDialog(day, range)">
                                                            {{$getLanguageMsg('remove')}}
                                                            <v-icon right>mdi-delete</v-icon>
                                                        </v-btn>
                                                    </v-list-item-action>
                                                </v-list-item> 
                                            </td>
                                        </tr>
                                    </tbody>
                                    </template>
                                </v-simple-table>
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
                    <v-card-title>{{$getLanguageMsg('unavailable')}}</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters>
                        <v-col>
                            <v-container>
                                <AdminBookingPicker v-on:saved-admin-booking="createAdminBooking($event)"/>
                            </v-container>
                        </v-col>
                        <v-col>
                            <v-container>
                                <v-simple-table>
                                    <template v-slot:default>

                                    <tbody>
                                        <tr v-for="(adminBooking, index) in adminBookings" :key="'adminBooking' + index">
                                            <td>
                                                <v-list-item>
                                                    <v-list-item-content>
                                                    {{$getLanguageMsg('From')}} {{ adminBooking.fromDate }} {{adminBooking.fromTime }}
                                                    {{$getLanguageMsg('to')}} {{ adminBooking.toDate }} {{ adminBooking.toTime }}
                                                    </v-list-item-content>
                                                    
                                                    <v-list-item-action>
                                                        <v-btn @click="deleteAdminBookingDialog(adminBooking)">
                                                            {{$getLanguageMsg('remove')}}
                                                            <v-icon right>mdi-delete</v-icon>
                                                        </v-btn>
                                                    </v-list-item-action>
                                                </v-list-item>
                                            </td>
                                        </tr>
                                    </tbody>
                                    </template>
                                </v-simple-table>
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
                <v-card-title>{{$getLanguageMsg('upcomingBookings')}}</v-card-title>
                <v-divider></v-divider>
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
import AdminBookingPicker from './AdminBookingPicker';
import RegularAvailabilityPicker from './RegularAvailabilityPicker';
import BusinessService from '../services/BusinessService';

export default {
    name: 'Dashboard',
    components: {
        Bookings,
        AdminBookingPicker,
        RegularAvailabilityPicker
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
            adminBookings: [],
            daysOfWeek: daysOfWeek,
            confirmDeleteTimeRangeDialog: false,
            confirmDeleteAdminBookingDialog: false,
            adminBookingToDelete: null,
            timeRangeDayToDelete: null,
            timeRangeRangeToDelete: null
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
        this.getRanges();
        this.getAdminBookings();
    },
    methods: {
        getRanges() {
            db.collection(`businesses/${this.id}/availability/`).doc('regular').get().then((snapshot) => {
                if(snapshot.exists) {
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
                }
            });
        },
        deleteTimeRangeDialog(day, range) {
            this.timeRangeDayToDelete = day;
            this.timeRangeRangeToDelete = range;
            this.confirmDeleteTimeRangeDialog = true;
        },
        confirmDeleteTimeRange() {
            this.confirmDeleteTimeRangeDialog = false;

            let day = this.timeRangeDayToDelete;
            let range = this.timeRangeRangeToDelete;

            let dayRef = db.collection(`businesses/${this.id}/availability`).doc('regular');
            //Return everything that doesn't have the same to or from - we then set the db WITHOUT the "Matched" values
            //- matched by EXCLUSION
            let dayArray = this.ranges[day].filter(item => ((item.from !== range.from) || (item.to !== range.to)));
            this.ranges[day] = dayArray;

            dayRef.update({
                [day]: dayArray
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
        deleteAdminBookingDialog(adminBooking) {
            this.adminBookingToDelete = adminBooking;
            this.confirmDeleteAdminBookingDialog = true;
        },
        confirmDeleteAdminBooking() {
            this.confirmDeleteAdminBookingDialog = false;

            BusinessService.deleteAdminBooking(this.id, this.adminBookingToDelete).then(res => {
                this.adminBookings = res;
            });
        },
        cancelDelete() {
            this.confirmDeleteTimeRangeDialog = false;
            this.confirmDeleteAdminBookingDialog = false;
            this.adminBookingToDelete = null;
            this.timeRangeToDelete = null;
        }
    }
}
</script>