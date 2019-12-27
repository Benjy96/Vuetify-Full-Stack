const admin = require('firebase-admin');
const serviceAccount = require('./config/adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  //TODO: Switch when deployed?
  //if using cloud functions - hosting on google - you can do admin.initializeApp(functions.config().firebase);
  //if using on google cloud platform: credential: admin.credential.applicationDefault();
});

module.exports = admin.firestore();