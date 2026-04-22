import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

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

async function verifyPasswords() {
  const dbUrl = getEnvVar('DATABASE_URL');
  if (!dbUrl) {
    console.error("DATABASE_URL not found");
    return;
  }
  
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    
    // Fetch all PARENT users (excluding our debug one)
    const res = await client.query(`SELECT email, password, role FROM "user" WHERE role = 'PARENT' AND email != 'debug_parent@test.com'`);
    
    if (res.rows.length === 0) {
      console.log("No other parent users found to check.");
      return;
    }

    const candidatePasswords = ['anjay123#', 'anjay1234#', 'anjay123', 'Anjay123#'];

    for (const user of res.rows) {
      console.log(`Checking user: ${user.email}`);
      let found = false;
      for (const pass of candidatePasswords) {
        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
          console.log(`  MATCH FOUND! Password is: "${pass}"`);
          found = true;
          break; // Found the match
        } else {
            console.log(`  Not: "${pass}"`);
        }
      }
      if (!found) {
        console.log("  No match found among candidates.");
      }
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

verifyPasswords();
