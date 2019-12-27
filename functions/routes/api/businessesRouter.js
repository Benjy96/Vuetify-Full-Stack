const express = require('express');

const db = require('../../firebaseDB');

//Router object from express
const router = express.Router();

// routed from: /api/posts/

/*

Where I went wrong in understanding the firestore shit - I wasn't checking the TYPEs returned by each method,
and then the method you would need to use from that returned type.

https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#delete

E.g., if you use .doc on a CollectionReference to get a DocumentReference, then look for the 
delete method on the DocumentReference class.

*/

// Get Posts - async functions automatically wrap the return in a Promise
router.get('/', async (req, res) => {
  let businesses = [];
  //await unwraps a value from a promise
  await db.collection('businesses').get().then(snapshot => {
    snapshot.forEach(doc => {
      businesses.push({
        id: doc.id,
        ...doc.data()
      });
    })
  });

  res.send(businesses);
});

/* // Add Post - https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#add
router.post('/', async (req, res) => {
  await db.collection('posts').add({
    text: req.body.text,
    createdAt: Date.now()
  })

  res.status(201).send();
});

// Delete Post - req.params.id from: https://expressjs.com/en/api.html#req
router.delete('/:id', async (req, res) => {
  await db.doc(`posts/${req.params.id}`).delete();
  res.status(200).send({});
}); */

//make router available to other packages when you require('posts.js') - it is getting this router object
module.exports = router;