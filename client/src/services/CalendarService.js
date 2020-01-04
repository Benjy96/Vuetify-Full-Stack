class CalendarService {
    /*
        Day PoV CRUD Operations.
    */

    /** Cal-Day-CREATE */
    static async createBooking() {
        //A booking will require 4 or 5 operations becuase of meta-data and admin availability.
        
        //Write to availability collection
        //Write to more detailed owner bookings collection
        //Read meta-data object
        //Read current day's remaining hours object
            //Sum remaining hours + admin hours if exists
                //If no remaining hours, add day to unavailable days meta-data
    }

    /** Cal-Day-READ */
    static async getBookings() {
        //Read from availability collection
    }

    /** Cal-Day-DELETE */
    static async cancelBooking() {

    }

    /* 
        Month PoV CRUD Operations.
    */

    /** Cal-Month-READ */
    static async getUnavailableDays() {
        //Read from meta-data doc.
    }
}