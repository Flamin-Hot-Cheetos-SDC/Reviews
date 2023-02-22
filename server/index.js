require('dotenv').config();
const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
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
  const test = await connection.collection('betterAllReviews').find(
    { product_id: input },
    { projection: { _id: 0, reviewer_email: 0 } }
  ).toArray();
  res.status(200).send({ results: test });
});

app.get('/reviews/meta/:product_id', async (req, res) => {
  if (typeof req.params.product_id !== 'number') {
    res.status(422).send('invalid product_id number');
  } else {
    const input = req.params.product_id;
    const meta = await connection.collection('reviewMetaIds').findOne(
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
  }
});

app.put('/reviews/:review_id/helpful', async (req, res) => {
  const input = Number(req.params.review_id);
  const helpful = await connection.collection('betterAllReviews').findOneAndUpdate(
    { _id: input },
    { $inc: { helpfulness: 1 } }
  );
  // findOneAndUpdate returns {"lastErrorObject", "value", and "ok"}
  // "value" shows the updated value, API should send 202 back as response status
  res.sendStatus(202);
});

app.put('/reviews/:review_id/report', async (req, res) => {
  const input = Number(req.params.review_id);
  let output;
  const report = await connection.collection('betterAllReviews').findOneAndUpdate(
    { _id: input },
    { $set: { reported: 'true' } },
  );
  res.sendStatus(202);
});

app.get('/reviews/:page?/:count?/:sort/:product_id', async (req, res) => {
  const product_id = Number(req.params.product_id);
  const sort = String(req.params.sort) || 'relevant';
  const page = Number(req.params.page) || 0;
  const count = Number(req.params.count) || 5;
  let sorting;
  if (sort === 'helpful') {
    sorting = { helpfulness: -1 };
  } else if (sort === 'newest') {
    sorting = { date: -1 };
  } else {
    sorting = { helpfulness: -1, date: -1 };
  }
  const reviews = await connection.collection('betterAllReviews')
    .find(
      { product_id, reported: 'false' },
      {
        sort: sorting, limit: count + (page * count), projection: { reviewer_email: 0 }
      }
    )
    .toArray();
  res.status(200).send({
    product_id, page, count, results: reviews
  });
});

app.post('/reviews', async (req, res) => {
  const { body } = req;
  if (typeof body.product_id !== 'number') {
    res.status(422).send('missing valid product id');
  } else if (!body.summary || !body.body || !body.name
    || !body.email || body.body.length <= 50) {
    res.status(422).send('missing valid summary, body, name, or email');
  } else if (typeof body.recommend !== 'boolean') {
    res.status(422).send('missing valid recommendation');
  } else if (!body.characteristics) {
    res.status(422).send('missing valid characteristics');
  } else {
    const chars = await connection.collection('reviewMetaIds')
      .findOne({ _id: body.product_id });
    const charList = new Set(Object.keys(chars.characteristics));
    const checkChars = Object.keys(body.characteristics);
    const incomingChars = await connection.collection('ORIGIN_chars').find({ product_id: body.product_id }).toArray();
    const [bodyChars, objChars] = [new Set(), { product_id: body.product_id, characteristics: {} }];
    const revCharsObj = { product_id: body.product_id, characteristics: {} };
    incomingChars.forEach((obj) => {
      bodyChars.add(obj.name);
      revCharsObj.characteristics[obj.name] = body.characteristics[obj._id];
      objChars.characteristics[obj.name] = { id: obj._id, value: body.characteristics[obj._id] };
    });
    if (charList.size !== bodyChars.size
      || ![...bodyChars.keys()].every((key) => charList.has(key))) {
      res.status(404).send('characteristics do not match for the given product_id');
    } else {
      delete body.characteristics;
      body._id = await connection.collection('betterAllReviews').find().count() + 1;
      revCharsObj._id = body._id;
      objChars._id = body._id;
      body.response = null;
      body.helpfulness = 0;
      const tempPhotos = [];
      if (body.photos.length !== 0) {
        let photoIds = await connection.collection('ORIGIN_ReviewPhotos').find().count();
        body.photos.map((url) => {
          tempPhotos.push({ id: photoIds += 1, review_id: body._id, url });
          return { id: photoIds, url };
        });
        connection.collection('ORIGIN_ReviewPhotos').insertMany(tempPhotos);
      }
      connection.collection('betterAllReviews').insertOne(body);
      const avg = await connection.collection('revChars').find({ product_id: body.product_id }).toArray();
      await connection.collection('revChars').insertOne(objChars);
      avg.forEach((obj) => {
        Object.keys(obj.characteristics).forEach((key) => {
          objChars.characteristics[key].value += obj.characteristics[key];
        });
      });
      Object.keys(objChars.characteristics).forEach((key) => {
        objChars.characteristics[key].value /= avg.length + 1;
      });
      await connection.collection('reviewMetaIds')
        .updateOne(
          { _id: body.product_id },
          { $inc: { [`ratings.${body.rating.toString()}`]: 1, [`recommend.${body.recommend}`]: 1 }, $set: { characteristics: objChars } }
        );
      res.status(201).send(`post ok, check review id ${body._id}`);
    }
  }
});

app.listen(process.env.PORT);
console.log(`Listening at http://localhost:${process.env.PORT}`);
