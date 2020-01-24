
import firebase from 'firebase';
import { db } from '../firebaseInit';
import MetaDataHelper from './MetaDataHelper';
import { DateUtils } from '../DateUtils';

class CalendarService {

    //TODO: Move to backend - either call from service or add a listener to booking collection
    //TODO: Add HTML template with CSS - Sendgrid has demos - figure out how to read in a html file into the JS
        //perhaps this? https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_readfile_file_options_callback
    static sendBookingEmail(recipientEmail, businessId, bookingDate, from, to) {
        let docRef = db.collection('mail').doc();
        docRef.set({
            bookingInfo: {
                date: bookingDate,
                from: from,
                to: to,
                uid: businessId
            },
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
        this.sendBookingEmail(email, uid, affectedDate, from, to);
    }

    /**
     * DELETE
     * @param {String} bookingReference The id of the document in firebase
     * TODO: deletes from one booking collection only currently - what about other?
     */
    static async cancelBooking(bookingReference) {
        let mailDoc = await db.collection('mail').doc(bookingReference).get();
        if(mailDoc.exists) {
            let data = mailDoc.data();

            let uid = data.bookingInfo.uid;
            let date = data.bookingInfo.date;
            let year = DateUtils.getYearFromDate(date);
            let month = DateUtils.getMonthFromDate(date);
            let day = DateUtils.getDayFromDate(date);
            let bookingFrom = data.bookingInfo.from;
            let bookingTo = data.bookingInfo.to;

            let bookingRef = db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`);
            let customer_bookings = (await bookingRef.get()).data().customer_bookings;

            customer_bookings = customer_bookings.filter(item => (item.from != bookingFrom) && (item.to != bookingTo));

            alert(JSON.stringify(customer_bookings));

            if(customer_bookings.length == 0) {
                bookingRef.delete().then(MetaDataHelper.updateMetaData(uid, date, date));
            } else {
                bookingRef.update({
                    customer_bookings: customer_bookings
                }).then(MetaDataHelper.updateMetaData(uid, date, date));
            }
        }
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