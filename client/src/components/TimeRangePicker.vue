<template>
    <div class="grey lighten-2">
        <!-- v-bind:items because it tells Vue it's not a string -->
        <v-form>
            <v-select v-bind:items="days" label="Day" v-model="day"/>
            <!-- v-text-field extends v-input: how do mixins work? -->
            <v-text-field label="From" placeholder="09:00" v-model="from" :rules="dateRules"/>
            <v-text-field label="To" placeholder="17:00" v-model="to" :rules="dateRules"/>
            <v-btn @click="validate">Save</v-btn>
        </v-form>
    </div>
</template>

<script>
import date from 'date-and-time';
import { db } from '../firebaseInit';
import { daysOfWeek } from './DateUtils';
import firebase from 'firebase';

export default {
    props: ['id'],
    data() {
        return {
            day: 'Monday',
            from: '09:00',
            to: '17:00',
            dateRules: [
                v => !!v || 'A time is required!',
                v => (v && v.length == 5 ) || 'Time must be in the 24:00 format',
                v => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/.test(v) || 'Time must be in the 24:00 format'
            ],
            days: daysOfWeek
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
                db.collection(`businesses/${this.id}/availability/`).doc('regular')
                    .update({
                        [this.day]: firebase.firestore.FieldValue.arrayUnion({
                            from: parsedFrom,
                            to: parsedTo
                        })
                    })
                    .then(this.$emit('saved-time-range', this.day)
                );
            }
        },
        getDoubleDigitTime(intMinOrHour){
            if(intMinOrHour < 10) {
                return `0${intMinOrHour}`;
            } else {
                return intMinOrHour;
            }
        }
    }
}
</script>