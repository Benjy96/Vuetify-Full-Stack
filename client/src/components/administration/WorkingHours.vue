<template>
    <v-data-table
    :headers="headers"
    :items="bookings"
    >

    <template v-slot:top>
        <v-toolbar flat>
            <v-dialog v-model="adder" max-width="500px">

                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="primary">{{$getLanguageMsg('Add')}}</v-btn>
                </template>

                <BaseCard>
                    <RegularAvailabilityPicker v-on:saved-time-range="getRanges($event)" :id="id"/>
                </BaseCard>

            </v-dialog>
        </v-toolbar>
    </template>

    <template v-slot:item.action="{ item }">
        <v-icon right color="red" @click="removeRange(item)">
            mdi-close
        </v-icon>
    </template>

    </v-data-table>
</template>

<script>
import { daysOfWeek } from '@/DateUtils';
import firebase from 'firebase';
import BusinessService from '@/services/BusinessService'

import RegularAvailabilityPicker from '@/components/administration/RegularAvailabilityPicker'

export default {
    components: {
        RegularAvailabilityPicker
    },
    data() {
        return {
            id: null,
            headers: [
                { text: 'Day', value: 'day' },
                { text: 'From', value: 'from' },
                { text: 'To', value: 'to' },
                { text: 'Actions', value: 'action', sortable: false }, //Linked with v-slot:item.action
            ],
            bookings: [],
            adder: false
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
        this.initialize();
    },
    methods: {
        initialize() {
            this.getRanges();
        },
        getRanges() {
            BusinessService.getRegularAvailability(this.id).then(regularAvailability => {
                if(regularAvailability) {
                    daysOfWeek.forEach(day => {
                        let weekday = day;

                        if(regularAvailability[weekday]) {
                            regularAvailability[weekday].forEach(range => {
                                this.bookings.push({
                                    englishDay: weekday,
                                    day: this.$getLanguageMsg(weekday),
                                    ...range
                                })
                            });
                        }
                    });
                }
            });
        },
        removeRange (range) {
            if(confirm(this.$getLanguageMsg('Remove'))) {
                let day = range.englishDay;
                let rangeToRemove = { from: range.from, to: range.to };

                //Return everything that doesn't have the same to or from - we then set the db WITHOUT the "Matched" values
                //- matched by EXCLUSION
                let dayArray = this.ranges[day].filter(item => ((item.from !== rangeToRemove.from) || (item.to !== rangeToRemove.to)));
                this.ranges[day] = dayArray;

                BusinessService.setDayRegularAvailability(this.id, day, dayArray).then(this.initialize());
            }
        }
    }
}
</script>