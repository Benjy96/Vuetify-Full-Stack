const express = require('express');
const request = require('request');

//Router object from express
const router = express.Router();

router.get('/', async (req, res) => {

    // https://nodejs.org/api/http.html#http_http_request_options_callback
    // Generated beneath code with POSTMAN Code button on the right-hand side of the screen

    // a node.JS request...
    // request(options, function (error, response) { 
    //     if (error) {
    //         res.status(500).send(error);
    //     } else {
    //         res.send(response.body);
    //     }
    // });

    res.status(200).send();
});

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;