import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

if (!process.env.PGHOST) throw new Error('PGHOST is not defined');
if (!process.env.PGDATABASE) throw new Error('PGDATABASE is not defined');
if (!process.env.PGUSER) throw new Error('PGUSER is not defined');
if (!process.env.PGPASSWORD) throw new Error('PGPASSWORD is not defined');

// Use Pool instead of Client for better connection management
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
});

export default pool;
