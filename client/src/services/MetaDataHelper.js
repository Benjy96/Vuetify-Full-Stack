import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';
import { daysOfWeek } from '../DateUtils';

class MetaDataHelper {

    //TODO - what are the from/to? Rounded up and down from/to day if a range?
    // static async markDaysUnavailable(uid, from, to) {
    //     //Example meta-data doc path: /businesses/6c6qWcNvsOhBpF0CgUox4LsG2v62/availability/2020/month/01

    //     //1. Get every month involved in the from->to
    //     //2. For each month, access firestore meta-data document
    //         //3. Add day to unavailable list
            
    // }

    /*
        TODO: What if we instead have a day collection, where you add different "types" to it,
        like an admin booking & customer booking?

        TODO: Move to back-end? Listener? Any time you add to booking or admin or regular hours collection?
    */
   /** 
    * Checks regular hours & admin/customer bookings
    * @returns {boolean}
    */
    static async isDateAvailable(uid, date) {
        //Prepare to count remaining hours of a day
        let remainingHours = 24;

        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);

        //1. Check bookings for day
        let dayDoc = await db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`).get();
        let customer_bookings = [];
        if(dayDoc.exists) {
            customer_bookings = dayDoc.data().customer_bookings;

            for(var bookedRanges in customer_bookings){
                remainingHours -= DateUtils.calcFromToDifference(customer_bookings[bookedRanges].from, 
                    customer_bookings[bookedRanges].to);
            }

            if(remainingHours <= 0) {
                return false;
            }
        }
        
        //2. Check admin bookings for day
        let adminDoc = await db.collection(`/businesses/${uid}/bookings`).doc('admin').get();
        let admin_bookings = [];
        if(adminDoc.exists) {
            admin_bookings = adminDoc.data().admin_bookings;

            //Get the relevant admin booking for this day
            for(var i in admin_bookings) {
                //The day is in the middle of a large range of time
                if(DateUtils.dateBetween(date, admin_bookings[i].from, admin_bookings[i].to)) {
                    return false;
                }

                //Admin Booking on one day
                if(admin_bookings[i].fromDate == date && admin_bookings[i].toDate == date) {
                    remainingHours -= DateUtils.calcFromToDifference(admin_bookings[i].from, admin_bookings[i]. to);
                } else if(admin_bookings[i].fromDate == date) {
                    //The day is on the admin booking "from" date
                    remainingHours -= DateUtils.calcFromToDifference(admin_bookings[i].fromTime, "24:00");
                } else if(admin_bookings[i].toDate == date) {
                    //The day is on admin booking "to" date
                    remainingHours -= DateUtils.calcFromToDifference("00:00", admin_bookings[i].toTime);
                }

                if(remainingHours <= 0) {
                    return false;
                }
            }   
        }

        //3. Check regular hours for day
        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();
        let regularHours = [];

        let weekday = daysOfWeek[new Date(date).getDay()];
        if(regularHoursDoc.exists) {
            regularHours = regularHoursDoc.data()[weekday];

            for(var range in regularHours){
                remainingHours -= DateUtils.calcRangeDifference(regularHours[range]);
            }
        }

        //4. Time left?
        if(remainingHours <= 0) {
            return false;
        } else {
            return true;
        }
    }
}

export default MetaDataHelper;