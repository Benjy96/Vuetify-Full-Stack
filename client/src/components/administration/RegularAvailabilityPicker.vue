<template>
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
                            :label="$getLanguageMsg('From time')"
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
                        <v-btn text color="primary" @click="fromTimeDialogToggle = false">{{$getLanguageMsg('Cancel')}}</v-btn>
                        <v-btn text color="primary" @click="$refs.fromTimeDialog.save(fromTime)">{{$getLanguageMsg('Ok')}}</v-btn>
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
                            :label="$getLanguageMsg('To time')"
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
                        <v-btn text color="primary" @click="toTimeDialogToggle = false">{{$getLanguageMsg('Cancel')}}</v-btn>
                        <v-btn text color="primary" @click="$refs.toTimeDialog.save(toTime)">{{$getLanguageMsg('Ok')}}</v-btn>
                    </v-time-picker>
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn color="primary" @click="validate">{{$getLanguageMsg('Add')}}</v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<script>
import { daysOfWeek } from '@/DateUtils';
import BusinessService from '@/services/BusinessService';

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
        validate() {
            BusinessService.addRegularAvailabilityRange(this.id, this.day, this.fromTime, this.toTime)
            .then(this.$emit('saved-time-range', { weekday: this.day, from: this.fromTime, to: this.toTime }));
        }
    }
}
</script>