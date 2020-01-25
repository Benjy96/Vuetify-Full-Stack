const express = require('express');
const request = require('request');

//Router object from express
const router = express.Router();

const { DateUtils } = require('./src/DateUtils');
const MetaDataHelper = require('./src/MetaDataHelper');

/* 

1) if exports.MetaDataHelper = MetaDataHelper, use const { MetaDataHalper } = require('./src/MetaDataHelper');

require() returns: { MetaDataHelper: [Function: MetaDataHelper] }

2) if module.exports = MetaDataHelper, use const MetaDataHelper = require('./src/MetaDataHelper');

require() returns: [Function: MetaDataHelper]

3) exports = x; doesn't work

require() returns: {}

(3) doesn't work because if you RE-ASSIGN exports, it becomes a new variable on its own when node returns the variables
(1)/(2) work because you're just adding to the module.exports object in a different level of nesting

*/

router.get('/', async (req, res) => {

    console.log(require('./src/MetaDataHelper'));

    MetaDataHelper.test();

    let convertedDate = DateUtils.formatAmericanDateToUK("2020-25-01");
    console.log(convertedDate);

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

    res.status(200).send(convertedDate);
});

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;