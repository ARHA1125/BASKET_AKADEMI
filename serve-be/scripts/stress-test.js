/**
 * Web Stress Testing Script for Wirabhakti Academy API
 * Zero-dependency script simulating concurrent users.
 * 
 * Usage: node stress-test.js [baseURL] [totalRequests] [concurrency]
 */

const baseURL = process.argv[2] || 'http://localhost:3005';
const totalRequests = parseInt(process.argv[3] || '200', 10);
const concurrency = parseInt(process.argv[4] || '50', 10);

console.log(`====================================================`);
console.log(`🔥 MEMULAI PENGUJIAN BEBAN (WEB STRESS TEST)`);
console.log(`Target API Base URL   : ${baseURL}`);
console.log(`Total Request         : ${totalRequests}`);
console.log(`Jumlah Concurrency    : ${concurrency} request bersamaan`);
console.log(`====================================================\n`);

async function runStressTest() {
  const targetURL = `${baseURL}/public/check-duplicate?email=stress-test@example.com`;
  let successCount = 0;
  let errorCount = 0;
  
  const latencies = [];
  const startTime = performance.now();

  // Helper to run a batch of requests concurrently
  async function sendRequest() {
    const startReq = performance.now();
    try {
      const res = await fetch(targetURL, { signal: AbortSignal.timeout(10000) });
      await res.text(); // Ensure complete body read
      const endReq = performance.now();
      latencies.push(endReq - startReq);

      if (res.status >= 200 && res.status < 400) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (err) {
      errorCount++;
    }
  }

  // Queue tasks with limited concurrency
  const queue = Array(totalRequests).fill(sendRequest);
  const workers = [];

  // Function that worker execution pool uses
  async function worker() {
    while (queue.length > 0) {
      const task = queue.pop();
      if (task) {
        await task();
      }
    }
  }

  // Start concurrent workers
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  // Wait for all workers to finish
  await Promise.all(workers);

  const endTime = performance.now();
  const totalDurationSeconds = (endTime - startTime) / 1000;
  const requestsPerSecond = totalRequests / totalDurationSeconds;

  latencies.sort((a, b) => a - b);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const avg = sum / latencies.length;
  
  const p95Idx = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95));
  const p99Idx = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.99));

  console.log(`📋 HASIL RINGKASAN PENGUJIAN STRES:`);
  console.log(`----------------------------------------------------`);
  console.log(`Total Durasi Pengujian : ${totalDurationSeconds.toFixed(2)} detik`);
  console.log(`Total Request Sukses   : ${successCount} / ${totalRequests} (${((successCount / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`Total Request Gagal    : ${errorCount} / ${totalRequests}`);
  console.log(`Throughput (RPS)       : ${requestsPerSecond.toFixed(2)} req/detik`);
  console.log(`\n⏱️  Statistik Latensi Beban (Load Latency):`);
  console.log(`Minimum Latency        : ${min.toFixed(2)} ms`);
  console.log(`Maksimum Latency       : ${max.toFixed(2)} ms`);
  console.log(`Rata-rata Latency      : ${avg.toFixed(2)} ms`);
  console.log(`Persentil ke-95 (P95)  : ${latencies[p95Idx]?.toFixed(2) || 0} ms`);
  console.log(`Persentil ke-99 (P99)  : ${latencies[p99Idx]?.toFixed(2) || 0} ms`);
  console.log(`====================================================`);
}

runStressTest().catch(err => {
  console.error("Terjadi error sistem saat pengujian stres:", err);
});
