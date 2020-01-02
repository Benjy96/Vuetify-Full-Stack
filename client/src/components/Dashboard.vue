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
                                <v-row class="red lighten-1" v-for="day in daysOfWeek" :key="'day' + day.value">
                                    <!-- Day -->
                                    <v-col class="red lighten-2">
                                        {{day.text}}
                                    </v-col>

                                    <!-- Time Ranges for Day-->
                                    <v-col class="red lighten-3">
                                        <v-list-item v-for="range in ranges[day.value]" :key="'dayRange' + day.value + range">
                                            {{range}}
                                            <v-list-item-action>
                                                <v-btn icon @click="deleteTimeRange(day.value, range)">
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
                                    <v-col cols=6>
                                        <TimeRangePicker v-on:saved-time-range="getRanges($event)" :id="id"/>
                                    </v-col>
                                    <v-col cols=6>
                                        <TimeRangePicker v-on:saved-time-range="getRanges($event)" :id="id"/>    
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

export default {
    name: 'Dashboard',
    components: {
        Bookings,
        TimeRangePicker
    },
    data() {
        return {
            id: null,
            ranges: {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: [],
                7: []
            },
            daysOfWeek: daysOfWeek
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
        this.daysOfWeek.forEach(day => {
            this.getRanges(day.value);
        });
    },
    methods: {
        deleteTimeRange(dayNum, range) {
            //TODO: Performance? - just store this value instead of converting to db format? Why is db diff format?
            let bothRanges = range.split(" - ");
            let dbFormat = bothRanges[1] += '-' + bothRanges[0];

            db.collection(`businesses/${this.id}/unavailable/days/${dayNum}`).doc(dbFormat).delete().then(
                this.getRanges(dayNum)
            );
        },
        getRanges(dayNum) {
            this.ranges[dayNum] = [];
            db.collection(`businesses/${this.id}/unavailable/days/${dayNum}`).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    let bothRanges = doc.id.split("-");
                    let reversedAndFormatted = bothRanges[1] += ' - ' + bothRanges[0];
                    this.ranges[dayNum].push(reversedAndFormatted);
                });
            });
        }
    }
}
</script>