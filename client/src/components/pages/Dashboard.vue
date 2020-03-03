<template>
    <v-container>

    <!-- DIALOGS -->

    <v-dialog v-model="confirmSavedDialog" max-width="400">
    <v-card>
        <v-container>
        <p>{{$getLanguageMsg('preferenceSaved')}}</p>
        <v-btn
            type="submit"
            color="primary"
            @click="confirmSavedDialog = !confirmSavedDialog"
        >{{$getLanguageMsg('thanks')}}</v-btn>
        </v-container>
    </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteAdminBookingDialog" max-width="400">
        <v-card>
        <v-container>
            <p>{{$getLanguageMsg('confirmRemove')}}</p>
            <v-btn color="error" 
            @click="confirmDeleteAdminBooking">
            {{$getLanguageMsg('yes')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" 
            @click="cancelDelete">
            {{$getLanguageMsg('cancel')}}
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
            {{$getLanguageMsg('yes')}}
            </v-btn>
            <v-btn color="primary" 
            @click="cancelDelete">
            {{$getLanguageMsg('cancel')}}
            </v-btn>
        </v-container>
        </v-card>
    </v-dialog>

        <!-- Bookings Box -->
        <v-row>
            <v-col>
                <v-card>
                <v-card-title>{{$getLanguageMsg('upcomingBookings')}}</v-card-title>
                <v-divider></v-divider>
                <v-row no-gutters class="grey lighten-5">
                    <v-col>
                        <v-container>
                            <!-- <Bookings/> -->
                            <UpcomingBookings :id="id"/>
                        </v-container>
                    </v-col>
                </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Working Hours Box -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{$getLanguageMsg('workingHours')}}</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters class="grey lighten-5">
                        <v-col>
                            <v-container>
                                <RegularAvailabilityPicker v-on:saved-time-range="getRanges($event)" :id="id"/>
                            </v-container>
                        </v-col>
                        <v-col>
                            <v-card>
                                <v-simple-table>
                                    <template v-slot:default>
                                    <thead>
                                        <tr>
                                            <th class="text-center">{{$getLanguageMsg('day')}}</th>
                                            <th class="text-center">{{$getLanguageMsg('hours')}}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="day in daysOfWeek" :key="'day' + day">
                                            <td>{{$getLanguageMsg(day)}}</td>
                                            <td>
                                                <v-list-item v-for="range in ranges[day]" :key="'dayRange' + day + range.from + range.to">
                                                    <v-list-item-content>
                                                        {{range.from + " - " + range.to}}
                                                    </v-list-item-content>

                                                    <v-list-item-action>
                                                        <v-btn @click="deleteTimeRangeDialog(day, range)">
                                                            {{$getLanguageMsg('remove')}}
                                                            <v-icon right>mdi-delete</v-icon>
                                                        </v-btn>
                                                    </v-list-item-action>
                                                </v-list-item> 
                                            </td>
                                        </tr>
                                    </tbody>
                                    </template>
                                </v-simple-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Exceptional Availability Box -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{$getLanguageMsg('unavailable')}}</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters class="grey lighten-5">
                        <v-col>
                            <v-container>
                                <AdminBookingPicker v-on:saved-admin-booking="createAdminBooking($event)"/>
                            </v-container>
                        </v-col>
                        <v-col>
                            <v-container>
                                <v-simple-table>
                                    <template v-slot:default>

                                    <tbody>
                                        <tr v-for="(adminBooking, index) in adminBookings" :key="'adminBooking' + index">
                                            <td>
                                                <v-list-item>
                                                    <v-list-item-content>
                                                    {{$getLanguageMsg('From')}} {{ adminBooking.fromDate }} {{adminBooking.fromTime }}
                                                    {{$getLanguageMsg('to')}} {{ adminBooking.toDate }} {{ adminBooking.toTime }}
                                                    </v-list-item-content>
                                                    
                                                    <v-list-item-action>
                                                        <v-btn @click="deleteAdminBookingDialog(adminBooking)">
                                                            {{$getLanguageMsg('remove')}}
                                                            <v-icon right>mdi-delete</v-icon>
                                                        </v-btn>
                                                    </v-list-item-action>
                                                </v-list-item>
                                            </td>
                                        </tr>
                                    </tbody>
                                    </template>
                                </v-simple-table>
                            </v-container> 
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Booking Management Box -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{$getLanguageMsg('bookingManagement')}}</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters class="grey lighten-5">
                        <v-col>
                            <v-container>
                                <v-col>
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

                                        <v-btn type="submit">
                                        {{$getLanguageMsg('save')}}
                                        <v-icon right>mdi-content-save</v-icon>
                                        </v-btn>

                                    </v-form>
                                </v-col>   
                            </v-container>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Profile Management Box -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{$getLanguageMsg('profileManagement')}}</v-card-title>
                    <v-divider></v-divider>
                    <v-row no-gutters class="grey lighten-5">
                        <v-col>
                            <v-container>
                                <v-col>
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

                                        <v-btn type="submit">
                                        {{$getLanguageMsg('save')}}
                                        <v-icon right>mdi-content-save</v-icon>
                                        </v-btn>

                                    </v-form>
                                </v-col>   
                            </v-container>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { daysOfWeek } from '../../DateUtils';

import firebase from 'firebase';
// import Bookings from './Bookings';
import UpcomingBookings from '../UpcomingBookings';
import AdminBookingPicker from '../AdminBookingPicker';
import RegularAvailabilityPicker from '../RegularAvailabilityPicker';
import BusinessService from '../../services/BusinessService';

export default {
    name: 'Dashboard',
    components: {
        // Bookings,
        UpcomingBookings,
        AdminBookingPicker,
        RegularAvailabilityPicker
    },
    data() {
        return {
            id: null,
            ranges: {
                "Monday": [],
                "Tuesday": [],
                "Wednesday": [],
                "Thursday": [],
                "Friday": [],
                "Saturday": [],
                "Sunday": []
            },
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
        getRanges() {
            BusinessService.getRegularAvailability(this.id).then(regularAvailability => {
                if(regularAvailability) {
                    this.daysOfWeek.forEach(day => {
                        let weekday = day;
                        this.ranges[weekday] = [];
                        if(regularAvailability[weekday]) {
                            regularAvailability[weekday].forEach(range => {
                                this.ranges[weekday].push(range);
                            });
                        }
                    });
                }
            });
        },
        deleteTimeRangeDialog(day, range) {
            this.timeRangeDayToDelete = day;
            this.timeRangeRangeToDelete = range;
            this.confirmDeleteTimeRangeDialog = true;
        },
        confirmDeleteTimeRange() {
            this.confirmDeleteTimeRangeDialog = false;

            let day = this.timeRangeDayToDelete;
            let range = this.timeRangeRangeToDelete;

            //Return everything that doesn't have the same to or from - we then set the db WITHOUT the "Matched" values
            //- matched by EXCLUSION
            let dayArray = this.ranges[day].filter(item => ((item.from !== range.from) || (item.to !== range.to)));
            this.ranges[day] = dayArray;

            BusinessService.setDayRegularAvailability(this.id, day, dayArray);
        },
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
            if(this.$refs.profileManagementForm.validate()) {
                if(this.bio != "" && this.bio != null) {
                    this.confirmSavedDialog = true;
                    BusinessService.updateBio(this.id, this.bio);
                }

                if(this.occupation != "" && this.occupation != null) {
                    this.confirmSavedDialog = true;
                    BusinessService.updateOccupation(this.id, this.occupation);
                }

                if(this.profileImage != null) {
                    this.confirmSavedDialog = true;
                    BusinessService.setProfileImage(this.id, this.profileImage);
                }

                this.$refs.profileManagementForm.reset();
            }
        },
        saveBookingDetails() {
            if(this.$refs.bookingManagementForm.validate()) {
                if(this.bookingTitle != "" && this.bookingTitle != null) {
                    this.confirmSavedDialog = true;
                    BusinessService.updateBookingTitle(this.id, this.bookingTitle);
                }
                //TODO: Preserve newlines?
                //TODO: Change to markup to allow lists, etc?
                if(this.bookingInfo != "" && this.bookingInfo != null) {
                    this.confirmSavedDialog = true;
                    BusinessService.updateBookingInfo(this.id, this.bookingInfo);
                }

                if(this.bookingDuration != "" && this.bookingDuration != null) {
                    this.confirmSavedDialog = true;
                    BusinessService.updateBookingDuration(this.id, this.bookingDuration);
                }

                if(this.bookingPrice != "" && this.bookingPrice != null) {
                    this.confirmSavedDialog = true;
                    BusinessService.updateBookingPrice(this.id, this.bookingPrice);
                }

                this.$refs.bookingManagementForm.reset();
            }
        }
    }
}
</script>