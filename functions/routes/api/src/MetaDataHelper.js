const firebase = require('firebase-admin').firebase;
const db = require('../../../firebaseDB');

const { DateUtils } = require('./DateUtils');
const { daysOfWeek } = require('./DateUtils');

class MetaDataHelper {

    static test() {
        console.log('hi');
    }

    /**
     * Checks if dates are unavailable and marks them as so
     */
    static async updateMetaData(uid, affectedFromDate, affectedToDate) {
        // Meta-data Get affected dates for marking unavailable
        let affectedDates = DateUtils.getDatesBetweenInclusive(affectedFromDate, affectedToDate);

        for(var i in affectedDates) {
            let dateAvailable = await this.isDateAvailable(uid, affectedDates[i]);
            if(!dateAvailable) {
                this.markDateUnavailable(uid, affectedDates[i]);
            }
        }
    }

    static isTimeLeft(remainingTime) {
        let y = 0;
        for(var x in remainingTime) {
            if(remainingTime[x].remainingTime == 0){
                y++;
                if(y == remainingTime.length) {
                    return false;
                }
            }
        }
        return true;
    }

    static async getAvailableTime(uid, date) {
        let remainingTime = 0;

        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();
        let regularHours = [];

        let weekday = daysOfWeek[new Date(date).getDay()];
        if(regularHoursDoc.exists) {
            regularHours = regularHoursDoc.data()[weekday];
            alert(JSON.stringify(regularHours));
            for(var range in regularHours) {
                //Remove the hours OUTSIDE the regular hours range
                remainingTime += DateUtils.calcFromToDifference(regularHours[range].from, regularHours[range].to);
            }
        }
        return remainingTime;
    }

    /**
     * @returns the amount of available time a user has on a date
     * TODO: Fix - If regular hours not set returns not avialable
     */
    static async getRegularHoursWithTimeRemaining(uid, date) {
        let remainingTime = [];

        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();

        let weekday = daysOfWeek[new Date(date).getDay()];
        if(regularHoursDoc.exists) {
            let regularHours = regularHoursDoc.data()[weekday];
            for(var range in regularHours) {
                let timeRange = regularHours[range].from + "-" + regularHours[range].to;
                let rangeAndTime = {
                    range: timeRange,
                    remainingTime: DateUtils.calcFromToDifference(regularHours[range].from, regularHours[range].to)
                }
                remainingTime.push(rangeAndTime);
            }
        }
        return remainingTime;
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
   //TODO: Conduct manual admin booking testing - some days weren't getting added to unavailableDays (1st Jan Wed)
    static async isDateAvailable(uid, date) {
        //1 - Set remaining hours based on regular hours
        let remainingTime = await this.getRegularHoursWithTimeRemaining(uid, date);

        if(remainingTime.length > 0) {
            let year = DateUtils.getYearFromDate(date);
            let month = DateUtils.getMonthFromDate(date);
            let day = DateUtils.getDayFromDate(date);

            //2 - Check bookings for day
            let dayDoc = await db.collection(`/businesses/${uid}/availability/${year}/month/${month}/days`).doc(`${day}`).get();
            let customer_bookings = [];
            if(dayDoc.exists) {
                customer_bookings = dayDoc.data().customer_bookings;
                for(let rangeIndex in remainingTime) {                  
                    for(var bookedRanges in customer_bookings) {
                        let bookingFromTime = customer_bookings[bookedRanges].from;
                        let bookingToTime = customer_bookings[bookedRanges].to;

                        if(DateUtils.timeWithinHourRange(bookingFromTime, remainingTime[rangeIndex].range) && 
                            DateUtils.timeWithinHourRange(bookingToTime, remainingTime[rangeIndex].range)) 
                        {
                            remainingTime[rangeIndex].remainingTime -= DateUtils.calcFromToDifference(bookingFromTime, bookingToTime);
                        }
                    }
                }

                if(this.isTimeLeft(remainingTime) == false) {
                    return false;
                }
            }

            //3 - Check admin bookings for day
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

                    /* 

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

                    //Admin Booking on one day - take from the regular hours of that day
                    for(let rangeIndex in remainingTime) {
                        if(admin_bookings[i].fromDate == date && admin_bookings[i].toDate == date) {  
                            //accessing the regular hour wrong.. its the left of the key i need                
                            let countFrom = DateUtils.getLeftTimeFromRangeString(remainingTime[rangeIndex].range);
                            let countTo = DateUtils.getRightTimeFromRangeString(remainingTime[rangeIndex].range);

                            if(admin_bookings[i].toTime < countFrom){
                                continue;
                            }
    
                            if(admin_bookings[i].fromTime > countFrom && admin_bookings[i].fromTime <= countTo) {
                                countFrom = admin_bookings[i].fromTime;
                            }
    
                            if(admin_bookings[i].toTime < countTo && admin_bookings[i].toTime >= countFrom) {
                                countTo = admin_bookings[i].toTime;
                            }
    
                            //If admin doesn't intersect inside, it is outside, and ALL reg hours should be subtracted                   
                            remainingTime[rangeIndex].remainingTime -= DateUtils.calcFromToDifference(countFrom, countTo);
                        //Admin from == date or Admin to == date
                        } else if(admin_bookings[i].toDate == date) {
                            let countFrom = DateUtils.getLeftTimeFromRangeString(remainingTime[rangeIndex].range);
                            let countTo = DateUtils.getRightTimeFromRangeString(remainingTime[rangeIndex].range);
    
                            //Otherwise, the admin booking extends beyond the regular hours, and we should subtract all to
                            if(admin_bookings[i].toTime < countTo) {
                                countTo = admin_bookings[i].toTime;
                            }
    
                            remainingTime[rangeIndex].remainingTime -= DateUtils.calcFromToDifference(countFrom, countTo);
                        } else if(admin_bookings[i].fromDate == date) {
                            let countFrom = DateUtils.getLeftTimeFromRangeString(remainingTime[rangeIndex].range);
                            let countTo = DateUtils.getRightTimeFromRangeString(remainingTime[rangeIndex].range);
    
                            //Otherwise, the admin booking extends beyond the regular hours, and we should subtract all from
                            if(admin_bookings[i].fromTime > countFrom) {
                                countFrom = admin_bookings[i].fromTime;
                            }
    
                            remainingTime[rangeIndex].remainingTime -= DateUtils.calcFromToDifference(countFrom, countTo);
                        }
                    }
                }   
            }
            
            //4 - Time left?
            if(this.isTimeLeft(remainingTime) == false) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    static async markDateUnavailable(uid, date) {
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);

        db.collection(`/businesses/${uid}/availability/${year}/month`).doc(`${month}`).update(
            {
                unavailableDays: firebase.firestore.FieldValue.arrayUnion(day)
            }
        );
    }
}

module.exports = MetaDataHelper;