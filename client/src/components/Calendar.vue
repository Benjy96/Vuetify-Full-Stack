<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn outlined class="mr-4" @click="setToday">
            Today
          </v-btn>
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next" class="mr-4">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>

          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-container>
            <v-form @submit.prevent="addBooking" ref="form">
              <p>Book an appointment</p>
                <v-text-field v-model="email"
                required
                v-bind:rules="emailRules"
                label="email" prepend-icon="mdi-account-circle"
                />
              <v-btn type="submit" color="primary">
                Book
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="bookingCreatedDialog" max-width="400">
        <v-card>
          <v-container>
            <p>You have been sent an email with your booking reference number</p>
            <v-btn type="submit" color="primary" 
            @click="bookingCreatedDialog = !bookingCreatedDialog">
              Thanks!
            </v-btn>
          </v-container>
        </v-card>
      </v-dialog>

<v-sheet height="600" v-if="!isFetchingUnavailableDays && !isFetchingRegularAvailability">

  <!-- ***** CALENDAR ***** -->

  <v-calendar
  ref="calendar"
  v-model="focus"
  color="primary"
  :now="today"
  :type="type"
  @click:more="getDayBookings"
  @click:date="getDayBookings"
  @click:day="getDayBookings"
  @change="updateRange"
  >
  <!-- TODO: Add logic method to the @click so u can't click a day if it's unavailable -->
  <!-- Might be better for a v-bound array of 31 day booleans to prevent retarded async shit? -->
  <template v-slot:day="dateObject">
    <v-sheet v-if="dayAvailable(dateObject)" height="100%" color="green">
    </v-sheet>
  </template>

  <template v-slot:interval="object">
    <v-btn v-if="slotAvailable(object)"
    @click="openDialog(object)" style="height: 100%; width: 100%;display: block;background-color:green;"
    ></v-btn>
  </template>

  </v-calendar>
  
  <!-- ***** END CALENDAR ***** -->
</v-sheet>
</v-col>
</v-row>
</template>

<script>
import CustomerService from '../services/CustomerService';
import { DateUtils } from '../DateUtils';
import { daysOfWeek } from '../DateUtils';

export default {
  props: ['id'],
  data: () => ({
    isFetchingUnavailableDays: true,
    isFetchingRegularAvailability: true,
    today: new Date().toISOString().substr(0, 10),
    focus: new Date().toISOString().substr(0, 10),
    type: 'month',
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      '4day': '4 Days',
    },
    start: null,  //TODO: What/who populates this? The child calendar component?
    end: null,
    dialog: false,
    dialogDate: false,
    addBookingDateObject: null,
    currentMonthUnavailableDays: null,
    customer_bookings: null,
    admin_bookings: null,
    regular_availability: null,
    defaultSlotInterval: 60,
    email: '',
    emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ],
    bookingCreatedDialog: false
  }),
  created () {
    //Month Viewed Upon Load
    //1. Check unavailable days meta-data
    this.getMonthUnavailableDays();
    this.getRegularAvailability();
  },
  computed: {
    //must be called by the calendar?
    title () {
      const { start, end } = this
      if (!start || !end) {
        return ''
      }
      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth
      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear
      const startDay = start.day + this.nth(start.day)
      const endDay = end.day + this.nth(end.day)
      switch (this.type) {
        case 'month':
        return `${startMonth} ${startYear}`
        case 'week':
        case '4day':
        return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
        case 'day':
        return `${startMonth} ${startDay} ${startYear}`
      }
      return ''
    },
    monthFormatter () {
      return this.$refs.calendar.getFormatter({
        timeZone: 'UTC', month: 'long',
      })
    }
  },
  methods: {
    async getRegularAvailability() {
      CustomerService.getRegularAvailability(this.id).then(res => {
        this.regular_availability = res;
        this.isFetchingRegularAvailability = false;
      });
    },
    async getMonthUnavailableDays() {
      this.currentMonthUnavailableDays = await CustomerService.getMonthUnavailableDays(this.id, 
        DateUtils.getYearFromDate(this.today),
        DateUtils.getMonthFromDate(this.today)
      );
      this.isFetchingUnavailableDays = false;
    },
    async getDayBookings({ date }) {
      this.customer_bookings = await CustomerService.getBookings(this.id, 
        DateUtils.getYearFromDate(date),
        DateUtils.getMonthFromDate(date),
        DateUtils.getDayFromDate(date)
      );

      this.viewDay(date);
    },
    async addBooking() {
      if(this.$refs.form.validate()) {
        this.dialog = false;
        this.bookingCreatedDialog = true;

        let date = this.addBookingDateObject.date;
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);

        let from = DateUtils.getHourMinFormattedHHMM(this.addBookingDateObject.hour, this.addBookingDateObject.minute);
        let to = DateUtils.getToTimeFormattedHHMM(this.addBookingDateObject.hour, this.addBookingDateObject.minute, this.defaultSlotInterval);

        await CustomerService.createBooking(this.id, this.email, year, month, day, from, to);

        this.getDayBookings(this.addBookingDateObject);
      }
    },
    dayAvailable(dateObject) {
      if(dateObject.date < DateUtils.getCurrentDateString()) {
        return false;
      }

      if(this.dateInUnavailableDays(dateObject)) return false;
      
      let dayOfWeek = daysOfWeek[dateObject.weekday - 1];
      if(dayOfWeek in this.regular_availability) {
        return true;
      }

      return false;
    },
    slotAvailable(dateObject) {
      // Check if date is passed
      let currentDate = DateUtils.getCurrentDateString();
      if(dateObject.date < currentDate) {
        return false;
      }

      //TODO: handle async with fetching bool
      // Check if already booked
      if(this.customer_bookings != null) {
        for(var x = 0; x < this.customer_bookings.length; x++) {
          if(DateUtils.hourMinBetween(dateObject.hour, dateObject.minute, this.customer_bookings[x])) {
            return false;
          }
        }
      }

      // Check if in unavailable days - handles admin bookings & fully-booked days
      if(this.dateInUnavailableDays(dateObject)) return false;
      
      // Check if in regular availability
      let dayOfWeek = daysOfWeek[dateObject.weekday - 1];
      if(dayOfWeek in this.regular_availability){
        if(this.regular_availability[dayOfWeek].length > 0) {
          for(let i in this.regular_availability[dayOfWeek]) {
            if(DateUtils.hourMinBetween(dateObject.hour, dateObject.minute, 
              this.regular_availability[dayOfWeek][i]))
            {
              return true;
            } else {
              return false;
            }
          }
        }
      }

      return false;
    },
    dateInUnavailableDays(dateObject) {
      let dayOfMonth = DateUtils.getDayFromDate(dateObject.date);

      if(this.currentMonthUnavailableDays != null) {
        for(var i in this.currentMonthUnavailableDays) {
          if(this.currentMonthUnavailableDays[i] == dayOfMonth) {
            return true;
          }
        }
      }
      return false;
    },
    openDialog(dateObject) {
      this.dialog = true;
      this.addBookingDateObject = dateObject;
    },
    viewDay (date) {
      this.focus = date
      this.type = 'day'
    },
    setToday () {
      this.focus = this.today
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    //start & end objects passed in with a .month proeprty, properly indexed.
    updateRange ({ start, end }) {
      this.start = start
      this.end = end
    },
    nth (d) {
      return d > 3 && d < 21
      ? 'th'
      : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
    }
  }
}
</script>