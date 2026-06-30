/**
 * Latency Testing Script for Wirabhakti Academy API
 * Zero-dependency script using native fetch.
 * 
 * Usage: node latency-test.js [baseURL] [iterations]
 */

const baseURL = process.argv[2] || 'http://localhost:3005';
const iterations = parseInt(process.argv[3] || '20', 10);

console.log(`====================================================`);
console.log(`🚀 MEMULAI PENGUJIAN LATENSI (LATENCY TEST)`);
console.log(`Target API Base URL : ${baseURL}`);
console.log(`Jumlah Iterasi      : ${iterations} request per endpoint`);
console.log(`====================================================\n`);

async function measureLatency(name, url, options = {}) {
  const latencies = [];
  let successes = 0;
  let failures = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
      await response.text(); // Read body to ensure complete transfer
      const end = performance.now();
      latencies.push(end - start);
      
      if (response.status >= 200 && response.status < 400) {
        successes++;
      } else {
        // HTTP error status but connection succeeded
        failures++;
      }
    } catch (error) {
      failures++;
    }
  }

  if (latencies.length === 0) {
    return {
      name,
      min: 0,
      max: 0,
      mean: 0,
      p95: 0,
      p99: 0,
      successRate: 0
    };
  }

  latencies.sort((a, b) => a - b);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const mean = sum / latencies.length;
  
  // Percentile calculation
  const p95Idx = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95));
  const p99Idx = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.99));
  
  return {
    name,
    min: min.toFixed(2),
    max: max.toFixed(2),
    mean: mean.toFixed(2),
    p95: latencies[p95Idx].toFixed(2),
    p99: latencies[p99Idx].toFixed(2),
    successRate: ((successes / iterations) * 100).toFixed(0)
  };
}

async function run() {
  const results = [];

  // Test 1: Public Health Check
  console.log(`Testing Public Endpoint: GET ${baseURL}/public/check-duplicate...`);
  results.push(await measureLatency('GET /public/check-duplicate', `${baseURL}/public/check-duplicate?email=test@example.com`));

  // Test 2: Auth Login (simulasi hit credentials salah)
  console.log(`Testing Auth Endpoint: POST ${baseURL}/auth/login (simulated invalid)...`);
  results.push(await measureLatency('POST /auth/login (invalid)', `${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrongpassword' })
  }));

  // Test 3: Unauthorized Access Gate
  console.log(`Testing Role Gating Endpoint: GET ${baseURL}/academic/students (unauthorized)...`);
  results.push(await measureLatency('GET /academic/students (401)', `${baseURL}/academic/students`));

  // Print Indonesian Table Results
  console.log('\n📊 HASIL PENGUJIAN LATENSI (DALAM MILIDETIK / MS):');
  console.table(results.map(r => ({
    'Endpoint API': r.name,
    'Min (ms)': r.min,
    'Max (ms)': r.max,
    'Rata-rata (ms)': r.mean,
    'P95 (ms)': r.p95,
    'P99 (ms)': r.p99,
    'Success Rate': `${r.successRate}%`
  })));

  console.log(`\n====================================================`);
  console.log(`✅ PENGUJIAN SELESAI`);
  console.log(`Catatan: Jalankan backend server terlebih dahulu untuk hasil valid.`);
  console.log(`====================================================`);
}

run().catch(err => {
  console.error("Terjadi error saat menjalankan pengujian latensi:", err);
});
