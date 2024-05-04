/* eslint-disable @typescript-eslint/naming-convention */
import pg from 'pg';

const { Pool } = pg;

const client = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.DB_NAME || 'nullus',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
});

export { client };
