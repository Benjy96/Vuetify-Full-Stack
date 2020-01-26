<template>
    <v-card width="400px" class="mx-auto mt-5">
        <v-card-title><h1>Register</h1></v-card-title>

        <v-card-text>
            <v-form>
                <v-text-field v-model="displayName"
                required
                v-bind:rules="nameRules"
                label="name" prepend-icon="mdi-account-circle"
                @keyup.enter="register"
                />
                <v-text-field v-model="email"
                required
                v-bind:rules="emailRules"
                label="email" prepend-icon="mdi-at"
                @keyup.enter="register"
                />
                <v-text-field v-model="password"
                @click:append="showPassword = !showPassword"
                v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                v-bind:type="showPassword ? 'text' : 'password'"
                label="password" prepend-icon="mdi-lock" 
                @keyup.enter="register"
                />
            </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="register">Register</v-btn>
        </v-card-actions>

    </v-card>
</template>

<script>
import firebase from 'firebase';
import { db } from '../firebaseInit';

//TODO: Could I combine the login/register component? Make em re-usable? The sign in form, even
export default {
    name: 'register',
    data() {
        return {
            showPassword: false,
            displayName: '',
            email: '',
            password: '',
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ],
            nameRules: [
                v => !!v || 'Name is required'
            ]
        }
    },
    created() {
        alert('hi');
    },
    methods: {
        register() {
            try{ 
                firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                //1. https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#createuserwithemailandpassword
                //2. https://firebase.google.com/docs/reference/js/firebase.auth.html#usercredential
                    .then((userCredential) => {
                        window.console.log('hi');
                        db.collection('businesses').doc(userCredential.user.uid).set({
                            displayName: this.displayName,
                            email: this.email
                        }).then(() => {
                            db.collection(`/businesses/${userCredential.user.uid}/availability`).doc('regular').set({
                                Monday: [{from: "09:00", to: "17:00"}],
                                Tuesday: [{from: "09:00", to: "17:00"}],
                                Wednesday: [{from: "09:00", to: "17:00"}],
                                Thursday: [{from: "09:00", to: "17:00"}],
                                Friday: [{from: "09:00", to: "17:00"}]
                            });
                        });
                    }, err => {
                        window.console.log(err.message);
                    });
            }catch(e) {
                window.console.log(e);
            }
        }
    }
}
</script>