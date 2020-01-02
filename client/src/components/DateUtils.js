export class DateUtils {

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
     * 
     * @param {String} date the date you want to check is in the date & time range
     * @param {String} hour the hour of the date
     * @param {String} minute the minute of the date
     * @param {String} dateRange a set of from/to dates in the format "YYYY-MM-DD/YYYY-MM-DD"
     * @param {String} timeRange a set of from/to times in the format "00:00-23:59"
     * 
     * For example, timeWithinDayRange(2020-01-02, 03, 30, 2020-01-01/2020-01-04, 17:00-09:00) would
     * imply someone is on holiday from the end of their work day on the 1st of January until the
     * start of their workday on the 4th of January. The function would return true, as the 2nd of
     * January at 03:30 am is within this range.
     */
    static timeWithinDateRange(date, hour, minute, dateRange, timeRange) {

    }
}

export const daysOfWeek = [
    {text: "Monday", value: 1},
    {text: "Tuesday", value: 2},
    {text: "Wednesay", value: 3},
    {text: "Thursday", value: 4},
    {text: "Friday", value: 5},
    {text: "Saturday", value: 6},
    {text: "Sunday", value: 7}
];