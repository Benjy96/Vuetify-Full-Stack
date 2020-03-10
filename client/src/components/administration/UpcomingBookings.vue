<template>
    <v-data-table
      :headers="headers"
      :items="bookings"
      sort-by="from"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">

        <v-menu
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
            max-width="300px"
        >
            <!-- Activator: Text field activates the menu -->
            <template v-slot:activator="{ on }">
                
                <v-text-field v-on="on"
                v-model="date"
                label="Viewing bookings on:"
                append-icon="mdi-calendar"
                readonly
                single-line
                ></v-text-field>
            </template>

            <!-- Menu: Date Picker takes the default menu slot - it is the "menu" -->
            <v-date-picker v-model="date" @input="menu = false"></v-date-picker>
        </v-menu>

        </v-toolbar>
      </template>

      <template v-slot:item.action="{ item }">
        <v-icon right @click="cancelBooking(item)">
          mdi-delete
        </v-icon>
      </template>

      <template v-slot:no-data>
        <p>{{$getLanguageMsg('noBookings')}}</p>
      </template>
    </v-data-table>
</template>


<script>
import {DateUtils} from '@/DateUtils';
import BusinessService from '@/services/BusinessService'

export default {
    props: ["id"],
    data: () => ({
        dialog: false,
        headers: [
            {
                text: 'Customer',
                align: 'left',
                sortable: false,
                value: 'bookerName',
            },
            { text: 'Date', value: 'date' },
            { text: 'From', value: 'from' },
            { text: 'To', value: 'to' },
            { text: 'Actions', value: 'action', sortable: false }, //Linked with v-slot:item.action
        ],
        date: DateUtils.getCurrentDateString(),
        bookings: [],
        bookingsDayLimit: 1,
        //Cancellation
        confirmCancelBookingDialog: false,
        bookingToCancel: null
    }
),

  watch: {
    //whenever date changes, this function is called
    date: function() {
        //set date
        this.initializeDate(this.date);
    }
  },

  created () {
    this.initializeDate(DateUtils.getCurrentDateString())
  },

  methods: {
    initializeDate (date) {
        //returns an obj of year->month->day that then has an array for each day
        /**
         * 
         * {"2020":{"02":{"17":[{"bookerName":"Ben","from":"10:00","to":"11:00
         * 
         */
        BusinessService.getUpcomingBookings(this.id, date, this.bookingsDayLimit)
        .then((res) => {
            let year = DateUtils.getYearFromDate(date);
            let month = DateUtils.getMonthFromDate(date);
            let day = DateUtils.getDayFromDate(date);

            let bookingsDateKey = `${year}-${month}-${day}`;

            this.bookings = res[year][month][day];

            if(this.bookings) {
              this.bookings.forEach(function(booking) {
                booking.date = bookingsDateKey;
              });
            }
        });
    },
    cancelBooking (booking) {
      this.bookingToCancel = booking;
      if(confirm(this.$getLanguageMsg('confirmCancelBooking'))) {
        let yearOfBookingToCancel = DateUtils.getYearFromDate(this.bookingToCancel.date);
        let monthOfBookingToCancel = DateUtils.getMonthFromDate(this.bookingToCancel.date);
        let dayOfBookingToCancel = DateUtils.getDayFromDate(this.bookingToCancel.date);

        BusinessService.cancelBooking(this.id, `${yearOfBookingToCancel}-${monthOfBookingToCancel}-${dayOfBookingToCancel}`, this.bookingToCancel)
          .then(() => {
              this.bookingToCancel = null;
              this.initializeDate(this.date);
        });
      } else {
        this.bookingToCancel = null;
      }
    }
  }
}
</script>