
import firebase from 'firebase';
import { db } from '../firebaseInit';

class CalendarService {
    /*
        Day PoV CRUD Operations.

        Read should check meta-data before EXPENSIVE operations. 
        Add and Delete should check and modify meta-data after ANY operation.

        TODO: Check each operation follows above guidelines.
    */

    /** Cal-Day-CREATE 
     * 
     * TODO: Make into a transaction for error handling:
     * https://firebase.google.com/docs/firestore/manage-data/transactions
     * 
    */
    static async createBooking(uid, email, year, month, day, from, to) {
        //1. Write to availability collection
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
                    "email": email,
                    "from": from,
                    "to": to
                })
            }, 
            {merge: true}
        );
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