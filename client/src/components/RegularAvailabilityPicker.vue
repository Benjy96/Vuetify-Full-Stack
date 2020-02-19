<template>
    <div>
    <v-form>
        <v-row>
            <v-col>
                <v-select :items="translatedDays" v-model="day"/>
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
                            :label="$getLanguageMsg('fromTime')"
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
                        <v-btn text color="primary" @click="fromTimeDialogToggle = false">{{$getLanguageMsg('cancel')}}</v-btn>
                        <v-btn text color="primary" @click="$refs.fromTimeDialog.save(fromTime)">{{$getLanguageMsg('ok')}}</v-btn>
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
                            :label="$getLanguageMsg('toTime')"
                            readonly
                            v-on="on"
                        ></v-text-field>
                    </template>

                    <v-time-picker
                    format="24hr"
                    v-if="toTimeDialogToggle"
                    v-model="toTime"
                    full-width
                    :min="fromTime">
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="toTimeDialogToggle = false">{{$getLanguageMsg('cancel')}}</v-btn>
                        <v-btn text color="primary" @click="$refs.toTimeDialog.save(toTime)">{{$getLanguageMsg('ok')}}</v-btn>
                    </v-time-picker>
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="validate">{{$getLanguageMsg('add')}}</v-btn>
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
            day: daysOfWeek[0],
            translatedDays: [
                { text: this.$getLanguageMsg('Monday'), value: daysOfWeek[0] },
                { text: this.$getLanguageMsg('Tuesday'), value: daysOfWeek[1] },
                { text: this.$getLanguageMsg('Wednesday'), value: daysOfWeek[2] },
                { text: this.$getLanguageMsg('Thursday'), value: daysOfWeek[3] },
                { text: this.$getLanguageMsg('Friday'), value: daysOfWeek[4] },
                { text: this.$getLanguageMsg('Saturday'), value: daysOfWeek[5] },
                { text: this.$getLanguageMsg('Sunday'), value: daysOfWeek[6] }
            ]
        }
    },
    methods: {
        /* Standard availability algorithm:

            - Store date range
                1. Save Lunes 09:00 - 17:00
                2. Add to DB: business/unavailable/days/Lunes/17:00-09:00
            - Retrieve date range
                1. Click on Lunes on calendar
                2. Read from DB: business/unavailable/days/Lunes
                3. If Lunes collection length > 0:
                    1. For each Calendar Hour (interval slot) in Calendar Lunes:
                        1. If Calendar Hour in DB Lunes Range:
                            1. Do not render clickable booking slot
        */
        validate() {
            db.collection('businesses').doc(this.id)
                .update({
                    "regularAvailability": {
                        [this.day]: firebase.firestore.FieldValue.arrayUnion({
                            from: this.fromTime,
                            to: this.toTime
                        })
                    }
                })
                .then(this.$emit('saved-time-range', this.day)
            );
        }
    }
}
</script>