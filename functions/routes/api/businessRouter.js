const express = require('express');
const router = express.Router();

const db = require('../../firebaseDB');
const admin = require('firebase-admin');

const { DateUtils } = require('./src/DateUtils');
const MetaDataHelper = require('./src/MetaDataHelper');

/*

Where I went wrong in understanding the firestore shit - I wasn't checking the TYPEs returned by each method,
and then the method you would need to use from that returned type.

https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#delete

E.g., if you use .doc on a CollectionReference to get a DocumentReference, then look for the 
delete method on the DocumentReference class.

*/

// Get Posts - async functions automatically wrap the return in a Promise
router.get('/', async (req, res) => {
  let businesses = [];
  //await unwraps a value from a promise
  await db.collection('businesses').get().then(snapshot => {
    snapshot.forEach(doc => {
      businesses.push({
        id: doc.id,
        ...doc.data()
      });
    })
  });

  res.send(businesses);
});

/** Create an admin booking */
router.post('/adminBooking', async(req, res) => {
  let uid = req.body.uid;
  let adminBooking = req.body.adminBooking;

  if(!uid || !adminBooking) {
    res.status(400).send();
  }

  //1. Get from year, month, and day
  let fromYear = DateUtils.getYearFromDate(adminBooking.fromDate);

  //2. Get to year, month, and day
  let toYear = DateUtils.getYearFromDate(adminBooking.toDate);

  if(fromYear == toYear){
      await db.collection(`/businesses/${uid}/bookings/`).doc('admin')
      .set(
          {
              admin_bookings: admin.firestore.FieldValue.arrayUnion({
                  ...adminBooking
              })
          },
          { merge: true }
      );
  } else {
      db.collection(`/businesses/${uid}/bookings/`).doc('admin')
      .set(
          {
              admin_bookings: admin.firestore.FieldValue.arrayUnion({
                  ...adminBooking
              })
          },
          { merge: true }
      );

      await db.collection(`/businesses/${uid}/bookings/`).doc('admin')
      .set(
          {
              admin_bookings: admin.firestore.FieldValue.arrayUnion({
                  ...adminBooking
              })
          },
          { merge: true }
      );
  }

  res.status(200).send();

  MetaDataHelper.updateMetaData(uid, adminBooking.fromDate, adminBooking.toDate);
});

/** Cancel Admin Booking */
router.delete('/adminBooking', async(req, res) => {
  let uid = req.body.uid;
  let adminBooking = req.body.adminBooking;

  if(!uid || !adminBooking) {
    res.status(400).send(`Invalid request to ${req.baseUrl}${req.url}`);
    return;
  }

  let adminDocRef = db.collection(`/businesses/${uid}/bookings`).doc('admin');
  let data = (await adminDocRef.get()).data();

  if(data && data.admin_bookings) {
    let admin_bookings = data.admin_bookings;

    let newAdminBookingsArray = admin_bookings.filter(item => 
      !(
        (item.fromDate == adminBooking.fromDate) &&
        (item.toDate == adminBooking.toDate) &&
        (item.fromTime == adminBooking.fromTime) &&
        (item.toTime == adminBooking.toTime)
      )
    );
  
    res.status(202).send(newAdminBookingsArray);
  
    adminDocRef.set({
        admin_bookings: newAdminBookingsArray
    }).then(MetaDataHelper.updateMetaData(uid, adminBooking.fromDate, adminBooking.toDate));
  } else {
    res.status(404).send('Admin booking not found');
  }
});

/** Cancel Booking */
router.delete('/booking', async (req, res) => {
  let uid = req.body.uid;
  let date = req.body.date;
  let booking = req.body.booking;

  if(!uid || !date || !booking) {
    res.status(400).send(`Invalid request to ${req.baseUrl}${req.url}`);
    return;
  }

  let year = DateUtils.getYearFromDate(date);
  let month = DateUtils.getMonthFromDate(date);
  let day = DateUtils.getDayFromDate(date);

  let docRef = db.collection(`/businesses/${req.body.uid}/availability/${year}/month/${month}/days`).doc(`${day}`);
  let data = (await docRef.get()).data();
  if(data && data.customer_bookings) {
    data = data.customer_bookings;

    let customer_bookings = data.filter(item => (item.from != booking.from) && (item.to != booking.to));
  
    //TODO: Test if this is faster doing in front-end, with only the bit ownards in this function in back-end?
    res.status(202).send(customer_bookings);
  
    if(customer_bookings.length == 0) {
        docRef.delete().then(MetaDataHelper.updateMetaData(uid, date, date));
    } else {
        docRef.set({
            customer_bookings: customer_bookings
        }).then(MetaDataHelper.updateMetaData(uid, date, date));
    }
  } else {
    res.status(404).send('Booking not found');
  }
});

//TODO: RATE LIMIT!!!
router.post('/bookingDuration', async (req, res) => {
  let uid = req.body.uid;
  let bookingDuration = req.body.bookingDuration;

  if(!uid || !bookingDuration) {
    res.status(400).send(`Invalid request to ${req.baseUrl}${req.url}`);
    return;
  }

  db.collection(`businesses/${uid}/availability/`).doc('regular').set({
    bookingDuration: bookingDuration
  }, {merge: true}).then(() => {

    let bookingDurationSetUntil = DateUtils.incrementMonthOfDate(DateUtils.getCurrentDateString(), 12);
    
    MetaDataHelper.updateMetaData(uid, 
      DateUtils.getCurrentDateString(), 
      bookingDurationSetUntil
    );

    res.status(202).send({setTo: bookingDurationSetUntil});
  });
});

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;