<template>
  <div>
    <h1>Businesses</h1>
    <v-divider></v-divider>

    <v-container fluid>
      <v-row dense>
        <v-col
          v-for="(business, index) in businesses" 
          v-bind:item="business" v-bind:index="index" v-bind:key="business"
          :cols="6"
        >
          <v-card>
            <router-link :to="{ name: 'business', params: { id: business } }">
              <v-card-title v-text="business"></v-card-title>
            </router-link>

          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div> <!-- v-container shrinks the width: adds gutter/padding to sides -->
</template>

<script>
import { db } from '../firebaseInit';

export default {
  name: 'home',
  data() {  //component state
    return {
      businesses: [], //will be filled by a request to the back end
      err: '',
      text: ''
    }
  },
  created() {
    db.collection('businesses').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.businesses.push(doc.id);
      });
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
