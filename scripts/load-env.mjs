/**
 * Load .env before any module reads process.env (db, redis).
 * Import first in worker.mjs and backfill *.mjs scripts.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = process.env.DOTENV_CONFIG_PATH || path.join(rootDir, '.env');
dotenv.config({ path: envPath });
