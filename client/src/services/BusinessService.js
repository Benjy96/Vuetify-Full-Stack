import axios from "axios";

//using proxy in vue.config.js for dev mode instead of having http://localhost:5000/firebase-payment-test/us-central1/app/ here
const apiURL = 'api/businesses/';

//Front end HTTP request utility
/*

NOTE: There is a front-end and back-end SDK for Firestore. You COULD access firebase directly from
the client. However, you need an API/Server for when you are using PRIVATE KEYS, like with StripebundleRenderer.renderToStream

The beneath functions could be done purely in the front-end and would LIKELY have better performance as fewer
requests. I.e.,: 

    Front-end click -> Firestore -> Front-end,
    vs:
    Front-end click -> Back-end -> Firestore -> Back-end -> Front-end

*/
class BusinessService {

    static getBusinesses() {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await axios.get(apiURL);    //adds onto end of your server
                const data = res.data;
                resolve(
                    //map is a high order function (takes a function or returns a function)
                    data.map(business => ({
                        ...business    //spread operator - splits item into its attributes
                    }))
                );
            } catch(err) {
                reject(err);
            }
        });
    }

/*     static insertBusiness(text) {
        return axios.post(apiURL, {
            text,
            createdAt: new Date()
        });
    }

    static deleteBusiness(id) {
        axios.delete(`${apiURL}${id}`)
    } */
}

//default export can be imported as any name in another file
export default BusinessService;