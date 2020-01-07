
// import { DateUtils } from '../components/DateUtils';
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

    - Fix DateUtils functions
    - Fix CalendarService.createBooking - add null checks
    - Clear out the bookings array in Calendar.vue as it's retaining info when it shouldn't be?
     */
    static async createBooking(uid, year, month, day, from, to) {
        //1. Write to availability collection - TODO: Handle failures?
        db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`)
        .set({
            "customer_bookings": firebase.firestore.FieldValue.arrayUnion({
                    "from": from,
                    "to": to
                })
            }, 
            {merge: true}
        );

        /* //2. Write to more detailed owner bookings collection - TODO: Store name, etc. Not relevant yet.
        db.collection(`/businesses/${uid}/bookings/${year}/month/${month}/days`).doc(`${day}`)
        .set({
            "customer_bookings": firebase.firestore.FieldValue.arrayUnion({
                    "from": from,
                    "to": to
                })
            }, 
            {merge: true}
        );

        //3. Read meta-data object
        let metaDataDocRef = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        let admin_bookings = [];
        if(metaDataDocRef.exists) {
            admin_bookings = metaDataDocRef.data().admin_bookings;
        }

        //4. Read current day's remaining hours object
        let updatedDayRef = await db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`).get();
        let booked_hours = [];
        if(updatedDayRef.exists) {
            booked_hours = updatedDayRef.data().customer_bookings;
        }

        //5. Read regular hours object
        let regularHoursRef = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();
        let regularHours = [];
        let remainingHours = 24;
        if(regularHoursRef.exists) {
            regularHours = regularHoursRef.data().weekday;

            //6. Sum remaining hours + admin hours if exists
            for(var regularRanges in regularHours){
                remainingHours -= DateUtils.fromToDifference(regularRanges);
            }

            for(var bookedRanges in booked_hours){
                remainingHours -= DateUtils.fromToDifference(bookedRanges);
            }

            for(var adminRanges in admin_bookings){
                remainingHours -= DateUtils.fromToDifference(adminRanges);
            }
        }
        
        //7. If no remaining hours, add day to uanvailable days meta-data
        if(remainingHours <= 0){
            db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).set({
                "availableDays": {
                    day: false
                }
            });
        } */
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
}

export default CalendarService;