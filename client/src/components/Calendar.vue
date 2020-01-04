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
  :now="today"
  :type="type"
  @click:more="viewDay"
  @click:date="viewDay"
  @click:day="viewDay"
  @change="updateRange"
  >
  <!-- TODO: Add logic method to the @click so u can't click a day if it's unavailable -->
  <template v-slot:day="{ day }">
    <v-sheet v-if="dayAvailable(day)" height="100%" color="green">
    </v-sheet>
  </template>

<!-- TODO: Check if event exists for this element -->
  <!-- <template v-slot:interval="object">
    <v-btn v-if="1"
    @click="openDialog(object)" style="height: 100%; width: 100%;display: block;background-color:green;"
    ></v-btn>
  </template> -->

  </v-calendar>
  
  <!-- ***** END CALENDAR ***** -->
</v-sheet>
</v-col>
</v-row>
</template>

<script>
// import { db } from '../firebaseInit';
// import BookingService from '../services/BookingService';
import CalendarService from '../services/CalendarService';

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
    currentlyEditing: null,
    dialog: false,
    dialogDate: false,
    unavailableDays: null
  }),
  created () {
    //Month Viewed Upon Load
    //1. Check unavailable days meta-data
    //this.getUnavailableDays(); //TODO: What if you click next? The unavailable_days obj on user cal should be multidimensional.
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
    async getUnavailableDays() {
      this.unavailableDays = await CalendarService.getUnavailableDays(this.id, this.today.substr(0, 4), this.today.substr(5, 2));
    },
    dayAvailable(day) {
      //TODO: Just specify month straight away as it seems to be calling more than this month
      if(day < 10){
        day = "0"+day;
      }
      //TODO: Specify month because there is pagination with prev() / next()
      //TODO: 2/3 are being set for all months at the beginning? How many times is dayAvailable getting called on load?
      if(this.unavailableDays == null){
        this.getUnavailableDays().then(() => {
          if(this.unavailableDays != null) this.dayAvailable(day);
        })
      }else{
        //TODO: add a month layer to the unavailableDays (if it's calling dayAvailable for every day of year?)
        if(day in this.unavailableDays) {
          return false;
        } else {
          return true;
        }
      }


    },
    openDialog(dateObject) {
      this.dialog = true;
      this.addEventKey = `${dateObject.date}${dateObject.time}`;
    },
    setDialogDate({ date }) {
      this.dialogDate = true
      this.focus = date
    },
    viewDay ({ date }) {
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