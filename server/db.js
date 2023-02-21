const mongoose = require('mongoose');

const { Schema } = mongoose;
mongoose.connect('mongodb://localhost:27017/reviews', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => { console.log('Mongoose: successful connection'); })
  .catch((err) => { console.log('Mongoose: failed connection', err); });

const reviewchars = new Schema({
  id: { type: Number, unique: true },
  characteristic_id: Number,
  review_id: Number,
  value: Number,
}, { collection: 'ReviewChars' });

const reviewphotos = new Schema({
  id: { type: Number, unique: true },
  review_id: Number,
  url: String,
}, { collection: 'ReviewPhotos' });

const meta = new Schema({
  product_id: { type: Number, unique: true },
  recommended: Object,
  characteristics: Object,
}, { collection: 'ReviewMeta' });

const ReviewChars = mongoose.model('ReviewChars', reviewchars);
const ReviewPhotos = mongoose.model('reviewphotos', reviewphotos, 'reviewphotos');
const ReviewMeta = mongoose.model('ReviewMeta', meta);

const savePhotos = (id, review_id, url) => {
  const photoEntry = new ReviewPhotos();
  photoEntry.id = id;
  photoEntry.review_id = review_id;
  photoEntry.url = url;
  return photoEntry.save();
};

const save = (id, char_id, review_id, value) => {
  const newEntry = new ReviewChars();
  newEntry.id = id;
  newEntry.characteristic_id = char_id;
  newEntry.review_id = review_id;
  newEntry.value = value;
  return newEntry.save();
};

const saveMeta = (product_id, recommended, characteristics) => {
  const metaEntry = new ReviewMeta();
  metaEntry.product_id = product_id;
  metaEntry.recommended = recommended;
  metaEntry.characteristics = characteristics;
  return metaEntry.save();
};

const allReviews = new Schema({
  review_id: Number,
  product_id: Number,
  rating: Number,
  date: String,
  summary: String,
  body: String,
  recommend: String,
  reported: String,
  reviewer_name: String,
  reviewer_email: String,
  response: String,
  helpfulness: Number,
  photos: Array,
}, { collection: 'allReviews' });
const allreviews = mongoose.model('allreviews', allReviews);
// module.exports.save = save;
// module.exports.ReviewsChars = ReviewChars;
// module.exports.savePhotos = savePhotos;
module.exports.ReviewPhotos = ReviewPhotos;
// module.exports.saveMeta = saveMeta;
module.exports.ReviewMeta = ReviewMeta;
module.exports.connection = mongoose.connection;
module.exports.mongoose = mongoose;
module.exports.allreviews = allreviews;
