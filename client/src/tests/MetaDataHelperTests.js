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
        await this.setDbTestData(fromDate, fromTime, toDate, toTime);
        let res = await MetaDataHelper.isDateAvailable("6c6qWcNvsOhBpF0CgUox4LsG2v62", date);
        if(res != expectedBoolean) {
            let errString = "FAIL: Got " + !expectedBoolean + " for " + date + " with admin booking: " +
            fromDate + " " + fromTime + " -> " + toDate + " " + toTime;

            throw errString;
        }
    }

    /**
     * Tests the "isDateAvailable" method against a set of admin bookings enclosing a single date ("2020-01-01")
     * 
     * The test assumes the user has:
     * 
     * - No bookings
     * - Regular availability of 09:00 -> 17:00
     */
    static async runSingleAdminBookingTests() {
        try
        {
            //Admin booking 2020-01-01 17:00 -> 2020-01-01 17:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "17:00", "2020-01-01", "17:00", true);

            //Admin booking 2020-01-01 00:00 -> 2020-01-03 00:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-03", "00:00", false);

            //Admin booking 2020-01-01 00:00 -> 2020-01-02 00:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-02", "00:00", false);

            //Admin booking 2020-01-01 00:00 -> 2020-01-01 00:05 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-01", "00:05", false);

            //Admin booking 2020-01-01 00:00 -> 2020-01-01 14:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-01", "14:00", true);

            //Admin booking 2019-10-01 17:00 -> 2020-01-01 24:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2019-10-01", "17:00", "2020-01-01", "24:00", false);

            //Admin booking 2019-10-01 17:30 -> 2020-01-01 17:30 (Wednesday Regular Hours 09:00->17:00) = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2019-10-01", "17:30", "2020-01-01", "17:30", false);

            //Admin booking 2019-10-01 17:30 -> 2020-01-01 17:00, Wednesday Regular Hours 09:00->17:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2019-10-01", "17:30", "2020-01-01", "17:00", false);

            //Admin booking 2019-10-01 17:30 -> 2020-01-01 16:30, Wednesday Regular Hours 09:00->17:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2019-10-01", "17:30", "2020-01-01", "16:30", true);
        }
        catch(e)
        {
            alert(e);
            return;
        }

        alert('All tests for a single admin booking passed');
    }
}

export default MetaDataHelperTests;