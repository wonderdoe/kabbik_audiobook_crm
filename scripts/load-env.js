/**
 * Load .env before any module reads process.env (db, redis).
 * Import this as the first line in scripts/worker.js and backfill scripts.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = process.env.DOTENV_CONFIG_PATH || path.join(rootDir, '.env');
dotenv.config({ path: envPath });
