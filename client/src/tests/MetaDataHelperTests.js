import { db } from '../firebaseInit';
import MetaDataHelper from '../services/MetaDataHelper';

class MetaDataHelperTests {

    static async clearCustomerBookings() {
        db.collection('/businesses/6c6qWcNvsOhBpF0CgUox4LsG2v62/availability/2020/month/01/days').doc('01').delete();
    }

    static async setCustomerBookings() {
        db.collection('/businesses/6c6qWcNvsOhBpF0CgUox4LsG2v62/availability/2020/month/01/days').doc('01').set({
            "customer_bookings": [
                {
                    from: "09:00",
                    to: "10:00"
                },
                {
                    from: "16:00",
                    to: "17:00"
                }
            ]
        });
    }

    /**
     * Test pack assumes the user:
     * 
     * - Has regular availability of 09:00-17:00
     */
    static async setRegularHours() {
        db.collection('/businesses/6c6qWcNvsOhBpF0CgUox4LsG2v62/availability').doc('regular').set({
            "Wednesday": [
                {
                    from: "09:00",
                    to: "17:00"
                }
            ]
        });
    }

    static async createAdminBooking(fromDate, fromTime, toDate, toTime) {
        await db.collection('/businesses/6c6qWcNvsOhBpF0CgUox4LsG2v62/bookings').doc('admin').set({
            admin_bookings: [
                {
                    fromDate: fromDate,
                    fromTime: fromTime,
                    toDate: toDate,
                    toTime: toTime
                }
            ]
        });
    }

    static async testDateAvailabilityWithAdminBooking(date, fromDate, fromTime, toDate, toTime, expectedBoolean) {
        await this.createAdminBooking(fromDate, fromTime, toDate, toTime);
        let res = await MetaDataHelper.isDateAvailable("6c6qWcNvsOhBpF0CgUox4LsG2v62", date);
        if(res != expectedBoolean) {
            let errString = "FAIL: Got " + !expectedBoolean + " for " + date + " with admin booking: " +
            fromDate + " " + fromTime + " -> " + toDate + " " + toTime;

            throw errString;
        }
    }

    /**
     * This test assumes:
     * 
     * - Customer bookings at 09:00 -> 10:00 and 16:00 -> 17:00
     */
    static async runSingleAdminBookingTestsWithCustomerBookings() {
        this.setCustomerBookings();
        await this.setRegularHours();

        try
        {
            //Admin booking 2020-01-01 17:00 -> 2020-01-01 17:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "17:00", "2020-01-01", "17:00", true);

            //Admin booking 2020-01-01 09:00 -> 16:00, Customer booking @ 09:00 & 16:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "09:00", "2020-01-01", "16:00", false);

            //Admin booking 2020-01-01 09:00 -> 11:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "09:00", "2020-01-01", "11:00", true);

            //Admin booking 2020-01-01 09:30 -> 16:30 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "09:30", "2020-01-01", "16:30", false);

            //Admin booking 2020-01-01 12:00 -> 14:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "09:30", "2020-01-01", "14:00", true);

            //Admin booking 2020-01-01 16:00 -> 2020-01-02 09:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "16:00", "2020-01-02", "09:00", true);

            //Admin booking 2020-01-01 10:00 -> 2020-01-03 09:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "09:30", "2020-01-01", "16:30", false);

            //Admin booking 2019-10-01 17:00 -> 2020-01-05 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2019-10-01", "17:00", "2020-01-05", "16:00", false);

            //Admin booking 2019-10-01 17:00 -> 2020-01-01 16:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2019-10-01", "17:00", "2020-01-01", "16:00", false);

            //Admin booking 2019-10-01 17:00 -> 2020-01-01 15:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2019-10-01", "17:00", "2020-01-01", "15:00", true);
        }
        catch(e)
        {
            alert(e);
            return;
        }

        alert('All tests for a single admin booking with customer bookings passed');
    }

    /**
     * Tests the "isDateAvailable" method against a set of admin bookings enclosing a single date ("2020-01-01")
     * 
     * This test assumes, in addition to the setup, that the user has:
     * 
     * - No bookings on 2020-01-01
     */
    static async runSingleAdminBookingTests() {
        this.clearCustomerBookings();
        await this.setRegularHours();

        //For date 2020-01-01:
        try 
        {
            //Admin booking 2020-01-01 17:00 -> 2020-01-01 17:00 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "17:00", "2020-01-01", "17:00", true);

            //Admin booking 2020-01-01 00:00 -> 2020-01-03 00:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-03", "00:00", false);

            //Admin booking 2020-01-01 00:00 -> 2020-01-02 00:00 = FALSE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-02", "00:00", false);

            //Admin booking 2020-01-01 00:00 -> 2020-01-01 00:05 = TRUE
            await this.testDateAvailabilityWithAdminBooking("2020-01-01", "2020-01-01", "00:00", "2020-01-01", "00:05", true);

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