/**
 * Pre-start is where we want to place things that must run BEFORE the express 
 * server is started. This is useful for environment variables, command-line 
 * arguments, and cron-jobs.
 */

// NOTE: DO NOT IMPORT ANY SOURCE CODE HERE
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// **** Setup **** //
export const setup = () => {
  if (!process.env.env) {
    process.env.env = 'development';
  }
  // Set the env file
  const result2 = dotenv.config({
    path: path.join(__dirname, `../env/${process.env.env}.env`),
  });
  if (result2.error) {
    throw result2.error;
  }

}