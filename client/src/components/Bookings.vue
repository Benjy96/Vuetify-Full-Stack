<template>
    <v-container fluid>
    <v-row dense>
        {{bookings}}
    </v-row>
    </v-container>
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