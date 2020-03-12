<template>
    <v-card>
        <v-container>
        <v-form @submit.prevent="addBooking" ref="addBookingForm">
            <p v-if="bookingTitle != ''" class="display-1">{{bookingTitle}}</p>
            <p v-else class="display-1">{{$getLanguageMsg('Book an appointment')}}</p>
            <p v-if="bookingInfo != ''" class="subtitle-1">{{bookingInfo}}</p>
            <v-text-field class="pb-2"
            v-model="bookerName"
            required
            v-bind:rules="nameRules"
            :label="$getLanguageMsg('Name')"
            prepend-icon="mdi-account-circle"
            />
            <v-text-field class="pb-4"
            v-model="email"
            required
            v-bind:rules="emailRules"
            label="email"
            prepend-icon="mdi-at"
            />
            <p v-if="bookingType == 'online'">{{$getLanguageMsg('bookingsOnline')}}</p>
            <p v-else>{{$getLanguageMsg(bookingType)}} </p>
            <p v-if="bookingType == 'customerTravels' && address"><span class="font-weight-bold">{{$getLanguageMsg('Location')}}:</span> {{address}}</p>
            
            <p class="subtitle-2" v-if="bookingDuration > 0">
                {{$getLanguageMsg('Duration')}}: {{bookingDuration}}
                <span v-if="bookingDuration == 1">{{$getLanguageMsg('minute')}}</span>
                <span v-else-if="bookingDuration > 1">{{$getLanguageMsg('minutes')}}</span>
                <br>
                {{$getLanguageMsg('Price')}}: {{bookingPrice}}
            </p>
            <v-btn type="submit" color="primary">{{$getLanguageMsg('Book')}}</v-btn>
        </v-form>
        </v-container>
    </v-card>
</template>

<script>
import { DateUtils } from '@/DateUtils';
import CustomerService from '@/services/CustomerService';

export default {
    data() {
        return {
            bookerName: '',
            email: ''
        }
    },
    props: {
        id: null,
        bookingTitle: {
            default: ''
        },
        bookingInfo: {
            default:'',
        },
        address: {
            default: ''
        },
        bookingType: {
            default: 'online'
        },
        bookingPrice: {
            default: "POA"
        },
        bookingDuration: {
            default: 60
        },
        addBookingDateObject: {
            default: null
        }
    },
    computed: {
        emailRules() {
            const rules = [];

            const requiredRule = v => !!v || this.$getLanguageMsg("Required");
            const invalidRule = v =>
                /.+@.+/.test(v) || this.$getLanguageMsg("emailNotValid");

            rules.push(requiredRule, invalidRule);

            return rules;
        },
        nameRules() {
            const rules = [];

            const requiredRule = v => !!v || this.$getLanguageMsg("Required");
            //const fullNameRule = v => (v || '').indexOf(' ') > -1 || this.$getLanguageMsg('fullNameRequired');

            rules.push(requiredRule);

            return rules;
        },
    },
    methods: {
        async addBooking() {
            if(this.id == null) return;

            if (this.$refs.addBookingForm.validate()) {                
                this.$emit("add-booking-validated");

                let date = this.addBookingDateObject.day.date;
                let year = DateUtils.getYearFromDate(date);
                let month = DateUtils.getMonthFromDate(date);
                let day = DateUtils.getDayFromDate(date);

                let from = this.addBookingDateObject.event.start.split(" ")[1];
                let to = this.addBookingDateObject.event.end.split(" ")[1];

                //RE "Huge Server Async Request Learning: in notes" - FUCK, it was awaiting axios/server, not the db
                //That's why it was returning 5 bookings instead of 6 when I'd just added a booking
                //the booking hadn't been added to the db, and my code was running simply when the server responded
                await CustomerService.createBooking(
                    this.id,
                    this.bookerName,
                    this.email,
                    year,
                    month,
                    day,
                    from,
                    to
                );

                this.$emit("add-booking-complete", date)
            }
        },
    }
}
</script>