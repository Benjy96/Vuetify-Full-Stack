<template>
    <v-app>
        <v-card width="400px" class="mx-auto mt-5">
            <v-card-title><h1>Login</h1></v-card-title>

            <v-card-text>
                <v-form>
                    <v-text-field v-model="email"
                    required
                    v-bind:rules="emailRules"
                    label="email" prepend-icon="mdi-account-circle"
                    />
                    <v-text-field v-model="password"
                    @click:append="showPassword = !showPassword"
                    v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    v-bind:type="showPassword ? 'text' : 'password'"
                    label="password" prepend-icon="mdi-lock" 
                    />
                </v-form>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="success" @click="login">Login</v-btn>
            </v-card-actions>

        </v-card>
    </v-app>
</template>

<script>
import firebase from 'firebase';

export default {
    name: 'login',
    data() {
        return {
            showPassword: false,
            email: '',
            password: '',
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
        }
    },
    methods: {
        login(event) {  //event is a MouseEvent - passed in by Javascript
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(user => {
                    alert("You are logged in as: " + user.email);
                    this.$router.go({path: this.$router.path});
                }, err => {
                    alert(err.message);
                }
            );
            event.preventDefault();
        }
    }
}
</script>
