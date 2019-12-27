<template>
<div>
    <div id="bookingjs"></div> 
</div>

</template>

<script>
export default {
    name: 'Business',
    props: ['project_id'],
    mounted () { 
        /* window.timekitBookingConfig = {
            app_key: 'test_widget_key_YglmTCFqY5fTbvgkfePc6leQDVxR4EsQ',
            // resources: ['7cfc57fa-9a81-4f76-bea2-92a909e5b70d']
            // project_id: this.project_id
            // project_id: '27fc7f05-586f-48f7-839f-164bdd3be6de'
            //id of bd resource: '7cfc57fa-9a81-4f76-bea2-92a909e5b70d'
            //TODO: How to get resource id?
            //TODO: Get email
        } */
        //Init specific resource
        window.timekitBookingConfig = {
            // name:           'BenTest',
            // email:          'benjamindickey@hotmail.co.uk',
            app_key:        'test_widget_key_YglmTCFqY5fTbvgkfePc6leQDVxR4EsQ', //account
            // resources:      ['5d672d4b-1ab1-4147-a11d-ab54c000b241'/* , 'f5626dac-49e3-4654-a410-33693b83463a' */],   //Benjamin Dickey & Ben D
            project_id:     '611a8f6f-4f1c-43c3-a8be-f9e7bdd825e5'  //Another Test project
        }
    }
}
</script>