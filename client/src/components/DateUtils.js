class DateUtils {

    /**
     * 
     * @param {*} range - a time String in format "17:00-09:00", with 18:00, 19:00 ... 03:00, and so on being included in the range.
     */
    static timeWithinRange(hour, minute, range) {
        //TODO performance: Don't loop the splits for the range
        let splitRange = range.split("-");

        let leftHour = parseInt(splitRange[0].split(":")[0]);   //17
        let leftMinute = parseInt(splitRange[0].split(":")[1]);

        let rightHour = parseInt(splitRange[1].split(":")[0]);  //9
        let rightMinute = parseInt(splitRange[1].split(":")[1]);

        // alert('hour is ' + hour + ' and min is ' + minute + ' ---  leftHour is ' + leftHour );
        // alert('typeof leftHour: ' +typeof leftHour + ' and typeof hour ' + typeof hour);

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
        if(rightHour < leftHour){
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
        if(leftHour < rightHour){
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
}

export default DateUtils;