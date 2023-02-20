const fs = require('fs');
const csvParser = require('csv-parser');
const csvStream = require('csv-stream');
const through2 = require('through2');
/*
  reviews.csv
    [id, product_id, rating, date, summary, body, recommend,
    reported, reviewer_name, reviewer_email, response, helpfulness]
*/

// let rphotos = fs.readFileSync('./sourceFiles/reviews_photos.csv');
// rphotos = rphotos.toString().split('\n');
function jsonConvert(input) {
  const headers = [...input[0].split(',')];
  const data = [];
  for (let i = 1; i < input.length - 1; i += 1) {
    const temp = input[i].split(',');
    const obj = {
      id: temp[0],
      review_id: temp[1],
      urls: temp[2],
    };
    data.push(obj);
  }
}
// jsonConvert(rphotos);
const saveIntodb = (row) => new Promise((res, reject) => {
  console.log(row);
  setTimeout(() => res(), 100);
});

const dat = [];
// const charStream = fs.createReadStream('./sourceFiles/reviews_photos.csv')
//   .pipe(csvStream.createStream({
//     endLine: '\n',
//   }))
//   .pipe(through2({ objectMode: true }), (row, enc, cb) => {
//     saveIntodb(row).then(() => {
//       cb(null, true);
//     })
//       .catch((err) => {
//         cb(err, null);
//       });
//   })
//   .on('data', (data) => {
//     dat.push(data);
//   })
//   .on('end', () => {
//     console.log('end');
//     return dat;
//   })
//   .on('error', (err) => {
//     console.log(err);
//   });

// fs.createReadStream('./sourceFiles/answers.csv', (err, data) => {
//   if (err) {console.log('there was an error', err); }
//   else { console.log('data'); }
// })
//   .pipe(csv())
//   .on('data', function(row) {
//     data.push(row)
//   })
//   .on('end', function() {
//     console.log('data loaded')
//   })

// let charReviews = fs.readFileSync('./sourceFiles/characteristic_reviews.csv');
// charReviews = charReviews.toString().split(',');
function jsonConvert2(input) {
  const headers = [...input[0].split(',')];
  const data = [];
  for (let i = 1; i < input.length - 1; i += 1) {
    const temp = input[i].split(',');
    const obj = {
      id: temp[0],
      characteristic_id: temp[1],
      review_id: temp[2],
      value: temp[3],
    };
    data.push(obj);
  }
  return data;
}
// console.log(jsonConvert2(charReviews.slice(0, 5)));
