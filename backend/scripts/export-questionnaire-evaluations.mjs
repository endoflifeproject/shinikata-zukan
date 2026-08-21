import { loadConfig } from '../src/config.mjs';
import { openDatabase } from '../src/db.mjs';
import { createPayloadCodec } from '../src/crypto.mjs';

const config = loadConfig();
const db = openDatabase(config.dbPath);
const codec = createPayloadCodec(config.encryptionKey, config.allowInsecureLocalStorage);

try {
  const rows = db.prepare(`SELECT evaluation_id, questionnaire_version, review_version, payload_envelope, created_at
    FROM questionnaire_evaluations
    WHERE withdrawn_at IS NULL AND payload_envelope IS NOT NULL
    ORDER BY created_at ASC`).all();

  const output = rows.map(row => ({
    evaluation_id: row.evaluation_id,
    questionnaire_version: row.questionnaire_version,
    review_version: row.review_version,
    created_at: row.created_at,
    review: codec.decode(row.payload_envelope)
  }));

  process.stdout.write(JSON.stringify({ exported_at: new Date().toISOString(), count: output.length, evaluations: output }, null, 2));
} finally {
  db.close();
}
