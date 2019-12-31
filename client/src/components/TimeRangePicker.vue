<template>
    <v-container class="grey lighten-2">
        <!-- v-bind:items because it tells Vue it's not a string -->
        <v-row class="green lighten-4">
            <v-col class="brown lighten-1">
                <v-select v-bind:items='["Monday", "Tuesday"]' label="Day"/>
            </v-col>

            <v-col class="brown lighten-2">
                <!-- v-text-field extends v-input: how do mixins work? -->
                <v-text-field label="From" placeholder="09:00"/>
            </v-col>

            <v-col class="brown lighten-3">
                <v-text-field label="To" placeholder="17:00"/>
            </v-col>
        </v-row>
    </v-container>
</template>