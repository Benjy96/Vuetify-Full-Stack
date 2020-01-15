import firebase from 'firebase';
import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';
import MetaDataHelper from './MetaDataHelper';

class OwnerService {

    /*
        Owner/Business PoV CRUD Operations.

        Read should check meta-data before EXPENSIVE operations. 
        Add/Create and Delete should check and modify meta-data after ANY operation.

        TODO: Check each operation follows above guidelines.

        ---- For metadata additions..... 

        Could we have a generic function to handle add operations? If we're always adding a RANGE, possibly. 

        -- How to check and mark days unavailable? --

        For admin bookings:

            1. Add every day clearly within range
            2. If to a single day:
                2.1. Check day
                2.2. Mark day


    */

    /**
     * CREATE - TODO: Meta-data
     * @param {*} adminBooking {fromDate: "", toDate: "", fromTime: "" toTime: ""}
     */
    static async createAdminBooking(uid, adminBooking) {

        //1. Get from year, month, and day
        let fromYear = DateUtils.getYearFromDate(adminBooking.fromDate);
        // let fromMonth = DateUtils.getMonthFromDate(adminBooking.fromDate);
        // let fromDay = DateUtils.getMonthFromDate(adminBooking.fromDate);
        // let fromTime = adminBooking.fromTime;

        //2. Get to year, month, and day
        let toYear = DateUtils.getYearFromDate(adminBooking.toDate);
        // let toMonth = DateUtils.getMonthFromDate(adminBooking.toDate);
        // let toDay = DateUtils.getMonthFromDate(adminBooking.toDate);
        // let toTime = adminBooking.toTime;

            //Better solution: Add to a top level collection and just delete the entries which are passed?

            /*

                bookings
                    admin meta-data document:
                        2020 [
                                {
                                fromDate
                                fromTime
                                toDate
                                toTime
                                overlapYear: true
                            }
                        ],
                        2021 [
                                {
                                fromDate
                                fromTime
                                toDate
                                toTime
                            }
                        ]

            */
        if(fromYear == toYear){
            db.collection(`/businesses/${uid}/bookings/`).doc('admin')
            .update(
                {
                    [fromYear]: firebase.firestore.FieldValue.arrayUnion({
                        ...adminBooking
                    })
                }
            );

            MetaDataHelper.markDaysUnavailable();
        } else {
            db.collection(`/businesses/${uid}/bookings/`).doc('admin')
            .update(
                {
                    [fromYear]: firebase.firestore.FieldValue.arrayUnion({
                        ...adminBooking
                    })
                }
            );

            db.collection(`/businesses/${uid}/bookings/`).doc('admin')
            .update(
                {
                    [toYear]: firebase.firestore.FieldValue.arrayUnion({
                        ...adminBooking
                    })
                }
            );

            MetaDataHelper.markDaysUnavailable();
        }
    }

    /** READ */
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

    /** READ */
    static async getAdminBookings(uid) {
        //Fetch from meta-data document.
        let snapshot = await db.collection(`/businesses/${uid}/bookings/`).doc('admin').get();
        return snapshot.data()[DateUtils.getCurrentYearString()];
    }

    /** DELETE/UPDATE - TODO: Meta-data */
    static cancelBooking() {

    }
}

export default OwnerService;