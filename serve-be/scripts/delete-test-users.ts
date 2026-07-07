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

// SQL condition targeting all test users from load, stress, and duplicate testing
const testUsersCondition = `
  email LIKE 'k6-admin-%' 
  OR email LIKE 'stress-student-%' 
  OR email LIKE 'test-user-%' 
  OR (
    email LIKE 'parent-%' 
    AND email LIKE '%@example.com' 
    AND email NOT LIKE 'parent1%' 
    AND email NOT LIKE 'parent2%' 
    AND email NOT LIKE 'parent3%' 
    AND email NOT LIKE 'parent4%' 
    AND email NOT LIKE 'parent5%' 
    AND email NOT LIKE 'parent6%' 
    AND email NOT LIKE 'parent7%'
  )
`;

async function runCleanup() {
  const dbUrl = getEnvVar('DATABASE_URL');
  if (!dbUrl) {
    console.error("DATABASE_URL not found in .env file");
    return;
  }
  
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database successfully.");

    // Query for test user count first
    const countQuery = `
      SELECT COUNT(*)::int as count 
      FROM "user" 
      WHERE ${testUsersCondition};
    `;
    const countRes = await client.query(countQuery);
    const totalUsers = countRes.rows[0].count;

    if (totalUsers === 0) {
      console.log("No test users matching k6/stress patterns were found. Database is clean!");
      return;
    }

    console.log(`Found ${totalUsers} test users to delete. Starting cleanup transaction...`);

    // Execute cleanup queries inside a transaction
    await client.query('BEGIN');

    // Define CTE arrays for test users, students, and parents
    const queryCTE = `
      WITH test_users AS (
        SELECT id FROM "user" 
        WHERE ${testUsersCondition}
      ),
      test_students AS (
        SELECT id FROM "student"
        WHERE "userId" IN (SELECT id FROM test_users)
      ),
      test_parents AS (
        SELECT id FROM "parent"
        WHERE "userId" IN (SELECT id FROM test_users)
      ),
      test_invoices AS (
        SELECT id FROM "invoice"
        WHERE "studentId" IN (SELECT id FROM test_students) 
           OR "parentId" IN (SELECT id FROM test_parents)
      )
    `;

    // 1. Delete transactions referencing test invoices
    await client.query(`
      ${queryCTE}
      DELETE FROM "transaction" 
      WHERE "invoiceId" IN (SELECT id FROM test_invoices);
    `);
    console.log("Deleted transactions associated with test invoices.");

    // 2. Delete invoice items referencing test invoices (handled by cascade delete usually, but doing it just in case)
    await client.query(`
      ${queryCTE}
      DELETE FROM "invoice_item" 
      WHERE "invoiceId" IN (SELECT id FROM test_invoices);
    `);
    console.log("Deleted invoice items.");

    // 3. Delete invoices
    await client.query(`
      ${queryCTE}
      DELETE FROM "invoice" 
      WHERE id IN (SELECT id FROM test_invoices);
    `);
    console.log("Deleted invoices.");

    // 4. Delete testimonials from test parents (if table exists)
    const checkTableRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name   = 'testimonials'
      );
    `);
    
    if (checkTableRes.rows[0].exists) {
      await client.query(`
        ${queryCTE}
        DELETE FROM "testimonials" 
        WHERE "parentId" IN (SELECT id FROM test_parents);
      `);
      console.log("Deleted testimonials.");
    } else {
      console.log("Testimonials table does not exist yet. Skipping testimonial deletion.");
    }

    // 5. Delete gamification and attendance records for test students
    await client.query(`
      ${queryCTE}
      DELETE FROM "attendance" 
      WHERE "studentId" IN (SELECT id FROM test_students);
    `);
    console.log("Deleted attendance records.");

    await client.query(`
      ${queryCTE}
      DELETE FROM "player_assessment" 
      WHERE "studentId" IN (SELECT id FROM test_students);
    `);
    console.log("Deleted player assessments.");

    await client.query(`
      ${queryCTE}
      DELETE FROM "student_activities" 
      WHERE "studentId" IN (SELECT id FROM test_students);
    `);
    console.log("Deleted student activity records.");

    await client.query(`
      ${queryCTE}
      DELETE FROM "gamification_point_ledgers" 
      WHERE "studentId" IN (SELECT id FROM test_students);
    `);
    console.log("Deleted gamification point ledgers.");

    await client.query(`
      ${queryCTE}
      DELETE FROM "student_badges" 
      WHERE "studentId" IN (SELECT id FROM test_students);
    `);
    console.log("Deleted student badges.");

    // 6. Delete student profiles
    await client.query(`
      ${queryCTE}
      DELETE FROM "student" 
      WHERE id IN (SELECT id FROM test_students);
    `);
    console.log("Deleted student profiles.");

    // 7. Delete parent profiles
    await client.query(`
      ${queryCTE}
      DELETE FROM "parent" 
      WHERE id IN (SELECT id FROM test_parents);
    `);
    console.log("Deleted parent profiles.");

    // 8. Delete orders
    await client.query(`
      ${queryCTE}
      DELETE FROM "order" 
      WHERE "userId" IN (SELECT id FROM test_users);
    `);
    console.log("Deleted orders.");

    // 9. Delete users
    const deleteUsersRes = await client.query(`
      WITH test_users AS (
        SELECT id FROM "user" 
        WHERE ${testUsersCondition}
      )
      DELETE FROM "user" 
      WHERE id IN (SELECT id FROM test_users);
    `);
    console.log(`Deleted ${deleteUsersRes.rowCount} user accounts from "user" table.`);

    await client.query('COMMIT');
    console.log("Cleanup transaction committed successfully!");

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error executing cleanup, rolled back transaction:", err);
  } finally {
    await client.end();
  }
}

runCleanup();
