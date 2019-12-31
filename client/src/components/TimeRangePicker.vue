<template>
    <v-container class="grey lighten-2">
        <!-- v-bind:items because it tells Vue it's not a string -->
        <v-row class="green lighten-4">
            <v-col>
            <v-form>
                <v-select v-bind:items="days" label="Day" v-model="day"/>
                <!-- v-text-field extends v-input: how do mixins work? -->
                <v-text-field label="From" placeholder="09:00" v-model="from" :rules="dateRules"/>
                <v-text-field label="To" placeholder="17:00" v-model="to" :rules="dateRules"/>
                <v-btn @click="validate">Save</v-btn>
            </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import date from 'date-and-time';
import { db } from '../firebaseInit';

export default {
    props: ['id'],
    data() {
        return {
            day: 'Monday',
            from: '09:00',
            to: '17:00',
            dateRules: [
                v => !!v || 'A time is required!',
                v => (v && v.length == 5 ) || 'Time must be in the 24:00 format'
            ],
            days: [
                {text: "Monday", value: 1},
                {text: "Tuesday", value: 2},
                {text: "Wednesay", value: 3},
                {text: "Thursday", value: 4},
                {text: "Friday", value: 5},
                {text: "Saturday", value: 6},
                {text: "Sunday", value: 7}
            ]
        }
    },
    methods: {
        /* Standard availability algorithm:

            - Store date range
                1. Save Monday 09:00 - 17:00
                2. Add to DB: business/unavailable/days/Monday/17:00-09:00
            - Retrieve date range
                1. Click on Monday on calendar
                2. Read from DB: business/unavailable/days/Monday
                3. If Monday collection length > 0:
                    1. For each Calendar Hour (interval slot) in Calendar Monday:
                        1. If Calendar Hour in DB Monday Range:
                            1. Do not render clickable booking slot
        */
        validate() {
            //TODO: Maybe a dropdown is better.....? (Although less control) 
                //Any other date pickers? Get working for now in DB side though
            let parsedFrom = date.parse(this.from, 'hh:mm');
            let parsedTo = date.parse(this.to, 'hh:mm');

            if(parsedFrom > parsedTo){
                alert('From should be earlier than To!');
            } else {
                let formattedFromHours = this.getDoubleDigitTime(parsedFrom.getHours());
                let formattedFromMins = this.getDoubleDigitTime(parsedFrom.getMinutes());

                let formattedToHour = this.getDoubleDigitTime(parsedTo.getHours());
                let formattedToMins = this.getDoubleDigitTime(parsedTo.getMinutes());

                parsedTo = `${formattedToHour}:${formattedToMins}`;
                parsedFrom = `${formattedFromHours}:${formattedFromMins}`;

                //Add to db...
                db.collection(`businesses/${this.id}/unavailable/days/${this.day}`)
                    .doc(`${parsedTo}-${parsedFrom}`).set({});
            }
        },
        getDoubleDigitTime(intMinOrHour){
            if(intMinOrHour < 10){
                return `0${intMinOrHour}`;
            } else {
                return intMinOrHour;
            }
        }
    }
}
</script>