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

    /* -- Profile Management -- */

    static async getLocale(uid) {
        let doc = await db.collection('/businesses').doc(uid).get();
        if(doc.data().locale) return doc.data().locale;
        else return null;
    }

    static async setLocale(uid, locale) {
        db.collection(`/businesses`).doc(uid).update({
            locale: locale
        });
    }

    static async updateBio(uid, bio) {
        axios.post(`${apiURL}/bio`, {uid, bio});
    }

    static async updateOccupation(uid, occupation) {
        axios.post(`${apiURL}/occupation`, {uid, occupation});
    }

    //TODO: Restrict writes to back-end? I cleared my business info...
    static async setProfileImage(uid, image) {
        if(image != null) {
            // Create a reference
            let storageRef = firebase.storage().ref();
            let ref = storageRef.child(`profileImages/${uid}_profile.jpg`);

            // Upload the file
            ref.put(image);

            let profilePicPath = ref.root + ref.fullPath;

            db.collection('businesses').doc(uid).set({
                profileImage: profilePicPath
            }, {merge: true});
        }
    }

    uploadAndGetProfileImageRef(uid) {
        // Create a reference
        var storageRef = firebase.storage().ref();
        var profilePicRef = storageRef.child(`profileImages/${uid}_profile.jpg`);

        // Upload the file
        profilePicRef.put(this.profilePicture);

    }

    //TODO: Combine update methods - in Dashboard check all then call one function
        //In back-end, retrieve what's needed in nested ifs
    static async updateBookingTitle(uid, bookingTitle) {
        axios.post(`${apiURL}/bookingTitle`, {uid, bookingTitle});
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

    /**
     * Merges a range into the regular availability array
     */
    static async addRegularAvailabilityRange(uid, day, from, to) {
        await db.collection('businesses').doc(uid)
        .set({
            "regularAvailability": {
                [day]: firebase.firestore.FieldValue.arrayUnion({
                    from: from,
                    to: to
                })
            }
        }, {merge: true});
    }

    /**
     * Replaces the current regular availability array
     */
    static async setDayRegularAvailability(uid, day, ranges) {
        let docRef = db.collection('businesses').doc(uid);
        docRef.update({
            "regularAvailability": {
                [day]: ranges
            }
        }, {merge: true});
    }
    /* ----- READ ----- */

    static async getRegularAvailability(uid) {
        let doc = await db.collection('businesses').doc(uid).get();
        if(doc.exists) return doc.data().regularAvailability;
    }

    static async getUpcomingBookings(uid, date, dayLimit) {
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);

        let snapshot;
        try 
        {
            //limiting by a week
            dayLimit = DateUtils.getFutureDayString_CappedMonth(date, dayLimit);

            snapshot = await db.collection(`businesses/${uid}/availability/${year}/month/${month}/days`)
                //Firestore supports logical ANDS, which is what chained wheres are, but no OR???
                .where(firebase.firestore.FieldPath.documentId(), '>=', day) 
                .where(firebase.firestore.FieldPath.documentId(), '<', dayLimit)
                .get();
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