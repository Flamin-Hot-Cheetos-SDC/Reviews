require('dotenv').config();
const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const csvStream = require('csv-stream');
const through2 = require('through2');
const path = require('path');
const db = require('./db.js');

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
  const output = [];
  const test = await db.allreviews.find({ product_id: input }, { _id: 0 }).lean();
  test.forEach((doc) => {
    output.push(doc);
  });
  res.status(200).send({ results: output });
});

app.get('/reviews', async (req, res) => {
  await db.connection.collection('ReviewsDatePhotos').find({}, { projection: { _id: 0 } }, (err, doc) => {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(doc);
    }
  });
});

// db.connection.collection('ReviewsDatePhotos').findOne({ review_id: 1 }, (err, res) => {
//   if (err) { console.log(err); } else { console.log(res); }
// });
app.listen(process.env.PORT);
console.log(`Listening at http://localhost:${process.env.PORT}`);
