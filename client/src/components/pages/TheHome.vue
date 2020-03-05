<template>
  <div>
    <h1 class="display-1 ma-4">{{$getLanguageMsg('businesses')}}</h1>
    <v-divider class="mb-7"></v-divider>
      <v-row id="businessesDisplay">
        <v-col cols="12" sm="6" md="4"
          v-for="(business, index) in businesses" 
          v-bind:item="business" v-bind:index="index" v-bind:key="business.id">

          <BaseCard>

            <v-avatar
              color="warning"
              slot="offset"
              size="130"
              class="elevation-6 clickable"
              @click="goTo({ name: 'business', params: { id: business.id } })"
            >
              <v-img v-if="businessImages[business.id] != ''" 
                    :src="businessImages[business.id]"></v-img>

              <v-icon v-else x-large>mdi-account-circle</v-icon>
            </v-avatar>
            
            <div>
              <!-- Goes into BaseCard default slot -->
              <div id="profileDisplay">
                <h6 class="overline pt-2">{{business.occupation}}</h6>
                <h1 class="headline pt-1 pb-3">{{business.firstname}} {{business.surname}}</h1>
                <p class="font-weight-light">{{business.description}}</p>
              </div>
            </div>
          
          </BaseCard>
        
        </v-col>
      </v-row>
  </div> <!-- v-container shrinks the width: adds gutter/padding to sides -->
</template>

<script>
import { db } from '../../firebaseInit';
import firebase from 'firebase';

export default {
  name: 'home',
  data() {  //component state
    return {
      businesses: [], //will be filled by a request to the back end
      businessImages: {},
      //TODO: put in pagination
      // businessImages: {}, //If you want to use an object, Vue will only be reactive if the key exists
      // - you would have to do something like v-if="loaded" and only display the businesses once
      //you've populated the keys
      err: '',
      text: ''
    }
  },
  created() {
    db.collection('businesses').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.businesses.push(
          {
            id: doc.id,
            ...doc.data()
          }
        );
      });

      //Note: this.$set makes the v-if reactive - I tested this with timeout and the acc icon still disappears
      this.getBusinessImages();
    }).catch((err) => {
      alert(err.message);
    });
  },
  methods: {
    async getBusinessImages() {
      var storage = firebase.storage();

      for(var i in this.businesses) {
        if(this.businesses[i].profileImage != null) {
          var gsRef = storage.refFromURL(this.businesses[i].profileImage);
          let downloadURL = await gsRef.getDownloadURL();

          // https://vuejs.org/v2/guide/list.html#Array-Change-Detection - Vue can't detect array[0] = x;
          this.$set(this.businessImages, this.businesses[i].id, downloadURL);
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
