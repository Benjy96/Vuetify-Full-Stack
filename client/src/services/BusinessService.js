import firebase from 'firebase';
import { db } from '../firebaseInit';
import { DateUtils } from '@/DateUtils';

// HTTP Utils
import axios from "axios";

//using proxy in vue.config.js for dev mode instead of having http://localhost:5000/firebase-payment-test/us-central1/app/ here
const apiURL = 'api/business';

class BusinessService {

    static getUserId() {
        return firebase.auth().currentUser.uid;
    }

    static isCurrentUser(id) {
        if(firebase.auth().currentUser && firebase.auth().currentUser.uid == id){
            return true;
        } else return false;
    }

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
    static async addBookingSlot(uid, date, start, end) {
        axios.post(`${apiURL}/irregularAvailability`, {uid, date, start, end});
    }

    static async createAdminBooking(uid, adminBooking) {
        axios.post(`${apiURL}/adminBooking`, {uid, adminBooking});
    }

    /* -- Profile Management -- */

    static async getProfileData() {
        let uid = firebase.auth().currentUser.uid;
        let data = (await db.collection('businesses').doc(uid).get()).data();
        return data.profileData;
    }

    static async getProfileImageDownloadURL(profileImageRef) {
        var storage = firebase.storage();
        var gsRef = storage.refFromURL(profileImageRef);
        let downloadURL = await gsRef.getDownloadURL();

        return downloadURL;
    }

    static async getProfileImage() {
        let uid = firebase.auth().currentUser.uid;
        let business = (await db.collection('businesses').doc(uid).get()).data();
        
        if(!business.profileImage) return;

        var storage = firebase.storage();
        var gsRef = storage.refFromURL(business.profileImage);
        let downloadURL = await gsRef.getDownloadURL();

        return downloadURL;
    }

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

    static async updateProfile(uid, firstname, surname, description, occupation) {
        axios.post(`${apiURL}/updateProfile`, {uid, firstname, surname, description, occupation});
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

            db.collection('businesses').doc(uid).update({
                "profileData.image": profilePicPath
            });
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
    static async updateBookingDetails(uid, bookingTitle, bookingInfo, bookingDuration, bookingPrice, bookingType, address) {
        axios.post(`${apiURL}/bookingDetails`, {uid, bookingTitle, bookingInfo, bookingDuration, bookingPrice, bookingType, address});
    }

    /**
     * Replaces the current regular availability array
     */
    //TODO: Do we need to do this server-side or can we do client side?
    static async setDayRegularAvailability(uid, day, ranges) {
        axios.put(`${apiURL}/regularAvailability`, {uid, day, ranges});
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