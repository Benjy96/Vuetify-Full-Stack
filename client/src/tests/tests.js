/*

To run these tests in the front-end, the setup is: npm install -g @vue/cli-service-global to
install the ability to use "vue serve" to serve any file.

If you type "vue", you will see in the list of commands:

  serve [options] [entry]                    serve a .js or .vue file in development mode with zero config

To run tests:

cd client/src/tests
vue serve tests.js
Open browser on localhost:8080

*/

import MetaDataHelperTests from './MetaDataHelperTests';
// MetaDataHelperTests.runSingleAdminBookingTests();
MetaDataHelperTests.runSingleAdminBookingTestsWithCustomerBookings();


///// ***** MANUAL TESTING ***** \\\\\

// import MetaDataHelper from './services/MetaDataHelper';

// try {
//   MetaDataHelper.isDateAvailable("6c6qWcNvsOhBpF0CgUox4LsG2v62", "2020-01-01").then(res => {
//     alert(res);
//   });
// }
// catch(e) {
//   alert(e.message);
// }