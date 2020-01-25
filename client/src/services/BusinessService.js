import firebase from 'firebase';
import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';
import MetaDataHelper from './MetaDataHelper';

// HTTP Utils
import axios from "axios";

//using proxy in vue.config.js for dev mode instead of having http://localhost:5000/firebase-payment-test/us-central1/app/ here
const apiURL = 'api/business/';

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
    static async createAdminBooking(uid, adminBooking) {

        //1. Get from year, month, and day
        let fromYear = DateUtils.getYearFromDate(adminBooking.fromDate);

        //2. Get to year, month, and day
        let toYear = DateUtils.getYearFromDate(adminBooking.toDate);

        if(fromYear == toYear){
            await db.collection(`/businesses/${uid}/bookings/`).doc('admin')
            .update(
                {
                    admin_bookings: firebase.firestore.FieldValue.arrayUnion({
                        ...adminBooking
                    })
                }
            );
        } else {
            db.collection(`/businesses/${uid}/bookings/`).doc('admin')
            .update(
                {
                    admin_bookings: firebase.firestore.FieldValue.arrayUnion({
                        ...adminBooking
                    })
                }
            );

            await db.collection(`/businesses/${uid}/bookings/`).doc('admin')
            .update(
                {
                    admin_bookings: firebase.firestore.FieldValue.arrayUnion({
                        ...adminBooking
                    })
                }
            );
        }

        MetaDataHelper.updateMetaData(uid, adminBooking.fromDate, adminBooking.toDate);
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
        //Fetch from meta-data document.
        let snapshot = await db.collection(`/businesses/${uid}/bookings/`).doc('admin').get();
        return snapshot.data()["admin_bookings"];
    }

    /* ----- DELETE/UPDATE ------ */
    static async cancelBooking(uid, date, booking) {
        let customer_bookings = await axios.post(`${apiURL}/cancel`, {
            uid,
            date,
            booking
        });

        return customer_bookings;
    }

    static async deleteAdminBooking(uid, adminBooking) {
        /*

            Answering question of will above async slow the program? Answer: No

            Async works like this:

            with MetaDataHelper.updateMetaData deleting a booking from 2020-01-01 to 2020-01-04, I logged:
                awaiting
                returning
                awaiting
                awaiting
                awaiting

            with await MetaDataHelper.updateMetaData (which has an await inside):

                awaiting
                awaiting
                awaiting
                awaiting
                returning


                Async works like this:

            - No Await: The parent waits for the child to go do something, but if the child waits for someone else, 
                the parent leaves.
            - With await: The parent waits for the child to go do something. If the child waits for someone else, 
                the parent keeps waiting on the child. He won't leave until the person the child is waiting for is 
                finished and then the child comes back to the parent.

            That is, with no await, the parent will leave the child if the child waits for someone to finish in the toilet
            They probably think their kid is too lenient and should've broken in. They have no patience. 

            With an await, the parent realises we live in a society.
        */
        return await axios.delete(`${apiURL}`, {
            uid, adminBooking
        });
    }
}

export default BusinessService;