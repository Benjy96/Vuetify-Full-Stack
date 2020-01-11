import { db } from '../firebaseInit';

class OwnerService {

    /*
        Owner/Business PoV CRUD Operations.
    */

    /** CREATE */
    static async createAdminBooking() {
        //Add to meta-data document.
    }

    /** READ */
    static async getUpcomingBookings(uid) {
        let bookings = [];
        let snapshot = await db.collection(`businesses/${uid}/bookings`).get();
        snapshot.forEach(doc => {
            bookings.push({
                id: doc.id
            })
        })
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