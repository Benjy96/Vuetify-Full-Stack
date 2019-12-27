const express = require('express');
const request = require('request');

//Router object from express
const router = express.Router();

const tkConfig = require('../../config/timekitsdk.json');

router.post('/', (req, res) => {

    var options = {
        'method': 'POST',
        'url': 'https://api.timekit.io/v2/resources',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': tkConfig.basic_req_auth
        },
        body: req.body
      };

    request(options, function (error, response) { 
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(201).send(response.body);
        }
    });
});

//make router available to other packages when you require('x.js') - it is getting this router object
module.exports = router;