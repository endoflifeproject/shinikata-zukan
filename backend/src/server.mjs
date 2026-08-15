import http from 'node:http';
import { URL } from 'node:url';
import { loadConfig } from './config.mjs';
import { openDatabase } from './db.mjs';
import { createPayloadCodec, hashSecret, randomId, randomSecret } from './crypto.mjs';

const ROLE_GROUP = {
  patient: 'patient',
  family: 'family',
  doctor: 'professional',
  nurse: 'professional',
  care_worker: 'professional',
  other_professional: 'professional'
};
const REQUIRED_CONSENT = 'research_aggregate_use';
const PUBLIC_METRICS = {
  total_suffering_overall: ['suffering', 'total_suffering_overall'],
  physical_suffering_overall: ['suffering', 'physical_suffering_overall'],
  caregiver_burden_overall: ['care_burden', 'caregiver_burden_overall'],
  financial_burden: ['cost', 'financial_burden'],
  overall_acceptance: ['reflection', 'overall_acceptance']
};
const REVIEW_ISSUES = new Set([
  'too_many_questions',
  'unclear_questions',
  'missing_needed_information',
  'low_value_questions',
  'psychologically_difficult',
  'fatigue'
]);
const REVIEW_SCORE_KEYS = ['mental_burden', 'ethical_concern', 'identification_risk'];

function json(res, status, body, headers = {}) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers
  });
  res.end(data);
}

function corsHeaders(req, config) {
  const origin = req.headers.origin;
  if (!origin || !config.allowedOrigins.includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'vary': 'Origin',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '600'
  };
}

function clientIp(req) {
  return String(req.socket.remoteAddress || 'unknown');
}

function createRateLimiter(limit) {
  const buckets = new Map();
  return ip => {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const old = buckets.get(ip);
    const bucket = old && old.minute === minute ? old : { minute, count: 0 };
    bucket.count += 1;
    buckets.set(ip, bucket);
    return bucket.count <= limit;
  };
}

async function readJson(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const err = new Error('Request body too large');
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const err = new Error('Invalid JSON');
    err.status = 400;
    throw err;
  }
}

function cloneWithoutClientIdentifiers(payload) {
  const copy = structuredClone(payload || {});
  if (copy.case && typeof copy.case === 'object') delete copy.case.case_id;
  if (copy.response && typeof copy.response === 'object') delete copy.response.response_id;
  delete copy.prototype;
  return copy;
}

function scanForDirectIdentifiers(value, path = '$', hits = []) {
  if (hits.length >= 8) return hits;
  if (Array.isArray(value)) {
    value.forEach((v, i) => scanForDirectIdentifiers(v, `${path}[${i}]`, hits));
  } else if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      const lower = key.toLowerCase();
      if (/(^|_)(email|phone|telephone|address|hospital_name|facility_name|medical_record|karte|full_name)(_|$)/.test(lower)) {
        hits.push(`${path}.${key}`);
      }
      scanForDirectIdentifiers(v, `${path}.${key}`, hits);
    }
  } else if (typeof value === 'string') {
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)) hits.push(`${path}:email-like`);
    if (/\d{7,}/.test(value.replace(/[\s-]/g, ''))) hits.push(`${path}:long-number-like`);
  }
  return hits;
}

function getPath(obj, path) {
  return path.reduce((v, key) => (v && typeof v === 'object' ? v[key] : undefined), obj);
}

function numberOrNull(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value);
  return null;
}

function summarizeMetrics(payloads, minCellSize) {
  const result = {};
  for (const [name, path] of Object.entries(PUBLIC_METRICS)) {
    const values = payloads.map(p => numberOrNull(getPath(p, path))).filter(v => v != null);
    if (values.length < minCellSize) {
      result[name] = { suppressed: true, n: null, average: null };
      continue;
    }
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    result[name] = { suppressed: false, n: values.length, average: Number(avg.toFixed(2)) };
  }
  return result;
}

function addFilter(clauses, params, sql, value) {
  if (value) {
    clauses.push(sql);
    params.push(value);
  }
}

function isScore(value, min, max) {
  return value == null || (Number.isInteger(value) && value >= min && value <= max);
}

function validateReviewPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return 'review_payload_required';
  if (typeof payload.review_version !== 'string' || !payload.review_version || payload.review_version.length > 80) return 'invalid_review_version';
  if (typeof payload.questionnaire_version !== 'string' || !payload.questionnaire_version || payload.questionnaire_version.length > 100) return 'invalid_questionnaire_version';
  if (!Array.isArray(payload.question_reviews) || payload.question_reviews.length < 1 || payload.question_reviews.length > 400) return 'invalid_question_reviews';

  for (const q of payload.question_reviews) {
    if (!q || typeof q !== 'object' || Array.isArray(q)) return 'invalid_question_review';
    if (typeof q.question_id !== 'string' || !q.question_id || q.question_id.length > 180) return 'invalid_question_id';
    if (typeof q.question_text !== 'string' || !q.question_text || q.question_text.length > 1600) return 'invalid_question_text';
    if (typeof q.section_id !== 'string' || q.section_id.length > 120) return 'invalid_section_id';
    if (typeof q.section_title !== 'string' || q.section_title.length > 600) return 'invalid_section_title';
    for (const key of REVIEW_SCORE_KEYS) if (!isScore(q[key], 0, 3)) return `invalid_${key}`;
    if (q.comment != null && (typeof q.comment !== 'string' || q.comment.length > 1200)) return 'invalid_question_comment';
  }

  if (!payload.overall || typeof payload.overall !== 'object' || Array.isArray(payload.overall)) return 'overall_review_required';
  if (!isScore(payload.overall.rating, 1, 5)) return 'invalid_overall_rating';
  if (!Array.isArray(payload.overall.issues) || payload.overall.issues.length > REVIEW_ISSUES.size) return 'invalid_overall_issues';
  if (payload.overall.issues.some(v => typeof v !== 'string' || !REVIEW_ISSUES.has(v))) return 'invalid_overall_issue';
  if (payload.overall.comment != null && (typeof payload.overall.comment !== 'string' || payload.overall.comment.length > 6000)) return 'invalid_overall_comment';
  return null;
}

function reviewFreeText(payload) {
  return {
    question_comments: payload.question_reviews.map(q => q.comment || '').filter(Boolean),
    overall_comment: payload.overall?.comment || ''
  };
}

export function createAppServer(overrides = {}) {
  const config = loadConfig(overrides);
  const db = openDatabase(config.dbPath);
  const codec = createPayloadCodec(config.encryptionKey, config.allowInsecureLocalStorage);
  const allowRequest = createRateLimiter(config.rateLimitPerMinute);

  const insertCase = db.prepare('INSERT OR IGNORE INTO cases(case_id, created_at) VALUES (?, ?)');
  const insertResponse = db.prepare(`INSERT INTO responses(
    response_id, case_id, schema_version, respondent_role, role_group, age_band,
    center_condition, patient_status, payload_envelope, consent_version,
    consent_scopes_json, withdrawal_secret_hash, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertInvite = db.prepare('INSERT INTO invite_tokens(token_hash, case_id, created_at, expires_at) VALUES (?, ?, ?, ?)');
  const findInvite = db.prepare('SELECT case_id, expires_at, revoked_at FROM invite_tokens WHERE token_hash = ?');
  const findWithdrawal = db.prepare('SELECT response_id, withdrawal_secret_hash, withdrawn_at FROM responses WHERE response_id = ?');
  const withdraw = db.prepare(`UPDATE responses SET
    payload_envelope = NULL,
    respondent_role = NULL,
    role_group = NULL,
    age_band = NULL,
    center_condition = NULL,
    patient_status = NULL,
    withdrawn_at = ?
    WHERE response_id = ? AND withdrawn_at IS NULL`);
  const insertEvaluation = db.prepare(`INSERT INTO questionnaire_evaluations(
    evaluation_id, questionnaire_version, review_version, payload_envelope,
    withdrawal_secret_hash, created_at
  ) VALUES (?, ?, ?, ?, ?, ?)`);
  const findEvaluationWithdrawal = db.prepare('SELECT evaluation_id, withdrawal_secret_hash, withdrawn_at FROM questionnaire_evaluations WHERE evaluation_id = ?');
  const withdrawEvaluation = db.prepare(`UPDATE questionnaire_evaluations SET
    payload_envelope = NULL,
    withdrawn_at = ?
    WHERE evaluation_id = ? AND withdrawn_at IS NULL`);

  const server = http.createServer(async (req, res) => {
    const cors = corsHeaders(req, config);
    if (req.method === 'OPTIONS') {
      if (req.headers.origin && !cors['access-control-allow-origin']) return json(res, 403, { error: 'origin_not_allowed' });
      res.writeHead(204, cors); return res.end();
    }
    if (!allowRequest(clientIp(req))) return json(res, 429, { error: 'rate_limited' }, cors);

    let url;
    try { url = new URL(req.url, 'http://localhost'); }
    catch { return json(res, 400, { error: 'bad_url' }, cors); }

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return json(res, 200, {
          ok: true,
          writes_enabled: config.enableWrites,
          review_writes_enabled: config.enableReviewWrites,
          invites_enabled: config.enableInvites,
          min_public_cell_size: config.minPublicCellSize
        }, cors);
      }

      if (req.method === 'POST' && url.pathname === '/v1/responses') {
        if (!config.enableWrites) return json(res, 503, { error: 'writes_disabled', message: 'Submission is disabled until governance and consent are explicitly enabled.' }, cors);
        const body = await readJson(req, config.maxBodyBytes);
        const scopes = Array.isArray(body.consent_scopes) ? body.consent_scopes.filter(v => typeof v === 'string') : [];
        if (!body.consent_version || !scopes.includes(REQUIRED_CONSENT) || !body.response_payload || typeof body.response_payload !== 'object') {
          return json(res, 400, { error: 'invalid_submission' }, cors);
        }

        const payload = cloneWithoutClientIdentifiers(body.response_payload);
        const role = payload?.response?.respondent_role || '';
        if (!ROLE_GROUP[role]) return json(res, 400, { error: 'respondent_role_required' }, cors);
        const identifierHits = scanForDirectIdentifiers(payload);
        if (identifierHits.length) {
          return json(res, 422, {
            error: 'possible_direct_identifier',
            message: 'Remove direct identifiers such as contact details, long identifying numbers, or explicit identifying fields before submission.',
            fields: identifierHits
          }, cors);
        }

        let caseId;
        if (body.optional_invite_token) {
          const row = findInvite.get(hashSecret(body.optional_invite_token));
          if (!row || row.revoked_at || Date.parse(row.expires_at) <= Date.now()) return json(res, 400, { error: 'invalid_or_expired_invite' }, cors);
          caseId = row.case_id;
        } else {
          caseId = randomId('case', 18);
          insertCase.run(caseId, new Date().toISOString());
        }

        const responseId = randomId('rsp', 18);
        const withdrawalSecret = randomSecret(32);
        const now = new Date().toISOString();
        const centerCondition = payload?.case?.course_center_condition || payload?.course?.course_center_condition || '';
        const ageBand = payload?.case?.patient_age_band || '';
        const patientStatus = payload?.case?.patient_status || '';
        insertResponse.run(
          responseId,
          caseId,
          String(payload.schema_version || 'unknown'),
          role,
          ROLE_GROUP[role],
          String(ageBand || ''),
          String(centerCondition || ''),
          String(patientStatus || ''),
          codec.encode(payload),
          String(body.consent_version),
          JSON.stringify(scopes),
          hashSecret(withdrawalSecret),
          now
        );

        let inviteToken = null;
        if (config.enableInvites) {
          inviteToken = randomSecret(32);
          const expires = new Date(Date.now() + config.inviteTtlDays * 86400000).toISOString();
          insertInvite.run(hashSecret(inviteToken), caseId, now, expires);
        }
        return json(res, 201, {
          response_id: responseId,
          withdrawal_secret: withdrawalSecret,
          optional_invite_token_for_other_perspectives: inviteToken
        }, cors);
      }

      if (req.method === 'POST' && url.pathname === '/v1/withdrawals') {
        const body = await readJson(req, config.maxBodyBytes);
        if (!body.response_id || !body.withdrawal_secret) return json(res, 400, { error: 'response_id_and_secret_required' }, cors);
        const row = findWithdrawal.get(String(body.response_id));
        if (!row) return json(res, 404, { error: 'not_found' }, cors);
        if (row.withdrawn_at) return json(res, 200, { request_status: 'already_withdrawn', effective_scope: 'response' }, cors);
        const given = Buffer.from(hashSecret(body.withdrawal_secret), 'hex');
        const expected = Buffer.from(row.withdrawal_secret_hash, 'hex');
        if (given.length !== expected.length || !cryptoTimingSafeEqual(given, expected)) return json(res, 403, { error: 'invalid_withdrawal_secret' }, cors);
        withdraw.run(new Date().toISOString(), String(body.response_id));
        return json(res, 200, { request_status: 'withdrawn', effective_scope: 'response' }, cors);
      }

      if (req.method === 'POST' && url.pathname === '/v1/questionnaire-evaluations') {
        if (!config.enableReviewWrites) return json(res, 503, { error: 'review_writes_disabled', message: 'Expert questionnaire review submission is not enabled on this server.' }, cors);
        const body = await readJson(req, config.maxBodyBytes);
        const payload = body.review_payload;
        const validationError = validateReviewPayload(payload);
        if (validationError) return json(res, 400, { error: validationError }, cors);
        const identifierHits = scanForDirectIdentifiers(reviewFreeText(payload));
        if (identifierHits.length) {
          return json(res, 422, {
            error: 'possible_direct_identifier',
            message: 'Do not include names, contact details, addresses, facility names, record numbers, or other direct identifiers in expert review comments.',
            fields: identifierHits
          }, cors);
        }

        const evaluationId = randomId('eval', 18);
        const withdrawalSecret = randomSecret(32);
        const now = new Date().toISOString();
        insertEvaluation.run(
          evaluationId,
          String(payload.questionnaire_version),
          String(payload.review_version),
          codec.encode(payload),
          hashSecret(withdrawalSecret),
          now
        );
        return json(res, 201, { evaluation_id: evaluationId, withdrawal_secret: withdrawalSecret }, cors);
      }

      if (req.method === 'POST' && url.pathname === '/v1/questionnaire-evaluation-withdrawals') {
        const body = await readJson(req, config.maxBodyBytes);
        if (!body.evaluation_id || !body.withdrawal_secret) return json(res, 400, { error: 'evaluation_id_and_secret_required' }, cors);
        const row = findEvaluationWithdrawal.get(String(body.evaluation_id));
        if (!row) return json(res, 404, { error: 'not_found' }, cors);
        if (row.withdrawn_at) return json(res, 200, { request_status: 'already_withdrawn', effective_scope: 'questionnaire_evaluation' }, cors);
        const given = Buffer.from(hashSecret(body.withdrawal_secret), 'hex');
        const expected = Buffer.from(row.withdrawal_secret_hash, 'hex');
        if (given.length !== expected.length || !cryptoTimingSafeEqual(given, expected)) return json(res, 403, { error: 'invalid_withdrawal_secret' }, cors);
        withdrawEvaluation.run(new Date().toISOString(), String(body.evaluation_id));
        return json(res, 200, { request_status: 'withdrawn', effective_scope: 'questionnaire_evaluation' }, cors);
      }

      if (req.method === 'POST' && url.pathname === '/v1/contact-consents') {
        return json(res, 501, {
          error: 'separate_contact_service_required',
          message: 'Contact details are intentionally not accepted by the case/response service.'
        }, cors);
      }

      if (req.method === 'GET' && url.pathname === '/v1/public/stats') {
        const clauses = ['withdrawn_at IS NULL', 'payload_envelope IS NOT NULL'];
        const params = [];
        addFilter(clauses, params, 'center_condition = ?', url.searchParams.get('condition'));
        addFilter(clauses, params, 'role_group = ?', url.searchParams.get('role_group'));
        addFilter(clauses, params, 'age_band = ?', url.searchParams.get('age_band'));
        addFilter(clauses, params, 'patient_status = ?', url.searchParams.get('status'));
        const rows = db.prepare(`SELECT payload_envelope FROM responses WHERE ${clauses.join(' AND ')}`).all(...params);
        if (rows.length < config.minPublicCellSize) {
          return json(res, 200, {
            suppressed: true,
            n: null,
            min_cell_size: config.minPublicCellSize,
            metrics: {},
            filters: Object.fromEntries(url.searchParams.entries())
          }, cors);
        }
        const payloads = rows.map(r => codec.decode(r.payload_envelope)).filter(Boolean);
        return json(res, 200, {
          suppressed: false,
          n: rows.length,
          min_cell_size: config.minPublicCellSize,
          metrics: summarizeMetrics(payloads, config.minPublicCellSize),
          filters: Object.fromEntries(url.searchParams.entries())
        }, cors);
      }

      return json(res, 404, { error: 'not_found' }, cors);
    } catch (err) {
      const status = Number(err?.status) || 500;
      if (status >= 500) console.error('[experience-api]', err?.message || 'internal error');
      return json(res, status, { error: status >= 500 ? 'internal_error' : String(err.message || 'request_failed') }, cors);
    }
  });

  return { server, db, config };
}

function cryptoTimingSafeEqual(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { server, config } = createAppServer();
  server.listen(config.port, '127.0.0.1', () => {
    console.log(`[experience-api] listening on http://127.0.0.1:${config.port}`);
    console.log(`[experience-api] writes=${config.enableWrites ? 'enabled' : 'disabled'} reviewWrites=${config.enableReviewWrites ? 'enabled' : 'disabled'} invites=${config.enableInvites ? 'enabled' : 'disabled'}`);
  });
}
