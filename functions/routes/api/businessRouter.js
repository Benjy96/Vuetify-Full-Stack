const express = require('express');
//Router object from express
const router = express.Router();

const db = require('../../firebaseDB');

const { DateUtils } = require('./src/DateUtils');

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

/** Cancel Booking */
router.post('/cancel', async (req, res) => {
  let uid = req.body.uid;
  let date = req.body.date;
  let booking = req.body.booking;

  if(!uid || !date || !booking) {
    res.status(400).send(`Invalid request to ${req.baseUrl}/${req.url}`);
    return;
  }

  let year = DateUtils.getYearFromDate(date);
  let month = DateUtils.getMonthFromDate(date);
  let day = DateUtils.getDayFromDate(date);

  let docRef = db.collection(`/businesses/${req.body.uid}/availability/${year}/month/${month}/days`).doc(`${day}`);
  let data = (await docRef.get()).data();
  if(data && data.customer_bookings) {
    data = data.customer_bookings;
    booking = JSON.stringify(booking);
    let customer_bookings = data.filter(item => JSON.stringify(item) != booking);
  
    //TODO: Test if this is faster doing in front-end, with only the bit ownards in this function in back-end?
    res.status(202).send(customer_bookings);
  
    if(customer_bookings.length == 0) {
        docRef.delete().then(MetaDataHelper.updateMetaData(uid, date, date));
    } else {
        docRef.update({
            customer_bookings: customer_bookings
        }).then(MetaDataHelper.updateMetaData(uid, date, date));
    }
  } else {
    res.status(404).send('Booking not found');
  }
});

/** Delete Admin Booking */
router.delete('/', async(req, res) => {
  let uid = req.body.uid;
  let adminBooking = req.body.adminBooking;

  if(!uid || adminBooking) {
    res.status(400).send(`Invalid request to ${req.baseUrl}${req.url}`);
    return;
  }

  let adminDocRef = db.collection(`/businesses/${uid}/bookings`).doc('admin');
  let data = (await adminDocRef.get()).data();

  if(data && data.admin_bookings) {
    let admin_bookings = data.admin_bookings;

    let adminBookingString = JSON.stringify(adminBooking);

    let newAdminBookingsArray = admin_bookings.filter(item => JSON.stringify(item) != adminBookingString);
  
    res.status(202).send(newAdminBookingsArray);
  
    adminDocRef.update({
        admin_bookings: newAdminBookingsArray
    }).then(MetaDataHelper.updateMetaData(uid, adminBooking.fromDate, adminBooking.toDate));
  } else {
    res.status(404).send('Admin booking not found');
  }
});

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;