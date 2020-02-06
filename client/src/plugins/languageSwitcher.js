import messages from '../languages.js';

export default {
    install (Vue) {

        Vue.$locale = 'en'
    
        //Method added to all Vue instances
        Vue.prototype.$getLanguageMsg = function(messageKey) {
            window.console.log('get language message for locale ' + Vue.$locale);
            return messages[messageKey][Vue.$locale];
        }
    
        //Modified GLOBAL Vue object
        Vue.prototype.$setLocale = function(localeKey) {
            Vue.$locale = localeKey;
            this.$vuetify.lang.current = 'es';
        }
    }
}
