<template>
    <v-container class="grey lighten-3">

        <!-- Availability Box -->
        <!-- How to fucking format the rows and cols? -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Regular Availability</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters>
                        <v-col class="red lighten-3">
                            <v-container>
                                <TimeRangePicker v-on:saved-time-range="getRanges($event)" :id="id"/>
                            </v-container>
                        </v-col>
                        <v-col class="red lighten-4">
                            <v-container>
                                <v-card-title>Regular Hours</v-card-title>
                                <!-- Days of Week -->
                                <v-row class="red lighten-1" v-for="day in daysOfWeek" :key="'day' + day.text">
                                    <!-- Day -->
                                    <v-col class="red lighten-2">
                                        {{day.text}}
                                    </v-col>

                                    <!-- Time Ranges for Day-->
                                    <v-col class="red lighten-3">
                                        <v-list-item v-for="range in ranges[day.text]" :key="'dayRange' + day.text + range.from + range.to">
                                            {{range.from + " - " + range.to}}
                                            <v-list-item-action>
                                                <v-btn icon @click="deleteTimeRange(day.text, range)">
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

        <!-- Exceptional Availability Box -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Exceptional Availability</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters>
                        <v-col class="red lighten-3">
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <DateRangePicker/>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-col>
                        <v-col class="red lighten-4">
                            <v-container>
                                <v-card-title>Unavailable</v-card-title>
                                <!-- Days of Week -->
                                <v-row class="red lighten-1">
                                    <!-- Day -->
                                    <v-col class="red lighten-2">
                                        Test
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
                    <Bookings/>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import { db } from '../firebaseInit';
import { daysOfWeek } from './DateUtils';

import firebase from 'firebase';
import Bookings from './Bookings';
import TimeRangePicker from './TimeRangePicker';
import DateRangePicker from './DateRangePicker';

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
            daysOfWeek: daysOfWeek
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
        this.getRanges();
    },
    methods: {
        deleteTimeRange(day, range) {
            let dayRef = db.collection(`businesses/${this.id}/availability`).doc('regular');
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
                    let weekday = day.text;
                    if(regularDoc[weekday]){
                        regularDoc[weekday].forEach(range => {
                            this.ranges[weekday].push(range);
                        });
                    }
                })
            });
        }
    }
}
</script>