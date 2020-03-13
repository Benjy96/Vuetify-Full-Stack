<template>
    <v-container>

        <!-- Bookings Box -->
        <v-row class="mb-6">
            <v-col cols="12">
                <BaseCard headerElevation="6" :title="$getLanguageMsg('Upcoming bookings')">
                    <UpcomingBookings :id="id"/>
                </BaseCard>
            </v-col>
        </v-row>

        <!-- Booking Management Box -->
        <!-- TODO add cols to the form -->
        <v-row class="mb-6">
            <v-col cols="12" md="8">
            <BaseCard :title="$getLanguageMsg('Edit Booking Form')">
                <v-form @submit.prevent="saveBookingDetails" 
                ref="bookingManagementForm">
                    <v-container>
                        <v-row class="mx-5">
                            <v-col cols="9">
                                <v-text-field v-model="bookingTitle"
                                v-bind:rules="bookingTitleRules"
                                :label="$getLanguageMsg('bookingTitleFormText')" 
                                prepend-icon="mdi-text-short"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-textarea v-model="bookingInfo"
                                v-bind:rules="bookingInfoRules"
                                :label="$getLanguageMsg('bookingInfoFormText')" 
                                prepend-icon="mdi-text-subject"
                                :counter="bookingInfoLimit"
                                />
                            </v-col>

                            <v-col cols="12" sm="3">
                                <v-text-field v-model="bookingPrice"
                                v-bind:rules="bookingPriceRules"
                                :label="$getLanguageMsg('bookingPriceFormText')" 
                                prepend-icon="mdi-cash"
                                />
                            </v-col>

                            <v-col cols="12" sm="3">
                                <v-text-field 
                                :rules="bookingDurationRules"
                                v-model="bookingDuration"
                                :label="$getLanguageMsg('bookingDurationFormText')"
                                prepend-icon="mdi-alarm"
                                ></v-text-field>
                            </v-col>

                            <v-col>
                                <v-select
                                required
                                v-model="bookingType"
                                :items="bookingTravelTypes"
                                :label="$getLanguageMsg('bookingTravelType')" prepend-icon="mdi-train-car"
                                ></v-select>
                            </v-col>

                            <v-col v-if="bookingType == 'customerTravels'" cols="12">
                                <v-text-field  
                                v-model="address"
                                required
                                :label="$getLanguageMsg('address')" prepend-icon="mdi-city"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-btn type="submit" color="primary">
                                {{$getLanguageMsg('Save')}}
                                    <v-icon right>mdi-content-save</v-icon>
                                </v-btn>
                            </v-col>

                        </v-row>
                    </v-container>
                </v-form>
            </BaseCard>
            </v-col>

            <v-col>
                <BaseCard headerElevation="6" color="info" title="Preview" subtitle="What customers see when booking you">
                    <AddBookingForm :id="id"
                    :bookingTitle="bookingTitle"
                    :bookingInfo="bookingInfo"
                    :bookingDuration="bookingDuration"
                    :bookingPrice="bookingPrice"
                    :bookingType="bookingType.value"
                    :address="address"/>
                </BaseCard>
                
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import { daysOfWeek } from '@/DateUtils';

import UpcomingBookings from '@/components/administration/UpcomingBookings';

import BusinessService from '@/services/BusinessService';
import CustomerService from '@/services/CustomerService';

import AddBookingForm from '@/components/AddBookingForm';

export default {
    name: 'Dashboard',
    components: {
        AddBookingForm,
        UpcomingBookings,
    },
    data() {
        return {
            id: null,
            daysOfWeek: daysOfWeek,
            // Booking Management Form
            bookingDuration: "",
            bookingDurationRules: [ //Return first thing that's true (i.e., if tests fail, the "error" string is returned)
                // The right side can always be converted to true so will return if the other fails
                // val is optional - if == "", it will return true first, exiting from the rules
                // if not == "", it will continue checking (it will go to parseInt)
                // this function is trying to return the first thing that can be seen as "true"
                val => ((val == "" || val == undefined) || parseInt(val) > 0) || this.$getLanguageMsg('invalidBookingDurationSize'),
                // If both false, return outer
                val => ((val == "" || val == undefined) || !val.includes(".")) || this.$getLanguageMsg('invalidBookingDurationMinutes')
            ],
            bookingPrice: "",
            bookingPriceRules: [
                val => (val.length > 0 || val == undefined) || this.$getLanguageMsg('Required')
            ],
            bookingInfo: "",
            bookingInfoRules: [
                val => val.length < this.bookingInfoLimit || this.$getLanguageMsg('invalidBookingInfoFormText')
            ],
            bookingInfoLimit: 300,
            bookingTitle: "",
            bookingTitleRules: [
                val => val.length < this.bookingTitleLimit || this.$getLanguageMsg('invalidBookingInfoFormText')
            ],
            bookingTitleLimit: 100,
            bookingType: {
                text: this.$getLanguageMsg('onlineBookings'),
                value: 'online'
            },
            //TODO: Avoid DRY violations? Need a constant/enum for this ? Also used in Register
            bookingTravelTypes: [
                {text: this.$getLanguageMsg('businessTravels'), value: 'businessTravels' },
                {text: this.$getLanguageMsg('customerTravels'), value: 'customerTravels' },
                {text: this.$getLanguageMsg('onlineBookings'), value: 'online' }
            ],
            address: ''
        }
    },
    created() {
        this.id = BusinessService.getUserId();

        // Violating DRY by calling this here & in Calendar, because I don't want the db calls to be made across 2 layers
        // i.e., the calendar would still need the regularAvailability from this db call
        CustomerService.getBusinessDetails(this.id).then(res => {
            let bookingDetails = res.bookingDetails;
            if(bookingDetails) {
                if(bookingDetails.title) this.bookingTitle = bookingDetails.title;
                if(bookingDetails.info) this.bookingInfo = bookingDetails.info;
                if(bookingDetails.duration) this.bookingDuration = bookingDetails.duration;
                if(bookingDetails.price) this.bookingPrice = bookingDetails.price;
                if(bookingDetails.type != 'online' && bookingDetails.address) {
                    this.address = bookingDetails.address;
                }
                if(bookingDetails.type) this.bookingType = bookingDetails.type;
            }
        });
    },
    methods: {
        saveBookingDetails() {
            if(this.$refs.bookingManagementForm.validate()) {
                BusinessService.updateBookingDetails(this.id, this.bookingTitle, this.bookingInfo,
                this.bookingDuration, this.bookingPrice, this.bookingType.value, this.address);

                this.$emit("open-generic-dialog", [this.$getLanguageMsg("Information"), this.$getLanguageMsg('preferenceSaved')])
            }
        }
    }
}
</script>