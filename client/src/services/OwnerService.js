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
        let year = DateUtils.getYear();  //TODO: DateUtils dynamic.
        let month = DateUtils.getMonth();
        let bookings = [];

        let snapshot = await db.collection(`businesses/${uid}/bookings/${year}/month/${month}/days/`).get();
        snapshot.forEach(doc => {
            bookings.push(doc.data());
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