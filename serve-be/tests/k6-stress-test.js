import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics for stress test tracking
const loginDuration = new Trend('login_duration');
const academicPerformanceDuration = new Trend('academic_performance_duration');
const successRate = new Rate('success_rate');

// Support dynamic VU/duration configuration or multi-stage ramping stress test
export const options = __ENV.VUS && __ENV.DURATION ? {
  vus: parseInt(__ENV.VUS),
  duration: __ENV.DURATION,
  thresholds: {
    http_req_duration: ['p(95)<3000'], // Relaxed for stress tests
    http_req_failed: ['rate<0.10'],    // Allows up to 10% errors under maximum stress
  },
} : {
  // Multi-stage stress test simulating the incremental concurrency steps (50, 100, 250, 500, 1000 VUs)
  stages: [
    // 50 VU Phase (60 seconds)
    { duration: '5s', target: 50 },
    { duration: '60s', target: 50 },
    
    // 100 VU Phase (60 seconds)
    { duration: '5s', target: 100 },
    { duration: '60s', target: 100 },
    
    // 250 VU Phase (60 seconds)
    { duration: '5s', target: 250 },
    { duration: '60s', target: 250 },
    
    // 500 VU Phase (60 seconds)
    { duration: '5s', target: 500 },
    { duration: '60s', target: 500 },
    
    // 1000 VU Phase (60 seconds) - System Limit/Saturation Point
    { duration: '5s', target: 1000 },
    { duration: '60s', target: 1000 },
    
    // Cool down
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    // Overall thresholds
    http_req_duration: ['p(95)<3000'], // Relaxed for stress tests
    http_req_failed: ['rate<0.10'],    // Allows up to 10% errors under maximum stress
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3005';

// VU-local variables (initialized once per Virtual User thread)
let isRegistered = false;
const userPassword = 'stresspassword123';

// Setup runs once at the beginning of the test to prepare an admin account
export function setup() {
  const email = `k6-admin-${Date.now()}@example.com`;
  const password = 'k6testpassword123';
  const fullName = 'K6 Load Test Admin';
  const phoneNumber = `0812${Math.floor(10000000 + Math.random() * 90000000)}`;

  // 1. Register temporary admin
  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email,
      password,
      role: 'ADMIN',
      fullName,
      phoneNumber,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (registerRes.status !== 201) {
    console.warn(`[Setup Warning] Registration failed (status ${registerRes.status}).`);
  }

  // 2. Login to get admin token
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const token = loginRes.status === 200 ? loginRes.json('accessToken') : null;
  console.log(`[Setup] Admin logged in. Token: ${token ? 'OK' : 'FAILED'}`);

  return { 
    adminToken: token,
    setupTimestamp: Date.now() 
  };
}

export default function (data) {
  const adminToken = data.adminToken;
  const setupTimestamp = data.setupTimestamp;
  const userEmail = `stress-student-${setupTimestamp}-${__VU}@example.com`;

  let success = true;

  // 1. First-time VU registration check (Requires Student profile, so we use unified/students via Admin)
  if (!isRegistered) {
    if (!adminToken) {
      console.warn(`[VU ${__VU}] Admin token missing. Cannot register student profile.`);
      successRate.add(false);
      sleep(1);
      return;
    }

    const registerPayload = JSON.stringify({
      email: userEmail,
      password: userPassword,
      fullName: `Stress Test Student ${__VU}`,
      phoneNumber: `0812${String(10000000 + __VU).slice(-8)}`,
      ageClass: 'KU-10', // Required to link a Student profile
    });

    const registerRes = http.post(
      `${BASE_URL}/academic/unified/students`,
      registerPayload,
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    // 201 = Created, 400/409 = Already exists in this run
    if (registerRes.status === 201 || registerRes.status === 400 || registerRes.status === 409) {
      isRegistered = true;
    } else {
      success = false;
      console.warn(`[VU ${__VU}] Unified student registration failed with status: ${registerRes.status} (body: ${registerRes.body})`);
      successRate.add(false);
      sleep(1);
      return;
    }
  }

  // 2. Call Auth Login Endpoint (/auth/login)
  const loginPayload = JSON.stringify({
    email: userEmail,
    password: userPassword,
  });

  const loginStart = Date.now();
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    loginPayload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  loginDuration.add(Date.now() - loginStart);

  const loginOk = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login has accessToken': (r) => r.json('accessToken') !== undefined,
  });
  success = success && loginOk;

  if (!loginOk) {
    successRate.add(false);
    sleep(0.5);
    return;
  }

  const token = loginRes.json('accessToken');
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 3. Fetch Academic Performance Endpoint (/academic/me/performance)
  const performanceStart = Date.now();
  const performanceRes = http.get(
    `${BASE_URL}/academic/me/performance`,
    { headers: authHeaders }
  );
  academicPerformanceDuration.add(Date.now() - performanceStart);

  const performanceOk = check(performanceRes, {
    'academic performance status is 200': (r) => r.status === 200,
  });
  success = success && performanceOk;

  // Track overall success rate
  successRate.add(success);

  // High concurrency simulation (minimal sleep to stress the system limits)
  sleep(0.1);
}
