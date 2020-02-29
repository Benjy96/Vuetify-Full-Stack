const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();

/*

  Back-end server/API.

  Using cloud functions & express/router. https://firebase.google.com/docs/hosting/functions#use_a_web_framework

*/

// Middleware - functions run as part of requests process
app.use(cors());  //Enable ALL CORS requests

//get the exported routers
const businessRouter = require('./routes/api/businessRouter');
const customerRouter = require('./routes/api/customerRouter');

//use([path], [callback...]) mounts a middleware FUNCTION(s) at the specified path
app.use('*/api/business', businessRouter); //sends all requests to /api/x/* to the xRouter
app.use('*/api/customer', customerRouter);

// express.static is a built-in middleware function in Express. 
// Defines where to serve static files from. public is our static asset folder on prod.
// https://expressjs.com/en/starter/static-files.html
// To see running locally, go to: http://localhost:5000/firebase-payment-test/us-central1/app/about
app.use('/about', express.static(__dirname + '/lander/web/'));

//TODO: Now need to add a Vue-routed 404 page - if we navigate to a non-existent route we will get nothing
//as we're now allowing any route that won't return from the server to be redirected to index.html (our Vue app)
app.use(/.*/, express.static(__dirname + '/public/index.html'));

// __dirname is a Node.JS Global Object: https://nodejs.org/docs/latest/api/globals.html
// For any route (after the main url) except the api route already used, send back index.html
// i.e. - prevent express trying to look for a file like "hello.html" if you browsed to
// app.com/hello

/* ----- The beneath is instead handled by the firebase.json rewrites property ----- */
// app.get(/.*/, (req, res) => {
//   console.log("Received a request to the server");
//   res.sendFile(__dirname + '/public/index.html')
//   }
// );

exports.app = functions.https.onRequest(app);
