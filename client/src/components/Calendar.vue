<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="grey lighten-3">
          <v-btn outlined class="mr-4" @click="setToday">{{$getLanguageMsg('today')}}</v-btn>
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
                <span>{{$getLanguageMsg(type)}}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>{{$getLanguageMsg('day')}}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>{{$getLanguageMsg('week')}}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>{{$getLanguageMsg('month')}}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>{{$getLanguageMsg('4day')}}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <!-- ***** DIALOGS ***** -->

      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-container>
            <v-form @submit.prevent="addBooking" ref="addBookingForm">
              <p>{{$getLanguageMsg('bookAppointment')}}</p>
              <v-text-field
                v-model="bookerName"
                required
                v-bind:rules="nameRules"
                :label="$getLanguageMsg('name')"
                prepend-icon="mdi-account-circle"
              />
              <v-text-field
                v-model="email"
                required
                v-bind:rules="emailRules"
                label="email"
                prepend-icon="mdi-at"
              />
              <v-btn type="submit" color="primary">{{$getLanguageMsg('book')}}</v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="bookingCreatedDialog" max-width="400">
        <v-card>
          <v-container>
            <p>{{$getLanguageMsg('bookingReferenceEmailed')}}</p>
            <v-btn
              type="submit"
              color="primary"
              @click="bookingCreatedDialog = !bookingCreatedDialog"
            >{{$getLanguageMsg('thanks')}}</v-btn>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isFetchingMonthData" hide-overlay persistent width="300">
        <v-card color="primary">
          <v-card-text color="white">
            {{$getLanguageMsg('loading')}}
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isFetchingDayData" hide-overlay persistent width="300">
        <v-card color="primary" light>
          <v-card-text>
            {{$getLanguageMsg('loadingBookings')}}
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-sheet height="600" v-if="!isFetchingMonthData">
        <!-- ***** CALENDAR ***** -->

        <v-calendar
          :locale="locale"
          ref="calendar"
          v-model="focus"
          color="primary"
          :now="today"
          :type="type"
          @click:more="loadAndViewDay"
          @click:date="loadAndViewDay"
          @click:day="loadAndViewDay"
          @change="updateRange"
          :events="events"
        >
          <!-- TODO: Add logic method to the @click so u can't click a day if it's unavailable -->
          <template v-slot:day="dateObject">
            <v-sheet v-if="dayAvailable(dateObject)" height="100%" color="green"></v-sheet>
          </template>

          <!-- TODO: Change to events array so we can go across hours? -->
          <!-- <template v-slot:interval="object">
            <v-btn
              v-if="slotAvailable(object)"
              @click="openDialog(object)"
              style="height: 100%; width: 100%;display: block;background-color:green;"
            ></v-btn>
          </template>-->
        </v-calendar>

        <!-- ***** END CALENDAR ***** -->
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { DateUtils } from "../DateUtils";
import { daysOfWeek } from "../DateUtils";
import CustomerService from "../services/CustomerService";

export default {
  props: ["id"],
  data: () => ({
    isFetchingMonthData: true,
    isFetchingDayData: false,
    today: new Date().toISOString().substr(0, 10),
    focus: new Date().toISOString().substr(0, 10),
    type: "month",
    start: null, // The vuetify calendar component populates this
    end: null,
    dialog: false,
    dialogDate: false,
    addBookingDateObject: null,
    unavailableDays: {},
    currentMonthUnavailableDays: null,
    customer_bookings: null,
    admin_bookings: null,
    regular_availability: null,
    defaultSlotInterval: 60,
    email: "",
    bookerName: "",
    bookingCreatedDialog: false,
    events: [{color: "", start:"2000-01-01 00:00",end:"2000-01-01 00:00", name:""}]
    // events: []
  }),
  created() {
    //Month Viewed Upon Load
    Promise.all([
      this.getRegularAvailability(),
      this.getUnavailableDays(this.today),
      this.getUnavailableDays(DateUtils.getNextMonthDate(this.today)),
      this.getUnavailableDays(DateUtils.incrementMonthOfDate(this.today, 2))
    ]).then(() => {
      this.isFetchingMonthData = false;
    });
  },
  computed: {
    emailRules() {
      const rules = [];

      const requiredRule = v => !!v || this.$getLanguageMsg("required");
      const invalidRule = v =>
        /.+@.+/.test(v) || this.$getLanguageMsg("emailNotValid");

      rules.push(requiredRule, invalidRule);

      return rules;
    },
    nameRules() {
      const rules = [];

      const requiredRule = v => !!v || this.$getLanguageMsg("required");
      //const fullNameRule = v => (v || '').indexOf(' ') > -1 || this.$getLanguageMsg('fullNameRequired');

      rules.push(requiredRule);

      return rules;
    },
    emailNotValid() {
      return this.$getLanguageMsg("emailNotValid");
    },
    required() {
      return this.$getLanguageMsg("required");
    },
    locale() {
      return this.$getLocale();
    },
    //computed properties are accessed as variables
    title() {
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }
      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;
      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;
      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);
      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
        case "4day":
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`;
        case "day":
          return `${startMonth} ${startDay} ${startYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    }
  },
  methods: {
    //TODO: Take admin bookings into account
    calcDayEvents(date) {
      let dayOfWeek = DateUtils.getWeekdayFromDateString(date);

      window.console.log(dayOfWeek);

      if (this.regular_availability[dayOfWeek] != null) {
        for (let range in dayOfWeek) {
          if (this.regular_availability[dayOfWeek][range] != null) {
            let potentiallyAvailableIntervals = DateUtils.getIntervalsInRange(
              this.regular_availability[dayOfWeek][range],
              this.defaultSlotInterval
            );

            for (let i in potentiallyAvailableIntervals) {
              if (this.customer_bookings != null) {
                for (var x = 0; x < this.customer_bookings.length; x++) {
                  //if the potentially available interval is not within an existing booking, make available
                  /*
                    How to make a time available?

                    If interval not time within booking range
                    
                    booking 10 -> 11
                    interval 10 -> 11

                    Should the above interval be in the booking?

                    When is an interval in a booking?

                    When from is >= booking from && to <= booking to

                    Is interval 10->11 within 11->12? No.

                      False

                    Is interval 10->11 within 10->11? Yes

                      True - True

                    Is interval 10:30->11 within 11->11:30? No

                  */
                  if(!(DateUtils.timeGreaterThanOrEqualTo(potentiallyAvailableIntervals[i].from, this.customer_bookings[x].from)
                  && DateUtils.timeLessThanOrEqualTo(potentiallyAvailableIntervals[i].to, this.customer_bookings[x].to))){
                    let start = `${this.focus} ${potentiallyAvailableIntervals[i].from}`;
                    let end = `${this.focus} ${potentiallyAvailableIntervals[i].to}`;

                    //return everything that doesn't have the start && end above
                    //TODO: Find a way to avoid iteration twice & therefore remove this filtering
                      //(bookings & potentiallyAvailableIntervals)
                    this.events = this.events.filter(x => (x.start != start) && (x.end != end));

                    this.events.push({
                      name: "",
                      start: start,
                      end: end,
                      color: ""
                    });
                  }
                }
              }
            }
          }
        }
      }
      window.console.log(JSON.stringify(this.events));
    },
    async getRegularAvailability() {
      CustomerService.getRegularAvailability(this.id).then(res => {
        this.regular_availability = res;
      });
    },
    //TODO: instead of separating unavailable days into sep documents - do one document with an array?
    async getUnavailableDays(date) {
      let year = DateUtils.getYearFromDate(date);
      let month = DateUtils.getMonthFromDate(date);

      if (this.unavailableDays[year] == null) {
        this.unavailableDays[year] = {};
      }

      this.unavailableDays[year][
        month
      ] = await CustomerService.getUnavailableDays(this.id, year, month);
    },
    async getDayBookings(date) {
      //Don't need a loader if we already have a dialog covering the bookings
      if (!this.bookingCreatedDialog) this.isFetchingDayData = true;

      this.customer_bookings = await CustomerService.getBookings(
        this.id,
        DateUtils.getYearFromDate(date),
        DateUtils.getMonthFromDate(date),
        DateUtils.getDayFromDate(date)
      );

      this.isFetchingDayData = false;
    },
    async addBooking() {
      if (this.$refs.addBookingForm.validate()) {
        this.dialog = false;
        this.bookingCreatedDialog = true;

        let date = this.addBookingDateObject.date;
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);

        let from = DateUtils.getHourMinFormattedHHMM(
          this.addBookingDateObject.hour,
          this.addBookingDateObject.minute
        );
        let to = DateUtils.getToTimeFormattedHHMM(
          this.addBookingDateObject.hour,
          this.addBookingDateObject.minute,
          this.defaultSlotInterval
        );

        //RE "Huge Server Async Request Learning: in notes" - FUCK, it was awaiting axios/server, not the db
        //That's why it was returning 5 bookings instead of 6 when I'd just added a booking
        //the booking hadn't been added to the db, and my code was running simply when the server responded
        await CustomerService.createBooking(
          this.id,
          this.bookerName,
          this.email,
          year,
          month,
          day,
          from,
          to
        );

        this.loadAndViewDay(date);
      }
    },
    dayAvailable(dateObject) {
      if (dateObject.date < DateUtils.getCurrentDateString()) {
        return false;
      }

      //Handles admin bookings (for current month) & customer bookings
      if (this.dateInUnavailableDays(dateObject)) return false;

      let dayOfWeek = daysOfWeek[dateObject.weekday - 1];
      if (this.regular_availability != null) {
        if (dayOfWeek in this.regular_availability) {
          if (this.regular_availability[dayOfWeek].length == 0) return false;
          else return true;
        }
      }

      return false;
    },
    slotAvailable(dateObject) {
      // Check if date is passed
      let currentDate = DateUtils.getCurrentDateString();
      if (dateObject.date < currentDate) {
        return false;
      }

      if (this.isFetchingDayData) return false;

      //TODO: handle async with fetching bool - we need to differentiate empty cust bookings with none
      // Check if already booked
      window.console.log(JSON.stringify(this.customer_bookings));

      if (this.customer_bookings != null) {
        for (var x = 0; x < this.customer_bookings.length; x++) {
          if (
            DateUtils.hourMinBetween(
              dateObject.hour,
              dateObject.minute,
              this.customer_bookings[x]
            )
          ) {
            return false;
          }
        }
      }

      // Check if in unavailable days - handles admin bookings & fully-booked days
      if (this.dateInUnavailableDays(dateObject)) return false;

      // Check if in regular availability
      let dayOfWeek = daysOfWeek[dateObject.weekday - 1];
      if (this.regular_availability != null) {
        if (dayOfWeek in this.regular_availability) {
          if (this.regular_availability[dayOfWeek].length > 0) {
            for (let i in this.regular_availability[dayOfWeek]) {
              if (
                DateUtils.hourMinBetween(
                  dateObject.hour,
                  dateObject.minute,
                  this.regular_availability[dayOfWeek][i]
                )
              ) {
                return true;
              } else {
                return false;
              }
            }
          }
        }
      }

      return false;
    },
    dateInUnavailableDays(dateObject) {
      let year = DateUtils.getYearFromDate(dateObject.date);
      let month = DateUtils.getMonthFromDate(dateObject.date);
      let dayOfMonth = DateUtils.getDayFromDate(dateObject.date);

      if (this.unavailableDays != null) {
        if (this.unavailableDays[year][month] != null) {
          for (var i in this.unavailableDays[year][month]) {
            if (this.unavailableDays[year][month][i] == dayOfMonth) return true;
          }
        }
      }

      return false;
    },
    openDialog(dateObject) {
      this.dialog = true;
      this.addBookingDateObject = dateObject;
    },
    async loadAndViewDay(date) {
      date = date.date != undefined ? date.date : date;

      await this.getDayBookings(date);
      this.calcDayEvents(date);
      this.viewDay(date);
    },
    viewDay(date) {
      this.focus = date;
      this.type = "day";
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
      if (!DateUtils.getCurrentDateString() < this.focus) {
        if (this.type == "day") this.getDayBookings(this.focus);

        if (this.type == "month") {
          let nextMonthDate = DateUtils.getLastMonthDate(this.focus);
          let year = DateUtils.getYearFromDate(nextMonthDate);
          let month = DateUtils.getMonthFromDate(nextMonthDate);

          if (!this.unavailableDays[year][month]) {
            this.isFetchingMonthData = true;
            this.getUnavailableDays(this.focus).then(() => {
              this.isFetchingMonthData = false;
            });
          }
        }
      }
    },
    next() {
      //TODO: get customer bookings for each day...  may be a lot of reads but could cache?
      this.$refs.calendar.next();
      if (this.focus >= DateUtils.getCurrentDateString()) {
        if (this.type == "day") this.getDayBookings(this.focus);

        if (this.type == "month") {
          let nextMonthDate = DateUtils.getNextMonthDate(this.focus);
          let year = DateUtils.getYearFromDate(nextMonthDate);
          let month = DateUtils.getMonthFromDate(nextMonthDate);

          if (
            !this.unavailableDays[year] ||
            !this.unavailableDays[year][month]
          ) {
            this.isFetchingMonthData = true;

            Promise.all([
              this.getUnavailableDays(nextMonthDate),
              this.getUnavailableDays(
                DateUtils.getNextMonthDate(nextMonthDate)
              ),
              this.getUnavailableDays(
                DateUtils.incrementMonthOfDate(nextMonthDate, 2)
              )
            ]).then(() => {
              this.isFetchingMonthData = false;
            });
          }
        }
      }
    },
    //start & end objects passed in with a .month proeprty, properly indexed.
    updateRange({ start, end }) {
      this.start = start;
      this.end = end;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    }
  }
};
</script>