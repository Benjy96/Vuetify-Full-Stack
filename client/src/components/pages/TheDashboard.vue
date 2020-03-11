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

        <!-- TODO: Turn into a v-dialog? -->
        <!-- TODO: UI Overhaul - How to format list nicely -->

        <!-- Booking Management Box -->
        <v-row>
            <v-col cols="8">
            <BaseCard :title="$getLanguageMsg('Booking Management')">
                <v-form @submit.prevent="saveBookingDetails" 
                ref="bookingManagementForm">

                    <v-text-field v-model="bookingTitle"
                    v-bind:rules="bookingTitleRules"
                    :label="$getLanguageMsg('bookingTitleFormText')" 
                    prepend-icon="mdi-text-short"
                    />

                    <v-textarea v-model="bookingInfo"
                    v-bind:rules="bookingInfoRules"
                    :label="$getLanguageMsg('bookingInfoFormText')" 
                    prepend-icon="mdi-text-subject"
                    :counter="bookingInfoLimit"
                    />

                    <v-text-field v-model="bookingPrice"
                    v-bind:rules="bookingPriceRules"
                    :label="$getLanguageMsg('bookingPriceFormText')" 
                    prepend-icon="mdi-cash"
                    />

                    <v-text-field 
                    :rules="bookingDurationRules"
                    v-model="bookingDuration"
                    :label="$getLanguageMsg('bookingDurationFormText')"
                    prepend-icon="mdi-alarm"
                    ></v-text-field>

                    <v-btn type="submit" color="primary">
                    {{$getLanguageMsg('Save')}}
                    <v-icon right>mdi-content-save</v-icon>
                    </v-btn>

                </v-form>
            </BaseCard>
            </v-col>

            <v-col>
                <BaseCard headerElevation="6" color="info" title="Preview" subtitle="What customers see when booking you">
                    <AddBookingForm></AddBookingForm>
                </BaseCard>
                
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import { daysOfWeek } from '@/DateUtils';

import firebase from 'firebase';
import UpcomingBookings from '@/components/administration/UpcomingBookings';
import BusinessService from '@/services/BusinessService';

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
            bookingDurationRules: [
                // The right side can always be converted to true so will return if the other fails
                // val is optional - if == "", it will return true first, exiting from the rules
                // if not == "", it will continue checking (it will go to parseInt)
                // this function is trying to return the first thing that can be seen as "true"
                val => ((val == "" || val == undefined) || parseInt(val) > 0) || this.$getLanguageMsg('invalidBookingDurationSize'),
                // If both false, return outer
                val => ((val == "" || val == undefined) || !val.includes(".")) || this.$getLanguageMsg('invalidBookingDurationMinutes')
                //TODO: What if they have a decimal? Do server side? Round down?
            ],
            bookingPrice: "",
            bookingPriceRules: [
                val => ((val == "" || val == undefined) || parseFloat(val) > 0) || this.$getLanguageMsg('invalidBookingPriceFormText')
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
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
    },
    methods: {
        saveBookingDetails() {
            if(this.$refs.bookingManagementForm.validate()) {
                let saved = false;

                if(this.bookingTitle != "" && this.bookingTitle != null) {
                    saved = true;
                    BusinessService.updateBookingTitle(this.id, this.bookingTitle);
                }
                //TODO: Preserve newlines?
                //TODO: Change to markup to allow lists, etc?
                if(this.bookingInfo != "" && this.bookingInfo != null) {
                    saved = true;
                    BusinessService.updateBookingInfo(this.id, this.bookingInfo);
                }

                if(this.bookingDuration != "" && this.bookingDuration != null) {
                    saved = true;
                    BusinessService.updateBookingDuration(this.id, this.bookingDuration);
                }

                if(this.bookingPrice != "" && this.bookingPrice != null) {
                    saved = true;
                    BusinessService.updateBookingPrice(this.id, this.bookingPrice);
                }

                if(saved) this.$emit("open-generic-dialog", [this.$getLanguageMsg("Information"), this.$getLanguageMsg('preferenceSaved')])

                this.$refs.bookingManagementForm.reset();
            }
        }
    }
}
</script>