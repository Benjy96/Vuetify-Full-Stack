const db = require('../../../firebaseDB');
const admin = require('firebase-admin');

const { DateUtils } = require('./DateUtils');
const { daysOfWeek } = require('./DateUtils');

class MetaDataHelper {

    /**
     * Checks if dates are unavailable and marks them as so
     * TODO: listener, instead? safer? means you don't have to remember to call it
     */
    static async updateMetaData(uid, affectedFromDate, affectedToDate) {
        // Meta-data Get affected dates for marking unavailable
        let affectedDates = DateUtils.getDatesBetweenInclusive(affectedFromDate, affectedToDate);

        let promises = [];

        //WARNING: if you use var i only affectedDates[31] will be called

        //The loop was completing iterations and THEN the callbacks were being called with the 
        //last value of the loop. 
        //See: https://stackoverflow.com/questions/11488014/asynchronous-process-inside-a-javascript-for-loop
        for(let i in affectedDates) {   
            promises.push(this.isDateAvailable(uid, affectedDates[i]));
        }
        /*

        1. Wait to calculate all available/unavailable days
        2. Create multiple month meta-data arrays
            - Store each day for each month
        3. Set each document - how to iterate object?

        */
       let metaDataArrays = {};

       // 1. 
       Promise.all(promises).then(availableBools => {
        // Get each year-month that needs stored
        for(let i in affectedDates) {
            let affectedYM = DateUtils.getYearFromDate(affectedDates[i]) + "-" + DateUtils.getMonthFromDate(affectedDates[i]);
            // Initialise each meta data array that we need
            if(!metaDataArrays[affectedYM]) {
                metaDataArrays[affectedYM] = [];
            }
        }

        // Store each day in each meta-data array
        for(let i in affectedDates) {
            let affectedDateYearMonth = DateUtils.getYearFromDate(affectedDates[i]) + "-" + DateUtils.getMonthFromDate(affectedDates[i]);
            if(availableBools[i] == false) {
                metaDataArrays[affectedDateYearMonth].push(DateUtils.getDayFromDate(affectedDates[i]));
            }
        }

        // Set each meta-data document
        let yearMonths = Object.keys(metaDataArrays);
        for(let i in yearMonths) {
            this.setUnavailableDays(uid, yearMonths[i], metaDataArrays[yearMonths[i]]);
        }
       });
    }

    static isTimeLeft(remainingTime, userBookingDuration) {
        let y = 0;
        for(var x in remainingTime) {
            if(remainingTime[x].remainingTime < userBookingDuration){
                y++;
                if(y == remainingTime.length) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @returns the amount of available time a user has on a date
     * [
     *  {
     *      range: "xx:xx-xx:xx",
     *      remainingTime: xx
     *  }
     *  ...
     * ]
     */
    static getTimeRemainingForRegularHours(regularHoursArrays, date) {
        let remainingTime = [];

        let weekday = daysOfWeek[new Date(date).getDay() - 1];
        if(regularHoursArrays[weekday] != undefined) {
            let regularHours = regularHoursArrays[weekday];

            if(regularHours.length == 0) return [];

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
   //TODO: Reduce reads by fetching doc in parent function and passing to helpers
   //TODO: What if deleting admin booking?
    static async isDateAvailable(uid, date) {
        let regularHoursDoc = await db.collection(`/businesses/${uid}/availability`).doc(`regular`).get();

        if(regularHoursDoc.exists) {
            let userBookingDuration = 60;
            if(regularHoursDoc.data().bookingDuration) {
                userBookingDuration = regularHoursDoc.data().bookingDuration;
            }
            //1 - Set remaining hours based on regular hours
            let remainingTime = this.getTimeRemainingForRegularHours(regularHoursDoc.data(), date);
    
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
    
                    if(this.isTimeLeft(remainingTime, userBookingDuration) == false) {
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
                if(this.isTimeLeft(remainingTime, userBookingDuration) == false) {
                    return false;
                } else {
                    return true;
                }
            }
        }

        return false;
    }

    static async markDateUnavailable(uid, date) {
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);

        db.collection(`/businesses/${uid}/availability/${year}/month`).doc(`${month}`).set(
            {
                unavailableDays: admin.firestore.FieldValue.arrayUnion(day)
            },
            { merge: true }
        );
    }

    static async setUnavailableDays(uid, yearMonth, days) {
        let year = yearMonth.split("-")[0];
        let month = yearMonth.split("-")[1];

        db.collection(`/businesses/${uid}/availability/${year}/month`).doc(`${month}`).set(
            {
                unavailableDays: days
            }
        );
    }
}

module.exports = MetaDataHelper;