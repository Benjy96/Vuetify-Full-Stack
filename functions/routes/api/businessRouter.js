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

/* ------ POSTS ------ */
/** Create an admin booking */
//TODO: Clean up old ones upon adding new ones?
router.post('/adminBooking', async(req, res) => {
  let uid = req.body.uid;
  let adminBooking = req.body.adminBooking;

  if(!uid || !adminBooking) {
    res.status(400).send();
  }

  await db.collection(`/businesses/${uid}/bookings/`).doc('admin')
  .set(
      {
          admin_bookings: admin.firestore.FieldValue.arrayUnion({
              ...adminBooking
          })
      },
      { merge: true }
  );

  res.status(200).send();

  MetaDataHelper.updateMetaData(uid, adminBooking.fromDate, adminBooking.toDate);
});

// Post adds to something and changes its state - Push a range to a reg availability day
router.post('/regularAvailability', async(req, res) => {
  let uid = req.body.uid;
  let day = req.body.day;
  let from = req.body.from;
  let to = req.body.to;

  if(!uid || !day || !from || !to) {
    res.status(400).send();
    return;
  }

  await db.collection('businesses').doc(uid)
  .update({
    ["regularAvailability." + [day]]: admin.firestore.FieldValue.arrayUnion({
        from: from,
        to: to
      })
  }, {merge: true});

  res.status(200).send();

  //TODO: We only need to check as far ahead as there may be admin/customer bookings
  let bookingDurationSetUntil = DateUtils.incrementMonthOfDate(DateUtils.getCurrentDateString(), 6);
  
  MetaDataHelper.updateMetaData(uid, 
    DateUtils.getCurrentDateString(), 
    bookingDurationSetUntil
  );
});

// Put creates or replaces something - calling it multiple times would have the same effect - replace a reg availability day
router.put('/regularAvailability', async(req, res) => {
  let uid = req.body.uid;
  let day = req.body.day;
  let ranges = req.body.ranges;

  if(!uid || !day || !ranges) {
    res.status(400).send();
    return;
  }

  let docRef = db.collection('businesses').doc(uid);
  //TODO: FUCK THIS IS UGLY
  await docRef.update({
      ["regularAvailability." + [day]]: ranges
  }, {merge: true});

  res.status(200).send();

  let bookingDurationSetUntil = DateUtils.incrementMonthOfDate(DateUtils.getCurrentDateString(), 12);
  //TODO: We need to check as far ahead as there may be admin/customer bookings

  /**
   * 
   * HOWEVER, we do need to calculate as far ahead as there may be customer bookings or admin bookings. 
   * THAT IS THE PROBLEM. This is because regular availability is handled client-side assuming there are no customer or admin bookings. 
   * The problem of conditional rendering is introduced whenever there is a customer or admin booking. 
   * The meta-data is there to determine whether a customer or admin booking "affects" the nice, clean, simple 
   * basic rendering based upon regular availability. It's like a line and anywhere an admin booking or customer booking is, 
   * it is distended, and standard checks won't work. Therefore, we need to update meta-data as far as the data is "non-standard".
   * 
   */
  MetaDataHelper.updateMetaData(uid, 
    DateUtils.getCurrentDateString(), 
    bookingDurationSetUntil
  );
});

// Post adds to something and changes its state - Push a range to a reg availability day
router.post('/irregularAvailability', async(req, res) => {
  let uid = req.body.uid;
  let date = req.body.date;
  let start = req.body.start;
  let end = req.body.end;

  if(!uid || !date || !start || !end) {
    res.status(400).send();
    return;
  }

  start = date + " " + start;
  end = date + " " + end;

  let year = DateUtils.getYearFromDate(date);
  let month = DateUtils.getMonthFromDate(date);

  await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).set({
      "irregularAvailability": admin.firestore.FieldValue.arrayUnion({
          name: "",
          start: start,
          end: end
      })
  }, {merge: true});

  res.status(200).send();
});

/* -- Profile management -- */
router.post('/updateProfile', async (req, res) => {
  let uid = req.body.uid;

  let profileData = {};

  if(!uid) {
    res.status(400).send(`Invalid request to ${req.baseUrl}${req.url}`);
    return;
  } else {
    if(req.body.firstname) profileData.firstname = req.body.firstname;
    if(req.body.surname) profileData.surname = req.body.surname;
    if(req.body.description) profileData.description = req.body.description;
    if(req.body.occupation) profileData.occupation = req.body.occupation;
    
    db.collection(`businesses`).doc(`${uid}`).set({
      profileData: profileData
    }, {merge: true}).then(() => {
      res.status(200).send();
    });
  }
});

/* -- Booking management -- */
router.post('/bookingDetails', async(req, res) => {
  let uid = req.body.uid;
  if(!uid) {
    res.status(400).send('Invalid request');
    return;
  } else {
    let bookingDetails = {};

    if(req.body.bookingDuration) {
      bookingDetails.duration = req.body.bookingDuration;

      let bookingDurationSetUntil = DateUtils.incrementMonthOfDate(DateUtils.getCurrentDateString(), 6);
      //TODO: We need to check as far ahead as there may be admin/customer bookings
      //TODO: Is MetaDataHelper checking this nested bookingDetails obj or root bookingDuration?
      MetaDataHelper.updateMetaData(uid, 
        DateUtils.getCurrentDateString(), 
        bookingDurationSetUntil
      );
    }

    if(req.body.bookingPrice) bookingDetails.price = req.body.bookingPrice;
    if(req.body.bookingAddress) bookingDetails.address = req.body.bookingAddress;
    if(req.body.bookingTitle) bookingDetails.title = req.body.bookingTitle;
    if(req.body.bookingInfo) bookingDetails.info = req.body.bookingInfo;
    if(req.body.bookingType) bookingDetails.type = req.body.bookingType;
    if(req.body.address) bookingDetails.address = req.body.address;

    db.collection('businesses').doc(uid).set({
      bookingDetails: bookingDetails
    }, {merge: true}).then(() => {
      res.status(200).send();
    });
  }
});

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;