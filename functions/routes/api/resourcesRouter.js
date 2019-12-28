// Routing
const express = require('express');
const request = require('request');
const router = express.Router();

// Firestore
const admin = require('firebase-admin');
let db = admin.firestore();

// Keys
const tkConfig = require('../../config/timekitsdk.json');

router.post('/', (req, res) => {

    console.log('req body ' + JSON.stringify(req.body));

    var options = {
        'method': 'POST',
        'url': 'https://api.timekit.io/v2/resources',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': tkConfig.basic_req_auth
        },
        body: JSON.stringify(req.body.data)
      };

    request(options, function (error, response) { 
        if (error) {
            res.status(500).send(error);
        } else {
            var responseJSON = JSON.parse(response.body).data;
            db.collection('businesses').doc(responseJSON.id).set(responseJSON);

            res.status(201).send(response.body.data);
        }
    });
});

//make router available to other packages when you require('x.js') - it is getting this router object
module.exports = router;