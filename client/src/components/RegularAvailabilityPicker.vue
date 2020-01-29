<template>
    <div>
    <v-form>
        <v-row>
            <v-col>
                <v-select v-bind:items="days" label="Day" v-model="day"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-dialog
                    ref="fromTimeDialog"
                    v-model="fromTimeDialogToggle"
                    :return-value.sync="fromTime"
                    persistent
                    width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field
                            v-model="fromTime"
                            label="From time"
                            readonly
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-time-picker
                    format="24hr"
                    v-if="fromTimeDialogToggle"
                    v-model="fromTime"
                    full-width
                    @click:minute="$refs.fromTimeDialog.save(fromTime)"
                    :max = "toTime"
                    >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="fromTimeDialogToggle = false">Cancel</v-btn>
                        <v-btn text color="primary" @click="$refs.fromTimeDialog.save(fromTime)">OK</v-btn>
                    </v-time-picker>
                </v-dialog>
            </v-col>
            <v-col>
                <v-dialog
                ref="toTimeDialog"
                v-model="toTimeDialogToggle"
                :return-value.sync="toTime"
                persistent
                width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field
                            v-model="toTime"
                            label="To time"
                            readonly
                            v-on="on"
                        ></v-text-field>
                    </template>

                    <v-time-picker
                    format="24hr"
                    v-if="toTimeDialogToggle"
                    v-model="toTime"
                    full-width
                    :min="minFromTime">
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="toTimeDialogToggle = false">Cancel</v-btn>
                        <v-btn text color="primary" @click="$refs.toTimeDialog.save(toTime)">OK</v-btn>
                    </v-time-picker>
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="validate">Save</v-btn>
            </v-col>
        </v-row>
    </v-form>
    </div>
</template>

<script>
import { db } from '../firebaseInit';
import { daysOfWeek } from '../DateUtils';
import firebase from 'firebase';

export default {
    props: ['id'],
    data() {
        return {
            fromTime: null,
            toTime: null,
            fromTimeDialogToggle: false,
            toTimeDialogToggle: false,
            day: 'Monday',
            days: daysOfWeek
        }
    },
    methods: {
        /* Standard availability algorithm:

            - Store date range
                1. Save Monday 09:00 - 17:00
                2. Add to DB: business/unavailable/days/Monday/17:00-09:00
            - Retrieve date range
                1. Click on Monday on calendar
                2. Read from DB: business/unavailable/days/Monday
                3. If Monday collection length > 0:
                    1. For each Calendar Hour (interval slot) in Calendar Monday:
                        1. If Calendar Hour in DB Monday Range:
                            1. Do not render clickable booking slot
        */
        validate() {
            db.collection(`businesses/${this.id}/availability/`).doc('regular')
                .update({
                    [this.day]: firebase.firestore.FieldValue.arrayUnion({
                        from: this.fromTime,
                        to: this.toTime
                    })
                })
                .then(this.$emit('saved-time-range', this.day)
            );
        }
    }
}
</script>