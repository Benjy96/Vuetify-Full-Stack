const express = require('express');
const request = require('request');
const router = express.Router();

const db = require('../../firebaseDB');

const { DateUtils } = require('./src/DateUtils');
const MetaDataHelper = require('./src/MetaDataHelper');

/* 

1) if exports.MetaDataHelper = MetaDataHelper, use const { MetaDataHalper } = require('./src/MetaDataHelper');

require() returns: { MetaDataHelper: [Function: MetaDataHelper] }

2) if module.exports = MetaDataHelper, use const MetaDataHelper = require('./src/MetaDataHelper');

require() returns: [Function: MetaDataHelper]

3) exports = x; doesn't work

require() returns: {}

(3) doesn't work because if you RE-ASSIGN exports, it becomes a new variable on its own when node returns the variables
(1)/(2) work because you're just adding to the module.exports object in a different level of nesting

*/

router.get('/', async (req, res) => {

    console.log(require('./src/MetaDataHelper'));

    MetaDataHelper.test();

    let convertedDate = DateUtils.formatAmericanDateToUK("2020-25-01");
    console.log(convertedDate);

    // https://nodejs.org/api/http.html#http_http_request_options_callback
    // Generated beneath code with POSTMAN Code button on the right-hand side of the screen

    // a node.JS request...
    // request(options, function (error, response) { 
    //     if (error) {
    //         res.status(500).send(error);
    //     } else {
    //         res.send(response.body);
    //     }
    // });

    res.status(200).send(convertedDate);
});

/** NOTE: there are two collections with bookings. Deletes from availability but bookings still exists.
 * Cancel a booking - finds booking based on uid and date info referenced by an email sent to the customer
 * 
 * TODO: deletes from one booking collection only currently - what about other?
 * 
 * Security: Because the delete request can only come from the server, it will only do what's in this function. 
 * If the client was allowed to make deletes, someone could modify the javascript and paths and delete everything.
 */
router.post('/', async(req, res) => {
    let mailDoc = await db.collection('mail').doc(req.body.bookingReference).get();
    if(mailDoc.exists) {
        let mailData = mailDoc.data();

        let uid = mailData.bookingInfo.uid;
        let date = mailData.bookingInfo.date;
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);
        let bookingFrom = mailData.bookingInfo.from;
        let bookingTo = mailData.bookingInfo.to;

        let dayOfBookingsRef = db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`);

        let bookingData = (await dayOfBookingsRef.get()).data();

        if(bookingData != undefined) {
            var customer_bookings = bookingData.customer_bookings;

            customer_bookings = customer_bookings.filter(item => (item.from != bookingFrom) && (item.to != bookingTo));

            if(customer_bookings.length == 0) {
                dayOfBookingsRef.delete().then(MetaDataHelper.updateMetaData(uid, date, date));
            } else {
                dayOfBookingsRef.update({
                    customer_bookings: customer_bookings
                }).then(MetaDataHelper.updateMetaData(uid, date, date));
            }
            res.status(200).send();
        } else {
            res.status(500).send('Could not find booking data for the business ' + uid);
        }
    } else {
        res.status(404).send('Booking not found');
    }
});

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;