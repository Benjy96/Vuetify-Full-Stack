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
     * The first and last days will contain the from and to.
     * @returns {*} { years: 
     * [2020: { 
     *          months: [
     *                  01: [
     *                          1: {
     *                              from: "17:30"
     *                          } , 2, 3 .... 31
     *                  ],
     *                  02: [
     *                          1,2,3,
     *                          4: {
     *                              times: [
     *                                      {
     *                                          to: "09:00"
     *                                      }
     *                                  ]
     *                          }
     *                      ]
     *              ]
     *          }
     */
    static getYearsMonthsDaysInRange(from, to){
        let fromSplit = from.split("-");
        let toSplit = to.split("-");

        let fromYear = fromSplit[0];
        let fromMonth = fromSplit[1];

        let toYear = toSplit[0];
        let toMonth = toSplit[1];

    }

    /**
     * Converts "YYYY-DD-MM" to "YYYY-MM-DD"
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
        d = this.getDDFormatedDay(d.getDate());
        if(d <= this.getCurrentDayString() && increment > 0){
            return this.getDaysInMonth();
        }else{
            return d;
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

    /**
     * 
     * @param {*} nestedDateObj "year.month.day object"
     * @param {*} date "YYYY-MM-DD"
     */
    static nestedYearMonthDayExists(nestedDateObj, date) {
        let year = DateUtils.getYearFromDate(date);
        let month = DateUtils.getMonthFromDate(date);
        let day = DateUtils.getDayFromDate(date);

        if(nestedDateObj[year] && nestedDateObj[year][month] && day in nestedDateObj[year][month]){
            return true;
        }
        return false;
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
     * 
     * @param {String} date "DD from YYYY-MM-DD"
     */
    static getDayFromDate(date) {
        if(typeof date == 'string') {
            return date.substr(8, 2);
        }else if(typeof date == 'number') {
            return date.toString().substr(8, 2);
        }
    }

    /**
     * 
     * @param {String} date "MM from YYYY-MM-DD"
     */
    static getMonthFromDate(date) {
        if(typeof date == 'string') {
            return date.substr(5, 2);
        }else if (typeof date == 'number') {
            return date.toString().substr(5, 2);
        }
    }

    /**
     * 
     * @param {String} date YYYY from "YYYY-MM-DD"
     */
    static getYearFromDate(date) {
        if(typeof date == 'string') {
            return date.substr(0, 4);
        }else if (typeof date == 'number') {
            return date.toString().substr(0, 4);
        }
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

    static calcFromToDifference(fromToMap) {
        let fromHour = fromToMap.from.split(":")[0];
        let fromMin = fromToMap.from.split(":")[1];

        let toHour = fromToMap.to.split(":")[0];
        let toMin = fromToMap.to.split(":")[1];

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
    static timeWithinHourRange(hour, minute, range) {
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
}