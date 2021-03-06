import messages from '../languages.js';

export default {
    install (Vue) {

        //If you want to access this somewhere else, you would need to import Vue (or use my getter)
        Vue.$locale = 'en'
    
        //Method added to all Vue instances - children objects will inherit the prototype methods
        Vue.prototype.$getLanguageMsg = function(messageKey) {
            if(messages[messageKey] == undefined) window.console.log('messageKey ' + messageKey)
            return messages[messageKey][Vue.$locale];
        }
    
        Vue.prototype.$setLocale = function(localeKey) {
            Vue.$locale = localeKey;
            this.$vuetify.lang.current = localeKey;
        }

        Vue.prototype.$getLocale = function() {
            return Vue.$locale;
        }
    }
}
