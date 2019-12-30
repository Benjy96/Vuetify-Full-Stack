import { db } from '../firebaseInit';

class BookingService {

    static async getBookings(uid) {
        let bookings = [];
        let snapshot = await db.collection(`businesses/${uid}/bookings`).get();
        snapshot.forEach(doc => {
            bookings.push({
                id: doc.id
            })
        })
        return bookings;
    }
}

export default BookingService;
