export const daysOfWeekNumbered = [
    {text: "Monday", value: 1},
    {text: "Tuesday", value: 2},
    {text: "Wednesay", value: 3},
    {text: "Thursday", value: 4},
    {text: "Friday", value: 5},
    {text: "Saturday", value: 6},
    {text: "Sunday", value: 7}
];

export const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

export class DateUtils {

    /**
     * Increments or decrements the month of a date. HOWEVER: Always returns 01 for the DD of YYYY-MM-DD
     * @param {*} date The date you wish to increment or decrement
     * @param {*} numMonthIncrements a positive or negative number
     * @returns {String} YYYY-MM-DD, where DD is 01 and YYYY-MM are incremented or decremented
     */
    static incrementMonthOfDate(date, numMonthIncrements) {
        let year = parseInt(this.getYearFromDate(date));
        let month = parseInt(this.getMonthFromDate(date));
        // How to, from a number, calculate a given year and month?

        //It's not just based on the number, but our position
        if(numMonthIncrements < 0) {
            let numYearsToDecrease, newMonth;

            //Decreasing but not by over a year
            if(numMonthIncrements < 12 && month + numMonthIncrements < 0) {
                numYearsToDecrease = 1;
                // e.g., Jan (1) - 2 months = -1, which is 12 + -1, which is 11
                newMonth = 12 + (month + numMonthIncrements);
            } else if(numMonthIncrements < 12 && month + numMonthIncrements == 0) {
                numYearsToDecrease = 1;
                newMonth = 12;
            } else {
                numYearsToDecrease = Math.floor(-numMonthIncrements / 12);
                newMonth = -numMonthIncrements % 12;
            }

            year -= numYearsToDecrease;

            return `${year}-${this.formatNumInMMFormat(newMonth)}-01`;
        } else if(numMonthIncrements > 0) {
            let numYearsToIncrease, newMonth;

            //Not going to new year
            if(numMonthIncrements + month <= 12) {
                numYearsToIncrease = 0;
                newMonth = numMonthIncrements + month;
            } else {
                newMonth = (numMonthIncrements + month) % 12;
                numYearsToIncrease = Math.floor((numMonthIncrements + month) / 12);
            }

            year += numYearsToIncrease;

            return `${year}-${this.formatNumInMMFormat(newMonth)}-01`
        } else {
            return date;
        }
    }

    static getLastMonthDate(fromDate) {
        let month = parseInt(this.getMonthFromDate(fromDate)) - 1;
        let year = this.getYearFromDate(fromDate);

        if(month < 1) {
            year = parseInt(year) - 1;
            return `${year}-12-01`;
        }

        if(month >= 10) {
            return `${year}-${month}-01`;
        }

        return `${year}-0${month}-01`;
    }

    /**
     * @param {String} date YYYY-MM-DD, with DD being 01 and YYYY / MM being incremented or decremented appropriately
     */
    static getNextMonthDate(fromDate) {
        let month = parseInt(this.getMonthFromDate(fromDate)) + 1;
        let year = this.getYearFromDate(fromDate);

        if(month > 12) {
            year = parseInt(year) + 1;
            return `${year}-01-01`;
        }

        if(month >= 10) {
            return `${year}-${month}-01`;
        }

        return `${year}-0${month}-01`;
    }

    static formatNumInMMFormat(month) {
        if(month >= 10) {
            return month;
        } else if(typeof month == 'number') {
            return "0" + month.toString();
        } else if(typeof month == 'string') {
            return "0" + month;
        }
    }

    /**
     * @returns {String[]} years
     */
    static getYearsInRange(from, to) {
        let fromYear = parseInt(from.split("-")[0]);
        let toYear = parseInt(to.split("-")[0]);

        let years = [];
        for(let i = fromYear; i <= toYear; i++){
            years.push(i);
        }

        return years;
    }

    /**
     * @returns {number} 1 if the same month in the from and to dates
     */
    static getNumMonthsInRange(from, to) {
        let numMonths = 0;
        let years = this.getNumYearsInRange(from, to);

        if(years > 1) {
            //Subtract smallest and largest to their "terminal" month
            let monthsToEndFirstYear = 12 - parseInt(this.getMonthFromDate(from)); // Month -----> End of Year
            let monthsInLaterYear = parseInt(this.getMonthFromDate(to)); // Start of Year <----- Month

            numMonths = monthsToEndFirstYear + monthsInLaterYear;

            //go through the middle years - add 12 for in-between years
            for(let i = 1; i < years - 1; i++){
                numMonths += 12;
            }

            return numMonths;

        } else {
            let fromMonth = parseInt(this.getMonthFromDate(from));
            let toMonth = parseInt(this.getMonthFromDate(to));

            numMonths = toMonth - fromMonth;

            return numMonths + 1;
        }
    }

    static getNumYearsInRange(from, to) {
        return this.getYearsInRange(from, to).length;
    }

    /**
     * @returns {String} "YYYY-DD-MM" as "YYYY-MM-DD"
     */
    static formatAmericanDateToUK(date) {
        let splitString = date.split("-");
        let year = splitString[0];
        let month = splitString[2];
        let day = splitString[1];

        return year + "-" + month + "-" + day;
    }

    static getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    /**
     * If you add more days than the month has, the function returns the max day of the month
     * @param {number} increment 
     */
    static getFutureDayString(increment) {
        let d = new Date();
        d.setDate(d.getDate() + increment);
        let day = this.getDDFormatedDay(d.getDate());
        if(day <= this.getCurrentDayString() && increment > 0){
            return (this.getDaysInMonth(d.getFullYear(), d.getMonth())).toString();
        } else {
            return day.toString();
        }
    }

    static getCurrentDayString() {
        return this.getDDFormatedDay(new Date().getDate());
    }

    static getCurrentMonthString() {
        let d = new Date();
        d = d.getMonth() + 1;
        if(d < 10){
            d = "0" + d;
        }
        return d;
    }

    static getCurrentYearString() {
        let d = new Date();
        return d.getFullYear().toString();
    }

    static getCurrentDateString() {
        return `${this.getCurrentYearString()}-${this.getCurrentMonthString()}-${this.getCurrentDayString()}`;
    }

    static formatMinuteToMM(minute) {
        if(typeof minute == 'number'){
            if(minute < 10){
                return "0" + minute;
            } else {
                return minute.toString();
            }
        }
    }

    //TODO: How to handle 24 in db and across days? For admin bookings?
    static formatHourToHH(hour) {
        if(typeof hour == 'number'){
            if(hour < 10) {
                return "0" + hour;
            } else {
                return hour.toString();
            }
        }
    }

    static getHourMinFormattedHHMM(hour, minute) {
        hour = this.formatHourToHH(hour);
        minute = this.formatMinuteToMM(minute);
        return hour + ":" + minute;
    }

    /**
     * 
     * @param {*} from 
     * @param {*} interval 
     */
    static getToTimeFormattedHHMM(fromHour, fromMinute, intervalDuration) {
        //TODO: subtract 60 from each 60 above 60 in future.. variable
        if(intervalDuration == 60){
            intervalDuration = intervalDuration /= 60;

            fromHour += intervalDuration;

            return this.getHourMinFormattedHHMM(fromHour, fromMinute);
        }else {
            throw "TODO: Implement interval durations smaller or larger than 1 hour";
        }
    }

    static getDDFormatedDay(day) {
        if(typeof day == 'number' && day < 10){
            return "0" + day;
        }else if(typeof day == 'string' && day.length < 2){
            return "0" + day;
        }else if(typeof day == 'number'){
            return day.toString();
        }
    }

    /**
     * @param {Date} date 
     */
    static getWeekdayFromDateObj(date) {
        if(typeof date == 'object'){
            let day = date.getDay();
            if(day == 0) {
                return daysOfWeek[7];
            } else {
                return daysOfWeek[day - 1];
            }
        }
    }

    /**
     * @param {String} date 
     */
    static getWeekdayFromDateString(date) {
        let d = new Date(date);
        return this.getWeekdayFromDateObj(d);
    }

    /**
     * @param {String} date "DD from YYYY-MM-DD"
     */
    static getDayFromDate(date) {
        if(typeof date == 'string') {
            return date.substr(8, 2);
        } else if(typeof date == 'number') {
            return date.toString().substr(8, 2);
        } else if (typeof date == 'object') {
            return date.toISOString().split("-")[2].split("T")[0];
        }
    }

    /**
     * @param {String} date "MM from YYYY-MM-DD"
     * @returns {String}
     */
    static getMonthFromDate(date) {
        if(typeof date == 'string') {
            return date.substr(5, 2);
        } else if (typeof date == 'number') {
            return date.toString().substr(5, 2);
        } else if (typeof date == 'object') {
            return date.toISOString().split("-")[1];
        }
    }

    /**
     * 
     * @param {String} date YYYY from "YYYY-MM-DD"
     */
    static getYearFromDate(date) {
        if(typeof date == 'string') {
            return date.substr(0, 4);
        } else if (typeof date == 'number') {
            return date.toString().substr(0, 4);
        } else if (typeof date == 'object') {
            return date.toISOString().split("-")[0];
        }
    }

    /**
     * Format into YYYY-MM-DD
     * @returns {String} date
     */
    static convertYearMonthDayToDate(year, month, day) {
        return `${year}-${month}-${day}`;
    }

    /**
     * Converts a JavaScript Date object to YYYY-MM-DD
     * @param {String} date 
     */
    static convertDateToYYYYMMDD(date) {
        return `${this.getYearFromDate(date)}-${this.getMonthFromDate(date)}-${this.getDayFromDate(date)}`;
    }

    /**
     * 
     * @param {String} range splits a string of format "00:00-17:00" into two strings
     * @returns {object} a times object with a "left" and "right" property containing an "hour" and "minute"
     */
    static getTimesFromRangeString(range) {
        let splitRange = range.split("-");

        let leftHour = parseInt(splitRange[0].split(":")[0]);   //00
        let leftMinute = parseInt(splitRange[0].split(":")[1]);

        let rightHour = parseInt(splitRange[1].split(":")[0]);  //17
        let rightMinute = parseInt(splitRange[1].split(":")[1]);

        let times = {
            left: {
                hour: leftHour,
                minute: leftMinute
            },
            right: {
                hour: rightHour,
                minute: rightMinute
            }
        }

        return times;
    }

    static getLeftTimeFromRangeString(range) {
        return range.split("-")[0];
    }

    static getRightTimeFromRangeString(range) {
        return range.split("-")[1];
    }

    /**
     * @param {String} range a String of format "00:00-17:00"
     */
    static calcRangeDifference(range) {
        let times = this.getTimesFromRangeString(range);

        let hourDiff = times.left.hour - times.right.hour;    //-17
        let minDiff = times.left.minute - times.right.minute; //0

        if(hourDiff < 0){
            hourDiff = -hourDiff;
        }

        if(minDiff < 0){
            minDiff = -minDiff;
        }

        return hourDiff + (minDiff / 60);
    }

    /**
     * @param {*} from a String of format "09:00"
     * @param {*} to a String of format "17:00"
     */
    static calcFromToDifference(from, to) {
        let fromHour = from.split(":")[0];
        let fromMin = from.split(":")[1];

        let toHour = to.split(":")[0];
        let toMin = to.split(":")[1];

        let hourDiff = fromHour - toHour;    //-17
        let minDiff = fromMin - toMin; //0

        if(hourDiff < 0){
            hourDiff = -hourDiff;
        }

        if(minDiff < 0){
            minDiff = -minDiff;
        }

        return hourDiff + (minDiff / 60);
    }

    /**
     * 
     * @param {String} range a String in the format "00:00-23:59".
     * 
     */
    static hourMinWithinHourRange(hour, minute, range) {
        let splitRange = range.split("-");

        let leftHour = parseInt(splitRange[0].split(":")[0]);   //00
        let leftMinute = parseInt(splitRange[0].split(":")[1]);

        let rightHour = parseInt(splitRange[1].split(":")[0]);  //23
        let rightMinute = parseInt(splitRange[1].split(":")[1]);

        //Same hour - 00:00 -> 00:45 or 17:00 -> 17:45
        if(hour == leftHour && hour == rightHour) {
            if(minute >= leftMinute && minute <= rightMinute) {
                return true;
            } else {
                return false;
            }
        }

        //No Reset - 17:00 -> 23:59
        if(leftHour < rightHour) {
            if(hour > leftHour && hour < rightHour) {
                return true;
            } else if(hour == leftHour) {
                if(minute >= leftHour) {
                    return true;
                } else {
                    return false;
                }
            } else if(hour == rightHour) {
                if(minute <= rightMinute) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    /**
     * from is exclusive, end is inclusive 
     * (time 10:00 with from 10:00 == false) 
     * (time 11:00 with to 11:00 == true)
     * @param {String} time a String in the format "14:00"
     * @param {String | {from:"", to: ""}} range a String in the format "00:00-23:59", or an object
     * with a "from" and "to" property in the format "00:00"
     */
    static timeWithinHourRange(time, range) {
        let leftHour, leftMinute, rightHour, rightMinute;

        if(range.from && range.to) {
            leftHour = parseInt(range.from.split(":")[0]);
            leftMinute = parseInt(range.from.split(":")[1]);

            rightHour = parseInt(range.to.split(":")[0]);  //23
            rightMinute = parseInt(range.to.split(":")[1]);
        } else {
            let splitRange = range.split("-");

            leftHour = parseInt(splitRange[0].split(":")[0]);   //00
            leftMinute = parseInt(splitRange[0].split(":")[1]);

            rightHour = parseInt(splitRange[1].split(":")[0]);  //23
            rightMinute = parseInt(splitRange[1].split(":")[1]);
        }

        let hour = time.split(":")[0];
        let minute = time.split(":")[1];

        //Same hour - 00:00 -> 00:45 or 17:00 -> 17:45
        if(hour == leftHour && hour == rightHour) {
            if(minute >= leftMinute && minute <= rightMinute) {
                return true;
            } else {
                return false;
            }
        }

        //No Reset - 17:00 -> 23:59
        if(leftHour < rightHour) {
            if(hour > leftHour && hour < rightHour) {
                return true;
            } else if(hour == leftHour) {
                if(minute >= leftHour) {
                    return true;
                } else {
                    return false;
                }
            } else if(hour == rightHour) {
                if(minute <= rightMinute) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    static timeGreaterThan(time, comparisonTime) {
        let hour, minute, otherHour, otherMinute;

        hour = parseInt(time.split(":")[0]);   //00
        minute = parseInt(time.split(":")[1]);

        otherHour = parseInt(comparisonTime.split(":")[0]);  //23
        otherMinute = parseInt(comparisonTime.split(":")[1]);

        //13:00 and 12:00
        if(hour > otherHour) {
            return true;
        }
        // 09:00 and 10:30
        else if(hour < otherHour) {
            return false;
        }
        // 10:00 and 10:00
        else if(hour == otherHour && minute == otherMinute) {
            return false;
        } 
        // 10:30 and 10:15
        else if(hour == otherHour && minute > otherMinute) {
            return true;
        }
    }

    /**
     * @param {String} time "00:00"
     * @param {String} comparisonTime "00:00"
     */
    static timeGreaterThanOrEqualTo(time, comparisonTime) {
        let hour, minute, otherHour, otherMinute;

        hour = parseInt(time.split(":")[0]);   //00
        minute = parseInt(time.split(":")[1]);

        otherHour = parseInt(comparisonTime.split(":")[0]);  //23
        otherMinute = parseInt(comparisonTime.split(":")[1]);

        // 10:00 and 09:30
        if(hour > otherHour) {
            return true;
        }
        // 09:00 and 10:00
        else if(hour < otherHour) {
            return false;
        }
        // 10:00 and 10:00
        else if(hour == otherHour && minute == otherMinute) {
            return true;
        } 
        // 10:30 and 10:15
        else if(hour == otherHour && minute > otherMinute) {
            return true;
        }
    }

    /**
     * @param {String} time "00:00"
     * @param {String} comparisonTime "00:00"
     */
    static timeLessThanOrEqualTo(time, comparisonTime) {
        let hour, minute, otherHour, otherMinute;

        hour = parseInt(time.split(":")[0]);   //00
        minute = parseInt(time.split(":")[1]);

        otherHour = parseInt(comparisonTime.split(":")[0]);  //23
        otherMinute = parseInt(comparisonTime.split(":")[1]);

        // 09:00 and 10:00
        if(hour < otherHour) {
            return true;
        }
        // 10:00 and 09:00
        else if(hour > otherHour) {
            return false;
        }
        // 10:00 and 10:00
        else if(hour == otherHour && minute == otherMinute) {
            return true;
        } 
        // 10:15 and 10:30 or 10:15 and 10:15
        else if(hour == otherHour && minute <= otherMinute) {
            return true;
        }
    }

    /**
     * 
     * @param {String} range a String in the format "17:00-09:00", where 00:00 is midnight, 
     * and so on being included in the range. I.e., a time on day 1 that goes to later in 
     * the day or into day 2.
     * 
     */
    static timeWithinOverlappingHourRange(hour, minute, range) {
        //TODO performance: Don't loop the splits for the range
        let splitRange = range.split("-");

        let leftHour = parseInt(splitRange[0].split(":")[0]);   //17
        let leftMinute = parseInt(splitRange[0].split(":")[1]);

        let rightHour = parseInt(splitRange[1].split(":")[0]);  //9
        let rightMinute = parseInt(splitRange[1].split(":")[1]);

        /*

        When is a time in a range?

        Need to compare 3 things. Operands and resets (going over into next day).

        Handle no reset, e.g. 23:57 against range(17:00 -> 23:56)

        */

        //Same hour - 00:00 -> 00:45 or 17:00 -> 17:45
        if(hour == leftHour && hour == rightHour) {
            if(minute >= leftMinute && minute <= rightMinute) {
                return true;
            } else {
                return false;
            }
        }

        //Reset - 17:00 -> 09:00
        if(rightHour < leftHour) {
            if(hour > leftHour) {
                return true;
            } else if(hour < rightHour) {
                return true;
            } else if(hour == leftHour && minute > leftMinute) {
                return true;
            } else if(hour == rightHour && minute < rightMinute) {
                return true;
            } else {
                return false;
            }
        }

        //No Reset - 17:00 -> 23:59
        if(leftHour < rightHour) {
            if(hour > leftHour && hour < rightHour) {
                return true;
            } else if(hour == leftHour) {
                if(minute >= leftHour) {
                    return true;
                } else {
                    return false;
                }
            } else if(hour == rightHour) {
                if(minute <= rightMinute) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    /**
     * Returns true if an HH:MM is >= a "from" time and < than a "to" time.
     */
    static hourMinBetween(hour, minute, fromToMap) {
        let fromHour = parseInt(fromToMap.from.split(":")[0]);
        let fromMinute = parseInt(fromToMap.from.split(":")[1]);

        let toHour = parseInt(fromToMap.to.split(":")[0]);
        let toMinute = parseInt(fromToMap.to.split(":")[1]);

        //Returning falses may be more performant? As true is more specific?

        //13:00 with 10:00 -> 12:00 or 09:00 with 10:00 -> 12:00
        if(hour > toHour || hour < fromHour) {
            return false;
        }

        //Specific cases - return true, fallback false

        //17:31 with 17:30 -> 18:00 - Diff right hour / Same left hour
        if(hour == fromHour && toHour > hour && minute >= fromMinute){
            return true;
        }

        //17:15 with 17:00 -> 17:30 - Same both hours
        if(hour == fromHour && hour == toHour && (minute >= fromMinute || minute < toMinute)){
            return true;
        }

        //17:00 with fromTo 16:00 -> 18:00 - Diff both hours
        if(hour > fromHour && hour < toHour){
            return true;
        }

        //17:00 with 13:00 -> 17:30 - Diff left hour / Same right hour
        if(hour > fromHour && hour == toHour && minute < toMinute){
            return true;
        }

        return false;
    }

    /**
     * 
     * @returns true if the date > from and < to - i.e., from 2020-01-01 and date 2020-01-01 is FALSE
     */
    static dateBetween(date, from, to) {
        let midDate = new Date(date);
        let fromDate = new Date(from);
        let toDate = new Date(to);

        if(fromDate < midDate && midDate < toDate) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @returns true if date >= from and < to - i.e., from 2020-01-01 and date 2020-01-01 is TRUE
     */
    static dateWithin(date, from, to) {
        let midDate = new Date(date);
        let fromDate = new Date(from);
        let toDate = new Date(to);

        if(fromDate <= midDate && midDate < toDate) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @returns {String[]}
     */
    static getDatesBetweenInclusive(startDate, endDate) {
        var dateList = [];
        let currentDate = new Date(startDate);
        endDate = new Date(endDate);

        while(currentDate <= endDate) {
            dateList.push(this.convertDateToYYYYMMDD(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateList;
    }

    /**
     * @param {*} range an object containing a from and to in "00:00" format
     * @param {*} intervalDuration in minutes
     */
    static getIntervalsInRange(range, intervalDuration) {
        let intervals = [];
        let fromHourInMins = parseInt(range.from.split(":")[0]);
        let fromMinuteInMins = parseInt(range.from.split(":")[1]);
        let toHourInMins = parseInt(range.to.split(":")[0]);
        let toMinuteInMins = parseInt(range.to.split(":")[1]);

        let startTimeInMins = (fromHourInMins * 60) + fromMinuteInMins;
        let endTimeInMins = (toHourInMins * 60) + toMinuteInMins;

        //09:00 -> 10:00

        /*
            How to get the time difference?
        */

        for(let i = startTimeInMins; i <= endTimeInMins; i += intervalDuration) {

            //convert i & i + intervalDuration min to 24h time

            // how to convert to 24 hour?
                // e.g., 09:00 is 540 minutes

            //if mins % 60 == 0 can do straight up conversion, but what if not?
                //then do modulus and take the remainder for the minutes with the base as the hours

            //Start time
            let hour = Math.floor(i / 60);
            let minute = 0;
            if(i % 60 != 0){    //what if lower than 60?
                window.console.log("i is " + i);
                window.console.log('% op: ' + i % 60);
                minute = i % 60;
            }

            minute = this.formatMinuteToMM(minute);
            hour = this.formatHourToHH(hour);

            let twentyFourHourStartTime = `${hour}:${minute}`;

            //Incremented time
            let incrementedTime = i + intervalDuration;
            hour = Math.floor(incrementedTime / 60);
            minute = 0;
            if(incrementedTime % 60 != 0){
                minute = incrementedTime % 60;
            }

            minute = this.formatMinuteToMM(minute);
            hour = this.formatHourToHH(hour);

            let twentyFourHourEndTime = `${hour}:${minute}`;

            intervals.push({
                from: twentyFourHourStartTime,
                to: twentyFourHourEndTime
            });
        }

        return intervals;
    }
}

// Testing with vue serve DateUtils.js
// alert(DateUtils.getLastMonthDate(new Date()));
// alert(DateUtils.getNextMonthDate(new Date()));
//alert(DateUtils.incrementMonthOfDate(DateUtils.getCurrentDateString(), 24));