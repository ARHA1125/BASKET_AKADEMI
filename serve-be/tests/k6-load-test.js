import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics to track specific flows
const publicFlowDuration = new Trend('public_flow_duration');
const adminFlowDuration = new Trend('admin_flow_duration');
const publicSuccessRate = new Rate('public_success_rate');
const adminSuccessRate = new Rate('admin_success_rate');

// Test options: Setup thresholds and stages for load testing
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 VUs
    { duration: '1m', target: 10 },  // Stay at 10 VUs (steady load)
    { duration: '30s', target: 0 },  // Ramp down to 0 VUs
  ],
  thresholds: {
    // 95% of all HTTP requests must complete within 500ms
    http_req_duration: ['p(95)<500'],
    // Overall request failure rate must be less than 1%
    http_req_failed: ['rate<0.01'],
    // Custom metrics thresholds
    public_success_rate: ['rate>0.95'],
    admin_success_rate: ['rate>0.95'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3005';

// Helper to generate random string for unique test data
function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Setup runs once at the beginning of the test to prepare resources/credentials
export function setup() {
  const email = `k6-admin-${Date.now()}@example.com`;
  const password = 'k6testpassword123';
  const fullName = 'K6 Load Test Admin';
  const phoneNumber = `0812${Math.floor(10000000 + Math.random() * 90000000)}`;

  // 1. Register a temporary admin user for performance testing
  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email,
      password,
      role: 'ADMIN',
      fullName,
      phoneNumber,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (registerRes.status !== 201) {
    console.warn(`[Setup Warning] Registration failed (status ${registerRes.status}). Proceeding without token.`);
    return { token: null };
  }

  // 2. Login to retrieve JWT token
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (loginRes.status !== 200) {
    console.warn(`[Setup Warning] Login failed (status ${loginRes.status}). Proceeding without token.`);
    return { token: null };
  }

  const token = loginRes.json('accessToken');
  console.log(`[Setup] Successfully registered & logged in admin. Token retrieved.`);
  return { token };
}

// The default function represents the behavior of a single Virtual User (VU)
export default function (data) {
  const token = data.token;
  
  // Decide VU type: 80% public visitors, 20% admins/coaches
  const isPublic = Math.random() < 0.8;

  if (isPublic) {
    const startTime = Date.now();
    let success = true;

    // Flow 1: Fetch public statistics
    const statsRes = http.get(`${BASE_URL}/public/stats`);
    const statsOk = check(statsRes, {
      'public stats status is 200': (r) => r.status === 200,
      'public stats has registrationsCount': (r) => r.json('registrationsCount') !== undefined,
    });
    success = success && statsOk;

    sleep(0.5);

    // Flow 2: Check duplicate application email
    const emailToCheck = `check-${randomString(8)}@example.com`;
    const duplicateRes = http.get(`${BASE_URL}/public/check-duplicate?email=${emailToCheck}`);
    const duplicateOk = check(duplicateRes, {
      'check duplicate status is 200': (r) => r.status === 200,
      'check duplicate returns boolean': (r) => typeof r.json('emailExists') === 'boolean',
    });
    success = success && duplicateOk;

    sleep(0.5);

    // Flow 3: Submit a public application
    const applicationPayload = JSON.stringify({
      parentName: `Parent ${randomString(5)}`,
      parentEmail: `parent-${randomString(8)}@example.com`,
      parentPhone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      studentName: `Student ${randomString(5)}`,
      studentDob: '2016-01-01',
      studentHeight: 135,
      studentWeight: 30,
      studentPosition: 'Forward',
    });

    const applyRes = http.post(
      `${BASE_URL}/public/apply`,
      applicationPayload,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const applyOk = check(applyRes, {
      'apply status is 201': (r) => r.status === 201,
      'apply returns application ID': (r) => r.json('id') !== undefined,
    });
    success = success && applyOk;

    // Track metrics
    publicFlowDuration.add(Date.now() - startTime);
    publicSuccessRate.add(success);

  } else {
    // Admin/Coach User Flow (Requires Auth Token)
    if (!token) {
      // Skip if token isn't available
      sleep(1);
      return;
    }

    const startTime = Date.now();
    let success = true;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Flow 1: Fetch list of coaches
    const coachesRes = http.get(`${BASE_URL}/academic/coaches`, { headers: authHeaders });
    const coachesOk = check(coachesRes, {
      'admin coaches status is 200': (r) => r.status === 200,
    });
    success = success && coachesOk;

    sleep(0.5);

    // Flow 2: Fetch academic attendance reports summary
    const attendanceRes = http.get(`${BASE_URL}/academic/attendance/reports/summary`, { headers: authHeaders });
    const attendanceOk = check(attendanceRes, {
      'admin attendance summary status is 200': (r) => r.status === 200,
    });
    success = success && attendanceOk;

    // Track metrics
    adminFlowDuration.add(Date.now() - startTime);
    adminSuccessRate.add(success);
  }

  // Think time: simulate actual user reading/navigation delay
  sleep(Math.random() * 1.5 + 0.5);
}
