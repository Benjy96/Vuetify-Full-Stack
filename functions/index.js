const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();

/*

Back-end server/API.

Using cloud functions & express/router.

*/

// Middleware - functions run as part of requests process
app.use(cors());  //Enable ALL CORS requests

//get the exported routers
const businessesRouter = require('./routes/api/businessesRouter');
const bookingsRouter = require('./routes/api/bookingsRouter');
const resourcesRouter = require('./routes/api/resourcesRouter');

//use([path], [callback...]) mounts a middleware FUNCTION(s) at the specified path
app.use('/api/businesses', businessesRouter); //sends all requests to /api/posts/* to the postsRouter
app.use('/api/bookings', bookingsRouter);
app.use('/api/resources', resourcesRouter);

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