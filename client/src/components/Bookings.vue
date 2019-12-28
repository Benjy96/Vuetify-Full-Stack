<template>
    <v-app>
        <v-container fluid>
        <v-row dense>
            {{bookings}}
        </v-row>
        </v-container>
    </v-app>
</template>

<script>
export default {
    name: 'Bookings',
    data() {
        return {
            bookings: [],
            err: ''
        }
    }
}
</script>