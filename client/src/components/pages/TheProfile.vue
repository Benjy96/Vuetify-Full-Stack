<template>
  <v-container>
    <v-row>
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
                    v-bind:rules="bioRules"
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
import ProfileCard from '../ProfileCard'
import BusinessService from '@/services/BusinessService';

export default {
  components: {
    ProfileCard
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
      occupation: '',
      profileImage: null,
      formProfileImage: null,
      imageRules: [
        value => !value || value.size < 1000000 || this.$getLanguageMsg('picTooLarge')
      ],
    }
  },
  methods: {
    saveProfileInfo() {
      if(this.$refs.profileManagementForm.validate()) {
          if(this.bio != "" && this.bio != null) {
              this.confirmSavedDialog = true; //TODO: Convert to generic modal I implemented?
              BusinessService.updateBio(this.id, this.bio);
          }

          if(this.occupation != "" && this.occupation != null) {
              this.confirmSavedDialog = true;
              BusinessService.updateOccupation(this.id, this.occupation);
          }

          if(this.profileImage != null) {
              this.confirmSavedDialog = true;
              BusinessService.setProfileImage(this.id, this.profileImage);
          }

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
