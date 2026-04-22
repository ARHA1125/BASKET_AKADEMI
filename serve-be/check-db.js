const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:123@localhost:5432/project-ta'
});

async function run() {
  try {
    const client = await pool.connect();
    
    console.log("Checking for defaults...");
    try {
      const res = await client.query(`SELECT column_name, column_default FROM information_schema.columns WHERE table_name='student' AND column_name='curriculumProfile';`);
      console.log(res.rows);
    } catch(err) {
      console.error(err);
    }
    
    // Also let's check if there are any remaining KU10_FUNDAMENTAL_CORE values in the DB in that column?
    try {
      const res = await client.query(`SELECT count(*), "curriculumProfile" FROM "student" GROUP BY "curriculumProfile";`);
      console.log(res.rows);
    } catch(err) {
      console.error(err);
    }
    
    client.release();
    pool.end();
  } catch (error) {
    console.error("Connection error:", error);
  }
}

run();
