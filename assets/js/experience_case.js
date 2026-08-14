(function(){
  const form=document.getElementById('caseForm'); if(!form)return;
  const caseInput=document.getElementById('caseId');
  const preview=document.getElementById('jsonPreview');
  const inviteOutput=document.getElementById('inviteOutput');
  const roleLabels={patient:'本人',family:'家族・身近な人',doctor:'医師',nurse:'看護師',care_worker:'介護職',other_professional:'その他医療・福祉職'};
  const depthLabels={easy:'ライト 約10分',normal:'標準 約15〜20分',deep:'詳しく 約30分＋'};
  const depthRank={easy:1,normal:2,deep:3};
  const caseSectionIds=['core','course','suffering','care','cost','decision','reflection','complete'];
  let responseId=makeId('RSP',12);

  function addPolicyLinks(){
    const headlinks=document.querySelector('.headlinks');
    if(headlinks&&!headlinks.querySelector('[data-data-policy-link]')){
      const a=document.createElement('a');a.href='experience_data_policy.html';a.textContent='データの扱い';a.setAttribute('data-data-policy-link','');headlinks.insertBefore(a,headlinks.firstChild);
    }
    const note=document.querySelector('#complete .prototype-note');
    if(note&&!note.querySelector('[data-data-policy-link]')){
      const a=document.createElement('a');a.href='experience_data_policy.html';a.textContent='本番時の症例・連絡先・撤回・公開集計の設計を見る →';a.style.textDecoration='underline';a.setAttribute('data-data-policy-link','');note.appendChild(document.createElement('br'));note.appendChild(a);
    }
  }
  function addPreDiagnosisJourney(){
    const duration=document.getElementById('duration');
    if(!duration||document.getElementById('preDiagnosisJourney'))return;
    const durationField=duration.closest('.field');
    if(durationField){
      const label=durationField.querySelector('label');
      if(label)label.textContent='最初に症状・変化に気づいた／病気が見つかった時点から現在・死亡まで';
      duration.name='first_change_to_current_or_death';
      const help=document.createElement('p');help.className='help';help.textContent='本人が気づかなかった場合は、家族・周囲が最初に気づいた変化を含みます。症状がなく健診・検査で見つかった場合は「病気が見つかった時点」から答えてください。';
      durationField.appendChild(help);
    }
    const core=document.getElementById('core');
    const firstWish=core&&core.querySelector('.field > label:not([for])');
    if(!core||!firstWish)return;
    const journey=document.createElement('div');
    journey.id='preDiagnosisJourney';
    journey.innerHTML=`
      <div class="subpanel"><span class="tag">診断前の経過</span><h3>最初の変化から、医療につながるまで</h3><p class="intro">「発症日」を当てるのではなく、本人や周囲が最初に気づいた変化、または病気が見つかった場面を記録します。</p>
        <div class="field"><label for="firstDetectionMode">最初のきっかけとして最も近いもの</label><select id="firstDetectionMode" name="first_detection_mode"><option value="">選択してください</option><option value="patient_noticed">本人が症状・体調の変化に気づいた</option><option value="others_noticed">家族・周囲が行動・生活・体調の変化に気づいた</option><option value="screening">症状はなく、健診・定期検査などで見つかった</option><option value="incidental">別の受診・検査をきっかけに見つかった</option><option value="emergency_first">急変・救急受診／搬送で初めて病気が分かった</option><option value="unknown">分からない・覚えていない</option></select></div>
        <div class="grid2 depth-hidden" data-depth-min="normal"><div class="field"><label for="noticeToCare">最初の症状・変化に気づいてから、最初に医療機関へ相談するまで</label><select id="noticeToCare" name="first_notice_to_first_care"><option value="">選択してください</option><option>すぐ〜1か月未満</option><option>1〜3か月</option><option>3〜6か月</option><option>6か月〜1年</option><option>1〜3年</option><option>3年以上</option><option>症状はなく健診・検査で見つかった</option><option>急変・救急受診／搬送が最初だった</option><option>医療にはつながっていなかった</option><option>分からない</option></select></div><div class="field"><label for="careToDiagnosis">最初に医療機関へ相談してから、病名・状態が分かるまで</label><select id="careToDiagnosis" name="first_care_to_diagnosis"><option value="">選択してください</option><option>その日〜1か月未満</option><option>1〜3か月</option><option>3〜6か月</option><option>6か月〜1年</option><option>1年以上</option><option>診断前に急変・死亡した／最後まで確定しなかった</option><option>分からない</option></select></div></div>
        <div class="depth-hidden" data-depth-min="deep"><div class="field"><label>受診まで時間が空いた背景として近いもの（複数可）</label><div class="options three"><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_minor" value="thought_minor"><label for="cdr_minor">大したことではないと思った</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_age" value="thought_aging"><label for="cdr_age">年齢・体力のせいだと思った</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_chronic" value="usual_symptom"><label for="cdr_chronic">以前からある症状だと思った</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_wait" value="wait_and_see"><label for="cdr_wait">様子を見ようと思った</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_decline" value="person_declined"><label for="cdr_decline">本人が受診を望まなかった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_busy" value="busy"><label for="cdr_busy">仕事・家事・介護などで時間が取れなかった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_cost" value="cost"><label for="cdr_cost">費用が心配だった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_access" value="access"><label for="cdr_access">交通・予約・距離など受診しにくさがあった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_where" value="didnt_know_where"><label for="cdr_where">どこに相談・受診すればよいか分からなかった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_fear" value="fear"><label for="cdr_fear">病院・検査・病気が分かることへの不安があった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_unnoticed" value="not_recognized"><label for="cdr_unnoticed">本人も周囲も病気につながる変化だと気づかなかった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_cognition" value="recognition_difficult"><label for="cdr_cognition">認知・意思伝達などの事情で症状を伝えにくかった</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_na" value="not_applicable"><label for="cdr_na">時間は空いていない／該当しない</label></div><div class="choice"><input type="checkbox" name="care_delay_reasons" id="cdr_unknown" value="unknown"><label for="cdr_unknown">分からない</label></div></div></div>
        <div class="field"><label>受診してから診断・状態把握まで時間がかかった背景として近いもの（複数可）</label><div class="options three"><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_nonspecific" value="nonspecific_symptoms"><label for="ddr_nonspecific">症状だけでは病気を特定しにくかった</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_repeat" value="repeat_visits"><label for="ddr_repeat">何度か受診・経過観察をした</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_tests" value="tests_referrals"><label for="ddr_tests">検査・専門医紹介などに時間がかかった</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_unclear" value="diagnosis_unclear"><label for="ddr_unclear">検査しても病名・原因がはっきりしなかった</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_defer" value="tests_deferred"><label for="ddr_defer">本人の希望などで検査・受診をいったん見送った</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_access" value="appointment_access"><label for="ddr_access">予約・受診先へのアクセスに時間がかかった</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_othercondition" value="other_condition_considered"><label for="ddr_othercondition">当初は別の病気・状態として対応していた</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_emergency" value="emergency_diagnosis"><label for="ddr_emergency">急変・救急受診時に初めて分かった</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_na" value="not_applicable"><label for="ddr_na">時間はかかっていない／該当しない</label></div><div class="choice"><input type="checkbox" name="diagnosis_delay_reasons" id="ddr_unknown" value="unknown"><label for="ddr_unknown">分からない</label></div></div></div></div>
      </div>`;
    firstWish.closest('.field').before(journey);
  }
  function makeId(prefix,len){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes=new Uint8Array(len); crypto.getRandomValues(bytes);
    let s=''; for(let i=0;i<len;i++)s+=chars[bytes[i]%chars.length];
    return prefix+'-'+s;
  }
  function validCase(v){return /^CASE-[A-Z2-9]{8,20}$/.test((v||'').trim().toUpperCase());}
  function ensureCase(){
    let v=(caseInput.value||'').trim().toUpperCase();
    if(!validCase(v))v=makeId('CASE',12);
    caseInput.value=v; return v;
  }
  function getRadio(name){const el=form.querySelector(`input[name="${name}"]:checked`);return el?el.value:'';}
  function roleGroup(role){if(role==='family')return'family';if(['doctor','nurse','care_worker','other_professional'].includes(role))return'professional';return'patient';}
  function updateRole(){
    const role=getRadio('respondent_role'); const group=roleGroup(role);
    document.querySelectorAll('[data-role-panel]').forEach(el=>el.classList.toggle('role-hidden',el.dataset.rolePanel!==group));
    document.getElementById('summaryRole').textContent=roleLabels[role]||'—';
  }
  function updateDepth(){
    const depth=getRadio('answer_depth')||'normal'; const current=depthRank[depth]||2;
    document.querySelectorAll('[data-depth-min]').forEach(el=>{const needed=depthRank[el.dataset.depthMin]||1;el.classList.toggle('depth-hidden',current<needed);});
    document.getElementById('summaryDepth').textContent=depthLabels[depth]||'—';
  }
  function updateDisease(){
    const v=document.getElementById('disease').value;
    const target=['dementia','lung_cancer','heart_failure','copd','kidney_failure'].includes(v)?v:(v?'other':'');
    document.querySelectorAll('[data-disease]').forEach(el=>el.classList.toggle('disease-hidden',el.dataset.disease!==target));
  }
  function updateState(){
    const v=document.getElementById('status').value;
    document.querySelectorAll('[data-state]').forEach(el=>el.classList.toggle('state-hidden',el.dataset.state!==v));
  }
  function updateDecision(){
    const v=document.getElementById('decisionFocus').value;
    document.querySelectorAll('[data-event]').forEach(el=>el.classList.toggle('event-hidden',el.dataset.event!==v));
  }
  function updateCrisis(){
    document.getElementById('crisisModule').classList.toggle('crisis-hidden',!document.getElementById('crisisOptin').checked);
  }
  function updateRecordType(){
    const overview=getRadio('record_type')==='professional_overview';
    document.getElementById('overviewNotice').classList.toggle('record-hidden',!overview);
    caseSectionIds.forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('record-hidden',overview);});
  }
  function updateSummary(){
    document.getElementById('summaryCase').textContent=ensureCase();
    document.getElementById('summaryResponse').textContent=responseId;
    updateRole(); updateDepth();
  }
  function parseHash(){
    const raw=location.hash.replace(/^#/,''); if(!raw)return;
    const p=new URLSearchParams(raw);
    const c=(p.get('case')||'').toUpperCase(); if(validCase(c))caseInput.value=c;
    const role=p.get('role'); if(role&&roleLabels[role]){const el=form.querySelector(`input[name="respondent_role"][value="${role}"]`);if(el)el.checked=true;}
    const depth=p.get('depth'); if(depthRank[depth]){const el=form.querySelector(`input[name="answer_depth"][value="${depth}"]`);if(el)el.checked=true;}
  }
  function isHidden(el){return !!el.closest('.depth-hidden,.role-hidden,.disease-hidden,.event-hidden,.state-hidden,.crisis-hidden,.record-hidden');}
  function collectFlat(){
    const out={};
    Array.from(form.elements).forEach(el=>{
      if(!el.name||el.disabled||isHidden(el))return;
      if((el.type==='checkbox'||el.type==='radio')&&!el.checked)return;
      let v=(el.value||'').trim?el.value.trim():el.value;
      if(v==='')return;
      if(Object.prototype.hasOwnProperty.call(out,el.name)){if(!Array.isArray(out[el.name]))out[el.name]=[out[el.name]];out[el.name].push(v);}else out[el.name]=v;
    });
    return out;
  }
  function take(flat,pred){const o={};Object.keys(flat).forEach(k=>{if(pred(k))o[k]=flat[k];});return o;}
  function buildPayload(){
    const flat=collectFlat();
    const caseKeys=new Set(['case_id','patient_age_band','patient_sex','patient_status','primary_disease','wish_expression','patient_values','prior_wishes_free']);
    const respondentKeys=new Set(['respondent_role','relationship','record_type','professional_experience','answer_source','answer_depth']);
    const courseKeys=new Set(['first_detection_mode','first_change_to_current_or_death','first_notice_to_first_care','first_care_to_diagnosis','care_delay_reasons','diagnosis_delay_reasons','seriousness_recognition_timing','trajectory_pattern','events','unplanned_admissions_6m','emergency_visits_6m','final_month_care_setting','place_of_death','death_expected','last30_treatment']);
    const diseasePrefixes=['dementia_','lung_cancer_','hf_','copd_','kidney_','other_disease_'];
    const carePrefixes=['care_','night_care_','support_services','caregiver_burden_'];
    const costPrefixes=['household_','out_of_pocket_','financial_','cost_','income_','public_support_'];
    const decisionPrefixes=['decision_','patient_wishes_','nutrition_','ventilation_','emergency_choice','treatment_choice','dialysis_choice','place_choice','disclosure_','acp_','other_decision_'];
    const reflectionPrefixes=['overall_acceptance','choose_same_again','what_helped','what_was_hard','values_','own_','message_'];
    const crisisPrefixes=['caregiver_self_death_thought','caregiver_joint_death_thought','crisis_'];
    return {
      schema_version:'experience-case-v1.2',
      record_kind:(flat.record_type==='professional_overview'?'professional_overview':'case_response'),
      case:take(flat,k=>caseKeys.has(k)),
      response:{response_id:responseId,...take(flat,k=>respondentKeys.has(k))},
      course:take(flat,k=>courseKeys.has(k)),
      suffering:take(flat,k=>k==='physical_suffering_overall'||k==='total_suffering_overall'||k==='suffering_free'||k.startsWith('symptom_')||k.startsWith('whole_')),
      disease_specific:take(flat,k=>diseasePrefixes.some(p=>k.startsWith(p))),
      care_burden:take(flat,k=>carePrefixes.some(p=>k.startsWith(p))),
      cost:take(flat,k=>costPrefixes.some(p=>k.startsWith(p))),
      decision:take(flat,k=>decisionPrefixes.some(p=>k.startsWith(p))),
      reflection:take(flat,k=>reflectionPrefixes.some(p=>k.startsWith(p))||k==='decision_regret'),
      crisis_optional:take(flat,k=>crisisPrefixes.some(p=>k.startsWith(p))),
      prototype:{
        submitted:false,
        storage:'none',
        contact_data_included:false,
        case_code_is_frontend_test_only:true,
        production_contract:'assets/data/experience_api_contract_v1.json',
        public_data_policy:'experience_data_policy.html'
      }
    };
  }
  function showPreview(){
    updateSummary(); preview.textContent=JSON.stringify(buildPayload(),null,2); preview.style.display='block'; preview.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function makeInvite(role){
    const caseId=ensureCase();
    const base=location.origin+location.pathname;
    const url=base+'#case='+encodeURIComponent(caseId)+'&role='+encodeURIComponent(role)+'&depth=normal';
    inviteOutput.textContent=url;inviteOutput.style.display='block';
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(url).then(()=>{inviteOutput.textContent='コピーしました（プレテスト用）： '+url;}).catch(()=>{});}
  }

  document.getElementById('newCaseBtn').addEventListener('click',()=>{caseInput.value=makeId('CASE',12);responseId=makeId('RSP',12);updateSummary();});
  document.querySelectorAll('input[name="respondent_role"]').forEach(el=>el.addEventListener('change',()=>{updateRole();updateRecordType();}));
  document.querySelectorAll('input[name="answer_depth"]').forEach(el=>el.addEventListener('change',updateDepth));
  document.querySelectorAll('input[name="record_type"]').forEach(el=>el.addEventListener('change',updateRecordType));
  document.getElementById('disease').addEventListener('change',updateDisease);
  document.getElementById('status').addEventListener('change',updateState);
  document.getElementById('decisionFocus').addEventListener('change',updateDecision);
  document.getElementById('crisisOptin').addEventListener('change',updateCrisis);
  document.getElementById('previewBtn').addEventListener('click',showPreview);
  document.getElementById('hidePreviewBtn').addEventListener('click',()=>preview.style.display='none');
  document.getElementById('resetBtn').addEventListener('click',()=>{if(!confirm('この画面に入力した内容を消します。よろしいですか？'))return;form.reset();caseInput.value=makeId('CASE',12);responseId=makeId('RSP',12);preview.style.display='none';inviteOutput.style.display='none';updateAll();window.scrollTo({top:0,behavior:'smooth'});});
  document.querySelectorAll('[data-invite-role]').forEach(btn=>btn.addEventListener('click',()=>makeInvite(btn.dataset.inviteRole)));
  caseInput.addEventListener('change',()=>{caseInput.value=caseInput.value.trim().toUpperCase();updateSummary();});

  function updateAll(){updateRole();updateDepth();updateDisease();updateState();updateDecision();updateCrisis();updateRecordType();updateSummary();}
  parseHash(); ensureCase(); addPolicyLinks(); addPreDiagnosisJourney(); updateAll();
})();