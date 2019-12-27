<template>
  <div class="container">



    
    <div class="create-post">
      <!-- for="" Specifies which form element a label is bound to: it will be treated like clicking on the associated input element -->
      <label for="create-post">Say something interesting...</label>
      <!-- We are binding the vue text instance variable to the input (2 way binding with v-model) -->
      <input type="text" class="create-post" v-model="text" placeholder="Create a post">
      <button v-on:click="createPost">Post!</button>
    </div>

    <h1>Latest Posts</h1>
    <v-divider></v-divider>
    <p class="error" v-if="err">{{err}}</p>
    <div class="posts-container">
      <!-- Index is a vue specific second, optional argument -->
      <v-card class="post" v-for="(post, index) in posts" 
        v-bind:item="post" v-bind:index="index" v-bind:key="post._id"
        v-on:dblclick="deletePost(post.id)"
        > 
        <!-- dblclick is a DOM event: https://www.w3schools.com/jsref/event_ondblclick.asp -->

        <!-- Standard JS Date class methods -->
        <!-- Backticks `` are template literals and can contain placeholders -->
        <v-card-text>
          <p class="display-1">{{ post.text }}</p>
          <p>{{ `${post.createdAt}` }}</p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import PostService from '../PostService.js';

export default {
  name: 'PostComponent',
  data() {  //component state
    return {
      posts: [], //will be filled by a request to the back end
      err: '',
      text: ''
    }
  },
  methods: {
    async createPost() {
      await PostService.insertPost(this.text);
      this.posts = await PostService.getPosts();
      //for performance could not bother with this request but add manually, but then again, what if it didnt get added? 
    },
    async deletePost(id) {
      try {
        await PostService.deletePost(id);  //this refers to this component instance
        this.posts = await PostService.getPosts();
      } catch(err) {
        this.err = err.message;
      }
    }
  },
  async created() { //run when component is initialized
    try {
      this.posts = await PostService.getPosts();  //this refers to this component instance
    } catch(err) {
      this.err = err.message;
    }
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

div.post {
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
