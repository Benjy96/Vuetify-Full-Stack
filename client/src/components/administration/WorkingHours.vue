<template>
    <v-data-table
    :headers="headers"
    :items="bookings"
    >

    <template v-slot:item.action="{ item }">
        <v-icon right color="red" @click="cancelBooking(item)">
            mdi-close
        </v-icon>
    </template>

    </v-data-table>
</template>

<script>
export default {
    data() {
        return {
            headers: [
                { text: 'Day', value: 'day' },
                { text: 'From', value: 'from' },
                { text: 'To', value: 'to' },
                { text: 'Actions', value: 'action', sortable: false }, //Linked with v-slot:item.action
            ],
            bookings: [
                {day: "Monday"}
            ]
        }
    },
}
</script>