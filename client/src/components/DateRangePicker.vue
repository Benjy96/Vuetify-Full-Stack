<template>
  <v-row>
    <v-col cols="11" sm="5">
      <v-dialog
        ref="fromTimeDialog"
        v-model="fromTimeDialogToggle"
        :return-value.sync="fromTime"
        persistent
        width="290px"
      >
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

    <v-spacer></v-spacer>

    <v-col cols="11" sm="5">
      <v-dialog
        ref="toTimeDialog"
        v-model="toTimeDialogToggle"
        :return-value.sync="time"
        persistent
        width="290px"
      >
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
          :min="fromTime"
        >
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="toTimeDialogToggle = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.toTimeDialog.save(toTime)">OK</v-btn>
        </v-time-picker>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
  export default {
    data () {
      return {
        fromTime: null,
        toTime: null,
        fromTimeDialogToggle: false,
        toTimeDialogToggle: false,
      }
    },
  }
</script>