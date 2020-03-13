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
      <v-col cols="12">
          <BaseCard headerElevation="6" title="Holiday Bookings">
            <AdminBookings/>
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
                <v-col cols="12">
                  <v-textarea
                    :label="$getLanguageMsg('bioFormText')"
                    prepend-icon="mdi-account-details"
                    v-model="description"
                    v-bind:rules="descriptionRules"
                    :counter="descriptionLimit"
                  />
                </v-col>
                <v-col cols="12">
                  <v-btn
                    @click="saveProfileInfo"
                    class="mx-0"
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

import BusinessService from '@/services/BusinessService';

import ProfileCard from '@/components/ProfileCard'

export default {
  components: {
    ProfileCard,
    WorkingHours,
    AdminBookings
  },
  created() {
    this.id = BusinessService.getUserId();

    BusinessService.getProfileData().then((res) => { 
      // Profile Image
      BusinessService.getProfileImageDownloadURL(res.image).then((url) => {
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
      id: null,
      firstname: '',
      surname: '',
      description: '',
      descriptionRules: [
        val => !val || val.length < this.descriptionLimit || this.$getLanguageMsg('invalidBioFormText')
      ],
      descriptionLimit: 150,
      occupation: '',
      occupationRules: [
        val => !val || val.length <= this.occupationLimit || this.$getLanguageMsg('tooLong')
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
    saveProfileInfo() {
      //TODO: Implement the new fields - use booking forms as reference
      if(this.$refs.profileManagementForm.validate()) {
          BusinessService.updateProfile(this.id, this.firstname, this.surname, this.description, this.occupation);

          if(this.formProfileImage != null) {
              BusinessService.setProfileImage(this.id, this.formProfileImage);
          }

          this.$emit("open-generic-dialog", [this.$getLanguageMsg("Information"), this.$getLanguageMsg('preferenceSaved')])
      }
    }
  },
  watch: {
    formProfileImage: function(file) {
      let vueInstance = this;
      
      let reader = new FileReader();
      reader.onload = function(event) {
        // window.console.log(this);
        // capturing vueInstance above as in this method, this refers to the FileReader
        // In an object method, this refers to the "owner" of the method.
        vueInstance.profileImage = event.target.result;
      }
      reader.readAsDataURL(file)
    }
  }
}
</script>