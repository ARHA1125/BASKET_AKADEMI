import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env.production' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false, // Don't auto-sync in CLI
  migrations: [],
});
