<template>
    <v-card width="600px" class="mx-auto mt-5">
        <v-card-title><h1>{{$getLanguageMsg('register')}}</h1></v-card-title>

        <v-card-text>
            <v-form @submit.prevent="register" ref="form">
                <v-text-field v-model="firstname"
                required
                v-bind:rules="nameRules"
                :label="$getLanguageMsg('firstname')" prepend-icon="mdi-account-circle"
                />
                <v-text-field v-model="surname"
                required
                v-bind:rules="nameRules"
                :label="$getLanguageMsg('surname')" prepend-icon="mdi-account-circle"
                />
                <v-text-field v-model="email"
                required
                v-bind:rules="emailRules"
                :label="$getLanguageMsg('email')" prepend-icon="mdi-at"
                />
                <v-text-field v-model="occupation"
                required
                v-bind:rules="nameRules"
                :label="$getLanguageMsg('occupation')" prepend-icon="mdi-hammer"
                />
                <v-select
                required v-bind:rules="nameRules"
                v-model="bookingTravelType"
                :items="bookingTravelTypes"
                :label="$getLanguageMsg('bookingTravelType')" prepend-icon="mdi-train-car"
                ></v-select>
                <v-text-field v-if="bookingTravelType == 'businessTravels' || bookingTravelType == 'customerTravels'" 
                v-model="address"
                required v-bind:rules="nameRules"
                :label="$getLanguageMsg('address')" prepend-icon="mdi-city"
                />
                <v-text-field
                v-else-if="bookingTravelType == 'online'"
                v-model="onlineContactDetails"
                required v-bind:rules="nameRules"
                :label="$getLanguageMsg('onlineContactDetails')" prepend-icon="mdi-headset"
                />
                <!-- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept -->
                <v-file-input v-model="profilePicture"
                show-size
                accept=".jpg"
                v-bind:rules="imageRules"
                :label="$getLanguageMsg('profilePicture')"
                prepend-icon="mdi-camera"
                ></v-file-input>

                <v-text-field v-model="password"
                @click:append="showPassword = !showPassword"
                v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                v-bind:type="showPassword ? 'text' : 'password'"
                :label="$getLanguageMsg('password')" prepend-icon="mdi-lock" 
                />

                <input type="submit" hidden/>
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
import BusinessService from '../services/BusinessService';

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
            bookingTravelType: '',
            bookingTravelTypes: [
                {text: this.$getLanguageMsg('businessTravels'), value: 'businessTravels' },
                {text: this.$getLanguageMsg('customerTravels'), value: 'customerTravels' },
                {text: this.$getLanguageMsg('onlineBookings'), value: 'online' }
            ],
            address: null,
            onlineContactDetails: null,
            profilePicture: null,
            email: '',
            password: '',
            emailRules: [
                v => !!v || this.$getLanguageMsg('required'),
                v => /.+@.+/.test(v) || this.$getLanguageMsg('emailNotValid'),
            ],
            nameRules: [
                v => !!v || this.$getLanguageMsg('required')
            ],
            imageRules: [
                value => !value || value.size < 1000000 || this.$getLanguageMsg('picTooLarge')
            ]
        }
    },
    methods: {
        register() {
            if(!this.$refs.form.validate()) return;

            try {
                //TODO: Ensure safe - move to back-end so can't write from front-end or make sure authenticated for current user
                //OR: Split so the bookign details all on a central booking doc like regular availability atm?
                firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                //1. https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#createuserwithemailandpassword
                //2. https://firebase.google.com/docs/reference/js/firebase.auth.html#usercredential
                    .then((userCredential) => {
                        db.collection('businesses_private').doc(userCredential.user.uid).set({
                                email: this.email
                        });

                        db.collection('businesses').doc(userCredential.user.uid).set({
                            firstname: this.firstname,
                            surname: this.surname,
                            occupation: this.occupation,
                            regularAvailability: {
                                Monday: [{from: "09:00", to: "17:00"}],
                                Tuesday: [{from: "09:00", to: "17:00"}],
                                Wednesday: [{from: "09:00", to: "17:00"}],
                                Thursday: [{from: "09:00", to: "17:00"}],
                                Friday: [{from: "09:00", to: "17:00"}]
                            },
                            bookingDetails: {
                                travelType: this.bookingTravelType,
                                address: this.address,
                                onlineContactDetails: this.onlineContactDetails
                            },
                            locale: this.$getLocale()
                        }).then(() => {
                            if(this.profilePicture != null) {
                                BusinessService.setProfileImage(userCredential.user.uid, this.profilePicture);
                            }
                        });
                    }, err => {
                        this.displayErrorModal(err.message);
                    });
            } catch(e) {
                this.displayErrorModal(e);
            }
        },
        displayErrorModal(message) {
            this.errorModalText = message;
            this.errorModalDialog = true;
        }
    }
}
</script>