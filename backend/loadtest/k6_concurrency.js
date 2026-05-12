import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '3m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '3m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';
const QR_CODE = __ENV.QR_CODE || 'SITE-ENTRY-FREE-001';

export function setup() {
  const scanRes = http.post(
    `${BASE_URL}/api/v1/auth/scan-qr`,
    JSON.stringify({ qr_code: QR_CODE }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const okScan = check(scanRes, {
    'setup scan-qr status 200': (r) => r.status === 200,
  });

  if (!okScan) {
    return { sessionUuid: null };
  }

  const body = scanRes.json();
  return { sessionUuid: body?.data?.session_id || null };
}

export default function (data) {
  const healthRes = http.get(`${BASE_URL}/api/v1/health`);
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
  });

  const sessionUuid = data?.sessionUuid;
  const hbRes = http.post(
    `${BASE_URL}/api/v1/auth/heartbeat`,
    JSON.stringify({ session_uuid: sessionUuid }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(hbRes, {
    'heartbeat status 200': (r) => r.status === 200,
  });

  const monitorRes = http.get(`${BASE_URL}/api/v1/monitor/online-devices?window_minutes=5`);
  check(monitorRes, {
    'monitor status 200': (r) => r.status === 200,
  });

  sleep(1);
}
