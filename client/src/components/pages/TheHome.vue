<template>
  <div>
    <v-row>
      <v-col align="center">
        <v-text-field
        v-model="searchText"
        :label="$getLanguageMsg('searchBarString')"
        class="ma-6"
        style="max-width: 20%;"
        hide-details>
          <template v-slot:append>
              <v-icon>mdi-magnify</v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-divider class="mb-12"></v-divider>

      <v-row id="businessesDisplay" >
        <v-col cols="12" sm="6" md="4" 
          v-for="(business, index) in filteredBusinesses" 
          v-bind:item="business" v-bind:index="index" v-bind:key="business.id">

          <v-hover v-slot:default="{ hover }">
            <ProfileCard
              @click.native="goTo({ name: 'business', params: { id: business.id } })"
              :class="hover ? 'elevation-6' : ''" class="clickable"
              :firstname="business.firstname"
              :surname="business.surname"
              :occupation="business.occupation"
              :description="business.description"
              :profileImage="businessImages[business.id]"
            />
          </v-hover>
        
        </v-col>
      </v-row>
  </div> <!-- v-container shrinks the width: adds gutter/padding to sides -->
</template>

<script>
import ProfileCard from '../ProfileCard';
import BusinessService from '@/services/BusinessService';
import { db } from '../../firebaseInit';

export default {
  components: {
    ProfileCard,
  },
  name: 'home',
  created() {
    db.collection('businesses').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.businesses.push(
          {
            id: doc.id,
            ...doc.data().profileData
          }
        );
      });

      //Note: this.$set makes the v-if reactive - I tested this with timeout and the acc icon still disappears
      this.getBusinessImages();
    }).catch((err) => {
      alert(err.message);
    });
  },
  data() {  //component state
    return {
      businesses: [], //will be filled by a request to the back end
      businessImages: {},
      //TODO: put in pagination
      searchText: ''
    }
  },
  computed: {
    //TODO: Improve this simple/"exact" search matching
    filteredBusinesses() {
      return this.businesses.filter(business => {
        if(this.searchText == '') return true;
        let nameString = (business.firstname + ' ' + business.surname).toLowerCase();
        let searchText = this.searchText.toLowerCase();

        if(nameString.includes(searchText)) {
          return true;
        }

        if(business.occupation.toLowerCase().includes(searchText)) {
          return true;
        }
      });
    }
  },
  methods: {
    async getBusinessImages() {
      for(let i in this.businesses) {
        if(this.businesses[i].image != null) {
          BusinessService.getProfileImageDownloadURL(this.businesses[i].image).then((downloadURL) => {
            this.$set(this.businessImages, this.businesses[i].id, downloadURL);
          });
        } else {
          this.$set(this.businessImages, this.businesses[i].id, '');
        }
      }
    },
    goTo(to) {
      this.$router.push(to);
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.container {
  max-width: 800px;
  margin: 0 auto;
}

.clickable {
  cursor: pointer;
}
</style>
