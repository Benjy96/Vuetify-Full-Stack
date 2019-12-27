const express = require('express');
const request = require('request');

//Router object from express
const router = express.Router();

const tkConfig = require('../../config/timekitsdk.json');

router.get('/', async (req, res) => {

    // https://nodejs.org/api/http.html#http_http_request_options_callback
    // Generated beneath code with POSTMAN Code button on the right-hand side of the screen
    var options = {
        'method': 'GET',
        'url': 'https://api.timekit.io/v2/bookings?include=available_actions,attributes,calendar,customers',
        'headers': {
        'Content-Type': 'application/json',
        'Authorization': tkConfig.basic_req_auth
        }
    };
    
    const email = req.query.email;
    if(email) {
        options.url = options.url + '&search=email:' + email
    }

    request(options, function (error, response) { 
        if (error) {
            res.status(500).send(error);
        } else {
            res.send(response.body);
        }
    });
});

// https://developers.timekit.io/reference#section-ex-1-search-on-a-given-resource
router.get('/:id', async (req, res) => {
    console.log('getting bookings for id: ' + req.params.id);
    // https://nodejs.org/api/http.html#http_http_request_options_callback
    // Generated beneath code with POSTMAN Code button on the right-hand side of the screen
    var options = {
        'method': 'GET',
        'url': 'https://api.timekit.io/v2/bookings?include=available_actions,attributes,calendar,customers&search=resource.id:' 
            + req.params.id,
        'headers': {
        'Content-Type': 'application/json',
        'Authorization': tkConfig.basic_req_auth
        }
    };

    request(options, function (error, response) { 
        if (error) {
            res.status(500).send(error);
        } else {
            res.send(response.body);
        }
    });
});

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;