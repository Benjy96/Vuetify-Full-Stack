<template>
    <v-data-table
    :headers="headers"
    :items="adminBookings"
    >

    <template v-slot:top>
        <v-toolbar flat>
            <v-dialog v-model="adder" max-width="500px">

                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="primary">{{$getLanguageMsg('Add')}}</v-btn>
                </template>

                <BaseCard>
                    <AdminBookingPicker v-on:saved-admin-booking="onSavedAdminBooking($event)" class="pt-8 px-4"/>
                </BaseCard>

            </v-dialog>
        </v-toolbar>
    </template>

    <template v-slot:item.action="{ item }">
        <v-icon right color="red" @click="removeAdminBooking(item)">
            mdi-close
        </v-icon>
    </template>

    </v-data-table>
</template>

<script>
import firebase from 'firebase';
import BusinessService from '@/services/BusinessService'

import AdminBookingPicker from '@/components/administration/AdminBookingPicker';

export default {
    components: {
        AdminBookingPicker
    },
    data() {
        return {
            id: null,
            headers: [
                { text: 'From date', value: 'fromDate' },
                { text: 'From time', value: 'fromTime' },
                { text: 'To date', value: 'toDate' },
                { text: 'To time', value: 'toTime' },
                { text: 'Actions', value: 'action', sortable: false }, //Linked with v-slot:item.action
            ],
            adminBookings: [],
            adder: false
        }
    },
    created() {
        this.id = firebase.auth().currentUser.uid;
        this.initialize();
    },
    methods: {
        initialize() {
            this.getAdminBookings();
        },
        onSavedAdminBooking(adminBooking) {
            this.adder = false;
            this.createAdminBooking(adminBooking);
        },
        createAdminBooking(adminBooking) {
            this.adminBookings.push(adminBooking);
            BusinessService.createAdminBooking(this.id, adminBooking);
        },
        getAdminBookings() {
            BusinessService.getAdminBookings(this.id).then(res => {
                if(res) {
                    this.adminBookings = res;
                }
            });
        },
        removeAdminBooking (adminBooking) {
            if(confirm(this.$getLanguageMsg('Remove'))) {
                BusinessService.deleteAdminBooking(this.id, adminBooking).then(res => {
                    this.adminBookings = res;
                });
            }
        }
    }
}
</script>