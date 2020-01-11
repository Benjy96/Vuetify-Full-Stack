
import { DateUtils } from '../DateUtils';
import firebase from 'firebase';
import { db } from '../firebaseInit';

class CalendarService {
    /*
        Day PoV CRUD Operations.
    */

    /** Cal-Day-CREATE 
     * 
     * TODO: Make into a transaction for error handling:
     * https://firebase.google.com/docs/firestore/manage-data/transactions
     * 
    */
   //TODO: Use weekday? Are we checking regular hours?

/*    TODO:

    - Fix CalendarService.createBooking - add null checks
     */
    static async createBooking(uid, year, month, day, from, to) {
        //1. Write to availability collection - TODO: Handle failures?
        let bookedDayDocRef = db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`);
        bookedDayDocRef.set({
            "customer_bookings": firebase.firestore.FieldValue.arrayUnion({
                    "from": from,
                    "to": to
                })
            }, 
            {merge: true}
        );

        //2. Write to more detailed owner bookings collection - TODO: Store name, etc. Not relevant yet.
        db.collection(`/businesses/${uid}/bookings/${year}/month/${month}/days`).doc(`${day}`)
        .set({
            "customer_bookings": firebase.firestore.FieldValue.arrayUnion({
                    "from": from,
                    "to": to
                })
            }, 
            {merge: true}
        );

        //3. Read meta-data object for admin bookings
        /* let metaDataDocSnapshot = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        let admin_bookings = [];
        if(metaDataDocSnapshot.exists) {
            admin_bookings = metaDataDocSnapshot.data().admin_bookings;
        } */
        
        //4. Get booked day's customer bookings
        let bookedDayDocSnapshot = await bookedDayDocRef.get();
        let customer_bookings = [];
        if(bookedDayDocSnapshot.exists) {
            customer_bookings = bookedDayDocSnapshot.data().customer_bookings;
        }
        
        //5. Read regular hours object
        let regularHoursSnapshot = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();
        let regularHours = [];
        let remainingHours = 24;
        if(regularHoursSnapshot.exists) {
            regularHours = regularHoursSnapshot.data().weekday;

            //6. Sum remaining hours + admin hours if exists
            for(var regularRanges in regularHours){
                remainingHours -= DateUtils.calcFromToDifference(regularHours[regularRanges]);
            }
        }

        for(var bookedRanges in customer_bookings){
            remainingHours -= DateUtils.calcFromToDifference(customer_bookings[bookedRanges]);
        }

        //TODO: how to calculate this across days?
        /* for(var adminRanges in admin_bookings){
            remainingHours -= DateUtils.calcFromToDifference(admin_bookings[adminRanges]);
        } */
        
        //7. If no remaining hours, add day to uanvailable days meta-data
        //TODO: Simpler calculations? Could just check if num booking entries / interval size == 24 (or max) ?
        if(remainingHours <= 0){
            db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).set({
                "unavailableDays": {
                    [day]: null
                    }
                },
                {merge: true}
            );
        }
    }

    /** Cal-Day-READ */
    static async getBookings(uid, year, month, day) {
        //Read from availability collection
        let bookingsRef = await db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`).get();
        let customer_bookings = [];
        if(bookingsRef.exists) {
            customer_bookings = bookingsRef.data().customer_bookings;
            return customer_bookings;
        } else {
            return null;
        }
    }

    /** Cal-Day-DELETE */
    static async cancelBooking() {

    }

    /* 
        Month PoV CRUD Operations.
    */

    //TODO: IF we stored this on back-end could have a listener and only need to actually query meta data when metadata changes
    /** READ from a month's meta-data document */
    static async getUnavailableDays(uid, year, month) {
        let metaDataDocRef = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        let unavailableDays = {};
        if(metaDataDocRef.exists) {
            unavailableDays = metaDataDocRef.data().unavailableDays;
        }

        let dateObj = {
            [year]: {
                [month]: {
                    ...unavailableDays
                }
            }
        }

        return dateObj;
    }

    /*
        Month / Day PoV CRUD Operations
    */
    static async getAdminBookings(uid, year, month) {
        let metaDataDocRef = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        let admin_bookings = [];
        if(metaDataDocRef.exists) {
            admin_bookings = metaDataDocRef.data().admin_bookings;
            return admin_bookings;
        } else {
            //TODO: Check traversy apps - waht does he do when null? exception? message?
            return null;
        }
    }

    static async getRegularAvailability(uid) {
        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc('regular').get();
        let regular_availability = [];
        if(regularHoursDoc.exists){
            regular_availability = regularHoursDoc.data();
            return regular_availability;
        } else {
            return null;
        }
    }
}

export default CalendarService;