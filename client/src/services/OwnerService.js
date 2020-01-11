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
    //TODO: How to organise them?
    static async getUpcomingBookings(uid) {
        let year = DateUtils.getCurrentYearString();
        let month = DateUtils.getCurrentMonthString();

        let bookings = {
            [year]: {
                [month]: []
            }
        };

        let snapshot = await db.collection(`businesses/${uid}/bookings/${year}/month/${month}/days`).get();
        snapshot.forEach(doc => {
            let dayObj = {
                day: doc.id,
                bookings: doc.data()
            }

            bookings[year][month].push(dayObj);
        });
        alert(JSON.stringify(bookings[year][month]));
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