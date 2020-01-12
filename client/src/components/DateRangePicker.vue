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
                        label="From date"
                        readonly
                        v-on="on"
                    ></v-text-field>
                </template>

                <v-date-picker v-model="fromDate" :max="toDate">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="fromDateDialogToggle = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.fromDateDialog.save(fromDate)">OK</v-btn>
                </v-date-picker>

            </v-dialog>
        </v-col>

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
                        label="To date"
                        readonly
                        v-on="on"
                    ></v-text-field>
                </template>

                <v-date-picker v-model="toDate" :min="fromDate">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="toDateDialogToggle = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.toDateDialog.save(toDate)">OK</v-btn>
                </v-date-picker>
            </v-dialog>
        </v-col>
    </v-row>

    <!-- Time Range -->
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
            <v-btn @click="add">Add</v-btn>
        </v-col>
    </v-row>
</v-container>
</template>

<script>
// import { DateUtils } from '../DateUtils';

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
      }
    },
    methods: {
        add() {
            if(this.fromDate && this.toDate && this.fromTime && this.toTime){
                let adminBooking = {
                    fromDate: this.fromDate,
                    fromTime: this.fromTime,
                    toDate: this.toDate,
                    toTime: this.toTime
                }; 
                this.$emit('saved-admin-booking', adminBooking);
            } 
        }
    },
    computed: {
        minFromTime() {
            if(this.toDate == this.fromDate){
                return this.fromTime;
            }else{
                return "00:00";
            }
        }
    }
  }
</script>