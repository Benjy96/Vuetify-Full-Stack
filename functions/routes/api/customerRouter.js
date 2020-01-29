const express = require('express');
const router = express.Router();

const db = require('../../firebaseDB');
const admin = require('firebase-admin');

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

/** Cancel a booking by email reference */
router.delete('/booking', async(req, res) => {
    if(!req.body.bookingReference) {
        res.status(400).send();
        return;
    }

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

            res.status(200).send(customer_bookings);

            if(customer_bookings.length == 0) {
                dayOfBookingsRef.delete().then(MetaDataHelper.updateMetaData(uid, date, date));
            } else {
                dayOfBookingsRef.update({
                    customer_bookings: customer_bookings
                }).then(MetaDataHelper.updateMetaData(uid, date, date));
            }
        } else {
            res.status(500).send('Could not find booking data for the business ' + uid);
        }
    } else {
        res.status(404).send('Booking not found');
    }
});

/** Create a booking */
//TODO: Make into a transaction for error handling: https://firebase.google.com/docs/firestore/manage-data/transactions
router.post('/booking', async (req, res) => {
    let uid = req.body.uid;
    let email = req.body.email;
    let year = req.body.year;
    let month = req.body.month;
    let day = req.body.day;
    let from = req.body.from;
    let to = req.body.to;

    if(!uid || !email || !year || !month || !day || !from || !to) {
        res.status(400).send();
        return;
    } else {
        res.status(202).send();
    }

    //1. Write to availability collection
    let bookedDayDocRef = db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`);
    bookedDayDocRef.set({
        "customer_bookings": admin.firestore.FieldValue.arrayUnion({
                "from": from,
                "to": to
            })
        }, 
        {merge: true}
    );

    //2. Write to more detailed owner bookings collection - TODO: Store name, etc. Not relevant yet.
    db.collection(`/businesses/${uid}/bookings/${year}/month/${month}/days`).doc(`${day}`)
    .set({
        "customer_bookings": admin.firestore.FieldValue.arrayUnion({
                "email": email,
                "from": from,
                "to": to
            })
        }, 
        {merge: true}
    );

    let affectedDate = DateUtils.convertYearMonthDayToDate(year, month, day);

    //3. Update meta-data
    MetaDataHelper.updateMetaData(uid, affectedDate, affectedDate);

    //4. Send an email
    sendBookingEmail(email, uid, affectedDate, from, to);
});

/** TODO: template?  https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_readfile_file_options_callback */
function sendBookingEmail(recipientEmail, businessId, bookingDate, from, to) {
    let docRef = db.collection('mail').doc();
    docRef.set({
        bookingInfo: {
            date: bookingDate,
            from: from,
            to: to,
            uid: businessId
        },
        to: recipientEmail,
        message: {
            subject: 'Booking Confirmation',
            html: `Hi there!
            <br>This is a confirmation of your booking on ${bookingDate} from ${from}-${to}.
            <br>Your booking confirmation code is: 
            <blockquote>${docRef.id}</blockquote>
            <br>Don't worry, you won't have to say that or anything. It's just for if you want to cancel your booking.`
        }
    });
}

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;