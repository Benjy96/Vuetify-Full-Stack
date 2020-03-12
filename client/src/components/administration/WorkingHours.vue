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
                    <RegularAvailabilityPicker v-on:saved-time-range="onSavedTimeRange($event)" :id="id" class="pt-8 px-4"/>
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
        onSavedTimeRange(savedTimeRange) {
            this.adder = false;

            if(!this.bookings) this.bookings = [];

            this.bookings.push({
                englishDay: savedTimeRange.weekday,
                day: this.$getLanguageMsg(savedTimeRange.weekday),
                from: savedTimeRange.from,
                to: savedTimeRange.to
            });
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
                let rangeToRemove = { day: range.englishDay, from: range.from, to: range.to };

                //Return everything that doesn't have the same to or from - we then set the db WITHOUT the "Matched" values
                //- matched by EXCLUSION)

                //it's returning no mondays
                // filter returns elements that pass the test

                //if same day:
                    //if not same from / to
                let dayArray = this.bookings.filter(function(element) {
                    if(element.englishDay == rangeToRemove.day) {
                        if(element.from == rangeToRemove.from && element.to == rangeToRemove.to) {
                            return false;
                        }
                    }
                    return true;
                });

                this.bookings = dayArray;

                BusinessService.setDayRegularAvailability(this.id, day, dayArray);
            }
        }
    }
}
</script>