
import firebase from 'firebase';
import { db } from '../firebaseInit';
import MetaDataHelper from './MetaDataHelper';
import { DateUtils } from '../DateUtils';

class CalendarService {

    static sendBookingEmail(recipientEmail, bookingDate, from, to) {
        let docRef = db.collection('mail').doc();
        docRef.set({
            to: recipientEmail,
            message: {
                subject: 'Booking Confirmation',
                html: `Hi there!
                <br>This is a confirmation of your booking on ${bookingDate} from ${from}-${to}.
                <br>Your booking confirmation code is: 
                <blockquote>${docRef.id}</blockquote>
                <br>Don't worry, you won't have to say that or anything. It's just for if you want to cancel your booking.`
            }
        });
    }
    /*
        Day PoV CRUD Operations.

        Read should check meta-data before EXPENSIVE operations. 
        Add and Delete should check and modify meta-data after ANY operation.

        TODO: Check each operation follows above guidelines.
    */

    /**
     * 
     * TODO: Make into a transaction for error handling:
     * https://firebase.google.com/docs/firestore/manage-data/transactions
     * 
    */
    static async createBooking(uid, email, year, month, day, from, to) {
        //1. Write to availability collection
        let bookedDayDocRef = db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`);
        bookedDayDocRef.set({
            "customer_bookings": firebase.firestore.FieldValue.arrayUnion({
                    "from": from,
                    "to": to
                })
            }, 
            {merge: true}
        );

        //2. Write to more detailed owner bookings collection - TODO: Store name, etc. Not relevant yet.
        db.collection(`/businesses/${uid}/bookings/${year}/month/${month}/days`).doc(`${day}`)
        .set({
            "customer_bookings": firebase.firestore.FieldValue.arrayUnion({
                    "email": email,
                    "from": from,
                    "to": to
                })
            }, 
            {merge: true}
        );

        let affectedDate = DateUtils.convertYearMonthDayToDate(year, month, day);
        MetaDataHelper.updateMetaData(uid, affectedDate, affectedDate);

        //3. Send an email
        this.sendBookingEmail(email, affectedDate, from, to);
    }

    /** Cal-Day-DELETE */
    static async cancelBooking() {

    }

    /* 
        Month PoV READ Operations.
    */

    //TODO: IF we stored this on back-end could have a listener and only need to actually query meta data when metadata changes
    /** READ from a month's meta-data document */
    static async getUnavailableDays(uid, year, month) {
        let metaDataDocRef = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        let unavailableDays = {};
        if(metaDataDocRef.exists) {
            unavailableDays = metaDataDocRef.data().unavailableDays;
        }

        return unavailableDays;
    }

    /*
        Month & Day PoV READ Operations
    */

    static async getBookings(uid, year, month, day) {
        //Read from availability collection
        let bookingsRef = await db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`).get();
        let customer_bookings = [];
        if(bookingsRef.exists) {
            customer_bookings = bookingsRef.data().customer_bookings;
            return customer_bookings;
        } else {
            return null;
        }
    }

    static async getAdminBookings(uid, year, month) {
        let metaDataDocRef = await db.collection(`/businesses/${uid}/availability/${year}/month/`).doc(`${month}`).get();
        let admin_bookings = [];
        if(metaDataDocRef.exists) {
            admin_bookings = metaDataDocRef.data().admin_bookings;
            return admin_bookings;
        } else {
            return null;
        }
    }

    static async getRegularAvailability(uid) {
        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc('regular').get();
        let regular_availability = [];
        if(regularHoursDoc.exists){
            regular_availability = regularHoursDoc.data();
            return regular_availability;
        } else {
            return null;
        }
    }
}

export default CalendarService;