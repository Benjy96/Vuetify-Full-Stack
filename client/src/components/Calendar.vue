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
            <v-form @submit.prevent="addEvent">
              <p>Book an appointment</p>
              <v-btn type="submit" color="primary" @click.stop="dialog = false">
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

  :event-color="getEventColor"
  :event-margin-bottom="3"
  :now="today"
  :type="type"
  @click:event="showEvent"
  @click:more="viewDay"
  @click:date="viewDay"
  @click:day="viewDay"
  @change="updateRange"
  >
  <!-- TODO: Add logic method to the @click so u can't click a day if it's unavailable -->

  <template v-slot:day="day">
    <v-sheet v-if="isAvailableDay(day)" height="100%" color="green">
    </v-sheet>
  </template>

  <template v-slot:interval="object">
    <!-- TODO: Check if event exists for this element -->
    <v-btn v-if="availableAtTime(object) == true"
    @click="openDialog(object)" style="height: 100%; width: 100%;display: block;background-color:green;"
    ></v-btn>
  </template>

  </v-calendar>
  
  <!-- ***** END CALENDAR ***** -->
  
  <v-menu
  v-model="selectedOpen"
  :close-on-content-click="false"
  :activator="selectedElement"
  offset-x
  >
  <v-card color="grey lighten-4" :width="350" flat>
    <v-toolbar :color="selectedEvent.color" dark>
      <v-btn @click="deleteEvent(selectedEvent.id)" icon>
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
      <div class="flex-grow-1"></div>
    </v-toolbar>

    <v-card-text>
      <form v-if="currentlyEditing !== selectedEvent.id">
        {{ selectedEvent.details }}
      </form>
      <form v-else>
        <textarea-autosize
        v-model="selectedEvent.details"
        type="text"
        style="width: 100%"
        :min-height="100"
        placeholder="add note">
      </textarea-autosize>
    </form>
  </v-card-text>

  <v-card-actions>
    <v-btn text color="secondary" @click="selectedOpen = false">
      close
    </v-btn>
    <v-btn v-if="currentlyEditing !== selectedEvent.id" text @click.prevent="editEvent(selectedEvent)">
      edit
    </v-btn>
    <v-btn text v-else type="submit" @click.prevent="updateEvent(selectedEvent)">
      Save
    </v-btn>
  </v-card-actions>
</v-card>
</v-menu>
</v-sheet>
</v-col>
</v-row>
</template>

<script>
import { db } from '../firebaseInit';
import BookingService from './BookingService';
import {DateUtils} from './DateUtils';

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
    name: null,
    details: null,
    start: null,
    end: null,
    color: '#1976D2', // default event color
    currentlyEditing: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: {},
    // events: [],
    dialog: false,
    dialogDate: false,
    //Ben - Adding for unique key
    addEventKey: null,
    bookedDays: {},
    unavailableTimeRanges: {}
  }),
  created () {
    this.getBookedDays()
    this.getBookings()
    this.getUnavailableRanges()
  },
  computed: {
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
    async getBookedDays() {
      let snapshot = await db.collection(`businesses/${this.id}/unavailable_days`).get()
      let bookedDays = {}
      snapshot.forEach(doc => {
        bookedDays[doc.id] = true
      })
      this.bookedDays = bookedDays;
    },
    isAvailableDay(day){
      if(this.bookedDays[day.date] == true) {
        return false;
      } else{
        return true;
      }
    },
    openDialog(dateObject) {
      this.dialog = true;
      this.addEventKey = `${dateObject.date}${dateObject.time}`;
    },
    availableAtTime(dateObject) {
      //TODO: once per day

      // Standard Availability
      if(this.unavailableTimeRanges[dateObject.weekday] != null) {
        // Check if hour in range

        //TODO: wasn't returning from forEach..why? I guess it was returning the for each method itself
        for(var i = 0; i < this.unavailableTimeRanges[dateObject.weekday].length; i++){
          //1. Split string
          //2. Convert to number
          //3. Check larger than left, check lower than right
            //If true, return false
          if(DateUtils.timeWithinRange(dateObject.hour, dateObject.minute, this.unavailableTimeRanges[dateObject.weekday][i])){
            return false;
          }
        }
      }

      // Special / Booking Availability
      if(this.isAvailableDay(dateObject) == false) {
        return false;
      }

      let key = dateObject.date + dateObject.time
      if(this.events[key] != null){
        return false;
      } else {
        return true;
      }
    },
    test(obj) {
      alert(JSON.stringify(obj));
    },
    async getBookings () {
      //TODO: Realtime DB not priced on read/writes - may be better for retrieving these
      let snapshot = await db.collection(`businesses/${this.id}/bookings`).get()
      let events = {};
      snapshot.forEach(doc => {
        let appData = doc.data()
        events[doc.id] = appData
      })
      this.events = events;
    },
    async getUnavailableRanges() {
      for(var i = 0; i < 8; i++){
        if(this.unavailableTimeRanges[i] == null) {
          this.unavailableTimeRanges[i] = await BookingService.getUnavailableTimeRanges(this.id, i);
        }
      }
    },
    setDialogDate({ date }) {
      this.dialogDate = true
      this.focus = date
    },
    viewDay ({ date }) {
      this.focus = date
      this.type = 'day'
    },
    getEventColor (event) {
      return event.color
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
    async addEvent () {
      await db.collection(`businesses/${this.id}/bookings`).doc(this.addEventKey).set({});
      /* What needs to happen when we try to make a booking?

        1. Add to firebase collection
        2. Mark the booking as no longer isAvailableDay
            Q: How to store and retrieve "taken" booking timeslots? 
            
                Collection for each day populated with bookings

                  When view month, retrieve day availabilities - like filled slot example on Vuetify calendar docs, an array
                  When click day, retrieve day bookings
                    Put booking into interval events

                OR:

                  Just a big events array

                  How to make a button un-clickable if there's an existing event?
                    How was it we populated the days with events, again?
                      events prop on calendar
                        each event will be passed in

                        button
                        unless event
                        then unclickable button

                          Could have some sort of dictionary with the date to match?

                            E.g., v-if="!dict[key]"

      */
    },
    editEvent () {
      // this.currentlyEditing = ev.id
    },
    async updateEvent () {
/*       await db.collection('calEvent').doc(this.currentlyEditing).update({
        details: ev.details
      })
      this.selectedOpen = false,
      this.currentlyEditing = null */
    },
    async deleteEvent () {
/*       await db.collection("calEvent").doc(ev).delete()
      this.selectedOpen = false,
      this.getBookings() */
    },
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        setTimeout(() => this.selectedOpen = true, 10)
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)
      } else {
        open()
      }
      nativeEvent.stopPropagation()
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
