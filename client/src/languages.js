/**
 * If you want an exact string match, start with uppercase,
 * otherwise use camelCase for a "variable"-type string.
 */

const messages = 
{
    //App.vue
    'title': {
        'en': "Booking Calendar",
        'es': "Calendario de Reservas"
    },
    'Error': {
        'en': "Error",
        'es': "" //TODO
    },
    'Information': {
        'en': "Information",
        'es': "" //TODO
    },
    'Bookings': {
        'en': "Bookings",
        'es': "" //TODO
    },
    'Booking Management': {
        'en': "Booking Management",
        'es': "" //TODO
    },
    //Home.vue
    'Search': {
        'en': "Search",
        'es': "" //TODO
    },
    'searchBarString': {
        'en': "I'm searching for . . .",
        'es': "" //TODO
    },
    'Profile': {
        'en': "Profile",
        'es': "Perfil" //TODO
    },
    'businesses': {
        'en': "Businesses",
        'es': "Empresas"
    },
    //App.vue - root page
    'home': {
        'en': "Home",
        'es': "Inicio"
    },
    'Cancel reservation': {
        'en': "Cancel reservation",
        'es': "Cancelar reserva"
    },
    'Calendar': {
        'en': "Calendar",
        'es': "Mi Calendario"
    },
    'My Calendar': {
        'en': "My Calendar",
        'es': "Mi Calendario"
    },
    'Administration': {
        'en': "Administration",
        'es': "Administración"
    },
    'Dashboard': {
        'en': "Dashboard",
        'es': "" //TODO
    },
    'registerBusiness': {
        'en': "Register",
        'es': "Registrar como empresa"
    },
    'Login': {
        'en': "Login",
        'es': "Iniciar Sesión"
    },
    'Logout': {
        'en': "Logout",
        'es': "Salir"
    },
    'Your reservation has been canceled': {
        'en': "Your reservation has been canceled",
        'es': "Tu reserva ha sido cancelada"
    },
    'Booking reference': {
        'en': "Booking reference",
        'es': "Referencia de reserva"
    },
    'Ok': {
        'en': "Ok",
        'es': "Vale"
    },
    'Required': {
        'en': "Required",
        'es': "Requerido"
    },
    //Register.vue
    'picTooLarge': {
        'en': "Picture size should be less than 1 MB!",
        'es': "" //TODO
    },
    'emailNotValid' : {
        'en': "E-mail must be valid",
        'es': "E-mail tiene que ser válido"
    },
    'Password': {
        'en': "Password",
        'es': "Contraseña"
    },
    'e-mail': {
        'en': "e-mail",
        'es': "e-mail"
    },
    'bookingTravelType': {
        'en': "Will you have to travel?",
        'es': "" //TODO
    },
    'customerTravels': {
        'en': "The customer will come to me.",
        'es': "" //TODO
    },
    'businessTravels': {
        'en': "I will go to the customer.",
        'es': "" //TODO
    },
    'onlineBookings': {
        'en': "Bookings are online.",
        'es': "" //TODO
    },
    'address': {
        'en': "Address (Where you are based)",
        'es': ""//TODO
    },
    'onlineContactDetails': {
        'en': "Online booking contact (For example: Abcd@Discord)",
        'es': "" //TODO
    },
    'occupation': {
        'en': "Occupation (For example: hairdresser)",
        'es': "Ocupación (Por ejemplo: peluquera)"
    },
    'Name': {
        'en': "Name",
        'es': "Nombre"
    },
    'Surname': {
        'en': "Surname",
        'es': "Apellido"
    },
    'First name': {
        'en': "First name",
        'es': "Nombre"
    },
    'First Name': {
        'en': "First Name",
        'es': "Nombre"
    },
    'Register': {
        'en': "Register",
        'es': "Registrar"
    },
    'profilePicture': {
        'en': "Profile picture",
        'es': "Foto de perfil"
    },
    //adminBookingPicker
    'Add': {
        'en': "Add",
        'es': "Añadir"
    },
    'To time': {
        'en': "To time",
        'es': "Hasta la hora"
    },
    'To date': {
        'en': "To date",
        'es': "Hasta la fecha"
    },
    'From time': {
        'en': "From time",
        'es': "Desde la hora"
    },
    'From date': {
        'en': "From date",
        'es': "Desde la fecha"
    },
    'Cancel': {
        'en': "Cancel",
        'es': "Cancelar"
    },
    'timeTravel': {
        'en': "As we haven't yet implemented time travel, your \"to\" time can't be before the \"from\" time!",
        'es': "Inválido"
    },
    //Bookings.vue
    'noBookings': {
        'en': "There are no bookings to display",
        'es': "" //TODO
    },
    'confirmCancelBooking': {
        'en': "Are you sure you wish to remove this booking?",
        'es': "¿Estás seguro/a de que quieres cancelar la reserca?"
    },
    //Calendar.vue - duplicates (day/month) are for v-calendar variables
    'Date': {
        'en': "Date",
        'es': "Fecha"
    },
    'Day': {
        'en': "Day",
        'es': "Dia"
    },
    'day': {
        'en': "Day",
        'es': "Dia"
    },
    'Week': {
        'en': "Week",
        'es': "Semanas"
    },
    'week': {
        'en': "Week",
        'es': "Semanas"
    },
    'Month': {
        'en': "Month",
        'es': "Mes"
    },
    'month': {
        'en': "Month",
        'es': "Mes"
    },
    '4day': {
        'en': "4 days",
        'es': '4 dias'
    },
    'Today': {
        'en': "Today",
        'es': "Hoy"
    },
    'thanks': {
        'en': "Thanks!",
        'es': "Gracias!"
    },
    'loading': {
        'en': "Loading...",
        'es': "Cargando..."
    },
    'loadingBookings': {
        'en': "Loading bookings...",
        'es': "Cargando reservas..."
    },
    'bookingReferenceEmailed': {
        'en': "You have been emailed your booking reference",
        'es': "Se te ha enviado un email con tu número de referencia"
    },
    'Book': {
        'en': "Book",
        'es': "Reservar"
    },
    'Book an appointment': {
        'en': "Book an appointment",
        'es': "Reservar una cita"
    },
    'fullNameRequired': {
        'en': "Please enter your first name and surname",
        'es': "" //TODO
    },
    'Online': {
        'en': "Online",
        'es': ""//TODO
    },
    'online': {
        'en': "Online",
        'es': "" //TODO
    },
    'bookingsOnline': {
        'en': "Bookings are online. You will be emailed contact details.",
        'es': "" //TODO
    },
    'Location': {
        'en': "Location",
        'es': "" //TODO
    },
    //Dashboard
    'tooLong': {
        'en': "Too long!",
        'es': "" //TODO
    },
    'Profile Management': {
        'en': "Profile Management",
        'es': "Perfil" //TODO
    },
    'Profile Settings': {
        'en': "Profile Settings",
        'es': "Perfil" //TODO
    },
    'bioFormText': {
        'en': "Bio - A short summary of who you are",
        'es': "" //TODO
    },
    'invalidBioFormText': {
        'en': "Your bio is too long",
        'es': "" //TODO
    },
    'bookingTitleFormText': {
        'en': "Booking title - the headline on your booking form (Default: Book an appointment)",
        'es': "" //TODO
    },
    'bookingInfoFormText': {
        'en': "Booking information - the text under the headline displayed on your booking form (Default: Blank)",
        'es': "" //TODO
    },
    'invalidBookingInfoFormText': {
        'en': "Your booking information is too long",
        'es': ""
    },
    'businessAddress': {
        'en': "Address",
        'es': "" //TODO
    },
    'Duration': {
        'en': "Duration",
        'es': "" //TODO
    },
    'minutes': {
        'en': "minutes",
        'es': "" //TODO
    },
    'minute': {
        'en': "minute",
        'es': "" //TODO
    },
    'Price': {
        'en': "Price",
        'es': "" //TODO
    },
    'bookingPriceFormText': {
        'en': "Booking price - how much it costs to book you (Default: Price Upon Asking)",
        'es': "" //TODO
    },
    'invalidBookingPriceFormText': {
        'en': "If you're setting a booking price, it must be a number greater than 0",
        'es': "" //TODO
    },
    'Save': {
        'en': "Save",
        'es': "Salvar" //TODO
    },
    'bookingDurationFormText': {
        'en': "Booking duration - how long your bookings are, in minutes (Default: 60)",
        'es': "" //TODO
    },
    'invalidBookingDurationMinutes': {
        'en': "Booking duration must be in minutes",
        'es': "" //TODO
    },
    'invalidBookingDurationSize': {
        'en': "Booking duration must a number greater than 0",
        'es': ""
    },
    'Booking Form': {
        'en': "Booking Form",
        'es': "" //TODO
    },
    'Edit Booking Form': {
        'en': "Edit Booking Form",
        'es': "" //TODO
    },
    'preferenceSaved': {
        'en': "Your preference has been saved",
        'es': "" //TODO
    },
    'Yes': {
        'en': "Yes",
        'es': "Si"
    },
    'confirmRemove': {
        'en': "Are you sure you wish to remove this?",
        'es': "" //TODO
    },
    'Remove': {
        'en': "Remove",
        'es': "Eliminar"
    },
    'Upcoming bookings': {
        'en': "Upcoming bookings",
        'es': "Próximas Reservas"
    },
    'From': {
        'en': "From",
        'es': "Desde"
    },
    'to': {
        'en': "to",
        'es': "hasta"
    },
    //TODO: clarify naming v
    'Unavailable': {
        'en': "Unavailable",
        'es': "Indisponibilidad"
    },
    'workingHours': {
        'en': "Working Hours",
        'es': "Horas laborables"
    },
    'addWorkingHours': {
        'en': "Add Working Hours",
        'es': "" //TODO
    },
    'editWorkingHours': {
        'en': "Edit Working Hours",
        'es': "" //TODO
    },
    'Hours': {
        'en': "Hours",
        'es': "Horas"
    },
    //days of the week
    "Monday": {
        'en': "Monday",
        'es': "Lunes"
    },
    "Tuesday": {
        'en': "Tuesday",
        'es': "Martes"
    },
    "Wednesday": {
        'en': "Wednesday",
        'es': "Miércoles"
    },
    "Thursday": {
        'en': "Thursday",
        'es': "Jueves"
    },
    "Friday": {
        'en': "Friday",
        'es': "Viernes"
    },
    "Saturday": {
        'en': "Saturday",
        'es': "Sábado"
    },
    "Sunday": {
        'en': "Sunday",
        'es': "Domingo"
    }
}

export default messages;