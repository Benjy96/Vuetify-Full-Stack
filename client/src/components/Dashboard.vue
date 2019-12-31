<template>
    <v-container class="grey lighten-3">

        <!-- Availability Box -->
        <!-- How to fucking format the rows and cols? -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Availability</v-card-title>
                    <v-divider></v-divider>
                    <TimeRangePicker/>
                </v-card>
            </v-col>
        </v-row>

        <!-- Bookings Box -->
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Upcoming Bookings</v-card-title>
                    <Bookings/>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import Bookings from './Bookings';
import TimeRangePicker from './TimeRangePicker';

export default {
    name: 'Dashboard',
    components: {
        Bookings,
        TimeRangePicker
    }
}
</script>