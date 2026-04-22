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

async function debugAuth() {
  const dbUrl = getEnvVar('DATABASE_URL');
  if (!dbUrl) {
    console.error("DATABASE_URL not found");
    return;
  }
  
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    const email = 'debug_parent@test.com';
    const password = 'password123';
    const role = 'PARENT';

    // 1. Cleanup
    await client.query('DELETE FROM "user" WHERE email = $1', [email]);

    // 2. Register
    console.log(`Registering ${email}...`);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const insertRes = await client.query(
      `INSERT INTO "user" (email, password, role, "fullName") VALUES ($1, $2, $3, $4) RETURNING *`,
      [email, hashedPassword, role, 'Debug Parent']
    );
    const user = insertRes.rows[0];
    console.log("Registered user:", user.email, "Role:", user.role);

    // 3. Login
    console.log(`Attempting login for ${email}...`);
    const findRes = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (findRes.rows.length === 0) {
      console.error("User not found after registration!");
      return;
    }
    const foundUser = findRes.rows[0];
    
    const isMatch = await bcrypt.compare(password, foundUser.password);
    console.log(`Password match result: ${isMatch}`);
    
    if (isMatch) {
      console.log("✅ Login logic SUCCESS");
    } else {
      console.log("❌ Login logic FAILED (password mismatch)");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

debugAuth();
