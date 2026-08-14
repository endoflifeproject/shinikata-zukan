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
  function addMedicalHistoryContext(){
    const disease=document.getElementById('disease');
    if(!disease||document.getElementById('medicalHistoryContext'))return;
    const row=disease.closest('.grid2');
    if(!row)return;
    const box=document.createElement('div');
    box.id='medicalHistoryContext';
    box.className='subpanel';
    box.innerHTML=`<span class="tag">併存疾患・既往歴</span><h3>主な病気だけでなく、この経過に影響した他の病気も少し残す</h3><p class="intro">すべての病歴を思い出す必要はありません。治療、症状、生活、介護、意思決定に影響したと思うものを中心に答えてください。主に記録する病気と同じものは重ねて選ばなくて構いません。</p>
      <div class="field"><label>主に記録する病気のほかに、療養中に影響した病気・持病はありましたか？</label><div class="options"><div class="choice"><input type="radio" name="comorbidity_presence" id="cmp_yes" value="yes"><label for="cmp_yes">あった</label></div><div class="choice"><input type="radio" name="comorbidity_presence" id="cmp_no" value="no"><label for="cmp_no">特に思い当たらない</label></div><div class="choice"><input type="radio" name="comorbidity_presence" id="cmp_unknown" value="unknown"><label for="cmp_unknown">分からない</label></div></div></div>
      <div class="depth-hidden" data-depth-min="normal"><div class="field"><label>療養中に治療中だった／生活や判断に影響した病気・状態（複数可）</label><div class="options three"><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_diabetes" value="diabetes"><label for="comorb_diabetes">糖尿病</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_ht" value="hypertension"><label for="comorb_ht">高血圧</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_lipid" value="dyslipidemia"><label for="comorb_lipid">脂質異常症</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_coronary" value="coronary_disease"><label for="comorb_coronary">狭心症・心筋梗塞など</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_hf" value="heart_failure"><label for="comorb_hf">心不全</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_arrhythmia" value="arrhythmia"><label for="comorb_arrhythmia">不整脈</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_stroke" value="stroke_cerebrovascular"><label for="comorb_stroke">脳卒中・脳血管疾患</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_ckd" value="chronic_kidney_disease"><label for="comorb_ckd">慢性腎臓病・腎機能低下</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_lung" value="chronic_respiratory"><label for="comorb_lung">慢性の肺・呼吸器疾患</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_dementia" value="dementia_cognitive"><label for="comorb_dementia">認知症・認知機能低下</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_cancer" value="other_cancer"><label for="comorb_cancer">主病以外のがん</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_liver" value="liver_disease"><label for="comorb_liver">肝臓の病気</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_mental" value="mental_health"><label for="comorb_mental">こころ・精神の病気</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_msk" value="musculoskeletal_frailty"><label for="comorb_msk">骨・関節・フレイル等</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_other" value="other"><label for="comorb_other">その他</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_none" value="none"><label for="comorb_none">特になし</label></div><div class="choice"><input type="checkbox" name="comorbid_conditions" id="comorb_unknown" value="unknown"><label for="comorb_unknown">分からない</label></div></div></div>
        <div id="diabetesComplications" class="event-hidden"><div class="field"><label>糖尿病に関連すると説明された／考えられていた合併症（複数可）</label><div class="options three"><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_retina" value="retinopathy"><label for="dm_retina">網膜症・視力への影響</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_kidney" value="nephropathy_ckd"><label for="dm_kidney">腎症・腎機能低下</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_neuro" value="neuropathy"><label for="dm_neuro">神経障害・しびれ・感覚低下</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_foot" value="foot_disease"><label for="dm_foot">足病変・潰瘍・壊疽など</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_coronary" value="coronary_disease"><label for="dm_coronary">心筋梗塞・虚血性心疾患など</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_stroke" value="stroke"><label for="dm_stroke">脳卒中</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_infection" value="infection"><label for="dm_infection">感染症が問題になった</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_none" value="none_known"><label for="dm_none">特に聞いていない・なかった</label></div><div class="choice"><input type="checkbox" name="diabetes_complications" id="dm_unknown" value="unknown"><label for="dm_unknown">分からない</label></div></div><p class="help">糖尿病が原因だったと回答者側で断定する必要はありません。「糖尿病に関連すると説明された／考えられていた」範囲で構いません。</p></div></div>
      </div>
      <div class="depth-hidden" data-depth-min="deep"><div class="field"><label>過去の病気・出来事で、今回の治療や療養判断に影響したもの（複数可）</label><div class="options three"><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_coronary" value="prior_coronary_event"><label for="hx_coronary">過去の心筋梗塞・狭心症</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_stroke" value="prior_stroke"><label for="hx_stroke">過去の脳卒中</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_cancer" value="prior_cancer_treatment"><label for="hx_cancer">過去のがん治療</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_surgery" value="major_surgery_procedure"><label for="hx_surgery">大きな手術・処置</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_fall" value="fracture_fall_decline"><label for="hx_fall">骨折・転倒などによる生活機能低下</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_mental" value="mental_health_history"><label for="hx_mental">こころ・精神の病気の既往</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_other" value="other"><label for="hx_other">その他、判断に影響した既往</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_none" value="none"><label for="hx_none">特になし</label></div><div class="choice"><input type="checkbox" name="relevant_past_history" id="hx_unknown" value="unknown"><label for="hx_unknown">分からない</label></div></div></div><div class="field"><label>併存疾患・既往歴が影響した場面（複数可）</label><div class="options three"><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_symptom" value="symptom_overlap"><label for="ci_symptom">どの病気の症状か分かりにくかった</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_treatment" value="treatment_options"><label for="ci_treatment">治療の選択肢・受けやすさ</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_med" value="medication_burden"><label for="ci_med">薬の数・組み合わせ</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_adl" value="activity_adl"><label for="ci_adl">移動・日常生活</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_cog" value="cognition_decision"><label for="ci_cog">認知・意思決定</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_food" value="diet_nutrition"><label for="ci_food">食事・栄養管理</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_care" value="care_burden"><label for="ci_care">介護の大変さ</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_cost" value="visits_cost"><label for="ci_cost">通院回数・費用</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_emergency" value="emergency_admission"><label for="ci_emergency">急変・入院</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_none" value="no_large_impact"><label for="ci_none">大きな影響はなかった</label></div><div class="choice"><input type="checkbox" name="comorbidity_impact_domains" id="ci_unknown" value="unknown"><label for="ci_unknown">分からない</label></div></div></div><div class="field"><label for="comorbidityOtherText">その他、経過に影響した病気・既往（任意）</label><input type="text" id="comorbidityOtherText" name="comorbidity_other_text" maxlength="120"><p class="help">希少な病名、病院名、地域など、組み合わせると本人が分かる情報は書きすぎないでください。</p></div></div>`;
    row.after(box);
    const dm=document.getElementById('comorb_diabetes');
    if(dm)dm.addEventListener('change',updateComorbidityPanels);
    updateComorbidityPanels();
  }
  function updateComorbidityPanels(){
    const dm=document.getElementById('comorb_diabetes');
    const panel=document.getElementById('diabetesComplications');
    if(panel)panel.classList.toggle('event-hidden',!(dm&&dm.checked));
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
    const medicalContextKeys=new Set(['comorbidity_presence','comorbid_conditions','diabetes_complications','relevant_past_history','comorbidity_impact_domains','comorbidity_other_text']);
    const courseKeys=new Set(['first_detection_mode','first_change_to_current_or_death','first_notice_to_first_care','first_care_to_diagnosis','care_delay_reasons','diagnosis_delay_reasons','seriousness_recognition_timing','trajectory_pattern','events','unplanned_admissions_6m','emergency_visits_6m','final_month_care_setting','place_of_death','death_expected','last30_treatment']);
    const diseasePrefixes=['dementia_','lung_cancer_','hf_','copd_','kidney_','other_disease_'];
    const carePrefixes=['care_','night_care_','support_services','caregiver_burden_'];
    const costPrefixes=['household_','out_of_pocket_','financial_','cost_','income_','public_support_'];
    const decisionPrefixes=['decision_','patient_wishes_','nutrition_','ventilation_','emergency_choice','treatment_choice','dialysis_choice','place_choice','disclosure_','acp_','other_decision_'];
    const reflectionPrefixes=['overall_acceptance','choose_same_again','what_helped','what_was_hard','values_','own_','message_'];
    const crisisPrefixes=['caregiver_self_death_thought','caregiver_joint_death_thought','crisis_'];
    return {
      schema_version:'experience-case-v1.3',
      record_kind:(flat.record_type==='professional_overview'?'professional_overview':'case_response'),
      case:take(flat,k=>caseKeys.has(k)),
      response:{response_id:responseId,...take(flat,k=>respondentKeys.has(k))},
      medical_context:take(flat,k=>medicalContextKeys.has(k)),
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

  function updateAll(){updateRole();updateDepth();updateDisease();updateState();updateDecision();updateCrisis();updateRecordType();updateComorbidityPanels();updateSummary();}
  parseHash(); ensureCase(); addPolicyLinks(); addPreDiagnosisJourney(); addMedicalHistoryContext(); updateAll();
})();