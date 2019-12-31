<template>
    <v-container class="grey lighten-2">
        <!-- v-bind:items because it tells Vue it's not a string -->
        <v-row class="green lighten-4">
            <v-col>
            <v-form>
                <v-select v-bind:items='["Monday", "Tuesday"]' label="Day" v-model="day"/>
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

export default {
    data() {
        return {
            day: 'Monday',
            from: '09:00',
            to: '17:00',
            dateRules: [
                v => !!v || 'A time is required!',
                v => (v && v.length == 5 ) || 'Time must be in the "24:00" format'
            ]
        }
    },
    methods: {
        validate() {
            //TODO: Maybe a dropdown is better.....? (Although less control) 
                //Any other date pickers? Get working for now in DB side though
            let parsedFrom = date.parse(this.from, 'hh:mm');
            let parsedTo = date.parse(this.to, 'hh:mm');

            if(parsedFrom > parsedTo){
                alert('From should be earlier than To!');
            } else {
                //Add to db...
            }
        }
    }
}
</script>