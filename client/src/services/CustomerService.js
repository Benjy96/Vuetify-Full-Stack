
import { db } from '../firebaseInit';

// HTTP Utils
import axios from "axios";

//using proxy in vue.config.js for dev mode instead of having http://localhost:5000/firebase-payment-test/us-central1/app/ here
const customerApiURL = 'api/customer';

class CustomerService {
    /*
        Day PoV CRUD Operations.

        Read should check meta-data before EXPENSIVE operations. 
        Add and Delete should check and modify meta-data after ANY operation.

        TODO: Check each operation follows above guidelines.
    */

    //TODO: use return value?
    static async createBooking(uid, name, email, year, month, day, from, to) {
        let res = await axios.post(customerApiURL + '/booking', {uid, name, email, year, month, day, from, to});
        return res.data;
    }

    /**
     * DELETE
     * @param {String} bookingReference The id of the document in firebase
     */
    static async cancelBooking(bookingReference) {
        let res = await axios.delete(customerApiURL + '/booking', {
            data: { bookingReference: bookingReference }
        });

        return res.data;    //TODO: use?
    }

    /* 
        Month PoV READ Operations.
    */

    //TODO: IF we stored this on back-end could have a listener and only need to actually query meta data when metadata changes
    /** READ from a month's meta-data document */
    static async getUnavailableDays(uid, year, month) {
        let metaDataDocRef = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        let unavailableDays = {};
        if(metaDataDocRef.exists) {
            unavailableDays = metaDataDocRef.data().unavailableDays;
        }

        return unavailableDays;
    }

    /**
     * The month document contains unavailable days and specific availability
     */
    static async getMonthAvailabilityData(uid, year, month) {
        let monthDocRef = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        if(monthDocRef.exists) {
            return monthDocRef.data();
        }
    }

    /*
        Month & Day PoV READ Operations
    */

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

    //TODO: Remove duplicates from businessService?
    static async getAdminBookings(uid) {
        let snapshot = await db.collection(`/businesses/${uid}/bookings/`).doc('admin').get();
        if(snapshot.exists) return snapshot.data()["admin_bookings"];
        else return [];
    }

    /**
     * Returns the top-level business document /businesses/uid
     */
    static async getBusinessDetails(uid) {
        let businessDoc = await db.collection(`/businesses`).doc(`${uid}`).get();
        if(businessDoc.exists){
            return businessDoc.data();
        } else {
            return null;
        }
    }
}

export default CustomerService;