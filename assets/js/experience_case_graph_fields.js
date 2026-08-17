(function(){
  const form=document.getElementById('caseForm');
  const course=document.getElementById('course');
  if(!form||!course||document.getElementById('graphDataModule'))return;

  const style=document.createElement('style');
  style.textContent=`
    #graphDataModule{margin-top:18px}
    #graphDataModule summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;border:1px solid #d6e3eb;border-radius:14px;background:#f8fbfd;color:#315f80;font-weight:900}
    #graphDataModule summary::-webkit-details-marker{display:none}
    #graphDataModule summary:after{content:'＋';font-size:18px;color:#7894a8}
    #graphDataModule[open] summary:after{content:'−'}
    .graph-extra-body{border:1px solid #d6e3eb;border-top:0;border-radius:0 0 14px 14px;padding:16px;background:#fff}
    .graph-extra-note{font-size:10px;line-height:1.8;color:#687d8c;margin:0 0 14px}
    .graph-readiness{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 12px;margin:12px 0;border-radius:11px;background:#f4f8fb;border:1px solid #dce7ed}
    .graph-readiness b{font-size:10px;color:#3d637d}.graph-readiness span{font-size:9px;color:#6f8190}
    .graph-event-list{display:grid;gap:10px}
    .graph-event-card{border:1px solid #dce6ec;border-radius:13px;padding:13px;background:#fbfdfe}
    .graph-event-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
    .graph-event-head b{font-size:11px;color:#3a627f}.graph-event-head button{border:1px solid #d8e2e8;background:#fff;border-radius:999px;padding:5px 9px;font-size:9px;cursor:pointer;color:#6a7c89}
    .graph-score-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .graph-event-card .field{margin-bottom:8px}
    .graph-event-card .field:last-child{margin-bottom:0}
    .graph-add-row{display:flex;justify-content:flex-end;margin-top:10px}
    .graph-add-row button{border:1px solid #c9dbe7;background:#f8fbfd;color:#315f80;border-radius:999px;padding:7px 12px;font-weight:800;cursor:pointer}
    .graph-keyfact-note{border-left:3px solid #9bb8ce;background:#f8fbfd;border-radius:8px;padding:10px 12px;margin-top:12px;font-size:9.5px;line-height:1.8;color:#667c8b}
    @media(max-width:720px){.graph-score-grid{grid-template-columns:1fr}.graph-event-head{align-items:flex-start}}
  `;
  document.head.appendChild(style);

  const timingOptions=[
    ['','選択してください'],['5y_plus','死亡／現在の5年以上前'],['3_5y','3〜5年前'],['1_3y','1〜3年前'],['6_12m','6か月〜1年前'],['1_6m','1〜6か月前'],['1m','1か月前ごろ'],['1w','1週間前ごろ'],['days','数日前〜当日'],['final','最期・現在'],['unknown','分からない']
  ];
  const eventOptions=[
    ['','選択してください'],['symptom_change','症状・体力が大きく変わった'],['diagnosis','診断・病状説明'],['fall_fracture','転倒・骨折'],['emergency','救急搬送・救急受診'],['hospitalization','入院・再入院'],['surgery','手術・大きな処置'],['treatment_start','治療開始'],['treatment_change','治療変更・中止'],['rehabilitation','リハビリ'],['home_care','在宅療養・訪問診療'],['facility','施設での療養'],['palliative','緩和ケア開始・強化'],['eating_decline','食事・嚥下・活動量の低下'],['infection','肺炎・感染症・発熱'],['decision','大きな意思決定'],['other','その他']
  ];
  const medicalOptions=[
    ['','選択してください'],['daily_life','医療介入は少なく、日常生活中心'],['outpatient','定期通院・通常の外来'],['home_support','訪問診療・訪問看護・在宅ケア'],['urgent','臨時受診・救急外来・救急搬送'],['inpatient','一般病棟への入院・処置'],['high_intensity','ICU・人工呼吸・大きな手術など'],['palliative_focus','緩和ケア・看取り中心'],['unknown','分からない']
  ];
  const scoreOptions=[['','未回答'],['0','0｜ほぼなし'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5｜非常に大きい']];
  const optionHtml=arr=>arr.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');

  const details=document.createElement('details');
  details.id='graphDataModule';
  details.innerHTML=`
    <summary><span>任意｜この体験を「負担の波」グラフと6つの数字にするための追加項目</span><small>詳しく残したい人向け</small></summary>
    <div class="graph-extra-body">
      <p class="graph-extra-note">ここは任意です。正確な日付や施設名は不要です。重要だった出来事を最大6件まで、時期と負担の大きさで残すと、将来「本人の負担」「支える人の負担」の推移を回答データから直接グラフ化できます。公開時は再特定リスクに応じて年齢・金額・回数を丸めます。</p>

      <div class="subpanel">
        <h3>6つの数字を補う情報</h3>
        <p class="intro">診断から死亡までの期間、貯蓄、自己負担などは既存の質問を使います。ここでは現在不足している項目だけ追加します。</p>
        <div class="grid2">
          <div class="field"><label for="deathAgeExact">亡くなった年齢（任意）</label><input id="deathAgeExact" name="death_age_exact" type="number" min="0" max="120" inputmode="numeric" placeholder="例：87"><p class="help">存命の場合は空欄で構いません。公開時は「80代後半」などに丸める場合があります。</p></div>
          <div class="field"><label for="careDurationToEnd">介護・継続的な支援が始まってから死亡／現在まで</label><select id="careDurationToEnd" name="care_duration_to_end"><option value="">分からない・未回答</option><option value="under_1m">1か月未満</option><option value="1_6m">1〜6か月</option><option value="6_12m">6か月〜1年</option><option value="1_3y">1〜3年</option><option value="3_5y">3〜5年</option><option value="5_10y">5〜10年</option><option value="10y_plus">10年以上</option><option value="not_applicable">継続的な介護・支援はなかった</option></select></div>
          <div class="field"><label for="retirementAgeExact">本人が退職・実質的に仕事を離れた年齢（任意）</label><input id="retirementAgeExact" name="patient_retirement_age_exact" type="number" min="10" max="100" inputmode="numeric" placeholder="例：65"><p class="help">病気より前に退職していた場合も、その年齢が分かれば入力できます。</p></div>
          <div class="field"><label for="retirementContext">仕事についての補足</label><select id="retirementContext" name="patient_retirement_context"><option value="">分からない・未回答</option><option value="illness_related">病気・療養をきっかけに退職／休業</option><option value="before_illness">病気・療養より前に退職済み</option><option value="continued">死亡／現在まで仕事を続けた</option><option value="not_working">もともと就労していなかった</option><option value="other">その他</option></select></div>
          <div class="field"><label for="emergencyLifetime">療養期間全体の救急搬送・救急受診回数（分かる範囲）</label><input id="emergencyLifetime" name="emergency_visits_lifetime_count" type="number" min="0" max="99" inputmode="numeric" placeholder="例：4"><p class="help">直近6か月だけではなく、今回の療養期間全体のおおよその回数です。</p></div>
          <div class="field"><label for="cprLifetime">心肺蘇生を受けた回数（分かる範囲）</label><select id="cprLifetime" name="cpr_lifetime_count"><option value="">分からない・未回答</option><option value="0">0回</option><option value="1">1回</option><option value="2">2回</option><option value="3_plus">3回以上</option></select></div>
        </div>
        <div class="graph-keyfact-note">既存の「診断・発症から現在／死亡まで」「療養開始時の世帯貯蓄」「家計自己負担」「失った収入」と組み合わせて、個別体験談の6カードを作る想定です。</div>
      </div>

      <div class="subpanel" style="margin-top:12px">
        <h3>負担の波を作る重要な出来事</h3>
        <p class="intro">全部を記録する必要はありません。「ここで生活が変わった」「ここが一番きつかった」と思う節目だけで十分です。3件以上そろうと折れ線グラフにしやすくなります。</p>
        <input type="hidden" name="graph_data_version" value="v1">
        <input type="hidden" id="graphPointCount" name="graph_point_count" value="0">
        <input type="hidden" id="graphLineReady" name="graph_line_ready" value="false">
        <input type="hidden" id="graphFullReady" name="graph_full_ready" value="false">
        <div class="graph-readiness"><b id="graphReadinessTitle">グラフ用データ 0件</b><span id="graphReadinessText">重要な出来事を3件入力すると、負担の推移を描ける情報量になります。</span></div>
        <div class="graph-event-list" id="graphEventList"></div>
        <div class="graph-add-row"><button type="button" id="addGraphEvent">＋ 出来事を追加</button></div>
      </div>
    </div>`;
  course.appendChild(details);

  const list=document.getElementById('graphEventList');
  const addBtn=document.getElementById('addGraphEvent');
  const pointCount=document.getElementById('graphPointCount');
  const lineReady=document.getElementById('graphLineReady');
  const fullReady=document.getElementById('graphFullReady');
  const readinessTitle=document.getElementById('graphReadinessTitle');
  const readinessText=document.getElementById('graphReadinessText');
  let count=0;

  function addEvent(){
    if(count>=6)return;
    count+=1;
    const n=count;
    const card=document.createElement('div');
    card.className='graph-event-card';
    card.dataset.graphEvent=String(n);
    card.innerHTML=`
      <div class="graph-event-head"><b>重要な出来事 ${n}</b>${n>3?'<button type="button" class="remove-graph-event">この出来事を外す</button>':''}</div>
      <div class="grid2">
        <div class="field"><label for="graphTiming${n}">いつ頃？</label><select id="graphTiming${n}" name="graph_event_timing_${n}">${optionHtml(timingOptions)}</select></div>
        <div class="field"><label for="graphType${n}">何が起きた？</label><select id="graphType${n}" name="graph_event_type_${n}">${optionHtml(eventOptions)}</select></div>
      </div>
      <div class="field"><label for="graphLabel${n}">短い補足（任意）</label><input id="graphLabel${n}" name="graph_event_label_${n}" type="text" maxlength="60" placeholder="例：転倒して大腿骨骨折、退院して在宅へ など"></div>
      <div class="graph-score-grid">
        <div class="field"><label for="graphPatient${n}">その頃の本人の負担</label><select id="graphPatient${n}" name="graph_patient_burden_${n}">${optionHtml(scoreOptions)}</select></div>
        <div class="field"><label for="graphSupporter${n}">その頃の支える人の負担</label><select id="graphSupporter${n}" name="graph_supporter_burden_${n}">${optionHtml(scoreOptions)}</select></div>
        <div class="field"><label for="graphDecision${n}">意思決定の重さ</label><select id="graphDecision${n}" name="graph_decision_weight_${n}">${optionHtml(scoreOptions)}</select></div>
      </div>
      <div class="field"><label for="graphMedical${n}">その頃の主な医療・ケアの状況</label><select id="graphMedical${n}" name="graph_medical_context_${n}">${optionHtml(medicalOptions)}</select><p class="help">「医療の密度」を点数で自己評価してもらうのではなく、この事実カテゴリからサイト側で表示用指標を作る想定です。</p></div>`;
    list.appendChild(card);
    card.addEventListener('input',updateReadiness);
    card.querySelector('.remove-graph-event')?.addEventListener('click',()=>{
      card.querySelectorAll('input,select').forEach(el=>{if(el.tagName==='SELECT')el.value='';else el.value='';});
      card.style.display='none';
      updateReadiness();
    });
    addBtn.disabled=count>=6;
    if(count>=6)addBtn.textContent='最大6件まで入力できます';
    updateReadiness();
  }

  function rowComplete(card,full){
    if(card.style.display==='none')return false;
    const n=card.dataset.graphEvent;
    const timing=form.elements[`graph_event_timing_${n}`]?.value;
    const type=form.elements[`graph_event_type_${n}`]?.value;
    const patient=form.elements[`graph_patient_burden_${n}`]?.value;
    const supporter=form.elements[`graph_supporter_burden_${n}`]?.value;
    if(!timing||!type||patient===''||supporter==='')return false;
    if(!full)return true;
    const decision=form.elements[`graph_decision_weight_${n}`]?.value;
    const medical=form.elements[`graph_medical_context_${n}`]?.value;
    return decision!==''&&!!medical;
  }

  function updateReadiness(){
    const cards=[...list.querySelectorAll('.graph-event-card')];
    const basic=cards.filter(c=>rowComplete(c,false)).length;
    const full=cards.filter(c=>rowComplete(c,true)).length;
    pointCount.value=String(basic);
    lineReady.value=basic>=3?'true':'false';
    fullReady.value=full>=3?'true':'false';
    readinessTitle.textContent=`グラフ用データ ${basic}件`;
    if(basic<3){
      readinessText.textContent=`あと${3-basic}件そろうと、本人・支える人の負担の推移を描ける情報量になります。`;
    }else if(full<3){
      readinessText.textContent='負担の折れ線グラフは作成可能。意思決定の重さと医療・ケア状況も3件以上埋まると補助指標まで表示できます。';
    }else{
      readinessText.textContent='負担の折れ線＋意思決定の重さ＋医療・ケアの補助表示まで作れる情報量です。';
    }
  }

  addBtn.addEventListener('click',addEvent);
  addEvent();addEvent();addEvent();
  updateReadiness();
})();