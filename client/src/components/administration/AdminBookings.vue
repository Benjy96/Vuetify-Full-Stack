<template>
    <v-data-table
    :headers="headers"
    :items="adminBookings"
    >

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

export default {
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
            adminBookings: []
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