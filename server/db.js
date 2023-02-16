const mongoose = require('mongoose');

const { Schema } = mongoose;
mongoose.connect('mongodb://localhost:27017/reviews', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => { console.log('Mongoose: successful connection'); })
  .catch((err) => {
    console.log('Mongoose: failed connection');
    console.log('This is what broke:', err);
  });

const reviewchars = new Schema({
  id: { type: Number, unique: true },
  characteristic_id: Number,
  review_id: Number,
  value: Number,
});

const ReviewChars = mongoose.model('reviewchars', reviewchars);

const save = (id, char_id, review_id, value) => {
  const newEntry = new ReviewChars();
  newEntry.id = id;
  newEntry.characteristic_id = char_id;
  newEntry.review_id = review_id;
  newEntry.value = value;
  return newEntry.save();
};

const reviewphotos = new Schema({
  id: { type: Number, unique: true },
  review_id: Number,
  url: String,
});

const ReviewPhotos = mongoose.model('reviewphotos', reviewphotos);

const savePhotos = (id, review_id, url) => {
  const photoEntry = new ReviewPhotos();
  photoEntry.id = id;
  photoEntry.review_id = review_id;
  photoEntry.url = url;
  return photoEntry.save();
};
module.exports.save = save;
module.exports.ReviewsChars = ReviewChars;
module.exports.savePhotos = savePhotos;
module.exports.ReviewPhotos = ReviewPhotos;
