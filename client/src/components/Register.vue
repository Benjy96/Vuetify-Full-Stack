<template>
    <v-app>
        <v-card width="400px" class="mx-auto mt-5">
            <v-card-title><h1>Register</h1></v-card-title>

            <v-card-text>
                <v-form>
                    <v-text-field 
                    required
                    v-model="email" v-bind:rules="emailRules"
                    label="email" prepend-icon="mdi-account-circle"
                    />
                    <v-text-field 
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
                <v-btn color="success">Register</v-btn>
            </v-card-actions>

        </v-card>
    </v-app>
</template>

<script>
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
    }
}
</script>