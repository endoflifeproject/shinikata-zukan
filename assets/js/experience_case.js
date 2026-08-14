(function(){
  const form=document.getElementById('caseForm'); if(!form)return;
  const caseInput=document.getElementById('caseId');
  const preview=document.getElementById('jsonPreview');
  const inviteOutput=document.getElementById('inviteOutput');
  const roleLabels={patient:'本人',family:'家族・身近な人',doctor:'医師',nurse:'看護師',care_worker:'介護職',other_professional:'その他医療・福祉職'};
  const depthLabels={easy:'ライト 約10分',normal:'標準 約15〜20分',deep:'詳しく 約30分＋'};
  const depthRank={easy:1,normal:2,deep:3};
  const caseSectionIds=['core','course','suffering','care','cost','decision','reflection','complete'];
  const detailedDiseaseValues=new Set(['dementia','lung_cancer','heart_failure','copd','kidney_failure']);
  let responseId=makeId('RSP',12);

  const centerConditions=[
    ['', '選択してください'],
    ['dementia','認知症'],['lung_cancer','肺がん'],['other_cancer','その他のがん'],
    ['heart_failure','心不全'],['copd','COPD・慢性呼吸器疾患'],['kidney_failure','腎不全・高度な腎機能低下'],
    ['diabetes','糖尿病'],['stroke_cerebrovascular','脳卒中・脳血管疾患'],['liver_disease','肝硬変・慢性肝疾患'],
    ['neurological_disease','その他の神経・筋疾患'],['frailty_multimorbidity','フレイル・多疾患併存が中心'],
    ['infection','感染症・肺炎など'],['multifactorial','複数の病気が絡み、一つに絞れない'],
    ['other','その他'],['unknown','病名・中心となった状態が分からない']
  ];

  const conditionChoices=[
    ['dementia','認知症・認知機能低下'],['lung_cancer','肺がん'],['other_cancer','その他のがん'],
    ['heart_failure','心不全'],['copd','COPD・慢性呼吸器疾患'],['kidney_failure','腎不全・高度CKD'],
    ['diabetes','糖尿病'],['hypertension','高血圧'],['dyslipidemia','脂質異常症'],
    ['coronary_disease','狭心症・心筋梗塞など'],['arrhythmia','不整脈'],['stroke_cerebrovascular','脳卒中・脳血管疾患'],
    ['liver_disease','肝臓の病気'],['neurological_disease','その他の神経・筋疾患'],['mental_health','こころ・精神の病気'],
    ['musculoskeletal_frailty','骨・関節・フレイル等'],['infection_recurrent','感染症・肺炎の反復'],['other','その他'],['unknown','分からない']
  ];

  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function checkChoices(name,items,prefix){return items.map(([value,label])=>`<div class="choice"><input type="checkbox" name="${name}" id="${prefix}_${value}" value="${value}"><label for="${prefix}_${value}">${esc(label)}</label></div>`).join('');}
  function radioChoices(name,items,prefix){return items.map(([value,label])=>`<div class="choice"><input type="radio" name="${name}" id="${prefix}_${value}" value="${value}"><label for="${prefix}_${value}">${esc(label)}</label></div>`).join('');}

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

  function enhanceCenterCondition(){
    const disease=document.getElementById('disease'); if(!disease)return;
    const old=disease.value;
    disease.name='course_center_condition';
    disease.innerHTML=centerConditions.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('');
    if(centerConditions.some(([v])=>v===old))disease.value=old;
    const label=disease.closest('.field')?.querySelector('label');
    if(label)label.textContent='今回の経過の中心となった病気・状態';
    const help=document.createElement('p');help.className='help';
    help.textContent='死亡診断書の「死因」を答える質問ではありません。療養・治療・介護の流れを振り返って、中心だったと思う病気・状態を選びます。一つに絞れない場合は、そのまま「複数の病気が絡む」を選べます。';
    disease.closest('.field')?.appendChild(help);
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
    const wishField=form.querySelector('input[name="wish_expression"]')?.closest('.field');
    if(!wishField)return;
    const journey=document.createElement('div');journey.id='preDiagnosisJourney';
    journey.innerHTML=`<div class="subpanel"><span class="tag">診断前の経過</span><h3>最初の変化から、医療につながるまで</h3><p class="intro">「発症日」を当てるのではなく、本人や周囲が最初に気づいた変化、または病気が見つかった場面を記録します。</p>
      <div class="field"><label for="firstDetectionMode">最初のきっかけとして最も近いもの</label><select id="firstDetectionMode" name="first_detection_mode"><option value="">選択してください</option><option value="patient_noticed">本人が症状・体調の変化に気づいた</option><option value="others_noticed">家族・周囲が行動・生活・体調の変化に気づいた</option><option value="screening">症状はなく、健診・定期検査などで見つかった</option><option value="incidental">別の受診・検査をきっかけに見つかった</option><option value="emergency_first">急変・救急受診／搬送で初めて病気が分かった</option><option value="unknown">分からない・覚えていない</option></select></div>
      <div class="grid2 depth-hidden" data-depth-min="normal"><div class="field"><label for="noticeToCare">最初の症状・変化に気づいてから、最初に医療機関へ相談するまで</label><select id="noticeToCare" name="first_notice_to_first_care"><option value="">選択してください</option><option>すぐ〜1か月未満</option><option>1〜3か月</option><option>3〜6か月</option><option>6か月〜1年</option><option>1〜3年</option><option>3年以上</option><option>症状はなく健診・検査で見つかった</option><option>急変・救急受診／搬送が最初だった</option><option>医療にはつながっていなかった</option><option>分からない</option></select></div><div class="field"><label for="careToDiagnosis">最初に医療機関へ相談してから、病名・状態が分かるまで</label><select id="careToDiagnosis" name="first_care_to_diagnosis"><option value="">選択してください</option><option>その日〜1か月未満</option><option>1〜3か月</option><option>3〜6か月</option><option>6か月〜1年</option><option>1年以上</option><option>診断前に急変・死亡した／最後まで確定しなかった</option><option>分からない</option></select></div></div>
      <div class="depth-hidden" data-depth-min="deep"><div class="field"><label>受診まで時間が空いた背景として近いもの（複数可）</label><div class="options three">${checkChoices('care_delay_reasons',[
        ['thought_minor','大したことではないと思った'],['thought_aging','年齢・体力のせいだと思った'],['usual_symptom','以前からある症状だと思った'],['wait_and_see','様子を見ようと思った'],['person_declined','本人が受診を望まなかった'],['busy','仕事・家事・介護などで時間が取れなかった'],['cost','費用が心配だった'],['access','交通・予約・距離など受診しにくさがあった'],['didnt_know_where','どこに相談・受診すればよいか分からなかった'],['fear','病院・検査・病気が分かることへの不安があった'],['not_recognized','本人も周囲も病気につながる変化だと気づかなかった'],['recognition_difficult','認知・意思伝達などの事情で症状を伝えにくかった'],['not_applicable','時間は空いていない／該当しない'],['unknown','分からない']],'cdr')}</div></div>
      <div class="field"><label>受診してから診断・状態把握まで時間がかかった背景として近いもの（複数可）</label><div class="options three">${checkChoices('diagnosis_delay_reasons',[
        ['nonspecific_symptoms','症状だけでは病気を特定しにくかった'],['repeat_visits','何度か受診・経過観察をした'],['tests_referrals','検査・専門医紹介などに時間がかかった'],['diagnosis_unclear','検査しても病名・原因がはっきりしなかった'],['tests_deferred','本人の希望などで検査・受診をいったん見送った'],['appointment_access','予約・受診先へのアクセスに時間がかかった'],['other_condition_considered','当初は別の病気・状態として対応していた'],['emergency_diagnosis','急変・救急受診時に初めて分かった'],['not_applicable','時間はかかっていない／該当しない'],['unknown','分からない']],'ddr')}</div></div></div>
    </div>`;
    wishField.before(journey);
  }

  function addMedicalHistoryContext(){
    const disease=document.getElementById('disease');
    if(!disease||document.getElementById('medicalHistoryContext'))return;
    const row=disease.closest('.grid2'); if(!row)return;
    const box=document.createElement('div');box.id='medicalHistoryContext';box.className='subpanel';
    box.innerHTML=`<span class="tag">病気の役割を分けて記録</span><h3>病名を1個の箱に押し込めない</h3><p class="intro">①今回の経過の中心、②経過に大きく影響した病気、③その他の併存疾患・関連既往を分けます。同じ病名を何度も重ねて選ぶ必要はありません。</p>
      <div class="field"><label>中心となった病気・状態のほかに、経過へ大きく影響した病気・持病・既往はありましたか？</label><div class="options">${radioChoices('additional_condition_presence',[['yes','あった'],['no','特に思い当たらない'],['unknown','分からない']],'acp')}</div></div>
      <div id="additionalConditionsDetail" class="event-hidden depth-hidden" data-depth-min="normal">
        <div class="field"><label>② 経過・治療・介護・最期に「大きく影響した」病気・状態（複数可）</label><div class="options three">${checkChoices('major_contributing_conditions',conditionChoices,'major')}</div><p class="help">中心の病気とは別に、経過を大きく変えたと思うものを2〜3個程度の感覚で。数を厳密に制限はしません。</p></div>
        <div class="field"><label>③ そのほか、療養中に治療中だった／背景にあった病気・持病（複数可）</label><div class="options three">${checkChoices('comorbid_conditions',conditionChoices,'comorb')}</div><p class="help">「大きく影響した」とまでは言えない持病も、背景要因として残せます。</p></div>
      </div>
      <div id="diabetesComplications" class="event-hidden depth-hidden" data-depth-min="normal"><div class="field"><label>糖尿病に関連すると説明された／考えられていた合併症（複数可）</label><div class="options three">${checkChoices('diabetes_complications',[
        ['retinopathy','網膜症・視力への影響'],['nephropathy_ckd','腎症・腎機能低下'],['neuropathy','神経障害・しびれ・感覚低下'],['foot_disease','足病変・潰瘍・壊疽など'],['coronary_disease','心筋梗塞・虚血性心疾患など'],['stroke','脳卒中'],['infection','感染症が問題になった'],['none_known','特に聞いていない・なかった'],['unknown','分からない']],'dm')}</div><p class="help">糖尿病が原因だったと回答者側で断定する必要はありません。「糖尿病に関連すると説明された／考えられていた」範囲で構いません。</p></div></div>
      <div class="depth-hidden" data-depth-min="deep"><div class="field"><label>④ 過去の病気・出来事で、今回の治療や療養判断に影響したもの（複数可）</label><div class="options three">${checkChoices('relevant_past_history',[
        ['prior_coronary_event','過去の心筋梗塞・狭心症'],['prior_stroke','過去の脳卒中'],['prior_cancer_treatment','過去のがん治療'],['major_surgery_procedure','大きな手術・処置'],['fracture_fall_decline','骨折・転倒などによる生活機能低下'],['mental_health_history','こころ・精神の病気の既往'],['other','その他、判断に影響した既往'],['none','特になし'],['unknown','分からない']],'hx')}</div></div>
        <div class="field"><label>病気の重なり・既往歴が影響した場面（複数可）</label><div class="options three">${checkChoices('comorbidity_impact_domains',[
          ['symptom_overlap','どの病気の症状か分かりにくかった'],['treatment_options','治療の選択肢・受けやすさ'],['medication_burden','薬の数・組み合わせ'],['activity_adl','移動・日常生活'],['cognition_decision','認知・意思決定'],['diet_nutrition','食事・栄養管理'],['care_burden','介護の大変さ'],['visits_cost','通院回数・費用'],['emergency_admission','急変・入院'],['no_large_impact','大きな影響はなかった'],['unknown','分からない']],'ci')}</div></div>
        <div class="field"><label for="comorbidityOtherText">その他、経過に影響した病気・既往（任意）</label><input type="text" id="comorbidityOtherText" name="comorbidity_other_text" maxlength="120"><p class="help">希少な病名、病院名、地域など、組み合わせると本人が分かる情報は書きすぎないでください。</p></div>
      </div>`;
    row.after(box);
  }

  function makeId(prefix,len){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=new Uint8Array(len);crypto.getRandomValues(bytes);let s='';for(let i=0;i<len;i++)s+=chars[bytes[i]%chars.length];return prefix+'-'+s;}
  function validCase(v){return /^CASE-[A-Z2-9]{8,20}$/.test((v||'').trim().toUpperCase());}
  function ensureCase(){let v=(caseInput.value||'').trim().toUpperCase();if(!validCase(v))v=makeId('CASE',12);caseInput.value=v;return v;}
  function getRadio(name){const el=form.querySelector(`input[name="${name}"]:checked`);return el?el.value:'';}
  function checkedValues(name){return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(el=>el.value);}
  function roleGroup(role){if(role==='family')return'family';if(['doctor','nurse','care_worker','other_professional'].includes(role))return'professional';return'patient';}
  function activeAdditionalConditions(){const depth=getRadio('answer_depth')||'normal';return getRadio('additional_condition_presence')==='yes'&&(depthRank[depth]||2)>=2;}

  function updateRole(){const role=getRadio('respondent_role');const group=roleGroup(role);document.querySelectorAll('[data-role-panel]').forEach(el=>el.classList.toggle('role-hidden',el.dataset.rolePanel!==group));document.getElementById('summaryRole').textContent=roleLabels[role]||'—';}
  function updateDepth(){const depth=getRadio('answer_depth')||'normal';const current=depthRank[depth]||2;document.querySelectorAll('[data-depth-min]').forEach(el=>{const needed=depthRank[el.dataset.depthMin]||1;el.classList.toggle('depth-hidden',current<needed);});document.getElementById('summaryDepth').textContent=depthLabels[depth]||'—';}
  function updateDisease(){
    const center=document.getElementById('disease').value;
    const majors=activeAdditionalConditions()?checkedValues('major_contributing_conditions'):[];
    const involved=new Set([center,...majors]);
    document.querySelectorAll('[data-disease]').forEach(el=>{
      const key=el.dataset.disease;
      const show=key==='other' ? center==='other' : detailedDiseaseValues.has(key)&&involved.has(key);
      el.classList.toggle('disease-hidden',!show);
    });
  }
  function updateState(){const v=document.getElementById('status').value;document.querySelectorAll('[data-state]').forEach(el=>el.classList.toggle('state-hidden',el.dataset.state!==v));}
  function updateDecision(){const v=document.getElementById('decisionFocus').value;document.querySelectorAll('[data-event]').forEach(el=>{if(el.id==='additionalConditionsDetail'||el.id==='diabetesComplications')return;el.classList.toggle('event-hidden',el.dataset.event!==v);});}
  function updateCrisis(){document.getElementById('crisisModule').classList.toggle('crisis-hidden',!document.getElementById('crisisOptin').checked);}
  function updateRecordType(){const overview=getRadio('record_type')==='professional_overview';document.getElementById('overviewNotice').classList.toggle('record-hidden',!overview);caseSectionIds.forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('record-hidden',overview);});}
  function updateConditionPanels(){
    const detail=document.getElementById('additionalConditionsDetail');
    if(detail)detail.classList.toggle('event-hidden',getRadio('additional_condition_presence')!=='yes');
    const extra=activeAdditionalConditions()?[...checkedValues('major_contributing_conditions'),...checkedValues('comorbid_conditions')]:[];
    const diabetes=[document.getElementById('disease')?.value,...extra].includes('diabetes');
    const dm=document.getElementById('diabetesComplications'); if(dm)dm.classList.toggle('event-hidden',!diabetes);
    updateDisease();
  }
  function updateSummary(){document.getElementById('summaryCase').textContent=ensureCase();document.getElementById('summaryResponse').textContent=responseId;updateRole();updateDepth();}

  function parseHash(){const raw=location.hash.replace(/^#/,'');if(!raw)return;const p=new URLSearchParams(raw);const c=(p.get('case')||'').toUpperCase();if(validCase(c))caseInput.value=c;const role=p.get('role');if(role&&roleLabels[role]){const el=form.querySelector(`input[name="respondent_role"][value="${role}"]`);if(el)el.checked=true;}const depth=p.get('depth');if(depthRank[depth]){const el=form.querySelector(`input[name="answer_depth"][value="${depth}"]`);if(el)el.checked=true;}}
  function isHidden(el){return !!el.closest('.depth-hidden,.role-hidden,.disease-hidden,.event-hidden,.state-hidden,.crisis-hidden,.record-hidden');}
  function collectFlat(){const out={};Array.from(form.elements).forEach(el=>{if(!el.name||el.disabled||isHidden(el))return;if((el.type==='checkbox'||el.type==='radio')&&!el.checked)return;let v=(el.value||'').trim?el.value.trim():el.value;if(v==='')return;if(Object.prototype.hasOwnProperty.call(out,el.name)){if(!Array.isArray(out[el.name]))out[el.name]=[out[el.name]];out[el.name].push(v);}else out[el.name]=v;});return out;}
  function take(flat,pred){const o={};Object.keys(flat).forEach(k=>{if(pred(k))o[k]=flat[k];});return o;}

  function buildPayload(){
    const flat=collectFlat();
    const caseKeys=new Set(['case_id','patient_age_band','patient_sex','patient_status','course_center_condition','wish_expression','patient_values','prior_wishes_free']);
    const respondentKeys=new Set(['respondent_role','relationship','record_type','professional_experience','answer_source','answer_depth']);
    const medicalContextKeys=new Set(['additional_condition_presence','major_contributing_conditions','comorbid_conditions','diabetes_complications','relevant_past_history','comorbidity_impact_domains','comorbidity_other_text']);
    const courseKeys=new Set(['first_detection_mode','first_change_to_current_or_death','first_notice_to_first_care','first_care_to_diagnosis','care_delay_reasons','diagnosis_delay_reasons','seriousness_recognition_timing','trajectory_pattern','events','unplanned_admissions_6m','emergency_visits_6m','final_month_care_setting','place_of_death','death_expected','last30_treatment']);
    const diseasePrefixes=['dementia_','lung_cancer_','hf_','copd_','kidney_','other_disease_'];
    const carePrefixes=['care_','night_care_','support_services','caregiver_burden_'];
    const costPrefixes=['household_','out_of_pocket_','financial_','cost_','income_','public_support_'];
    const decisionPrefixes=['decision_','patient_wishes_','nutrition_','ventilation_','emergency_choice','treatment_choice','dialysis_choice','place_choice','disclosure_','acp_','other_decision_'];
    const reflectionPrefixes=['overall_acceptance','choose_same_again','what_helped','what_was_hard','values_','own_','message_'];
    const crisisPrefixes=['caregiver_self_death_thought','caregiver_joint_death_thought','crisis_'];
    return {
      schema_version:'experience-case-v1.4',
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
      prototype:{submitted:false,storage:'none',contact_data_included:false,case_code_is_frontend_test_only:true,production_contract:'assets/data/experience_api_contract_v1.json',public_data_policy:'experience_data_policy.html'}
    };
  }

  function showPreview(){updateSummary();preview.textContent=JSON.stringify(buildPayload(),null,2);preview.style.display='block';preview.scrollIntoView({behavior:'smooth',block:'nearest'});}
  function makeInvite(role){const caseId=ensureCase();const base=location.origin+location.pathname;const url=base+'#case='+encodeURIComponent(caseId)+'&role='+encodeURIComponent(role)+'&depth=normal';inviteOutput.textContent=url;inviteOutput.style.display='block';if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(url).then(()=>{inviteOutput.textContent='コピーしました（プレテスト用）： '+url;}).catch(()=>{});}}

  function bindEvents(){
    document.getElementById('newCaseBtn').addEventListener('click',()=>{caseInput.value=makeId('CASE',12);responseId=makeId('RSP',12);updateSummary();});
    document.querySelectorAll('input[name="respondent_role"]').forEach(el=>el.addEventListener('change',()=>{updateRole();updateRecordType();}));
    document.querySelectorAll('input[name="answer_depth"]').forEach(el=>el.addEventListener('change',()=>{updateDepth();updateConditionPanels();}));
    document.querySelectorAll('input[name="record_type"]').forEach(el=>el.addEventListener('change',updateRecordType));
    document.getElementById('disease').addEventListener('change',updateConditionPanels);
    document.querySelectorAll('input[name="additional_condition_presence"],input[name="major_contributing_conditions"],input[name="comorbid_conditions"]').forEach(el=>el.addEventListener('change',updateConditionPanels));
    document.getElementById('status').addEventListener('change',updateState);
    document.getElementById('decisionFocus').addEventListener('change',updateDecision);
    document.getElementById('crisisOptin').addEventListener('change',updateCrisis);
    document.getElementById('previewBtn').addEventListener('click',showPreview);
    document.getElementById('hidePreviewBtn').addEventListener('click',()=>preview.style.display='none');
    document.getElementById('resetBtn').addEventListener('click',()=>{if(!confirm('この画面に入力した内容を消します。よろしいですか？'))return;form.reset();caseInput.value=makeId('CASE',12);responseId=makeId('RSP',12);preview.style.display='none';inviteOutput.style.display='none';updateAll();window.scrollTo({top:0,behavior:'smooth'});});
    document.querySelectorAll('[data-invite-role]').forEach(btn=>btn.addEventListener('click',()=>makeInvite(btn.dataset.inviteRole)));
    caseInput.addEventListener('change',()=>{caseInput.value=caseInput.value.trim().toUpperCase();updateSummary();});
  }

  function updateAll(){updateRole();updateDepth();updateConditionPanels();updateState();updateDecision();updateCrisis();updateRecordType();updateSummary();}
  parseHash();ensureCase();addPolicyLinks();enhanceCenterCondition();addPreDiagnosisJourney();addMedicalHistoryContext();bindEvents();updateAll();
})();