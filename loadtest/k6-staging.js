import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
  },
};

const BASE = 'https://api-staging-e6d1.up.railway.app';

export default function () {
  const health = http.get(`${BASE}/api/v1/health/ready/`);
  check(health, { 'health 200': (r) => r.status === 200 });

  const products = http.get(`${BASE}/api/v1/catalog/products/?page_size=20`, {
    headers: { Origin: 'https://vitaleevo-git-staging-vitaleevos-projects.vercel.app' },
  });
  check(products, { 'products 200': (r) => r.status === 200 });

  const categories = http.get(`${BASE}/api/v1/catalog/categories/?type=store`, {
    headers: { Origin: 'https://vitaleevo-git-staging-vitaleevos-projects.vercel.app' },
  });
  check(categories, { 'categories 200': (r) => r.status === 200 });

  sleep(0.5 + Math.random() * 0.5);
}
