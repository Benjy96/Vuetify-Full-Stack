import firebase from 'firebase';
import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';

class OwnerService {

    /*
        Owner/Business PoV CRUD Operations.
    */

    /** CREATE */
    static async createAdminBooking() {
        //Add to meta-data document.
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
        try{
            //limiting by a week
            dayLimit = DateUtils.getFutureDayString(dayLimit);

            snapshot = await db.collection(`businesses/${uid}/bookings/${year}/month/${month}/days`)
            .where(firebase.firestore.FieldPath.documentId(), '>=', day)
            .where(firebase.firestore.FieldPath.documentId(), '<=', dayLimit)
            .get();
        }catch(e){
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