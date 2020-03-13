<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="grey lighten-3">
          <v-btn outlined class="mr-4" @click="setToday">{{$getLanguageMsg('Today')}}</v-btn>
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next" class="mr-4">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>

          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-btn v-if="isUser" color="primary" class="mr-4" @click="newBookingSlotDialog = true" dark>Add Booking Slot</v-btn>
          <v-btn outlined @click="type = typeToSwitchTo">{{$getLanguageMsg(typeToSwitchTo)}}</v-btn>
        </v-toolbar>
      </v-sheet>

      <!-- ***** DIALOGS ***** -->

      <v-dialog v-model="newBookingSlotDialog" width="500">
        <v-card>
          <v-container>
            <!-- .stop is shorthand for Event.stopPropagation()
            events normally go back up nested HTML elements, calling attached event listeners - this stops that-->
            <v-form @submit.prevent="addBookingSlot" ref="addBookingSlotForm">
              <v-text-field :rules="requiredRule" v-model="newBookingSlotDate" type="date" :label="$getLanguageMsg('Date')" />
              <v-text-field :rules="requiredRule" v-model="newBookingSlotStart" type="time" :label="$getLanguageMsg('From time')" />
              <v-text-field :rules="requiredRule" v-model="newBookingSlotEnd" type="time" :label="$getLanguageMsg('To time')" />

              <v-btn
                type="submit"
                color="primary"
                class="mr-4"
              >Add Booking Slot</v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="addBookingDialog" max-width="500">
        <AddBookingForm v-on:add-booking-complete="loadAndViewDay($event)" v-on:add-booking-validated="closeAddBookingDialog"
        :id="id"
        :addBookingDateObject="addBookingDateObject"
        :bookingTitle="bookingTitle"
        :bookingInfo="bookingInfo"
        :address="address"
        :bookingType="bookingType"
        :bookingPrice="bookingPrice"/>
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

      <!-- ***** END DIALOGS ***** -->

      <v-sheet height="600" v-if="!isFetchingMonthData">
        <!-- ***** CALENDAR ***** -->

        <v-calendar
          :locale="locale"
          ref="calendar"
          v-model="focus"
          color="primary"
          :now="today"
          :type="type"
          @click:event="openAddBookingDialog"
          @click:more="loadAndViewDay"
          @click:date="loadAndViewDay"
          @click:day="loadAndViewDay"
          @change="updateRange"
          :events="visibleEvents"
          event-color="green"
        >
          <!-- TODO: Add logic method to the @click so u can't click a day if it's unavailable -->
          <template v-slot:day="dateObject">
            <v-sheet v-if="dayAvailable(dateObject)" height="62.5%" color="green"></v-sheet>
          </template>
        </v-calendar>

        <!-- ***** END CALENDAR ***** -->
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { DateUtils } from "@/DateUtils";
import { daysOfWeek } from "@/DateUtils";
import CustomerService from "@/services/CustomerService";
import BusinessService from '@/services/BusinessService';

import AddBookingForm from '@/components/AddBookingForm';

export default {
  components: {
    AddBookingForm
  },
  props: ["id"],
  data: () => ({
    isUser: false,
    isFetchingMonthData: true,
    isFetchingDayData: false,
    today: new Date().toISOString().substr(0, 10),
    focus: new Date().toISOString().substr(0, 10),
    type: "month",
    typeToSwitchTo: "day",
    start: null, // The vuetify calendar component populates this
    end: null,
    // NEW BOOKING SLOT >
    newBookingSlotDialog: false,
    newBookingSlotDate: null,
    newBookingSlotStart: null,
    newBookingSlotEnd: null,
    // Availability >
    unavailableDays: {},
    currentMonthUnavailableDays: null,
    customer_bookings: null,
    admin_bookings: null,
    regular_availability: null,
    // Add Booking >
    addBookingDialog: false,
    addBookingDateObject: null,
    bookingTitle: "",
    bookingInfo: "",
    bookingDuration: 60,
    bookingPrice: "POA",
    bookingType: "online",
    address: "",
    bookingCreatedDialog: false,
    // Booking Slots >
    visibleEvents: [{start:"2019-01-01 00:00",end:"2019-01-01 00:00", name:""}],
    events: {}
    // Booking Slots <
  }),
  created() {
    // Check if own calendar
    if(BusinessService.isCurrentUser(this.id)){
      this.isUser = true;
    }

    // Month Viewed Upon Load
    Promise.all([
      this.getBusinessDetails(),
      this.getAdminBookings(),  //TODO: call for next/prev
      this.getMonthAvailabilityData(this.today),
      this.getMonthAvailabilityData(DateUtils.getNextMonthDate(this.today)),
      this.getMonthAvailabilityData(DateUtils.incrementMonthOfDate(this.today, 2))
    ]).then(() => {
      this.isFetchingMonthData = false;
    });
  },
  computed: {
    requiredRule() {
      return [v => !!v || this.$getLanguageMsg("Required")]
    },
    emailRules() {
      const rules = [];

      const requiredRule = v => !!v || this.$getLanguageMsg("Required");
      const invalidRule = v =>
        /.+@.+/.test(v) || this.$getLanguageMsg("emailNotValid");

      rules.push(requiredRule, invalidRule);

      return rules;
    },
    nameRules() {
      const rules = [];

      const requiredRule = v => !!v || this.$getLanguageMsg("Required");
      //const fullNameRule = v => (v || '').indexOf(' ') > -1 || this.$getLanguageMsg('fullNameRequired');

      rules.push(requiredRule);

      return rules;
    },
    emailNotValid() {
      return this.$getLanguageMsg("emailNotValid");
    },
    required() {
      return this.$getLanguageMsg("Required");
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
    /**
     * 
     * 1. If date not passed: Else display modal / Validation error
     * 1.1. If no intersecting customer bookings
     * 1.2. If no intersecting admin bookings
     * 1.3. If not in regular hours
     * 
     * 2. Store in DB
     * 3. Show new events
     * 
     */
    async addBookingSlot() {
      if(!this.$refs.addBookingSlotForm.validate()) return;

      // 1
      if(this.newBookingSlotDate < DateUtils.getCurrentDateString()) {
        return; //TODO: add date rule
      }

      let year = DateUtils.getYearFromDate(this.newBookingSlotDate);
      let month = DateUtils.getMonthFromDate(this.newBookingSlotDate);
      let day = DateUtils.getDayFromDate(this.newBookingSlotDate);

      // 1.1 - Check customer bookings
      let bookings = await CustomerService.getBookings(this.id, year, month, day);

      for(let i in bookings) {
        if(DateUtils.rangesIntersect(bookings[i].from, bookings[i].to, this.newBookingSlotStart, this.newBookingSlotEnd)) {
          this.$emit('open-generic-dialog', [this.$getLanguageMsg("Error"), "There is already a customer booking at this time."]);
          return;
        }
      }

      // 1.2 - Check admin bookings
      //get the time range from the admin booking
      for(let x = 0; x < this.admin_bookings.length; x++) {
        let adminBooking = this.admin_bookings[x];
        if(DateUtils.dateWithin(this.newBookingSlotDate, adminBooking.fromDate, adminBooking.toDate)) {
          let fromTime, toTime;

          if(this.newBookingSlotDate == adminBooking.fromDate && this.newBookingSlotDate == adminBooking.toDate) {
            fromTime = adminBooking.fromTime;
            toTime = adminBooking.toTime;
          }
          else if(this.newBookingSlotDate == adminBooking.fromDate) {
            fromTime = adminBooking.fromTime;
            toTime = "24:00";
          } 
          else if(this.newBookingSlotDate == adminBooking.toDate) {
            fromTime = "00:00";
            toTime = adminBooking.toTime;
          }
          else {
            this.$emit('open-generic-dialog', [this.$getLanguageMsg("Error"), "You have already marked this time as unavailable. Please check your Dashboard's 'Unavailable Dates' section."]);
            return;
          }

          // If interval is not in an admin booking
          if(DateUtils.rangesIntersect(this.newBookingSlotStart, this.newBookingSlotEnd, fromTime, toTime)) {
            this.$emit('open-generic-dialog', [this.$getLanguageMsg("Error"), "You have already marked this time as unavailable. Please check your Dashboard's 'Unavailable Dates' section."]);
            return;
          }
        } // for each admin booking
      }

      // 1.3 - Check regular availability based upon intervals (I1)
      let dayOfWeek = DateUtils.getWeekdayFromDateString(this.newBookingSlotDate);

      if (this.regular_availability && this.regular_availability[dayOfWeek] != null) {
        for(let range in this.regular_availability[dayOfWeek]) {
          if(this.regular_availability[dayOfWeek][range] != null) {
            let regularRange = this.regular_availability[dayOfWeek][range];
            let regIntervals = DateUtils.getIntervalsInRange(regularRange, this.bookingDuration);
            for (let i in regIntervals) {
              let interval = regIntervals[i];

              if(DateUtils.rangesIntersect(interval.from, interval.to, this.newBookingSlotStart, this.newBookingSlotEnd)) {
                this.$emit('open-generic-dialog', [this.$getLanguageMsg("Information"), "You are already available for a portion of this time."]);
                return;
              }
            }
          }
        }
      }

      // 2
      await BusinessService.addBookingSlot(this.id, this.newBookingSlotDate, this.newBookingSlotStart, this.newBookingSlotEnd);

      // 3
      if(!this.events[year][month]) this.events[year][month] = [];
      this.events[year][month].push({
        name: "",
        start: this.newBookingSlotDate + " " + this.newBookingSlotStart,
        end: this.newBookingSlotDate + " " + this.newBookingSlotEnd,
      });

      this.loadAndViewDay(this.newBookingSlotDate);
      
      this.newBookingSlotDate = null;
      this.newBookingSlotStart = null;
      this.newBookingSlotEnd = null;

      this.newBookingSlotDialog = false;
    },
    // Clears the Calendar events array so that the events aren't displayed on the month view
    hideEvents() {
      this.visibleEvents = [{start:"2019-01-01 00:00",end:"2019-01-01 00:00", name:""}];
    },
    // Clears events for the day, keeping user added "Irregular Availability" and the default event for Vue reactivity
    unhideEvents(year, month) {
      this.visibleEvents = this.events[year][month];
    },
    // Renders available booking slots
    setAvailableTimes(date) { //TODO: take specific availability into account - specific takes priority
      /*
        When is an interval in a booking? <--- The killer question

        When from is >= booking from && to <= booking to

      */

      // 1 & 2: Check if date passed or unavailable
      if(date < DateUtils.getCurrentDateString() || this.dateInUnavailableDays(date)) {
        return;
      }

      let year = DateUtils.getYearFromDate(date);
      let month = DateUtils.getMonthFromDate(date);

      if(!this.events[year][month]) this.events[year][month] = [];

      // 3 & 4: Check if times intersect with customer bookings
      let dayOfWeek = DateUtils.getWeekdayFromDateString(date);

      if (this.regular_availability && this.regular_availability[dayOfWeek] != null) {
        for (let range in dayOfWeek) {
          if (this.regular_availability[dayOfWeek][range] != null) {
            let potentiallyAvailableIntervals = DateUtils.getIntervalsInRange(
              this.regular_availability[dayOfWeek][range],
              this.bookingDuration
            );

            for (let i in potentiallyAvailableIntervals) {
              let intervalAvailable = true;

              let start = `${this.focus} ${potentiallyAvailableIntervals[i].from}`;
              let end = `${this.focus} ${potentiallyAvailableIntervals[i].to}`;

              // 3: Check intervals v admin bookings
              if(this.admin_bookings != null) { //TODO: How are we sure we have it? Check customerbookings for ref

                //TODO: Can we make the specific availability functionality transferrable to admin dashboard? Reuse?
                //get the time range from the admin booking
                for(let x = 0; x < this.admin_bookings.length; x++) {

                  let adminBooking = this.admin_bookings[x];
                  if(DateUtils.dateWithin(this.focus, adminBooking.fromDate, adminBooking.toDate)) {
                    let fromTime, toTime;

                    if(adminBooking.fromDate == adminBooking.toDate) {
                      fromTime = adminBooking.fromTime;
                      toTime = adminBooking.toTime;
                    } 
                    else if(this.focus == adminBooking.fromDate) {
                      fromTime = adminBooking.fromTime;
                      toTime = "24:00";
                    } 
                    else if(this.focus == adminBooking.toDate) {
                      fromTime = "00:00";
                      toTime = adminBooking.toTime;
                    }

                    // If interval is not in an admin booking
                    if(DateUtils.rangesIntersect(potentiallyAvailableIntervals[i].from, potentiallyAvailableIntervals[i].to,
                    fromTime, toTime)) {
                      intervalAvailable = false;
                      break;
                    }
                  } // for each admin booking
                }
              }

              // 4: Check intervals v customer bookings
              if (this.customer_bookings != null) {
                if(intervalAvailable != false) { 
                  for (let x = 0; x < this.customer_bookings.length; x++) {
                    // If interval is in a booking:
                      //if interval from >= booking from && interval to <= booking to - within
                      //But what if the start is before the other booking start and the to is in the middle?
                      //OR
                      //If to < booking to & > booking from
                      //OR
                      //If from > booking from & < booking to
                    if(DateUtils.rangesIntersect(potentiallyAvailableIntervals[i].from, potentiallyAvailableIntervals[i].to,
                    this.customer_bookings[x].from, this.customer_bookings[x].to)) 
                    {
                      intervalAvailable = false;
                      break;
                    } 
                  } // for each customer booking
                }
              }

              // No admin booking or customer booking
              if(intervalAvailable == true) {
                if(this.events[year][month]) {
                  this.events[year][month] = this.events[year][month].filter(event => (event.start != start) && (event.end != end));
                }
                
                this.events[year][month].push({
                  name: "",
                  start: start,
                  end: end
                });
              }
            } // for each potential interval
          }
        } // for each day of week
      }
    },
    //TODO can call this a bit more lazily than reg availability? as already have meta-data and only need
    //this for individual days
    async getAdminBookings(date) {
      let year = DateUtils.getYearFromDate(date);
      let month = DateUtils.getMonthFromDate(date);
      CustomerService.getAdminBookings(this.id, year, month).then(res => {
        this.admin_bookings = res;
      });
    },
    async getBusinessDetails() {
      CustomerService.getBusinessDetails(this.id).then(res => {
        this.regular_availability = res.regularAvailability;
        let bookingDetails = res.bookingDetails;
        if(bookingDetails) {
          if(bookingDetails.title) this.bookingTitle = bookingDetails.title;
          if(bookingDetails.info) this.bookingInfo = bookingDetails.info;
          if(bookingDetails.duration) this.bookingDuration = bookingDetails.duration;
          if(bookingDetails.price) this.bookingPrice = bookingDetails.price;
          if(bookingDetails.type != 'online' && bookingDetails.address) {
            this.address = bookingDetails.address;
          }
          if(bookingDetails.type) this.bookingType = bookingDetails.type;
        }
      });
    },
    async getMonthAvailabilityData(date) {
      let year = DateUtils.getYearFromDate(date);
      let month = DateUtils.getMonthFromDate(date);

      if (this.unavailableDays[year] == null) {
        this.unavailableDays[year] = {};
      }

      if(this.events[year] == null) {
        this.events[year] = {};
      }

      let data = await CustomerService.getMonthAvailabilityData(this.id, year, month);

      if(data && data.unavailableDays) {
        if(!this.unavailableDays[year][month]) this.unavailableDays[year][month] = [];
        this.unavailableDays[year][month] = data.unavailableDays;
        if(data.irregularAvailability) {
          if(this.events[year][month] == null) {
            this.events[year][month] = [];
          }
          this.events[year][month] = data.irregularAvailability;
        }
      }
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
    dayAvailable(dateObject) {
      if (dateObject.date < DateUtils.getCurrentDateString()) {
        return false;
      }

      // Handle specific availability
      let year = DateUtils.getYearFromDate(dateObject.date);
      let month = DateUtils.getMonthFromDate(dateObject.date);
      for(let i in this.events[year][month]) {
        let eventDate = this.events[year][month][i].start.split(" ")[0];
        if(dateObject.date == eventDate) return true;
      }

      // Handle meta-data (admin bookings & customer bookings make a day unavailable)
      if (this.dateInUnavailableDays(dateObject)) return false;

      // Handle regular availability
      let dayOfWeek = daysOfWeek[dateObject.weekday - 1];
      if (this.regular_availability != null) {
        if (dayOfWeek in this.regular_availability) {
          if (this.regular_availability[dayOfWeek].length == 0) return false;
          else return true;
        }
      }

      return false;
    },
    dateInUnavailableDays(date) {
      date = date.date != undefined ? date.date : date;

      let year = DateUtils.getYearFromDate(date);
      let month = DateUtils.getMonthFromDate(date);
      let dayOfMonth = DateUtils.getDayFromDate(date);

      if (this.unavailableDays != null) {
        if (this.unavailableDays[year][month] != null) {
          for (var i in this.unavailableDays[year][month]) {
            if (this.unavailableDays[year][month][i] == dayOfMonth) return true;
          }
        }
      }

      return false;
    },
    openAddBookingDialog(eventObject) {
      this.addBookingDialog = true;
      this.addBookingDateObject = eventObject;
    },
    closeAddBookingDialog() {
      this.addBookingDialog = false
      this.bookingCreatedDialog = true
    },
    async loadAndViewDay(date) {
      date = date.date != undefined ? date.date : date;

      await this.getDayBookings(date);
      this.setAvailableTimes(date);
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

      if (this.focus >= DateUtils.getCurrentDateString()) {
        if (this.type == "day") {
          this.loadAndViewDay(this.focus);
        }

        if (this.type == "month") {
          let nextMonthDate = DateUtils.getLastMonthDate(this.focus);
          let year = DateUtils.getYearFromDate(nextMonthDate);
          let month = DateUtils.getMonthFromDate(nextMonthDate);

          if (!this.unavailableDays[year][month]) {
            this.isFetchingMonthData = true;
            this.getMonthAvailabilityData(this.focus).then(() => {
              this.isFetchingMonthData = false;
            });
          }
        }
      }
    },
    next() {
      this.$refs.calendar.next();

      if (this.focus >= DateUtils.getCurrentDateString()) {
        if (this.type == "day") {
          this.loadAndViewDay(this.focus);
        }

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
              this.getMonthAvailabilityData(nextMonthDate),
              this.getMonthAvailabilityData(DateUtils.getNextMonthDate(nextMonthDate)),
              this.getMonthAvailabilityData(DateUtils.incrementMonthOfDate(nextMonthDate, 2)
              )
            ]).then(() => {
              this.isFetchingMonthData = false;
            });
          }
        }
      }
    },
    //@change is called any time the days displayed are changed - start & end encapsulate the scope of days
    updateRange({ start, end }) {
      let date = start.date;
      let year = DateUtils.getYearFromDate(date);
      let month = DateUtils.getMonthFromDate(date);

      if(this.type == 'month') {
        this.hideEvents();
        this.typeToSwitchTo = 'day';
      } else if(this.type == 'day') {
        this.unhideEvents(year, month);
        this.typeToSwitchTo = 'month';
      }

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