import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env manually since we don't want to rely on dotenv package availability
function getEnvVar(key: string): string | undefined {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      const lines = envFile.split('\n');
      for (const line of lines) {
        // Handle KEY=VALUE
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match && match[1] === key) {
           return match[2].trim();
        }
      }
    }
  } catch (e) {
    console.error("Error reading .env:", e);
  }
  return process.env[key];
}

async function checkParent() {
  const dbUrl = getEnvVar('DATABASE_URL');
  if (!dbUrl) {
    console.error("DATABASE_URL not found in .env");
    return;
  }
  
  console.log("Connecting to DB...");
  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    
    // Check for ANY user with role PARENT (case insensitive check to be sure)
    console.log("Querying for users with role 'PARENT'...");
    
    const res = await client.query(`SELECT id, email, role, "fullName" FROM "user" WHERE UPPER(role) = 'PARENT'`);
    
    if (res.rows.length === 0) {
      console.log("❌ NO users found with role PARENT.");
    } else {
      console.log(`✅ Found ${res.rows.length} parent user(s):`);
      res.rows.forEach(u => console.log(` - ${u.email}`));
    }
  } catch (err: any) {
    console.error("Database error:", err.message);
    
    console.log("Listing tables...");
    const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
    console.log("Tables found:", tables.rows.map(r => r.table_name).join(', '));
    
  } finally {
    await client.end();
  }
}

checkParent();
