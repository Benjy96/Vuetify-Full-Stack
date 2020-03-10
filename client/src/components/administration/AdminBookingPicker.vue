<template>

<v-container>
    <!-- Date Range -->
    <v-row>
        <v-col>
            <v-dialog
            ref="fromDateDialog"
            v-model="fromDateDialogToggle"
            :return-value.sync="fromDate"
            persistent
            width="290px">

                <!-- on clicking the v-text-field within, display following date-picker element -->
                <template v-slot:activator="{ on }">
                    <v-text-field
                        v-model="fromDate"
                        :label="$getLanguageMsg('From date')"
                        readonly
                        v-on="on"
                    ></v-text-field>
                </template>

                <v-date-picker v-model="fromDate" :max="toDate">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="fromDateDialogToggle = false">{{$getLanguageMsg('Cancel')}}</v-btn>
                    <v-btn text color="primary" @click="$refs.fromDateDialog.save(fromDate)">{{$getLanguageMsg('Ok')}}</v-btn>
                </v-date-picker>

            </v-dialog>
        </v-col>

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
                :max = "maxFromTime"
                >
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="fromTimeDialogToggle = false">{{$getLanguageMsg('Cancel')}}</v-btn>
                <v-btn text color="primary" @click="$refs.fromTimeDialog.save(fromTime)">{{$getLanguageMsg('Ok')}}</v-btn>
                </v-time-picker>
            </v-dialog>
        </v-col>
    </v-row>

    <!-- Time Range -->
    <v-row>
        <v-col>
            <v-dialog
            ref="toDateDialog"
            v-model="toDateDialogToggle"
            :return-value.sync="toDate"
            persistent
            width="290px">

                <!-- on clicking the v-text-field within, display following date-picker element -->
                <template v-slot:activator="{ on }">
                    <v-text-field
                        v-model="toDate"
                        :label="$getLanguageMsg('To date')"
                        readonly
                        v-on="on"
                    ></v-text-field>
                </template>

                <v-date-picker v-model="toDate" :min="fromDate">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="toDateDialogToggle = false">{{$getLanguageMsg('Cancel')}}</v-btn>
                    <v-btn text color="primary" @click="$refs.toDateDialog.save(toDate)">{{$getLanguageMsg('Ok')}}</v-btn>
                </v-date-picker>
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
                    :min="minFromTime">
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="toTimeDialogToggle = false">{{$getLanguageMsg('Cancel')}}</v-btn>
                        <v-btn text color="primary" @click="$refs.toTimeDialog.save(toTime)">{{$getLanguageMsg('Ok')}}</v-btn>
                    </v-time-picker>
            </v-dialog>
        </v-col>
    </v-row>

    <v-row>
        <v-col>
            <v-btn color="primary" @click="add">{{$getLanguageMsg('Add')}}</v-btn>
        </v-col>
    </v-row>

    <v-dialog v-model="errorDialogToggle" max-width="400">
        <v-card>
        <v-container>
            <p>{{$getLanguageMsg('timeTravel')}}</p>
            <v-btn type="submit" color="error" @click="errorDialogToggle = !errorDialogToggle">
            {{$getLanguageMsg('Ok')}}
            </v-btn>
        </v-container>
        </v-card>
    </v-dialog>

</v-container>
</template>

<script>
// import { DateUtils } from '@/DateUtils';

  export default {
    data () {
      return {
        fromDate: null,
        toDate: null,
        fromDateDialogToggle: false,
        toDateDialogToggle: false,
        fromTime: null,
        toTime: null,
        fromTimeDialogToggle: false,
        toTimeDialogToggle: false,
        errorDialogToggle: false
      }
    },
    methods: {
        add() {
            if(this.fromDate && this.toDate && this.fromTime && this.toTime){
                //How to handle booking to the end of the day?
                let adminBooking = {
                    fromDate: this.fromDate,
                    fromTime: this.fromTime,
                    toDate: this.toDate,
                    toTime: this.toTime
                }; 

                if(adminBooking.fromDate == adminBooking.toDate && adminBooking.fromTime > adminBooking.toTime) {
                    this.errorDialogToggle = true;
                    return;
                }

                //TODO: Is this really needed? How to handle booking a whole day off?
                //Better for user to just book to midnight/start of the following day?
                if(adminBooking.fromDate == adminBooking.toDate && 
                    adminBooking.fromTime == "00:00" && adminBooking.toTime == "00:00")
                {
                    adminBooking.toTime = "24:00";
                }

                this.$emit('saved-admin-booking', adminBooking);
            } 
        }
    },
    computed: {
        minFromTime() {
            if(this.toDate == this.fromDate) {
                return this.fromTime;
            } else {
                return "00:00";
            }
        },
        maxFromTime() {
            if(this.fromDate == this.toDate) {
                return this.toTime;
            } else {
                return "23:59";
            }
        }
    }
  }
</script>