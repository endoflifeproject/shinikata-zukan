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

  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));}
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

  function enhanceValuesAndRespiratoryLabels(){
    const valuesField=form.querySelector('input[name="patient_values"]')?.closest('.field');
    if(valuesField&&!document.getElementById('patientValuesFree')){
      const free=document.createElement('div');free.className='field';
      free.innerHTML='<label for="patientValuesFree">その他・本人が大切にしていたこと（任意）</label><input type="text" id="patientValuesFree" name="patient_values_free" maxlength="200" placeholder="例：毎朝の習慣、ペットと過ごす、孫の行事までは生きたい、一人の時間を守りたい など"><p class="help">選択肢にない「その人らしさ」を短く残せます。氏名・病院名・住所など本人を特定できる情報は書かないでください。</p>';
      valuesField.after(free);
    }
    const setLabel=(id,text)=>{const el=document.getElementById(id);const label=el&&form.querySelector(`label[for="${id}"]`);if(label)label.textContent=text;};
    setLabel('ev_oxygen','酸素療法（鼻のチューブ・酸素マスク・高流量の酸素・在宅酸素など）');
    setLabel('ev_niv','NPPV/NIV（顔に密着するマスクで呼吸を補助する治療）');
    setLabel('copd_oxygen','在宅酸素療法（家で酸素を使う）');
    setLabel('copd_niv','NPPV/NIV（マスクで呼吸を補助）');
    setLabel('vent_noninv','NPPV/NIV（顔に密着するマスクで呼吸を補助）');
    const ventilationOption=document.querySelector('#decisionFocus option[value="ventilation"]');
    if(ventilationOption)ventilationOption.textContent='人工呼吸・換気補助（NPPV/NIVなど）';
  }

  function enhanceCostSection(){
    const costSection=document.getElementById('cost'); if(!costSection)return;
    const medical=document.getElementById('cost_med');
    if(medical){
      medical.value='insured_medical_out_of_pocket';
      const label=costSection.querySelector('label[for="cost_med"]');
      if(label)label.textContent='保険適用の医療費（窓口で支払った自己負担分）';
      if(!document.getElementById('cost_uninsured_medical')){
        const choice=document.createElement('div');choice.className='choice';
        choice.innerHTML='<input type="checkbox" name="cost_categories" id="cost_uninsured_medical" value="noncovered_medical"><label for="cost_uninsured_medical">保険適用外の医療・薬・検査など（自由診療・未承認治療など）</label>';
        medical.closest('.choice')?.after(choice);
      }
    }
    const privateService=document.getElementById('cost_private');
    if(privateService){
      privateService.value='private_care_service';
      const label=costSection.querySelector('label[for="cost_private"]');
      if(label)label.textContent='保険外の生活・介護サービス（家事支援など）';
    }
    const categoryField=medical?.closest('.field');
    if(categoryField&&!document.getElementById('costFinancialDetail')){
      const box=document.createElement('div');box.id='costFinancialDetail';box.className='subpanel';
      box.innerHTML=`<h3>医療費・保険・お金のきつさ</h3><p class="intro">同じ「費用がかかった」でも、保険診療の自己負担、保険外医療、生活費、収入減、民間保険などを分けて残します。</p>
        <div class="grid2"><div class="field"><label for="costCopayRate">保険適用の医療で、主な窓口負担割合</label><select id="costCopayRate" name="cost_public_insurance_copay"><option value="">分からない・該当なし</option><option value="10">主に1割</option><option value="20">主に2割</option><option value="30">主に3割</option><option value="varied">時期・制度によって変わった</option><option value="unknown">分からない</option></select></div><div class="field"><label>民間の保険・保障で利用したもの（複数可）</label><div class="options">${checkChoices('cost_private_insurance_types',[
          ['medical','民間の医療保険'],['disease_specific','がん保険など疾病別の保障'],['income_protection','就業不能・所得補償など'],['death_benefit','死亡保険・死亡保障'],['other','その他の民間保障'],['none','加入・利用していない'],['unknown','分からない']],'cpi')}</div></div></div>
        <div class="field"><label>民間保険について、もっとも近いもの</label><div class="options">${radioChoices('cost_private_insurance_status',[
          ['paid','給付・保険金を受け取った'],['applied_no_payment','請求・申請したが給付されなかった'],['not_claimed','加入していたが請求しなかった／できなかった'],['not_enrolled','民間保険には加入していなかった'],['unknown','分からない'],['prefer_not','答えたくない']],'cpis')}</div></div>
        <div class="field"><label for="costInsuranceHelp">保険や制度のお金は、何に役立ちましたか？（任意）</label><textarea id="costInsuranceHelp" name="cost_private_insurance_help" placeholder="例：治療費、保険外治療、生活費、収入減の補填、介護・施設費など"></textarea></div>
        <div class="field"><label>療養・介護中、お金の面で特につらかったこと（複数可）</label><div class="options three">${checkChoices('cost_financial_strain',[
          ['savings_declining','貯金が減り続けること自体が不安だった'],['used_savings','貯蓄を大きく取り崩した'],['uncertain_duration','いつまで続くか分からず、費用の見通しが立たなかった'],['insured_medical_cost','保険適用でも医療費の自己負担が重かった'],['noncovered_medical_cost','保険適用外の医療・薬・検査などが高額だった'],['public_support_insufficient','公的な助成・制度だけでは足りない／使いにくいと感じた'],['care_or_facility_cost','介護サービス・施設・在宅療養の費用が重かった'],['income_loss','本人・支える人の収入が減った'],['family_paid','本人の貯蓄だけでは足りず、家族・親族の貯蓄を使った'],['childcare_overlap','子育て・教育費など別の家計負担と重なった'],['cut_daily_spending','食費・娯楽費など日常生活の支出を削った'],['reduced_care_for_cost','費用を理由に医療・介護サービスを諦めた／減らした'],['borrowing','借入れが必要になった'],['basic_expenses','家賃・光熱費・食費など生活費の支払いに困った'],['patient_income_dependency','本人の年金・収入への依存が大きかった'],['after_death_income_loss','本人の死亡後に年金・収入がなくなることも不安だった'],['none_major','特に大きな金銭的負担はなかった'],['unknown','分からない・答えたくない']],'cfs')}</div></div>
        <div class="field"><label for="costFinancialStrainFree">お金のことで、ほかにきつかったこと（任意）</label><textarea id="costFinancialStrainFree" name="cost_financial_strain_free" placeholder="例：親の貯金が少なく自分の貯金を使った、介護費そのものより子育てとの両立が厳しかった、制度の申請が間に合わなかった など"></textarea></div>`;
      categoryField.after(box);
    }
    const incomeLoss=document.getElementById('incomeLoss');
    if(incomeLoss){
      const field=incomeLoss.closest('.field');
      const label=field?.querySelector('label');
      if(label)label.textContent='療養・介護期間全体で、仕事を減らす・休む・辞めることで失った収入の概算';
      if(field&&!document.getElementById('incomeLossDuration')){
        const duration=document.createElement('div');duration.className='field';
        duration.innerHTML='<label for="incomeLossDuration">収入への影響が続いた期間</label><select id="incomeLossDuration" name="income_loss_duration"><option value="">不明・該当なし</option><option>1か月未満</option><option>1〜3か月</option><option>3〜6か月</option><option>6か月〜1年</option><option>1〜3年</option><option>3年以上</option><option>断続的・時期によって変わった</option><option>分からない</option></select><p class="help">上の金額は「月額・年額」ではなく、この療養・介護期間全体で失ったおおよその合計額として答えます。</p>';
        field.after(duration);
      }
    }
    const publicSupport=document.querySelector('input[name="public_support_used"]')?.closest('.field')?.querySelector('label');
    if(publicSupport)publicSupport.textContent='高額療養費・介護保険・自治体助成など公的制度・給付の利用';
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
    journey.innerHTML=`<div class="subpanel"><span class="tag">診断前の経過</span><h3>最初の変化から、医療につながるまで</h3><p class="intro">「発症日」を当てるのではなく、本人や周囲が最初に気づいた変化、または病気が見つかった場面を記録します。本命の病気とは別のけが・症状・通院が入口になったケースも残せます。</p>
      <div class="field"><label for="firstDetectionMode">最初のきっかけとして最も近いもの</label><select id="firstDetectionMode" name="first_detection_mode"><option value="">選択してください</option><option value="patient_noticed">本人が症状・体調の変化に気づいた</option><option value="others_noticed">家族・周囲が行動・生活・体調の変化に気づいた</option><option value="injury_accident">転倒・骨折・けが・事故などをきっかけに医療につながった</option><option value="other_symptom_visit">風邪症状など、別の症状・病気で受診したことがきっかけになった</option><option value="ongoing_care">持病の定期通院・別の病気の診療中に見つかった</option><option value="screening">症状はなく、健診・定期検査などで見つかった</option><option value="incidental">別の検査・処置をきっかけに偶然見つかった</option><option value="emergency_first">急変・救急受診／搬送で初めて病気が分かった</option><option value="unknown">分からない・覚えていない</option></select></div>
      <div class="depth-hidden" data-depth-min="normal">
        <div class="grid2"><div class="field"><label for="noticeToCare">最初の症状・変化に気づいてから、最初に医療機関へ相談するまで</label><select id="noticeToCare" name="first_notice_to_first_care"><option value="">選択してください</option><option>すぐ〜1か月未満</option><option>1〜3か月</option><option>3〜6か月</option><option>6か月〜1年</option><option>1〜3年</option><option>3年以上</option><option>症状はなく健診・検査で見つかった</option><option>けが・事故・別の症状で受診したことが入口だった</option><option>急変・救急受診／搬送が最初だった</option><option>医療にはつながっていなかった</option><option>分からない</option></select></div><div class="field"><label for="careToDiagnosis">最初に医療機関へ相談してから、病名・状態が分かるまで</label><select id="careToDiagnosis" name="first_care_to_diagnosis"><option value="">選択してください</option><option>その日〜1か月未満</option><option>1〜3か月</option><option>3〜6か月</option><option>6か月〜1年</option><option>1年以上</option><option>診断前に急変・死亡した／最後まで確定しなかった</option><option>分からない</option></select></div></div>
        <div class="grid2"><div class="field"><label for="firstCareEntry">最初に医療へつながった入口</label><select id="firstCareEntry" name="first_care_entry"><option value="">選択してください</option><option value="self_visit_symptom">本人の症状・体調変化で自分から受診</option><option value="family_prompted">家族・周囲に勧められて受診</option><option value="injury_accident_visit">転倒・骨折・けが・事故で受診</option><option value="other_illness_visit">風邪など別の症状・病気で受診</option><option value="routine_chronic_visit">持病の定期通院中</option><option value="screening_checkup">健診・検診・定期検査</option><option value="emergency_transport">救急受診・救急搬送</option><option value="during_admission_or_facility">入院中・施設利用中に気づかれた</option><option value="other">その他</option><option value="unknown">分からない</option></select></div><div class="field"><label for="diagnosisRoute">その後、病名・状態が分かるまでの経路</label><select id="diagnosisRoute" name="diagnosis_route"><option value="">選択してください</option><option value="same_facility">最初に受診した医療機関で検査・診断</option><option value="clinic_referral_hospital">クリニック等から、より大きな病院・専門医へ紹介</option><option value="screening_referral">健診・検診から精密検査へ</option><option value="emergency_admission_workup">救急受診・搬送から入院し検査</option><option value="found_during_other_care">別の病気・けがの診療中に見つかり検査</option><option value="multiple_visits">何度か受診・複数の医療機関を経て診断</option><option value="not_confirmed">最後まで病名が確定しなかった</option><option value="other">その他</option><option value="unknown">分からない</option></select></div></div>
      </div>
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
      <div class="depth-hidden" data-depth-min="deep"><div class="field"><label>④ 過去の病気・けが・出来事で、今回の治療や療養判断に影響したもの（複数可）</label><div class="options three">${checkChoices('relevant_past_history',[
        ['prior_coronary_event','過去の心筋梗塞・狭心症'],['prior_stroke','過去の脳卒中'],['prior_cancer_treatment','過去のがん治療'],['major_surgery_procedure','大きな手術・処置'],['fracture_fall_decline','骨折・転倒などによる生活機能低下'],['accident_injury','事故・けがの経験'],['mental_health_history','こころ・精神の病気の既往'],['other','その他、判断に影響した既往'],['none','特になし'],['unknown','分からない']],'hx')}</div></div>
        <div class="field"><label>持病があることや、これまでの病気・けが・治療の経験は、その後の選択・判断に影響しましたか？（複数可）</label><div class="options three">${checkChoices('prior_experience_decision_influence',[
          ['start_or_decline_treatment','治療を受ける／受けない'],['continue_reduce_stop_treatment','治療を続ける／減らす／やめる'],['emergency_or_admission','救急搬送・入院をするか'],['high_burden_intervention','手術・人工呼吸・透析・人工栄養など負担の大きい治療'],['care_place','退院先・療養場所・看取り場所'],['care_service_or_facility','介護サービス・施設を利用するか'],['reflect_patient_wishes','本人の希望をどう反映するか'],['avoid_based_on_past','以前の経験から「これはしたくない／してほしくない」と考えた'],['prefer_based_on_past','以前の経験から「これはしたい／してほしい」と考えた'],['no_influence','特に影響しなかった'],['unknown','分からない']],'pi')}</div><p class="help">過去の経験が「次はこうしたい／これは避けたい」という判断につながった場合も含みます。</p></div>
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
    const caseKeys=new Set(['case_id','patient_age_band','patient_sex','patient_status','course_center_condition','wish_expression','patient_values','patient_values_free','prior_wishes_free']);
    const respondentKeys=new Set(['respondent_role','relationship','record_type','professional_experience','answer_source','answer_depth']);
    const medicalContextKeys=new Set(['additional_condition_presence','major_contributing_conditions','comorbid_conditions','diabetes_complications','relevant_past_history','prior_experience_decision_influence','comorbidity_other_text']);
    const courseKeys=new Set(['first_detection_mode','first_change_to_current_or_death','first_notice_to_first_care','first_care_to_diagnosis','first_care_entry','diagnosis_route','care_delay_reasons','diagnosis_delay_reasons','seriousness_recognition_timing','trajectory_pattern','events','unplanned_admissions_6m','emergency_visits_6m','final_month_care_setting','place_of_death','death_expected','last30_treatment']);
    const diseasePrefixes=['dementia_','lung_cancer_','hf_','copd_','kidney_','other_disease_'];
    const carePrefixes=['care_','night_care_','support_services','caregiver_burden_'];
    const costPrefixes=['household_','out_of_pocket_','financial_','cost_','income_','public_support_'];
    const decisionPrefixes=['decision_','patient_wishes_','nutrition_','ventilation_','emergency_choice','treatment_choice','dialysis_choice','place_choice','disclosure_','acp_','other_decision_'];
    const reflectionPrefixes=['overall_acceptance','choose_same_again','what_helped','what_was_hard','values_','own_','message_','expectation_'];
    const crisisPrefixes=['caregiver_self_death_thought','caregiver_joint_death_thought','crisis_'];
    return {
      schema_version:'experience-case-v1.9',
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

  function enhanceExpectationMismatch(){
    const reflection=document.getElementById('reflection');
    if(!reflection||document.getElementById('expectationMismatchFree'))return;
    const normalGrid=reflection.querySelector('.grid2.depth-hidden[data-depth-min="normal"]');
    if(!normalGrid)return;
    const field=document.createElement('div');
    field.className='field depth-hidden';
    field.dataset.depthMin='normal';
    field.innerHTML='<label for="expectationMismatchFree">「思っていたのと違った」と感じたこと（任意）</label><textarea id="expectationMismatchFree" name="expectation_mismatch_free" placeholder="例：眠るように亡くなると聞いていたが、実際はせん妄で落ち着かない時間があり驚いた／余命半年と聞いて生活や仕事を大きく変えたが、その後5年ほど生きた／治療後の生活をもっと楽に想像していた など"></textarea><p class="help">説明や予測の正誤を決めるためではなく、事前に想像・説明されていたことと、実際に経験したことのズレを残す欄です。</p>';
    normalGrid.after(field);
  }

  function enhanceDecisionSources(){
    const decision=document.getElementById('decision');
    if(!decision||document.getElementById('decisionInformationSourcesFree'))return;
    const infoField=decision.querySelector('input[name="decision_information"]')?.closest('.field');
    if(!infoField)return;
    const field=document.createElement('div');
    field.className='field';
    field.innerHTML='<label for="decisionInformationSourcesFree">実際に見た・読んだ情報源（任意）</label><textarea id="decisionInformationSourcesFree" name="decision_information_sources_free" placeholder="例：○○学会の患者向けページ、病院の治療説明ページ、患者会の冊子、YouTubeの体験談、ブログ、本・雑誌、生成AIで調べた内容など。覚えていればサイト名・ページ名・動画名・資料名も書けます。"></textarea><p class="help">URLや個人名は必須ではありません。特定の患者さん・医療者など個人を識別できる情報は書かないでください。</p>';
    infoField.after(field);
  }

  function updateAll(){updateRole();updateDepth();updateConditionPanels();updateState();updateDecision();updateCrisis();updateRecordType();updateSummary();}
  parseHash();ensureCase();addPolicyLinks();enhanceCenterCondition();enhanceValuesAndRespiratoryLabels();enhanceCostSection();addPreDiagnosisJourney();addMedicalHistoryContext();enhanceExpectationMismatch();enhanceDecisionSources();bindEvents();updateAll();
})();