import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAppServer } from '../src/server.mjs';

function samplePayload() {
  return {
    schema_version: 'experience-case-v1.14',
    record_kind: 'case_response',
    case: { patient_age_band: '80代', patient_status: 'deceased', course_center_condition: 'dementia', case_id: 'CASE-CLIENTONLY' },
    response: { respondent_role: 'family', response_id: 'RSP-CLIENTONLY' },
    suffering: { total_suffering_overall: '8', physical_suffering_overall: '6' },
    care_burden: { caregiver_burden_overall: '10' },
    cost: { financial_burden: '8' },
    reflection: { overall_acceptance: '6' },
    prototype: { submitted: false }
  };
}

async function startApp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-api-'));
  const { server, db } = createAppServer({
    dbPath: path.join(dir, 'test.sqlite'),
    enableWrites: true,
    enableInvites: true,
    minPublicCellSize: 1,
    allowInsecureLocalStorage: true,
    allowedOrigins: ['http://127.0.0.1:8000']
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  return { base: `http://127.0.0.1:${port}`, server, db, dir };
}

test('submission -> aggregate -> withdrawal', async () => {
  const app = await startApp();
  try {
    const submit = await fetch(`${app.base}/v1/responses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:8000' },
      body: JSON.stringify({
        consent_version: 'local-test-v1',
        consent_scopes: ['research_aggregate_use'],
        response_payload: samplePayload()
      })
    });
    assert.equal(submit.status, 201);
    const receipt = await submit.json();
    assert.match(receipt.response_id, /^rsp_/);
    assert.ok(receipt.withdrawal_secret.length > 20);
    assert.ok(receipt.optional_invite_token_for_other_perspectives);

    const stats = await fetch(`${app.base}/v1/public/stats?condition=dementia&role_group=family`);
    assert.equal(stats.status, 200);
    const body = await stats.json();
    assert.equal(body.suppressed, false);
    assert.equal(body.n, 1);
    assert.equal(body.metrics.total_suffering_overall.average, 8);
    assert.equal(body.metrics.caregiver_burden_overall.average, 10);

    const withdrawn = await fetch(`${app.base}/v1/withdrawals`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ response_id: receipt.response_id, withdrawal_secret: receipt.withdrawal_secret })
    });
    assert.equal(withdrawn.status, 200);
    assert.equal((await withdrawn.json()).request_status, 'withdrawn');

    const after = await fetch(`${app.base}/v1/public/stats?condition=dementia&role_group=family`);
    const afterBody = await after.json();
    assert.equal(afterBody.suppressed, true);
    assert.equal(afterBody.n, null);
  } finally {
    await new Promise(resolve => app.server.close(resolve));
    app.db.close();
    fs.rmSync(app.dir, { recursive: true, force: true });
  }
});

test('direct identifiers are rejected', async () => {
  const app = await startApp();
  try {
    const payload = samplePayload();
    payload.reflection.what_helped = 'contact me at person@example.com';
    const res = await fetch(`${app.base}/v1/responses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ consent_version: 'local-test-v1', consent_scopes: ['research_aggregate_use'], response_payload: payload })
    });
    assert.equal(res.status, 422);
    assert.equal((await res.json()).error, 'possible_direct_identifier');
  } finally {
    await new Promise(resolve => app.server.close(resolve));
    app.db.close();
    fs.rmSync(app.dir, { recursive: true, force: true });
  }
});
