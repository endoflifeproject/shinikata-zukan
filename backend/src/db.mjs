import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function openDatabase(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS cases (
      case_id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS responses (
      response_id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(case_id),
      schema_version TEXT NOT NULL,
      respondent_role TEXT,
      role_group TEXT,
      age_band TEXT,
      center_condition TEXT,
      patient_status TEXT,
      payload_envelope TEXT,
      consent_version TEXT NOT NULL,
      consent_scopes_json TEXT NOT NULL,
      withdrawal_secret_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      withdrawn_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_responses_public_filters
      ON responses(center_condition, role_group, age_band, patient_status, withdrawn_at);
    CREATE TABLE IF NOT EXISTS invite_tokens (
      token_hash TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(case_id),
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT
    );
    CREATE TABLE IF NOT EXISTS questionnaire_evaluations (
      evaluation_id TEXT PRIMARY KEY,
      questionnaire_version TEXT NOT NULL,
      review_version TEXT NOT NULL,
      payload_envelope TEXT,
      withdrawal_secret_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      withdrawn_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_questionnaire_evaluations_active
      ON questionnaire_evaluations(questionnaire_version, withdrawn_at);
  `);
  return db;
}
