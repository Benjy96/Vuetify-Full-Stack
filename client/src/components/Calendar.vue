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

<v-sheet height="600">

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
  <template v-slot:day="{ date }">
    <v-sheet v-if="dayAvailable(date)" height="100%" color="green">
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
import CalendarService from '../services/CalendarService';
import { DateUtils } from '../DateUtils';
import { daysOfWeek } from '../DateUtils';

export default {
  props: ['id'],
  data: () => ({
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
    unavailableDays: null,
    customer_bookings: null,
    admin_bookings: null,
    regular_availability: null,
    defaultSlotInterval: 60,
    email: '',
    emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
  }),
  created () {
    //Month Viewed Upon Load
    //1. Check unavailable days meta-data
    this.getUnavailableDays();
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
      CalendarService.getRegularAvailability(this.id).then(res => {
        this.regular_availability = res;
      });
    },
    async getUnavailableDays() {
      this.unavailableDays = await CalendarService.getUnavailableDays(this.id, 
        DateUtils.getYearFromDate(this.today),
        DateUtils.getMonthFromDate(this.today)
      );
    },
    //TODO: Move to back-end / add extra checks - like meta-data first, perhaps?
    async refreshDayBookings(year, month, day) {
      this.customer_bookings = await CalendarService.getBookings(this.id, year, month, day);
    },
    async getDayBookings({ date }) {
      this.customer_bookings = await CalendarService.getBookings(this.id, 
        DateUtils.getYearFromDate(date),
        DateUtils.getMonthFromDate(date),
        DateUtils.getDayFromDate(date)
      );

      this.viewDay(date);
    },
    // async getAdminBookings({ date }) {
    //   //TODO: When to retrieve admin bookings? For a month, on load, as it can span a large range of time?
    // },
    async addBooking() {
      if(this.$refs.form.validate()) {
        this.dialog = false;

        let year = DateUtils.getYearFromDate(this.addBookingDateObject.date);
        let month = DateUtils.getMonthFromDate(this.addBookingDateObject.date);
        let day = DateUtils.getDayFromDate(this.addBookingDateObject.date);

        let from = DateUtils.getHourMinFormattedHHMM(this.addBookingDateObject.hour, this.addBookingDateObject.minute);
        let to = DateUtils.getToTimeFormattedHHMM(this.addBookingDateObject.hour, this.addBookingDateObject.minute, this.defaultSlotInterval);

        await CalendarService.createBooking(this.id, this.email, year, month, day, from, to);

        this.refreshDayBookings(year, month, day);
      }
    },
    dayAvailable(date) {
      if(date < DateUtils.getCurrentDateString()) {
        return false;
      }

      if(this.unavailableDays != null) {
        for(var i in this.unavailableDays) {
          if(this.unavailableDays[i] == date) {
            return false;
          }
        }
      }
      return true;
    },
    slotAvailable(dateObject) {
      let currentDate = DateUtils.getCurrentDateString();
      if(dateObject.date < currentDate) {
        return false;
      }

      let dayOfMonth = DateUtils.getDayFromDate(dateObject.date);

      for(let i in this.unavailableDays) {
        if(this.unavailableDays[i] == dayOfMonth) {
          return false; //TODO: Can we skip rest of slot checks? Maybe through ref methods? Check Calendar component
        }
      }

      if(this.customer_bookings != null) {
        for(var x = 0; x < this.customer_bookings.length; x++) {
          //TODO: Could we not iterate thorugh this for every hour? Perhaps every hour just access a key?
          if(DateUtils.hourMinBetween(dateObject.hour, dateObject.minute, this.customer_bookings[x])) {
            return false;
          }
        }
      }
      
      let dayOfWeek = daysOfWeek[dateObject.weekday-1];

      //3. Check if in regular availability
      if(dayOfWeek in this.regular_availability) {
        //3.1. For each regular hour range of the day
        for(let i in this.regular_availability[dayOfWeek]) {
          //3.2. if current time in range, return false
          if(DateUtils.hourMinBetween(dateObject.hour, dateObject.minute, 
            this.regular_availability[dayOfWeek][i]))
          {
            return true;
          } else {
            return false;
          }
        }
      }

      //4. TODO: Check if in admin booking

      return true;
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