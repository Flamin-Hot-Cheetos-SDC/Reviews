require('dotenv').config();
const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const csvStream = require('csv-stream');
const through2 = require('through2');
const path = require('path');
const { connection, mongoose, allreviews } = require('./db.js');

const app = express();

app.use(express.json());
// fs.createReadStream(path.join(__dirname, '../sourceFiles/characteristic_reviews.csv'))
//   .pipe(csvParser())
//   .pipe(through2({ objectMode: true }, (row, enc, cb) => {
//     db.save(row.id, row.characteristic_id, row.review_id, row.value)
//       .then(() => { cb(null, true); })
//       .catch((err) => { cb(err, null); });
//   }))
//   .on('data', (row) => {})
//   .on('end', () => { console.log('read complete'); });

app.get('/reviews/:product_id', async (req, res) => {
  const input = Number(req.params.product_id);
  const test = await connection.collection('allReviews').find(
    { product_id: input },
    { projection: { _id: 0 } }
  ).toArray();
  res.status(200).send({ results: test });
});

app.get('/reviews/meta/:product_id', async (req, res) => {
  const input = Number(req.params.product_id);
  const meta = await connection.collection('reviewMetaFinal').findOne(
    { _id: input },
    {
      projection: {
        ratings: 1, recommend: 1, characteristics: 1, _id: 1
      }
    }
  );
  meta.product_id = meta._id;
  delete meta._id;
  res.status(200).send({ results: meta });
});

app.put('/reviews/:review_id/helpful', async (req, res) => {
  const input = Number(req.params.review_id);
  const helpful = await connection.collection('allReviews').findOneAndUpdate(
    { _id: input },
    {
      $inc: { helpfulness: 1 }
    }
  );
  // findOneAndUpdate returns {"lastErrorObject", "value", and "ok"}
  // "value" shows the updated value, API should send 202 back as response status
  console.log(helpful.value);
  res.sendStatus(202);
});

app.put('/reviews/:review_id/report', async (req, res) => {
  const input = Number(req.params.review_id);
  let output;
  const report = await connection.collection('allReviews').findOneAndUpdate(
    { _id: input },
    { $set: { reported: 'true' } },
    { new: true }
  );
  console.log(report);
  res.sendStatus(202);
});

app.get('/reviews/:page?/:count?/:sort/:product_id', async (req, res) => {
  const prod_id = Number(req.params.product_id);
  const sort = String(req.params.sort);
  const page = Number(req.params.page) || 0;
  const count = Number(req.params.count) || 5;
  const reviews = await connection.collection('allReviews').findOne({ product_id: prod_id }).limit(count);
  console.log(reviews);
  res.status(200).send(reviews);
});

app.get('/reviewphotos/:product_id', async (req, res) => {
  const input = Number(req.params.product_id);
  const test = await connection.collection('reviewphotos2').findOne({ product_id: input });
  if (!test) {
    res.status(404).send('there are no reviews relating to this product id');
  } else {
    res.status(200).send(test);
  }
});

// db.connection.collection('ReviewsDatePhotos').findOne({ review_id: 1 }, (err, res) => {
//   if (err) { console.log(err); } else { console.log(res); }
// });
app.listen(process.env.PORT);
console.log(`Listening at http://localhost:${process.env.PORT}`);
