<template>
  <v-container>
    <v-row>
      <!-- Fill screen on smallest, otherwise allow 4 spaces for other column -->
      <v-col cols="12" md="8">
        <v-card>
          <v-form>
            <v-container>
              <v-row class="mx-5">
                <v-col cols="12" md="4">
                  <v-text-field label="Company (disabled)" disabled/>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field label="User Name"/>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field label="Email Address"/>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="First Name"/>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="Last Name"/>
                </v-col>
                <v-col cols="12" md="12">
                  <v-text-field label="Adress"/>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field label="City"/>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field label="Country"/>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field label="Postal Code"/>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    label="About Me"
                    value="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                  />
                </v-col>
                <v-col cols="12" class="text-xs-right">
                  <v-btn
                    class="mx-0 font-weight-light"
                    color="success"
                  >
                    Update Profile
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card>
      </v-col>

      <!-- Profile Column -->
      <v-col cols="12" md="4">
        <v-card>
          <v-avatar
            slot="offset"
            class="mx-auto d-block"
            size="130"
          >
            <img
              src="https://demos.creative-tim.com/vue-material-dashboard/img/marc.aba54d65.jpg"
            >
          </v-avatar>
          <v-card-text>
            <h1>Alec Thompson</h1>
            <p class="font-weight-light">Description description description description description description...</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  //
}
</script>

<style scoped>

.v-text-field {
  font-weight: 100;
}

</style>
