(function(){
  const burdenStories={
    dementia:{
      note:'認知症ダミーでは、骨折・救急を最初の大きな山、その後の在宅介護を高止まり、肺炎反復〜最終期を二つ目の山として置いた表示検討用スコアです。',
      finance:{
        spending:'100〜299万円',
        incomeLoss:'50〜199万円',
        incomeRatio:'1〜2割程度',
        incomeDuration:'1〜3年・断続的',
        savingsStart:'500〜999万円',
        savingsDrawdown:'300〜499万円',
        savingsDecline:'5〜7割程度'
      },
      points:[
        {x:0,when:'約6年前',label:'物忘れに気づく',patient:1,family:2,decision:1,medical:1},
        {x:18,when:'約5年前',label:'転倒・骨折／救急',patient:5,family:5,decision:3,medical:5,major:true},
        {x:31,when:'その後',label:'リハビリ後、自宅へ',patient:3,family:4,decision:2,medical:3},
        {x:58,when:'2〜3年前から',label:'肺炎・入退院反復',patient:4,family:5,decision:4,medical:4,major:true},
        {x:92,when:'最終数か月',label:'食事・活動量低下',patient:4,family:5,decision:5,medical:3},
        {x:100,when:'最期',label:'自宅で看取り',patient:3,family:5,decision:5,medical:3,major:true}
      ]
    },
    lung:{
      note:'肺がんダミーでは、診断後から短期間に治療・情報探索・仕事・費用の判断が重なり、後半に本人負担と家族負担が急上昇する表示検討用スコアです。',
      finance:{
        spending:'300〜499万円',
        incomeLoss:'300〜499万円',
        incomeRatio:'5〜7割程度',
        incomeDuration:'6か月〜1年',
        savingsStart:'500〜999万円',
        savingsDrawdown:'300〜499万円',
        savingsDecline:'5〜7割程度'
      },
      points:[
        {x:0,when:'約8か月前',label:'クリニック受診',patient:2,family:1,decision:1,medical:2},
        {x:10,when:'数週間後',label:'紹介・精密検査',patient:3,family:4,decision:4,medical:5,major:true},
        {x:28,when:'診断後1〜2か月',label:'治療開始',patient:4,family:4,decision:5,medical:5},
        {x:48,when:'治療中',label:'情報を大量に探す',patient:4,family:5,decision:5,medical:4},
        {x:75,when:'最終2〜3か月',label:'息苦しさ・入退院',patient:5,family:5,decision:5,medical:5,major:true},
        {x:100,when:'最終数週間',label:'苦痛緩和を優先',patient:5,family:5,decision:5,medical:4,major:true}
      ]
    }
  };

  const requested=new URLSearchParams(location.search).get('story')||'dementia';
  const model=burdenStories[requested]||burdenStories.dementia;
  const svg=document.getElementById('burdenChart');
  const indicators=document.getElementById('burdenIndicators');
  const storyNote=document.getElementById('burdenStoryNote');

  function injectFinanceSummary(){
    const cost=document.getElementById('cost');
    const money=cost?.querySelector('.money');
    if(!money||cost.querySelector('[data-household-impact]'))return;
    const f=model.finance;
    const wrap=document.createElement('div');
    wrap.className='household-impact';
    wrap.setAttribute('data-household-impact','');
    wrap.innerHTML=`
      <div class="household-impact-head"><b>家計がどう削られたか</b><span>支出・収入・資産を分けて見る</span></div>
      <div class="household-impact-grid">
        <div class="impact-card"><span class="impact-kicker">① 支出</span><b>家計から出たお金</b><strong>${f.spending}</strong><small>療養期間全体の自己負担</small></div>
        <div class="impact-card"><span class="impact-kicker">② 収入</span><b>仕事から入るお金の減少</b><strong>${f.incomeLoss}</strong><small>元の仕事収入から ${f.incomeRatio} 減<br>影響期間：${f.incomeDuration}</small></div>
        <div class="impact-card"><span class="impact-kicker">③ 資産</span><b>貯蓄の取り崩し</b><strong>${f.savingsDrawdown}</strong><small>療養開始時：${f.savingsStart}<br>開始時から ${f.savingsDecline} 減</small></div>
      </div>
      <p class="household-impact-note">※ すべて架空の表示例です。絶対額だけでなく、元の収入・貯蓄に対してどの程度の打撃だったかを併記する想定です。</p>`;
    money.after(wrap);
  }

  injectFinanceSummary();
  if(!svg||!indicators)return;

  const W=900,H=330;
  const left=58,right=34,top=24,bottom=108;
  const plotW=W-left-right,plotH=H-top-bottom;
  const ns='http://www.w3.org/2000/svg';
  const y=v=>top+plotH-(v/5)*plotH;
  const x=v=>left+(v/100)*plotW;
  const make=(name,attrs={},text='')=>{
    const el=document.createElementNS(ns,name);
    Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
    if(text)el.textContent=text;
    return el;
  };
  const pathFor=key=>model.points.map((p,i)=>(i?'L':'M')+x(p.x).toFixed(1)+' '+y(p[key]).toFixed(1)).join(' ');

  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','横軸が時間、縦軸が負担0から5。本人の負担と家族の負担を示すダミーグラフ');
  svg.replaceChildren();

  for(let v=0;v<=5;v++){
    const yy=y(v);
    svg.appendChild(make('line',{x1:left,y1:yy,x2:W-right,y2:yy,class:'burden-grid'}));
    svg.appendChild(make('text',{x:left-14,y:yy+4,'text-anchor':'end',class:'burden-axis-label'},String(v)));
  }
  svg.appendChild(make('text',{x:16,y:top+plotH/2,transform:`rotate(-90 16 ${top+plotH/2})`,'text-anchor':'middle',class:'burden-axis-title'},'負担の大きさ'));
  svg.appendChild(make('text',{x:left+plotW/2,y:H-8,'text-anchor':'middle',class:'burden-axis-title'},'時間 →'));

  model.points.forEach((p,i)=>{
    const xx=x(p.x);
    svg.appendChild(make('line',{x1:xx,y1:top,x2:xx,y2:top+plotH,class:'burden-event-line'}));
    const labelY=top+plotH+26+(i%2)*27;
    const t=make('text',{x:xx,y:labelY,'text-anchor':i===0?'start':i===model.points.length-1?'end':'middle',class:'burden-event-label'});
    const a=make('tspan',{x:xx,dy:0},p.when);
    const b=make('tspan',{x:xx,dy:13},p.label);
    if(i===0){a.setAttribute('text-anchor','start');b.setAttribute('text-anchor','start');}
    if(i===model.points.length-1){a.setAttribute('text-anchor','end');b.setAttribute('text-anchor','end');}
    t.append(a,b);svg.appendChild(t);
  });

  svg.appendChild(make('path',{d:pathFor('patient'),class:'burden-line patient'}));
  svg.appendChild(make('path',{d:pathFor('family'),class:'burden-line family'}));

  model.points.forEach(p=>{
    [['patient','本人'],['family','家族']].forEach(([key,label])=>{
      const c=make('circle',{cx:x(p.x),cy:y(p[key]),r:p.major?6:5,class:`burden-dot ${key}`});
      c.appendChild(make('title',{},`${p.when} ${p.label}｜${label}の負担 ${p[key]}/5`));
      svg.appendChild(c);
    });
  });

  const blocks=n=>Array.from({length:5},(_,i)=>`<span class="${i<n?'on':''}"></span>`).join('');
  indicators.innerHTML=model.points.map(p=>`<div class="burden-indicator"><b>${p.when}</b><strong>${p.label}</strong><div><em>判断</em><span class="mini-blocks" aria-label="意思決定の重さ ${p.decision}/5">${blocks(p.decision)}</span></div><div><em>医療</em><span class="mini-blocks medical" aria-label="医療の密度 ${p.medical}/5">${blocks(p.medical)}</span></div></div>`).join('');
  if(storyNote)storyNote.textContent=model.note;
})();