<template>
  <v-container>
    <v-row>
      <!-- Fill screen on smallest, otherwise allow 4 spaces for other column -->
      <v-col cols="12" md="8">
        <BaseCard title="Edit Profile" subtitle="Complete your profile">
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
        </BaseCard>
      </v-col>

      <!-- Profile Column -->
      <v-col cols="12" md="4">
        <BaseCard>
          <!-- Goes into BaseCard offset slot -->
          <v-avatar
            slot="offset"
            size="130"
            class="elevation-10"
          >
            <img v-if="profileImage != ''" :src="profileImage">
            <v-icon v-else x-large>mdi-account-circle</v-icon>
          </v-avatar>
        <!-- Goes into BaseCard default slot -->
          <!-- TODO: Turn this into a component -->
          <div id="profileDisplay">
            <h6 class="overline pt-2">{{occupation}}</h6>
            <h1 class="headline pt-1 pb-3">{{firstname}} {{surname}}</h1>
            <p class="font-weight-light">{{description}}</p>
          </div>
        </BaseCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BusinessService from '../../services/BusinessService';

export default {
  //
  created() {
    BusinessService.getProfileData().then((res) => { 
      // Profile Image
      BusinessService.getProfileImageDownloadURL(res.profileImage).then((url) => {
        this.profileImage = url;
      });

      this.firstname = res.firstname
      this.surname = res.surname
      this.description = res.description
      this.occupation = res.occupation
    });
  },
  data() {
    return {
      firstname: '',
      surname: '',
      description: '',
      occupation: '',
      profileImage: ''
    }
  }

}
</script>

<style scoped>

.v-text-field {
  font-weight: 100;
}

</style>
