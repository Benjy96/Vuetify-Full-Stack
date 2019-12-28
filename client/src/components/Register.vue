<template>
    <v-app>
        <v-card width="400px" class="mx-auto mt-5">
            <v-card-title><h1>Register</h1></v-card-title>

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
                <v-btn color="success" @click="register">Register</v-btn>
            </v-card-actions>

        </v-card>
    </v-app>
</template>

<script>
import firebase from 'firebase';
import ResourceService from '../ResourceService';

//TODO: Could I combine the login/register component? Make em re-usable? The sign in form, even
export default {
    name: 'register',
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
        register(event) {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                .then(() => {
                    ResourceService.createTKResource(
                        {
                            "email": this.email, 
                            "timezone": "Europe/Belfast", 
                            "name": this.email, 
                            "password": this.password
                        }
                    );
                    this.$router.go({path: this.$router.path});
                }, err => {
                    alert(err.message);
                });
            event.preventDefault();
        }
    }
}
</script>