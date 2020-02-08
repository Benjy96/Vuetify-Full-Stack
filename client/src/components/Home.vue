<template>
  <div>
    <h1>{{$getLanguageMsg('businesses')}}</h1>
    <v-divider></v-divider>
      <v-row>
        <v-col 
          v-for="(business, index) in businesses" 
          v-bind:item="business" v-bind:index="index" v-bind:key="business.id">
          
          <v-card max-width="550" :to="{ name: 'business', params: { id: business.id } }">
            <v-list-item>
              <v-list-item-avatar color="grey">
                <v-img :src="businessImages[index+1]"></v-img>
                <!-- <v-icon color="white">mdi-account-circle</v-icon> -->
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title style="text-align: left" class="headline">{{ business.firstname }} {{ business.surname }}</v-list-item-title>
                <v-list-item-subtitle  style="text-align: left">{{ business.occupation }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-img
              src="https://cdn.vuetifyjs.com/images/cards/mountain.jpg"
              height="194"></v-img>

            <v-card-text>
              {{ business.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  </div> <!-- v-container shrinks the width: adds gutter/padding to sides -->
</template>

<script>
import { db } from '../firebaseInit';
import firebase from 'firebase';

export default {
  name: 'home',
  data() {  //component state
    return {
      businesses: [], //will be filled by a request to the back end
      businessImages: Array(10).fill(""),
      //TODO: Remove hardcoding/put in pagination
      // businessImages: {}, //If you want to use an object, Vue will only be reactive if the key exists
      // - you would have to do something like v-if="loaded" and only display the businesses once
      //you've populated the keys
      err: '',
      text: ''
    }
  },
  mounted() {
    db.collection('businesses').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.businesses.push(
          {
            id: doc.id,
            ...doc.data()
          }
        );
      });

      window.console.log(this.businessImages);

      var storage = firebase.storage();

      for(var i in this.businesses) {
        if(this.businesses[i].image != undefined) {
          var gsRef = storage.refFromURL(this.businesses[i].image);
          gsRef.getDownloadURL().then(url => {
            // https://vuejs.org/v2/guide/list.html#Array-Change-Detection - Vue can't detect array[0] = x;
            this.businessImages.splice(i, 1, url);
          });
        }
      }
    }).catch((err) => {
      alert(err.message);
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.container {
  max-width: 800px;
  margin: 0 auto;
}

p.error {
  border: 1px solid #ff5b5f;
  background-color: #ffc5c1;
  padding: 10px;
  margin-bottom: 15px;
}

div.business {
  /* relative is offset from itself */
  /* absolute is offset from its container */
  position: relative;
  /* border: 1px solid #5bd658;
  background-color: #bcffb8; */
  padding: 10px 10px 30px 10px;
  margin-bottom: 15px;
}

div.created-at {
  position: absolute;
  top: 0;
  left: 0;
  padding: 5px 15px 5px 15px;
  background-color: darkgreen;
}
</style>
