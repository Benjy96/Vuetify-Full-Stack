<template>
    <v-container>

    <!-- DIALOGS -->
    <v-dialog v-model="confirmDeleteAdminBookingDialog" max-width="400">
        <v-card>
        <v-container>
            <p>{{$getLanguageMsg('confirmRemove')}}</p>
            <v-btn color="error" 
            @click="confirmDeleteAdminBooking">
            {{$getLanguageMsg('Yes')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" 
            @click="cancelDelete">
            {{$getLanguageMsg('Cancel')}}
            </v-btn>
        </v-container>
        </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteTimeRangeDialog" max-width="400">
        <v-card>
        <v-container>
            <p>{{$getLanguageMsg('confirmRemove')}}</p>
            <v-btn color="error" class="mr-4"
            @click="confirmDeleteTimeRange">
            {{$getLanguageMsg('Yes')}}
            </v-btn>
            <v-btn color="primary" 
            @click="cancelDelete">
            {{$getLanguageMsg('Cancel')}}
            </v-btn>
        </v-container>
        </v-card>
    </v-dialog>

    <!-- /DIALOGS -->

        <!-- Bookings Box -->
        <v-row class="mb-6">
            <v-col cols="12">
                <BaseCard headerElevation="6" :title="$getLanguageMsg('Upcoming bookings')">
                    <UpcomingBookings :id="id"/>
                </BaseCard>
            </v-col>
        </v-row>

        <v-row class="mb-6">
            <!-- Working Hours Box -->
            <v-col cols="8">
                <BaseCard headerElevation="6" :title="$getLanguageMsg('workingHours')">
                    <WorkingHours></WorkingHours>
                </BaseCard>
            </v-col>

            <!-- Working Hours Management (Adder) -->
            <!-- TODO: Make this a modal? -->
            <v-col cols="4">
                <BaseCard headerElevation="6" :title="$getLanguageMsg('addWorkingHours')">
                    <RegularAvailabilityPicker v-on:saved-time-range="getRanges($event)" :id="id"/>
                </BaseCard>
            </v-col>
        </v-row>

                        <!-- TODO: Turn into a v-dialog? -->
                        <!-- TODO: UI Overhaul - How to format list nicely -->

        <!-- <v-row>
            
            <v-col cols="6" md="12">
                <BaseCard :title="$getLanguageMsg('Unavailable')">
                    <AdminBookingPicker v-on:saved-admin-booking="createAdminBooking($event)"/>
                </BaseCard>
            </v-col>

            <v-col cols="6" md="12">

                <v-row v-for="(adminBooking, index) in adminBookings" :key="'adminBooking' + index">
                    <v-col cols="8">
                        {{$getLanguageMsg('From')}} {{ adminBooking.fromDate }} {{adminBooking.fromTime }}
                        {{$getLanguageMsg('to')}} {{ adminBooking.toDate }} {{ adminBooking.toTime }}
                    </v-col>
                    
                    <v-col>
                        <v-list-item-action>
                            <v-icon>mdi-delete</v-icon>
                        </v-list-item-action>
                    </v-col>

                    <v-list-item-action>
                        <v-btn @click="deleteAdminBookingDialog(adminBooking)">
                            {{$getLanguageMsg('Remove')}}
                            <v-icon right>mdi-delete</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-row>
            </v-col>
        </v-row> -->

        <!-- Booking Management Box -->
        <!-- <v-row>
            <v-col cols="12">
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
        </v-row> -->

        <!-- Profile Management Box -->
        <!-- <v-row>
            <v-col>
                <BaseCard :title="$getLanguageMsg('Profile Management')">
                    <v-form @submit.prevent="saveProfileInfo" 
                    ref="profileManagementForm">

                        <v-text-field v-model="bio"
                        v-bind:rules="bioRules"
                        :label="$getLanguageMsg('bioFormText')" 
                        prepend-icon="mdi-account-details"
                        />

                        <v-text-field v-model="occupation"
                        :label="$getLanguageMsg('occupation')" 
                        prepend-icon="mdi-hammer"
                        />

                        <v-file-input v-model="profileImage"
                        show-size
                        accept=".jpg"
                        v-bind:rules="imageRules"
                        :label="$getLanguageMsg('profilePicture')"
                        prepend-icon="mdi-camera"
                        ></v-file-input>

                        <v-btn type="submit" color="primary">
                        {{$getLanguageMsg('Save')}}
                        <v-icon right>mdi-content-save</v-icon>
                        </v-btn>

                    </v-form>
                </BaseCard>
            </v-col>
        </v-row> -->

    </v-container>
</template>

<script>
import { daysOfWeek } from '@/DateUtils';

import firebase from 'firebase';
// import Bookings from '@/components/administration/Bookings';
import UpcomingBookings from '@/components/administration/UpcomingBookings';
// import AdminBookingPicker from '@/components/administration/AdminBookingPicker';
import BusinessService from '@/services/BusinessService';
import WorkingHours from '@/components/administration/WorkingHours';

import RegularAvailabilityPicker from '@/components/administration/RegularAvailabilityPicker';


export default {
    name: 'Dashboard',
    components: {
        // Bookings,
        UpcomingBookings,
        WorkingHours,
        // AdminBookingPicker,
        RegularAvailabilityPicker
    },
    data() {
        return {
            id: null,
            adminBookings: [],
            daysOfWeek: daysOfWeek,
            confirmDeleteTimeRangeDialog: false,
            confirmDeleteAdminBookingDialog: false,
            adminBookingToDelete: null,
            timeRangeDayToDelete: null,
            timeRangeRangeToDelete: null,
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
            bio: "",
            bioRules: [
                val => val.length < this.bioLimit || this.$getLanguageMsg('invalidBioFormText')
            ],
            bioLimit: 150,
            occupation: "",
            occupationRules: [
                val => val.length <= this.occupationLimit || this.$getLanguageMsg('tooLong')
            ],
            occupationLimit: 25,
            profileImage: null,
            imageRules: [
                value => !value || value.size < 1000000 || this.$getLanguageMsg('picTooLarge')
            ],
            confirmSavedDialog: false
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
        this.getRanges();
        this.getAdminBookings();
    },
    methods: {
        getAdminBookings() {
            BusinessService.getAdminBookings(this.id).then(res => {
                if(res) {
                    this.adminBookings = res;
                }
            });
        },
        createAdminBooking(adminBooking) {
            this.adminBookings.push(adminBooking);
            BusinessService.createAdminBooking(this.id, adminBooking);
        },
        deleteAdminBookingDialog(adminBooking) {
            this.adminBookingToDelete = adminBooking;
            this.confirmDeleteAdminBookingDialog = true;
        },
        confirmDeleteAdminBooking() {
            this.confirmDeleteAdminBookingDialog = false;

            BusinessService.deleteAdminBooking(this.id, this.adminBookingToDelete).then(res => {
                this.adminBookings = res;
            });
        },
        cancelDelete() {
            this.confirmDeleteTimeRangeDialog = false;
            this.confirmDeleteAdminBookingDialog = false;
            this.adminBookingToDelete = null;
            this.timeRangeToDelete = null;
        },
        saveProfileInfo() {
            let saved = false;

            if(this.$refs.profileManagementForm.validate()) {
                if(this.bio != "" && this.bio != null) {
                    saved = true;
                    BusinessService.updateBio(this.id, this.bio);
                }

                if(this.occupation != "" && this.occupation != null) {
                    saved = true;
                    BusinessService.updateOccupation(this.id, this.occupation);
                }

                if(this.profileImage != null) {
                    saved = true;
                    BusinessService.setProfileImage(this.id, this.profileImage);
                }

                if(saved) this.$emit("open-generic-dialog", [this.$getLanguageMsg("Information"), this.$getLanguageMsg('preferenceSaved')])

                this.$refs.profileManagementForm.reset();
            }
        },
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