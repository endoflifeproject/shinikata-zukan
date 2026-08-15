(function(){
  const form = document.getElementById('caseForm');
  const complete = document.getElementById('complete');
  const config = window.SHINIKATA_API_CONFIG || {};
  if (!form || !complete) return;

  function hidden(el){ return !!el.closest('.depth-hidden,.role-hidden,.disease-hidden,.event-hidden,.state-hidden,.crisis-hidden,.record-hidden'); }
  function collectFlat(){
    const out = {};
    Array.from(form.elements).forEach(el => {
      if (!el.name || el.disabled || hidden(el)) return;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      const value = typeof el.value === 'string' ? el.value.trim() : el.value;
      if (value === '') return;
      if (Object.prototype.hasOwnProperty.call(out, el.name)) {
        if (!Array.isArray(out[el.name])) out[el.name] = [out[el.name]];
        out[el.name].push(value);
      } else out[el.name] = value;
    });
    return out;
  }
  function take(flat, predicate){ const out={}; Object.keys(flat).forEach(k => { if (predicate(k)) out[k]=flat[k]; }); return out; }
  function buildPayload(){
    const flat = collectFlat();
    delete flat.case_id;
    const caseKeys = new Set(['patient_age_band','patient_sex','patient_status','course_center_condition','case_overview_free','wish_expression','patient_values','patient_values_free','prior_wishes_free']);
    const respondentKeys = new Set(['respondent_role','relationship','record_type','professional_experience','answer_source','answer_depth']);
    const medicalContextKeys = new Set(['additional_condition_presence','major_contributing_conditions','comorbid_conditions','diabetes_complications','relevant_past_history','prior_experience_decision_influence','comorbidity_other_text']);
    const regionKeys = new Set(['care_prefecture','care_region_change','regional_access_difficulty','regional_access_reasons']);
    const courseKeys = new Set(['first_detection_mode','first_change_to_current_or_death','first_notice_to_first_care','first_care_to_diagnosis','first_care_entry','diagnosis_route','care_delay_reasons','diagnosis_delay_reasons','seriousness_recognition_timing','trajectory_pattern','events','unplanned_admissions_6m','emergency_visits_6m','final_month_care_setting','place_of_death','death_expected','death_period_band','last30_treatment']);
    const diseasePrefixes=['dementia_','lung_cancer_','hf_','copd_','kidney_','other_disease_'];
    const carePrefixes=['care_','night_care_','support_services','caregiver_burden_'];
    const costPrefixes=['household_','out_of_pocket_','financial_','cost_','income_','public_support_'];
    const decisionPrefixes=['decision_','patient_wishes_','nutrition_','ventilation_','emergency_choice','treatment_choice','dialysis_choice','place_choice','disclosure_','acp_','other_decision_'];
    const reflectionPrefixes=['overall_acceptance','choose_same_again','what_helped','what_was_hard','values_','own_','message_','expectation_'];
    const crisisPrefixes=['caregiver_self_death_thought','caregiver_joint_death_thought','crisis_'];
    return {
      schema_version:'experience-case-v1.14',
      record_kind:(flat.record_type==='professional_overview'?'professional_overview':'case_response'),
      case:take(flat,k=>caseKeys.has(k)),
      response:take(flat,k=>respondentKeys.has(k)),
      medical_context:take(flat,k=>medicalContextKeys.has(k)),
      region_access:take(flat,k=>regionKeys.has(k)),
      course:take(flat,k=>courseKeys.has(k)),
      suffering:take(flat,k=>k==='physical_suffering_overall'||k==='total_suffering_overall'||k==='suffering_free'||k.startsWith('symptom_')||k.startsWith('whole_')),
      disease_specific:take(flat,k=>diseasePrefixes.some(p=>k.startsWith(p))),
      care_burden:take(flat,k=>!regionKeys.has(k)&&carePrefixes.some(p=>k.startsWith(p))),
      cost:take(flat,k=>costPrefixes.some(p=>k.startsWith(p))),
      decision:take(flat,k=>decisionPrefixes.some(p=>k.startsWith(p))),
      reflection:take(flat,k=>reflectionPrefixes.some(p=>k.startsWith(p))||k==='decision_regret'),
      crisis_optional:take(flat,k=>crisisPrefixes.some(p=>k.startsWith(p)))
    };
  }

  const panel = document.createElement('div');
  panel.className = 'subpanel';
  panel.id = 'apiSubmissionPanel';
  if (!config.enableSubmission || !config.baseUrl) {
    panel.innerHTML = '<span class="tag">API接続｜安全側で停止中</span><h3>送信機能はまだ有効化していません</h3><p class="intro">バックエンド接続層は組み込まれていますが、正式な同意文書・データ保持期間・運用責任者などが確定するまで、このページから回答は送信されません。ローカル開発時だけ <code>?api=local</code> で接続検証できます。</p>';
    complete.appendChild(panel);
    return;
  }

  panel.innerHTML = `
    <span class="tag">LOCAL API TEST｜本番収集ではありません</span>
    <h3>回答をローカルAPIへ送信して接続を確認する</h3>
    <p class="intro">この機能は開発用です。公開環境では無効です。連絡先・氏名・病院名・住所・正確な日付など、本人を直接特定できる情報は送らないでください。</p>
    <div class="choice"><input type="checkbox" id="apiConsentResearch"><label for="apiConsentResearch">この開発テストでは、回答を匿名化・集計用データとして保存することに同意する</label></div>
    <div class="choice"><input type="checkbox" id="apiConsentNoIdentifiers"><label for="apiConsentNoIdentifiers">氏名・連絡先・病院名・住所・カルテ番号など直接特定できる情報を書いていないことを確認した</label></div>
    <div style="margin-top:12px"><button class="btn primary" type="button" id="apiSubmitBtn">ローカルAPIへ送信</button></div>
    <div id="apiSubmitStatus" class="prototype-note" style="margin-top:12px" aria-live="polite"></div>`;
  complete.appendChild(panel);

  const button = document.getElementById('apiSubmitBtn');
  const status = document.getElementById('apiSubmitStatus');
  button.addEventListener('click', async () => {
    const consent = document.getElementById('apiConsentResearch').checked;
    const noIds = document.getElementById('apiConsentNoIdentifiers').checked;
    if (!consent || !noIds) {
      status.textContent = '2つの確認にチェックしてから送信してください。';
      return;
    }
    const payload = buildPayload();
    if (!payload.response.respondent_role) {
      status.textContent = '「回答者の立場」を選んでください。';
      return;
    }
    button.disabled = true;
    status.textContent = '送信しています…';
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/,'')}/v1/responses`, {
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          consent_version:config.consentVersion,
          consent_scopes:[config.requiredConsentScope],
          response_payload:payload
        })
      });
      const body = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(body.message || body.error || `HTTP ${res.status}`);
      status.innerHTML = `<b>送信テスト成功</b><br>response_id: <code>${body.response_id}</code><br><b>撤回用secret（この画面で一度だけ表示）:</b> <code>${body.withdrawal_secret}</code><br><small>本番ではこのsecretを安全に控える導線が必要です。ブラウザのlocalStorageには保存しません。</small>`;
      button.textContent = '送信済み';
    } catch (e) {
      status.textContent = `送信できませんでした：${e.message}`;
      button.disabled = false;
    }
  });
})();
