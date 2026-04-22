const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:123@localhost:5432/project-ta' });

async function check() {
  await client.connect();
  const res = await client.query('SELECT current_setting(\'server_version\')');
  console.log(res.rows);
  const assessments = await client.query('SELECT * FROM player_assessment ORDER BY "assessedAt" DESC LIMIT 5');
  console.log("Assessments:", assessments.rows);
  await client.end();
}

check().catch(console.error);
