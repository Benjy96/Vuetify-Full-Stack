import { db } from '../firebaseInit';
import MetaDataHelper from '../services/MetaDataHelper';

class MetaDataHelperTests {

    static async setDbTestData(fromDate, fromTime, toDate, toTime) {
        await db.collection('/businesses/6c6qWcNvsOhBpF0CgUox4LsG2v62/bookings').doc('admin').set({
            admin_bookings: [
                {
                    fromDate: fromDate,
                    toDate: toDate,
                    fromTime: fromTime,
                    toTime: toTime
                }
            ]
        });
    }

    static async testDateAvailabilityWithAdminBooking(date, fromDate, fromTime, toDate, toTime, expectedBoolean) {
        await this.setDbTestData(fromDate, toDate, fromTime, toTime);
        let res = await MetaDataHelper.isDateAvailable("6c6qWcNvsOhBpF0CgUox4LsG2v62", date);
        if(res != expectedBoolean) {
            let errString = "FAIL: Got " + !expectedBoolean + " for " + date + " with admin booking: " +
            fromDate + " " + fromTime + " -> " + toDate + " " + toTime;

            throw errString;
        }
    }

    static async runSingleAdminBookingTests() {
        try
        {
            //Admin booking 2020-01-01 17:00 -> 2020-01-01 17:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "17:00", "2020-01-01", "17:00", true);

            //Admin booking 2020-01-01 00:00 -> 2020-01-03 00:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-03", "00:00", true);
        }
        catch(e)
        {
            alert(e);
            return;
        }

        alert('All tests passed');
    }
}

export default MetaDataHelperTests;