<template>
  <v-container>
      <!-- Working Hours Box -->
      <v-row class="mb-6">
        <v-col cols="12">
            <BaseCard headerElevation="6" :title="$getLanguageMsg('workingHours')">
                <WorkingHours></WorkingHours>
            </BaseCard>
        </v-col>
      </v-row>

    <!-- Holiday Management -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
          <BaseCard title="Holiday Bookings">
            <AdminBookings/>
          </BaseCard>
      </v-col>

      <v-col cols="12" md="4">
          <BaseCard title="Add a holiday">
              <AdminBookingPicker v-on:saved-admin-booking="createAdminBooking($event)"/>
          </BaseCard>
      </v-col>
    </v-row>

    <!-- Edit Profile Box -->
    <v-row class="mb-6">
      <!-- Fill screen on smallest, otherwise allow 4 spaces for other column -->
      <v-col cols="12" md="8">
        <BaseCard title="Edit Profile" subtitle="Complete your profile">
          <v-form ref="profileManagementForm">
            <v-container>
              <v-row class="mx-5">
                <v-col cols="12" md="6">
                  <v-text-field :label="$getLanguageMsg('First Name')" v-model="firstname"/>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field :label="$getLanguageMsg('Surname')" v-model="surname"/>
                </v-col>
                <v-col cols="12" md="5">
                  <v-file-input v-model="formProfileImage"
                  show-size
                  accept=".jpg"
                  v-bind:rules="imageRules"
                  :label="$getLanguageMsg('profilePicture')"
                  prepend-icon="mdi-camera"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="occupation"
                    :label="$getLanguageMsg('occupation')" 
                    prepend-icon="mdi-hammer"
                  />
                </v-col>
                <!-- <v-col cols="12" md="12">
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
                </v-col> -->
                <v-col cols="12">
                  <v-textarea
                    :label="$getLanguageMsg('bioFormText')"
                    prepend-icon="mdi-account-details"
                    v-model="description"
                    v-bind:rules="descriptionRules"
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
        <ProfileCard
          :firstname="firstname"
          :surname="surname"
          :occupation="occupation"
          :description="description"
          :profileImage="profileImage"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import WorkingHours from '@/components/administration/WorkingHours';

import AdminBookings from '@/components/administration/AdminBookings';
import AdminBookingPicker from '@/components/administration/AdminBookingPicker';

import BusinessService from '@/services/BusinessService';

import ProfileCard from '@/components/ProfileCard'

export default {
  components: {
    ProfileCard,
    WorkingHours,
    AdminBookings,
    AdminBookingPicker  //TODO: Change to modal & put in AdminBookigns components
  },
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
      descriptionRules: [
        val => val.length < this.descriptionLimit || this.$getLanguageMsg('invalidBioFormText')
      ],
      descriptionLimit: 150,
      occupation: '',
      occupationRules: [
        val => val.length <= this.occupationLimit || this.$getLanguageMsg('tooLong')
      ],
      occupationLimit: 25,
      profileImage: null,
      formProfileImage: null,
      imageRules: [
        value => !value || value.size < 1000000 || this.$getLanguageMsg('picTooLarge')
      ],
    }
  },
  methods: {
    createAdminBooking(adminBooking) {
      this.adminBookings.push(adminBooking);
      BusinessService.createAdminBooking(this.id, adminBooking);
    },
    saveProfileInfo() {
      let saved = false;

      if(this.$refs.profileManagementForm.validate()) {
          if(this.description != "" && this.description != null) {
              saved = true; //TODO: Convert to generic modal I implemented?
              BusinessService.updateBio(this.id, this.description);
          }

          if(this.occupation != "" && this.occupation != null) {
              saved = true;
              BusinessService.updateOccupation(this.id, this.occupation);
          }

          if(this.formProfileImage != null) {
              saved = true;
              BusinessService.setProfileImage(this.id, this.profileImage);
          }

          if(saved) this.$emit("open-generic-dialog", [this.$getLanguageMsg("Information"), this.$getLanguageMsg('preferenceSaved')])

          this.$refs.profileManagementForm.reset();
      }
    }
  }

}
</script>

<style scoped>

.v-text-field {
  font-weight: 100;
}

</style>
