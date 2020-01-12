import firebase from 'firebase';
import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';

class OwnerService {

    /*
        Owner/Business PoV CRUD Operations.
    */

    /**
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

        //TODO: What if we also added a month array? How to separate? Cost is again logic v storage
        if(fromYear == toYear){
            db.collection(`/businesses/${uid}/bookings/`).doc('admin')
            .update(
                {
                    [fromYear]: firebase.firestore.FieldValue.arrayUnion({
                        ...adminBooking
                    })
                }
            );
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
            .where(firebase.firestore.FieldPath.documentId(), '>=', day)
            .where(firebase.firestore.FieldPath.documentId(), '<=', dayLimit)
            .get();
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
    static async getAdminBookings() {
        //Fetch from meta-data document.
    }

    /** DELETE/UPDATE */
    static cancelBooking() {

    }
}

export default OwnerService;