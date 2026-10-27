import 'dotenv/config';
import pg from 'pg';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL first (see .env.example)');
export const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:8,connectionTimeoutMillis:5000});
