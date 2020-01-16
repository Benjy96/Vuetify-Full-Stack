import { db } from '../firebaseInit';
import { DateUtils } from '../DateUtils';
import { daysOfWeek } from '../DateUtils';

class MetaDataHelper {

    static isTimeLeft(ranges) {
        let y = 0;
        for(var x in remainingRanges) {
            if(remainingRanges[x] == 0){
                y++;
                if(y == remainingRanges.length) {
                    return false;
                }
            }
        }
        return true;
    }

    static async getAvailableTime(uid, date) {
        let remainingRanges = 0;

        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();
        let regularHours = [];

        let weekday = daysOfWeek[new Date(date).getDay()];
        if(regularHoursDoc.exists) {
            regularHours = regularHoursDoc.data()[weekday];
            alert(JSON.stringify(regularHours));
            for(var range in regularHours) {
                //Remove the hours OUTSIDE the regular hours range
                remainingRanges += DateUtils.calcFromToDifference(regularHours[range].from, regularHours[range].to);
            }
        }
        return remainingRanges;
    }

    /**
     * @returns the amount of available time a user has on a date
     */
    static async getRegularHoursWithTimeRemaining(uid, date) {
        let remainingRanges = [];

        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();
        let regularHours = [];

        let weekday = daysOfWeek[new Date(date).getDay()];
        if(regularHoursDoc.exists) {
            regularHours = regularHoursDoc.data()[weekday];
            for(var range in regularHours) {
                let timeRange = regularHours[range].from + regularHours[range].to;
                let rangeAndTime = {
                    [timeRange]: DateUtils.calcFromToDifference(regularHours[range].from, regularHours[range].to)
                }
                remainingRanges.push(rangeAndTime);
            }
        }
        return remainingRanges;
    }
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
        //1 - Set remaining hours based on regular hours
        let remainingRanges = await this.getRegularHoursWithTimeRemaining(uid, date);

        if(remainingRanges.length > 0) {
            let year = DateUtils.getYearFromDate(date);
            let month = DateUtils.getMonthFromDate(date);
            let day = DateUtils.getDayFromDate(date);

            //1. Check bookings for day
            let dayDoc = await db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`).get();
            let customer_bookings = [];
            if(dayDoc.exists) {
                customer_bookings = dayDoc.data().customer_bookings;

                for(let range in remainingRanges) {
                    for(var bookedRanges in customer_bookings) {
                        let bookingFromTime = customer_bookings[bookedRanges].from;
                        let bookingToTime = customer_bookings[bookedRanges].to;

                        if(DateUtils.timeWithinHourRange(bookingFromTime, range) && 
                            DateUtils.timeWithinHourRange(bookingToTime, range)) 
                        {
                            remainingRanges[range] -= DateUtils.calcFromToDifference(bookingFromTime, bookingToTime);
                        }
                    }
                }

                if(this.isTimeLeft(remainingRanges) == false) {
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
                    if(DateUtils.dateBetween(date, admin_bookings[i].fromDate, admin_bookings[i].toDate)) {
                        return false;
                    }

                    //Admin Booking on one day
                    if(admin_bookings[i].fromDate == date && admin_bookings[i].toDate == date) {
                        //remainingRanges -= DateUtils.calcFromToDifference(admin_bookings[i].fromTime, admin_bookings[i].toTime);

                        /* TODO: Check for admin bookings

                            An admin booking can be outside or inside the range

                            We need to subtract the time within both ranges

                            e.g.:

                            Start with remaining: 8.5

                            regular 09:00->17:30
                            admin 00:00->14:00
                            
                            Need to subtract 5 hours. Remaining 3.5

                        */

                        
                        for(let range in remainingRanges) {

                        /*

                        For each regular hour range, (admin / reg):

                        This is how we can do it: Use logic to determine the inside and outisde of each range:
                        
                            10:00->14:00 / 09:00->12:30 = 
                                if admin to > reg to 
                                &&
                                if admin from > reg from:
                                    count from admin from -> reg to
                                && admin from > reg from:
                                    count from admin from to reg to
                                    subtract from this range's remaining hours


                                    ** We only need to count the hours in the reg range! **
                                    I.e., 
                                    count to reg To if largest To
                                    count from reg from if admin from >= reg from

                                    Simply need to determine the largest/smallest from and to:

                                    if adFrom > regFrom, countFrom = regFrom (reg hours are what we're subtracting from)
                                    else countFrom = adminFrom
                                    if adTo > regTo, countTo = regTo
                                    else countTo = adTo

                        */

                        }




                    } else if(admin_bookings[i].fromDate == date) {
                        //The day is on the admin booking "from" date
                        //remainingRanges -= DateUtils.calcFromToDifference(admin_bookings[i].fromTime, "24:00");







                    } else if(admin_bookings[i].toDate == date) {

                        //remainingRanges -= DateUtils.calcFromToDifference("00:00", admin_bookings[i].toTime);





                    }

                    if(this.isTimeLeft(remainingRanges) == false) {
                        return false;
                    }
                }   
            }

            //4. Time left?
            if(this.isTimeLeft(remainingRanges) == false) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }
}

export default MetaDataHelper;