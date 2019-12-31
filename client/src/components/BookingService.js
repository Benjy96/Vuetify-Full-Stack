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

    static async getUnavailableTimeRanges(uid, weekday){
        let ranges = [];
        let snapshot = await db.collection(`businesses/${uid}/unavailable/days/${weekday}`).get();
        snapshot.forEach(doc => {
            ranges.push(doc.id);
        })
        return ranges;
    }
}

export default BookingService;
