import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

function getEnvVar(key: string): string | undefined {
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
  return process.env[key];
}

async function listUsers() {
  const dbUrl = getEnvVar('DATABASE_URL');
  if (!dbUrl) {
    console.error("DATABASE_URL not found");
    return;
  }
  
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    const res = await client.query('SELECT id, email, role, "fullName" FROM "user"');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

listUsers();
