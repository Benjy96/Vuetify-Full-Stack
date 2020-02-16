import firebase from 'firebase';
import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';

// HTTP Utils
import axios from "axios";

//using proxy in vue.config.js for dev mode instead of having http://localhost:5000/firebase-payment-test/us-central1/app/ here
const apiURL = 'api/business';

class BusinessService {

    /*
        Owner/Business PoV CRUD Operations.

        Read should check meta-data before EXPENSIVE operations. 
        Add/Create and Delete should check and modify meta-data after ANY operation.

        After each Create or Update or Delete, run the meta data update methods
    */

    /** This can safely be done from the client (updates/creates to business) as it's authenticated
     * 
     * Creates an admin booking, checks whether the day is still
     * available, and then adds to the "unavailableDays" meta data for a month if it is not
     * @param {*} adminBooking {fromDate: "", toDate: "", fromTime: "" toTime: ""}
     */

    /* ----- POST ----- */

    static async createAdminBooking(uid, adminBooking) {
        axios.post(`${apiURL}/adminBooking`, {uid, adminBooking});
    }

    static async updateBookingInfo(uid, bookingInfo) {
        axios.post(`${apiURL}/bookingInfo`, {uid, bookingInfo});
    }

    static async updateBookingDuration(uid, bookingDuration) {
        axios.post(`${apiURL}/bookingDuration`, {uid, bookingDuration});
    }

    static async updateBookingPrice(uid, bookingPrice) {
        axios.post(`${apiURL}/bookingPrice`, {uid, bookingPrice});
    }

    /* ----- READ ----- */

    static async getUpcomingBookings(uid, dayLimit) {
        let year = DateUtils.getCurrentYearString();
        let month = DateUtils.getCurrentMonthString();
        let day = DateUtils.getCurrentDayString();

        let snapshot;
        try 
        {
            //limiting by a week
            dayLimit = DateUtils.getFutureDayString(dayLimit);

            snapshot = await db.collection(`businesses/${uid}/availability/${year}/month/${month}/days`)
                //Firestore supports logical ANDS, which is what chained wheres are, but no OR???
                .where(firebase.firestore.FieldPath.documentId(), '>=', day) 
                .where(firebase.firestore.FieldPath.documentId(), '<=', dayLimit)
                .get();

            //TODO: How to return future hours?
            //If doing multiple days in future it won't work!!
                //Would work for single day: where day == day && from > currentTime
        } 
        catch(e) 
        {
            alert(e.message);
        }

        let bookings = {
            [year]: {
                [month]: {}
            }
        };

        snapshot.forEach(doc => {
            bookings[year][month][doc.id] = doc.data().customer_bookings;
        });

        return bookings;
    }

    static async getAdminBookings(uid) {
        let snapshot = await db.collection(`/businesses/${uid}/bookings/`).doc('admin').get();
        if(snapshot.exists) {
            if(snapshot.data()["admin_bookings"] != undefined) {
                return snapshot.data()["admin_bookings"];
            }
        } else {
            return [];
        }
        
    }

    /* ----- DELETE ------ */

    static async cancelBooking(uid, date, booking) {
        let res = await axios.delete(`${apiURL}/booking`, {
            data: {
                uid,
                date,
                booking
            }
        });

        return res.data;
    }

    static async deleteAdminBooking(uid, adminBooking) {
        let res = await axios.delete(`${apiURL}/adminBooking`, {
            data: {
                uid, adminBooking
            }
        });

        return res.data;
    }
}

export default BusinessService;