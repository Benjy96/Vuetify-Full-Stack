<template>
    <v-card width="400px" class="mx-auto mt-5">
        <v-card-title><h1>{{$getLanguageMsg('Login')}}</h1></v-card-title>

        <v-card-text>
            <v-form ref="form" @submit.prevent="login">
                <v-text-field v-model="email"
                required
                v-bind:rules="emailRules"
                :label="$getLanguageMsg('e-mail')" prepend-icon="mdi-account-circle"
                />
                <v-text-field v-model="password"
                @click:append="showPassword = !showPassword"
                v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                v-bind:type="showPassword ? 'text' : 'password'"
                :label="$getLanguageMsg('Password')" prepend-icon="mdi-lock" 
                />

                <input type="submit" hidden/>
            </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="login">{{$getLanguageMsg('Login')}}</v-btn>
        </v-card-actions>

    </v-card>
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
                v => !!v || this.$getLanguageMsg('Required'),
                v => /.+@.+/.test(v) || this.$getLanguageMsg('emailNotValid'),
            ]
        }
    },
    methods: {
        login() {  //event is a MouseEvent - passed in by Javascript
            if(!this.$refs.form.validate()) return;

            firebase.auth().signInWithEmailAndPassword(this.email, this.password);
        }
    }
}
</script>
