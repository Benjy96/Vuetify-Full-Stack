<template>
    <div>
        <div id="firebaseui-auth-container"></div>
    </div>
</template>

<script>
var firebase = require('firebase');
var firebaseui = require('firebaseui');
import 'firebaseui/dist/firebaseui.css';

export default {
    name: 'login',
    mounted() {
        var uiConfig = {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID
            ]
        }

        if(firebaseui.auth.AuthUI.getInstance()) {
            const ui = firebaseui.auth.AuthUI.getInstance();
            ui.start('#firebaseui-auth-container', uiConfig);
        } else {
            const ui = new firebaseui.auth.AuthUI(firebase.auth());
            ui.start('#firebaseui-auth-container', uiConfig);
        }
    },
}
</script>
