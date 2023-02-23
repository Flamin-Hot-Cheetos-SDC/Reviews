const http = require('k6/http');
const { check, sleep } = require('k6');

const TOKEN = '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';
export const options = {
  stages: [
    { duration: '10s', target: 1100 },
    { duration: '5m', target: 1100 },
  ],
};
export default function () {
  const params = {
    headers: { Authorization: TOKEN }
  };
  // const newestReviews = http.get('http://localhost:3000/reviews/newest/1');
  const metaReviews = http.get('http://localhost:3000/reviews/meta/123');
  check(metaReviews, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
