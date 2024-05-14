/* eslint-disable no-console */
/* eslint-disable global-require */

import type { Pool } from 'pg';

let optionalPackage: typeof import('pg') | null = null;
let pgClient: Pool | null = null;
try {
  optionalPackage = require('pg') as typeof import('pg');
  pgClient = new optionalPackage.Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DB_NAME || 'nullus',
    password: process.env.PG_PASSWORD || 'postgres',
    port: parseInt(process.env.PG_PORT || '5432', 10) || 5432,
  });
} catch (error) {
  console.error('pg is not installed. Please install it by running `npm install pg`');
  optionalPackage = null;
}

const client = pgClient as Pool;
export { client };
