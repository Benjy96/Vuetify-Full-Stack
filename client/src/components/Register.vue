<template>
    <v-card width="400px" class="mx-auto mt-5">
        <v-card-title><h1>{{$getLanguageMsg('register')}}</h1></v-card-title>

        <v-card-text>
            <v-form>
                <v-text-field v-model="firstname"
                required
                v-bind:rules="nameRules"
                :label="$getLanguageMsg('firstname')" prepend-icon="mdi-account-circle"
                @keyup.enter="register"
                />
                <v-text-field v-model="surname"
                required
                v-bind:rules="nameRules"
                :label="$getLanguageMsg('surname')" prepend-icon="mdi-account-circle"
                @keyup.enter="register"
                />
                <v-text-field v-model="occupation"
                required
                v-bind:rules="nameRules"
                :label="$getLanguageMsg('occupation')" prepend-icon="mdi-hammer"
                @keyup.enter="register"
                />
                <v-text-field v-model="email"
                required
                v-bind:rules="emailRules"
                :label="$getLanguageMsg('email')" prepend-icon="mdi-at"
                @keyup.enter="register"
                />
                <v-text-field v-model="password"
                @click:append="showPassword = !showPassword"
                v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                v-bind:type="showPassword ? 'text' : 'password'"
                :label="$getLanguageMsg('password')" prepend-icon="mdi-lock" 
                @keyup.enter="register"
                />
            </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="register">{{$getLanguageMsg('register')}}</v-btn>
        </v-card-actions>

        <v-dialog v-model="errorModalDialog" max-width="400">
            <v-card>
            <v-container>
                <p>{{ errorModalText }}</p>
                <v-btn type="submit" color="error" 
                @click="errorModalDialog = !errorModalDialog">
                {{$getLanguageMsg('ok')}}
                </v-btn>
            </v-container>
            </v-card>
        </v-dialog>

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
            errorModalDialog: false,
            errorModalText: '',
            showPassword: false,
            firstname: '',
            surname: '',
            occupation: '',
            email: '',
            password: '',
            emailRules: [
                v => !!v || this.$getLanguageMsg('required'),
                v => /.+@.+/.test(v) || this.$getLanguageMsg('emailNotValid'),
            ],
            nameRules: [
                v => !!v || this.$getLanguageMsg('required')
            ]
        }
    },
    methods: {
        register() {
            try{ 
                firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                //1. https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#createuserwithemailandpassword
                //2. https://firebase.google.com/docs/reference/js/firebase.auth.html#usercredential
                    .then((userCredential) => {
                        db.collection('businesses').doc(userCredential.user.uid).set({
                            firstname: this.firstname,
                            surname: this.surname,
                            occupation: this.occupation,
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
                        this.displayErrorModal(err.message);
                    });
            } catch(e) {
                window.console.log(e);
            }
        },
        displayErrorModal(message) {
            this.errorModalText = message;
            this.errorModalDialog = true;
        }
    }
}
</script>