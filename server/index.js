require('dotenv').config();
const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const csvStream = require('csv-stream');
const through2 = require('through2');
const path = require('path');
const db = require('./db.js');
const { dat } = require('../jsonConvert.js');

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
/*
  db.ReviewPhotos.aggregate([{
    $group:
    {_id: "$review_id",
    url:{$addToSet:"$url"}}},
    {$out:"reviewphotos"}], {allowDiskUse:true})

  db.reviewchars.aggregate([
  {
    $group:{
        _id: '$review_id',
        characteristics: { $push:  {
            characteristic_id: "$characteristic_id",
            value: "$value"
        }}
    }
  }, {$out:"ReviewChars"}], {allowDiskUse:true})
*/

app.listen(process.env.PORT);
console.log(`Listening at http://localhost:${process.env.PORT}`);
