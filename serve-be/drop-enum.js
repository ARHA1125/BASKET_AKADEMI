const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:123@localhost:5432/project-ta'
});

async function run() {
  try {
    const client = await pool.connect();
    
    console.log("Dropping enum type...");
    try {
      await client.query(`ALTER TABLE "student" ALTER COLUMN "curriculumProfile" TYPE varchar;`);
      await client.query(`DROP TYPE IF EXISTS "student_curriculumprofile_enum";`);
      console.log("Enum dropped and column converted to varchar. TypeORM can now recreate it.");
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
