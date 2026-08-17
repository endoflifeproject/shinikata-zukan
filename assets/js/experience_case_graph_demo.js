(function(){
  const form=document.getElementById('caseForm');
  const module=document.getElementById('graphDataModule');
  if(!form||!module||document.getElementById('graphDemoActions'))return;

  const style=document.createElement('style');
  style.textContent=`
    #graphDemoActions{margin-top:14px;padding:14px;border:1px solid #c9dce8;background:linear-gradient(135deg,#f8fbfd,#eef6fb);border-radius:13px}
    #graphDemoActions b{display:block;color:#315f80;font-size:12px;margin-bottom:3px}
    #graphDemoActions p{margin:0 0 10px;font-size:9.5px;line-height:1.75;color:#6b7f8e}
    #graphDemoButton{border:0;border-radius:999px;background:#173d68;color:#fff;padding:10px 16px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}
    #graphDemoButton:disabled{background:#aebbc4;cursor:not-allowed}
    #graphDemoStatus{margin-left:9px;font-size:9px;color:#718493}
  `;
  document.head.appendChild(style);

  const actions=document.createElement('div');
  actions.id='graphDemoActions';
  actions.innerHTML=`<b>プレゼン用｜この入力から実際のグラフを作る</b><p>重要な出来事を3件以上入力すると、このブラウザ内だけで「負担の波」と6つの数字を生成できます。入力内容はこの操作ではサーバーへ送信しません。</p><button type="button" id="graphDemoButton" disabled>この入力からグラフを見る →</button><span id="graphDemoStatus">あと3件</span>`;
  const body=module.querySelector('.graph-extra-body')||module;
  body.appendChild(actions);

  const button=document.getElementById('graphDemoButton');
  const status=document.getElementById('graphDemoStatus');

  const value=name=>form.elements[name]?.value||'';
  const textOf=name=>{
    const el=form.elements[name];
    if(!el)return '';
    if(el.tagName==='SELECT')return el.options[el.selectedIndex]?.text||el.value||'';
    return el.value||'';
  };

  function collectEvents(){
    return [...form.querySelectorAll('[data-graph-event]')].map(card=>{
      const n=card.dataset.graphEvent;
      const timing=value(`graph_event_timing_${n}`);
      const type=value(`graph_event_type_${n}`);
      const patient=value(`graph_patient_burden_${n}`);
      const supporter=value(`graph_supporter_burden_${n}`);
      if(!timing||!type||patient===''||supporter==='')return null;
      return {
        timing,
        timingLabel:textOf(`graph_event_timing_${n}`),
        type,
        typeLabel:textOf(`graph_event_type_${n}`),
        label:value(`graph_event_label_${n}`),
        patient:Number(patient),
        supporter:Number(supporter),
        decision:value(`graph_decision_weight_${n}`)===''?null:Number(value(`graph_decision_weight_${n}`)),
        medical:value(`graph_medical_context_${n}`),
        medicalLabel:textOf(`graph_medical_context_${n}`)
      };
    }).filter(Boolean);
  }

  function update(){
    const n=collectEvents().length;
    button.disabled=n<3;
    status.textContent=n>=3?`${n}件｜生成できます`:`あと${3-n}件`;
  }

  function collectPayload(){
    return {
      version:'graph-demo-v1',
      createdAt:new Date().toISOString(),
      caseId:value('case_id'),
      condition:textOf('course_center_condition')||textOf('primary_disease')||'',
      ageBand:textOf('patient_age_band'),
      deathAge:value('death_age_exact'),
      illnessDuration:textOf('illness_duration'),
      careDuration:textOf('care_duration_to_end'),
      retirementAge:value('patient_retirement_age_exact'),
      retirementContext:textOf('patient_retirement_context'),
      savings:textOf('household_savings_start'),
      outOfPocket:textOf('out_of_pocket_total'),
      incomeLoss:textOf('income_loss_band'),
      emergencyCount:value('emergency_visits_lifetime_count'),
      cprCount:textOf('cpr_lifetime_count'),
      events:collectEvents()
    };
  }

  form.addEventListener('input',update);
  form.addEventListener('change',update);
  button.addEventListener('click',()=>{
    const payload=collectPayload();
    if(payload.events.length<3)return;
    try{
      sessionStorage.setItem('shinikata_graph_demo_v1',JSON.stringify(payload));
      location.href='experience_graph_demo.html';
    }catch(e){
      alert('プレビュー用データを保存できませんでした。ブラウザ設定をご確認ください。');
    }
  });
  update();
})();