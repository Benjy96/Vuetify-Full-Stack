<template>
  <v-container
    fill-height
    fluid
    grid-list-xl>
    <v-row>
      <v-col xs="12" md="8">
        <v-card>
          <v-form >
            <v-container py-0>
              <v-layout wrap>
                <v-flex
                  xs12
                  md4
                >
                  <v-text-field
                    label="Company (disabled)"
                    disabled/>
                </v-flex>
                <v-flex
                  xs12
                  md4
                >
                  <v-text-field
                    label="User Name"
                  />
                </v-flex>
                <v-flex
                  xs12
                  md4
                >
                  <v-text-field label="Email Address"/>
                </v-flex>
                <v-flex
                  xs12
                  md6
                >
                  <v-text-field label="First Name"/>
                </v-flex>
                <v-flex
                  xs12
                  md6
                >
                  <v-text-field label="Last Name"/>
                </v-flex>
                <v-flex
                  xs12
                  md12
                >
                  <v-text-field
                    label="Adress"
                    />
                </v-flex>
                <v-flex
                  xs12
                  md4>
                  <v-text-field
                    label="City"
                    />
                </v-flex>
                <v-flex
                  xs12
                  md4>
                  <v-text-field
                    label="Country"
                    />
                </v-flex>
                <v-flex
                  xs12
                  md4>
                  <v-text-field label="Postal Code"/>
                </v-flex>
                <v-flex xs12>
                  <v-textarea
                    
                    label="About Me"
                    value="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                  />
                </v-flex>
                <v-flex
                  xs12
                  text-xs-right
                >
                  <v-btn
                    class="mx-0 font-weight-light"
                    color="success"
                  >
                    Update Profile
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card>
      </v-col>
      <v-col xs="12" md="4">
        <v-card class="v-card-profile">
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
