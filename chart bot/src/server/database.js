import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const databasePath = process.env.FEEDBACK_DB_PATH || path.resolve('data', 'feedback.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');
database.exec(`
  CREATE TABLE IF NOT EXISTS admin_accounts (
    admin_id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES admin_accounts(admin_id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_users (
    user_id TEXT PRIMARY KEY,
    google_sub TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    picture_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    last_login_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feedback (
    feedback_id TEXT PRIMARY KEY,
    subject_key TEXT NOT NULL,
    user_id TEXT,
    anonymous_id TEXT,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('response', 'overall')),
    conversation_id TEXT,
    response_id TEXT,
    response_content TEXT,
    star_rating INTEGER CHECK (star_rating IS NULL OR star_rating BETWEEN 1 AND 5),
    thumbs_rating INTEGER CHECK (thumbs_rating IS NULL OR thumbs_rating IN (0, 1)),
    categories_json TEXT NOT NULL DEFAULT '[]',
    comment TEXT NOT NULL DEFAULT '',
    submitted_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Resolved')),
    admin_note TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL,
    CHECK (star_rating IS NOT NULL OR thumbs_rating IS NOT NULL)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS feedback_response_owner_unique
    ON feedback(subject_key, conversation_id, response_id)
    WHERE feedback_type = 'response';
  CREATE INDEX IF NOT EXISTS feedback_submitted_at_idx ON feedback(submitted_at);
  CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);
  CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(star_rating);
`);

export function hashAdminPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
