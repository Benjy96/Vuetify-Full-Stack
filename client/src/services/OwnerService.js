import firebase from 'firebase';
import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';
import MetaDataHelper from './MetaDataHelper';

class OwnerService {

    /**
     * Checks if dates are unavailable and marks them as so
     */
    static async updateMetaData(uid, adminBooking) {
        // Meta-data Get affected dates for marking unavailable
        let affectedDates = DateUtils.getDatesBetweenInclusive(adminBooking.fromDate, adminBooking.toDate);

        for(var i in affectedDates) {
            let dateAvailable = await MetaDataHelper.isDateAvailable(uid, affectedDates[i]);
            if(!dateAvailable) {
                MetaDataHelper.markDateUnavailable(uid, affectedDates[i]);
            }
        }
    }

    /*
        Owner/Business PoV CRUD Operations.

        Read should check meta-data before EXPENSIVE operations. 
        Add/Create and Delete should check and modify meta-data after ANY operation.

        After each Create or Update or Delete, run the meta data update methods
    */

    /**
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

        this.updateMetaData(uid, adminBooking);
    }

    /* ----- READ ----- */

    static async getUpcomingBookings(uid, dayLimit) {
        let year = DateUtils.getCurrentYearString();
        let month = DateUtils.getCurrentMonthString();
        let day = DateUtils.getCurrentDayString();

        let bookings = {
            [year]: {
                [month]: []
            }
        };

        let snapshot;
        try 
        {
            //limiting by a week
            dayLimit = DateUtils.getFutureDayString(dayLimit);

            snapshot = await db.collection(`businesses/${uid}/bookings/${year}/month/${month}/days`)
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
        snapshot.forEach(doc => {
            let dayObj = {
                day: doc.id,
                customer_bookings: doc.data()
            }

            bookings[year][month].push(dayObj);
        });
        return bookings;
    }

    static async getAdminBookings(uid) {
        //Fetch from meta-data document.
        let snapshot = await db.collection(`/businesses/${uid}/bookings/`).doc('admin').get();
        return snapshot.data()["admin_bookings"];
    }

    /* ----- DELETE/UPDATE ------ */

    static cancelBooking() {

    }

    static async deleteAdminBooking(uid, adminBooking) {
        let adminDocRef = db.collection(`/businesses/${uid}/bookings`).doc('admin');
        let admin_bookings = (await adminDocRef.get()).data().admin_bookings;

        let newAdminBookingsArray = admin_bookings.filter(item => JSON.stringify(item) != JSON.stringify(adminBooking));

        adminDocRef.update({
            admin_bookings: newAdminBookingsArray
        });

        //TODO: Will the await inside updateMetaData slow things down? Single-threaded JS? What happens here?
        this.updateMetaData(uid, adminBooking);

        return newAdminBookingsArray;
    }
}

export default OwnerService;