const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();

/*

  TODO: Fix proxy bug. When you are viewing a business, the api route gets /businesses added and it 
  won't reach the API. pathRewrites?

  Back-end server/API.

  Using cloud functions & express/router.

*/

// Middleware - functions run as part of requests process
app.use(cors());  //Enable ALL CORS requests

//get the exported routers
const businessRouter = require('./routes/api/businessRouter');
const customerRouter = require('./routes/api/customerRouter');

//TODO: Vue rewrites?
//use([path], [callback...]) mounts a middleware FUNCTION(s) at the specified path
app.use('*/api/business', businessRouter); //sends all requests to /api/x/* to the xRouter
app.use('*/api/customer', customerRouter);

// express.static is a built-in middleware function in Express. 
// Define where to serve static files from. public is our static asset folder on prod.
app.use(express.static(__dirname + '/public/'));

// __dirname is a Node.JS Global Object: https://nodejs.org/docs/latest/api/globals.html
// For any route (after the main url) except the api route already used, send back index.html
// i.e. - prevent express trying to look for a file like "hello.html" if you browsed to
// app.com/hello

/* ----- Handled by firebase.json rewrites property ----- */
app.get(/.*/, (req, res) => {
  console.log("Received a request to the server");
  res.sendFile(__dirname + '/public/index.html')
  }
);

exports.app = functions.https.onRequest(app);
/* 
exports.setRegularHours = functions.firestore.document('/businesses/{businessId}').onCreate((change, context) => {
  let newBusinessId = change.id();

  db.collection(`/businesses/${newBusinessId}/availability`).doc('regular').set({
    Lunes: [{from: "09:00", to: "17:00"}],
    Martes: [{from: "09:00", to: "17:00"}],
    Miércoles: [{from: "09:00", to: "17:00"}],
    Jueves: [{from: "09:00", to: "17:00"}],
    Viernes: [{from: "09:00", to: "17:00"}]
  });
}); */