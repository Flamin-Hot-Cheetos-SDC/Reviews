const http = require('k6/http');
const { check, sleep } = require('k6');

export const options = {
  stages: [
    { duration: '10s', target: 1100 },
    { duration: '5m', target: 1100 },
  ],
};
export default function () {
  // const newestReviews = http.get('http://localhost:3000/reviews/newest/1');
  const metaReviews = http.get('http://localhost:3000/reviews/meta/123');
  check(metaReviews, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
