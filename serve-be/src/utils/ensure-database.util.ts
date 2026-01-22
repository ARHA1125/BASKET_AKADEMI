import { Client } from 'pg';
import * as dotenv from 'dotenv';

export async function ensureDatabaseExists() {
  dotenv.config();

  const dbName = process.env.DB_NAME;
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '5432', 10);

  if (!dbName) {
    console.error('DB_NAME is not defined in .env');
    return;
  }
  const client = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres', 
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error ensuring database exists:', error);
  } finally {
    await client.end();
  }
}
