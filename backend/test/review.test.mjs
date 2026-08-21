import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAppServer } from '../src/server.mjs';

function reviewPayload() {
  return {
    review_version: 'questionnaire-expert-review-v1',
    questionnaire_version: 'experience-case-v1.14',
    reviewed_at_client: new Date().toISOString(),
    question_reviews: [
      {
        question_id: 'core:patient_age_band',
        question_text: '本人の年代',
        section_id: 'core',
        section_title: '全疾患共通CORE',
        mental_burden: 0,
        ethical_concern: 0,
        identification_risk: 1,
        comment: '年代区分なら許容できると思う'
      }
    ],
    overall: {
      rating: 4,
      issues: ['too_many_questions', 'fatigue'],
      comment: '全体として有用だが、短縮版があると使いやすい'
    },
    completion: { questions_total: 1, questions_fully_rated: 1 }
  };
}

async function startApp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-review-api-'));
  const { server, db } = createAppServer({
    dbPath: path.join(dir, 'test.sqlite'),
    enableWrites: false,
    enableReviewWrites: true,
    enableInvites: false,
    allowInsecureLocalStorage: true,
    allowedOrigins: ['http://127.0.0.1:8000']
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  return { base: `http://127.0.0.1:${port}`, server, db, dir };
}

test('expert review can be accepted while experience writes remain disabled', async () => {
  const app = await startApp();
  try {
    const review = await fetch(`${app.base}/v1/questionnaire-evaluations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:8000' },
      body: JSON.stringify({ review_payload: reviewPayload() })
    });
    assert.equal(review.status, 201);
    const receipt = await review.json();
    assert.match(receipt.evaluation_id, /^eval_/);
    assert.ok(receipt.withdrawal_secret.length > 20);

    const stored = app.db.prepare('SELECT questionnaire_version, payload_envelope, withdrawn_at FROM questionnaire_evaluations WHERE evaluation_id = ?').get(receipt.evaluation_id);
    assert.equal(stored.questionnaire_version, 'experience-case-v1.14');
    assert.ok(stored.payload_envelope);
    assert.equal(stored.withdrawn_at, null);

    const experience = await fetch(`${app.base}/v1/responses`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}'
    });
    assert.equal(experience.status, 503);

    const withdrawn = await fetch(`${app.base}/v1/questionnaire-evaluation-withdrawals`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ evaluation_id: receipt.evaluation_id, withdrawal_secret: receipt.withdrawal_secret })
    });
    assert.equal(withdrawn.status, 200);
    assert.equal((await withdrawn.json()).request_status, 'withdrawn');

    const after = app.db.prepare('SELECT payload_envelope, withdrawn_at FROM questionnaire_evaluations WHERE evaluation_id = ?').get(receipt.evaluation_id);
    assert.equal(after.payload_envelope, null);
    assert.ok(after.withdrawn_at);
  } finally {
    await new Promise(resolve => app.server.close(resolve));
    app.db.close();
    fs.rmSync(app.dir, { recursive: true, force: true });
  }
});

test('expert review comments reject direct identifiers', async () => {
  const app = await startApp();
  try {
    const payload = reviewPayload();
    payload.overall.comment = '連絡は reviewer@example.com へ';
    const res = await fetch(`${app.base}/v1/questionnaire-evaluations`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ review_payload: payload })
    });
    assert.equal(res.status, 422);
    assert.equal((await res.json()).error, 'possible_direct_identifier');
  } finally {
    await new Promise(resolve => app.server.close(resolve));
    app.db.close();
    fs.rmSync(app.dir, { recursive: true, force: true });
  }
});
