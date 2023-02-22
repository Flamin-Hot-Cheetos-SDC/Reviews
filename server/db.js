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
});

const reviewphotos = new Schema({
  id: { type: Number, unique: true },
  review_id: Number,
  url: String,
});

const meta = new Schema({
  product_id: { type: Number, unique: true },
  recommended: Object,
  characteristics: Object,
});

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
});
// const ReviewChars = mongoose.model('ReviewChars', reviewchars);
// const ReviewPhotos = mongoose.model('reviewphotos', reviewphotos, 'reviewphotos');
// const ReviewMeta = mongoose.model('ReviewMeta', meta);
// const allreviews = mongoose.model('allreviews', allReviews);

// module.exports.ReviewsChars = ReviewChars;
// module.exports.ReviewPhotos = ReviewPhotos;
// module.exports.ReviewMeta = ReviewMeta;
module.exports.connection = mongoose.connection;
module.exports.mongoose = mongoose;
// module.exports.allreviews = allreviews;
