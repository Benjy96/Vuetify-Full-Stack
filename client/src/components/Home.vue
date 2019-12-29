<template>
  <div>
    <h1>Businesses</h1>
    <v-divider></v-divider>

    <Calendar/>

    <!-- <v-container fluid>
      <v-row dense>
        <v-col
          v-for="(business, index) in businesses" 
          v-bind:item="business" v-bind:index="index" v-bind:key="business.id"
          :cols="6"
        >
          <v-card>
            <router-link :to="{ name: 'business', params: { project_id: business.id } }">
              <v-card-title v-text="business.name"></v-card-title>
            </router-link>
        
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>
    </v-container> -->
  </div>
</template>

<script>
//TODO: Move calendar to another child
import Calendar from './Calendar';

export default {
  name: 'home',
  components: {
    Calendar
  },
  data() {  //component state
    return {
      businesses: [], //will be filled by a request to the back end
      err: '',
      text: ''
    }
  },
  methods: {
/*     async createBusiness() {
      await BusinessService.insertbusiness(this.text);
      this.businesses = await BusinessService.getBusinesses();
      //for performance could not bother with this request but add manually, but then again, what if it didnt get added? 
    },
    async deleteBusiness(id) {
      try {
        await BusinessService.deleteBusiness(id);  //this refers to this component instance
        this.businesses = await BusinessService.getBusinesses();
      } catch(err) {
        this.err = err.message;
      }
    } */
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
