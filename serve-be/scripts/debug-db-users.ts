import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

function getEnvVar(key: string): string | undefined {
  if (process.env[key]) {
    return process.env[key];
  }
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      const lines = envFile.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match && match[1] === key) {
           return match[2].trim();
        }
      }
    }
  } catch (e) {
    console.error("Error reading .env:", e);
  }
  return undefined;
}

async function debug() {
  const dbUrl = getEnvVar('DATABASE_URL');
  console.log("Using DATABASE_URL:", dbUrl ? dbUrl.split('@')[1] || dbUrl : 'undefined');
  
  if (!dbUrl) return;

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    
    // Print total users
    const totalRes = await client.query('SELECT COUNT(*)::int as count FROM "user"');
    console.log("Total users in database:", totalRes.rows[0].count);

    // List top 20 users
    const usersRes = await client.query('SELECT id, email, role FROM "user" LIMIT 20');
    console.log("Sample of 20 users:");
    usersRes.rows.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`);
    });

  } catch (err) {
    console.error("Error connecting to database:", err);
  } finally {
    await client.end();
  }
}

debug();
