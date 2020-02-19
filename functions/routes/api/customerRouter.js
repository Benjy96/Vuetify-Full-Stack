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

/** Cancel a booking by email reference - identifies correct booking by from/to date and time */
router.delete('/booking', async(req, res) => {
    let bookingReference = req.body.bookingReference;

    if(!bookingReference) {
        res.status(400).send();
        return;
    }

    let mailDoc = await db.collection('mail').doc(bookingReference).get();
    if(mailDoc.exists) {
        let mailData = mailDoc.data();

        let uid = mailData.bookingInfo.uid;
        let date = mailData.bookingInfo.date;
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);
        let bookingFrom = mailData.bookingInfo.from;
        let bookingTo = mailData.bookingInfo.to;
        let recipientEmail = mailData.to;

        let dayOfBookingsRef = db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`);

        let bookingData = (await dayOfBookingsRef.get()).data();

        if(bookingData != undefined) {
            var customer_bookings = bookingData.customer_bookings;

            customer_bookings = customer_bookings.filter(item => (item.from != bookingFrom) && (item.to != bookingTo));

            res.status(202).send(customer_bookings);

            if(customer_bookings.length == 0) {
                dayOfBookingsRef.delete().then(MetaDataHelper.updateMetaData(uid, date, date));
            } else {
                dayOfBookingsRef.update({
                    customer_bookings: customer_bookings
                }).then(MetaDataHelper.updateMetaData(uid, date, date));
            }

            sendCancellationEmail(bookingReference, recipientEmail, uid, date, bookingFrom, bookingTo);
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
    let name = req.body.name;
    let email = req.body.email;
    let year = req.body.year;
    let month = req.body.month;
    let day = req.body.day;
    let from = req.body.from;
    let to = req.body.to;

    if(!uid || !name || !email || !year || !month || !day || !from || !to) {
        res.status(400).send();
        return;
    }

    //1. Write to availability collection
    let bookedDayDocRef = db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`);
    bookedDayDocRef.set({
        "customer_bookings": admin.firestore.FieldValue.arrayUnion({
                "from": from,
                "to": to,
                "bookerName": name
            })
        }, 
        {merge: true}
    ).then(() => {
        res.status(200).send();
    })

    //TODO - 2: More detailed owner collection of bookings?

    let affectedDate = DateUtils.convertYearMonthDayToDate(year, month, day);

    //3. Update meta-data
    MetaDataHelper.updateMetaData(uid, affectedDate, affectedDate);

    //4. Send an email to the customer & business
    sendBookingEmails(email, name, uid, affectedDate, from, to);
});

/** TODO: template?  https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_readfile_file_options_callback */
async function sendBookingEmails(recipientEmail, customerName, businessId, bookingDate, from, to) {
    // Get business details
    let businessDetails = (await db.collection(`/businesses`).doc(`${businessId}`).get()).data();
    let businessName = businessDetails.firstname + " " + businessDetails.surname;
    let businessEmail = (await db.collection(`/businesses_private`).doc(`${businessId}`).get()).data().email;

    // Compose customer email
    let customerEmailDocRef = db.collection('mail').doc();

    let html = 
    `This is a confirmation of your booking with ${businessName} on ${bookingDate} from ${from}-${to}.
    <br><br>Your booking confirmation code is: 
    <blockquote>${customerEmailDocRef.id}</blockquote>
    <br>Don't worry, you won't have to say that or anything. It's just for if you want to cancel your booking.
    To cancel, please go to <a href="https://booking-calendar.web.app/cancel">https://booking-calendar.web.app/cancel</a> 
    and enter your booking reference.`;
    
    customerEmailDocRef.set({
        bookingInfo: {
            date: bookingDate,
            from: from,
            to: to,
            uid: businessId
        },
        to: recipientEmail,
        message: {
            subject: 'Booking Confirmation',
            html: html
        }
    });

    // Compose Business email
    let businessEmailDocRef = db.collection('mail').doc();
    businessEmailDocRef.set({
        bookingConfirmationEmail: customerEmailDocRef.id,
        to: businessEmail,
        message: {
            subject: 'New Booking',
            html: `You have a new booking on ${bookingDate} at ${from}-${to} with ${customerName}. This will be
            shown on your Dashboard.`
        }
    });
}

//TODO: Add identifying business info so customer knows wtf it's on about
function sendCancellationEmail(bookingId, recipientEmail, businessId, bookingDate, from, to) {
    db.collection('mail').doc(bookingId).delete();

    let newEmailRef = db.collection('mail').doc();
    newEmailRef.set({
        bookingInfo: {
            cancelTime: admin.firestore.FieldValue.serverTimestamp(),
            date: bookingDate,
            from: from,
            to: to,
            uid: businessId
        },
        to: recipientEmail,
        message: {
            subject: 'Booking Cancelation',
            html: `Hi there!
            <br><br>Your booking on ${bookingDate} from ${from}-${to} has been cancelled.`
        }
    });
}

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;