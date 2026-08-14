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
    const caseKeys=new Set(['case_id','patient_age_band','patient_sex','patient_status','primary_disease','illness_duration','wish_expression','patient_values','prior_wishes_free']);
    const respondentKeys=new Set(['respondent_role','relationship','record_type','professional_experience','answer_source','answer_depth']);
    const courseKeys=new Set(['seriousness_recognition_timing','trajectory_pattern','events','unplanned_admissions_6m','emergency_visits_6m','final_month_care_setting','place_of_death','death_expected','last30_treatment']);
    const diseasePrefixes=['dementia_','lung_cancer_','hf_','copd_','kidney_','other_disease_'];
    const carePrefixes=['care_','night_care_','support_services','caregiver_burden_'];
    const costPrefixes=['household_','out_of_pocket_','financial_','cost_','income_','public_support_'];
    const decisionPrefixes=['decision_','patient_wishes_','nutrition_','ventilation_','emergency_choice','treatment_choice','dialysis_choice','place_choice','disclosure_','acp_','other_decision_'];
    const reflectionPrefixes=['overall_acceptance','choose_same_again','what_helped','what_was_hard','values_','own_','message_'];
    const crisisPrefixes=['caregiver_self_death_thought','caregiver_joint_death_thought','crisis_'];
    return {
      schema_version:'experience-case-v1.1',
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
  parseHash(); ensureCase(); addPolicyLinks(); updateAll();
})();