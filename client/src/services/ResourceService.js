import axios from "axios";

//using proxy in vue.config.js for dev mode instead of having http://localhost:5000/firebase-payment-test/us-central1/app/ here
const apiURL = 'api/resources/';

//Front end HTTP request utility
class ResourceService {

    static createResource(obj) {
        return axios.post(apiURL, {
            data: {
                ...obj
            }
        });
    }
}

//default export can be imported as any name in another file
export default ResourceService;