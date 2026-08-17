(function(){
  const raw=sessionStorage.getItem('shinikata_graph_demo_v1');
  let data=null;
  try{data=raw?JSON.parse(raw):null;}catch(e){}
  if(!data||!Array.isArray(data.events)||data.events.length<3){
    document.querySelector('main').innerHTML='<section class="panel"><h2>グラフ用の入力がまだ足りません</h2><p>質問票で重要な出来事を3件以上入力してから、「この入力からグラフを見る」を押してください。</p><p><a href="experience_case.html#course">← 質問票へ戻る</a></p></section>';
    return;
  }

  const style=document.createElement('style');
  style.textContent=`
    .demo-keyfacts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .demo-keyfact{border:1px solid #d7e3eb;background:#fff;border-radius:13px;padding:13px 14px;min-height:105px}
    .demo-keyfact span{display:block;font-size:9px;font-weight:900;color:#748796;margin-bottom:5px}
    .demo-keyfact strong{display:block;font-family:"Yu Mincho","Hiragino Mincho ProN",serif;color:#285d83;font-size:19px;line-height:1.45;margin-bottom:4px}
    .demo-keyfact p{margin:0;font-size:10px;line-height:1.65;color:#637888}
    .demo-keyfact.money strong{color:#765f34}
    .demo-keyfact.emergency strong{color:#8a5c38}
    .demo-medical-text{font-size:8px!important;color:#7d8e9a!important;margin-top:4px!important}
    .btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid #cadce7;border-radius:999px;padding:8px 12px;background:#fff;color:#315f82;font-size:10px;font-weight:900;text-decoration:none}
    .btn.primary{background:#173d68;color:#fff;border-color:#173d68}
    @media(max-width:760px){.demo-keyfacts{grid-template-columns:1fr 1fr}}
    @media(max-width:520px){.demo-keyfacts{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const condition=document.getElementById('conditionPill');
  if(condition)condition.textContent=data.condition||'入力データ';

  const timingRank={
    '5y_plus':0,'3_5y':1,'1_3y':2,'6_12m':3,'1_6m':4,'1m':5,'1w':6,'days':7,'final':8,'unknown':9
  };
  const medicalScore={daily_life:1,outpatient:2,home_support:3,urgent:4,inpatient:4,high_intensity:5,palliative_focus:2,unknown:0,'':0};
  const events=[...data.events].sort((a,b)=>(timingRank[a.timing]??99)-(timingRank[b.timing]??99));
  const n=events.length;
  events.forEach((e,i)=>{e.x=n===1?50:(i/(n-1))*100;e.medicalScore=medicalScore[e.medical]||0;});

  const svg=document.getElementById('demoBurdenChart');
  const indicators=document.getElementById('demoIndicators');
  const W=900,H=330,left=58,right=34,top=24,bottom=108;
  const plotW=W-left-right,plotH=H-top-bottom;
  const ns='http://www.w3.org/2000/svg';
  const y=v=>top+plotH-(v/5)*plotH;
  const x=v=>left+(v/100)*plotW;
  const make=(name,attrs={},text='')=>{const el=document.createElementNS(ns,name);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text)el.textContent=text;return el;};
  const pathFor=key=>events.map((p,i)=>(i?'L':'M')+x(p.x).toFixed(1)+' '+y(p[key]).toFixed(1)).join(' ');

  svg.replaceChildren();
  for(let v=0;v<=5;v++){
    const yy=y(v);
    svg.appendChild(make('line',{x1:left,y1:yy,x2:W-right,y2:yy,class:'burden-grid'}));
    svg.appendChild(make('text',{x:left-14,y:yy+4,'text-anchor':'end',class:'burden-axis-label'},String(v)));
  }
  svg.appendChild(make('text',{x:16,y:top+plotH/2,transform:`rotate(-90 16 ${top+plotH/2})`,'text-anchor':'middle',class:'burden-axis-title'},'負担の大きさ'));
  svg.appendChild(make('text',{x:left+plotW/2,y:H-8,'text-anchor':'middle',class:'burden-axis-title'},'時間 →'));

  events.forEach((p,i)=>{
    const xx=x(p.x);
    svg.appendChild(make('line',{x1:xx,y1:top,x2:xx,y2:top+plotH,class:'burden-event-line'}));
    const labelY=top+plotH+26+(i%2)*27;
    const anchor=i===0?'start':i===events.length-1?'end':'middle';
    const t=make('text',{x:xx,y:labelY,'text-anchor':anchor,class:'burden-event-label'});
    t.append(make('tspan',{x:xx,dy:0},p.timingLabel||''),make('tspan',{x:xx,dy:13},p.label||p.typeLabel||''));
    svg.appendChild(t);
  });

  svg.appendChild(make('path',{d:pathFor('patient'),class:'burden-line patient'}));
  svg.appendChild(make('path',{d:pathFor('supporter'),class:'burden-line family'}));
  events.forEach(p=>{
    [['patient','本人'],['supporter','支える人']].forEach(([key,label])=>{
      const c=make('circle',{cx:x(p.x),cy:y(p[key]),r:5,class:`burden-dot ${key==='patient'?'patient':'family'}`});
      c.appendChild(make('title',{},`${p.timingLabel} ${p.label||p.typeLabel}｜${label}の負担 ${p[key]}/5`));
      svg.appendChild(c);
    });
  });

  const blocks=v=>Array.from({length:5},(_,i)=>`<span class="${i<v?'on':''}"></span>`).join('');
  indicators.innerHTML=events.map(p=>`<div class="burden-indicator"><b>${escapeHtml(p.timingLabel||'')}</b><strong>${escapeHtml(p.label||p.typeLabel||'')}</strong><div><em>判断</em><span class="mini-blocks" aria-label="意思決定の重さ ${p.decision??0}/5">${blocks(p.decision??0)}</span></div><div><em>医療</em><span class="mini-blocks medical" aria-label="医療の密度 ${p.medicalScore}/5">${blocks(p.medicalScore)}</span></div><p class="demo-medical-text">${escapeHtml(p.medicalLabel||'未回答')}</p></div>`).join('');

  const durationParts=[data.illnessDuration?`診断から ${data.illnessDuration}`:'',data.careDuration?`介護開始から ${data.careDuration}`:''].filter(Boolean);
  const financeParts=[data.savings&&data.savings!=='分からない・答えたくない'?`療養開始時の貯蓄 ${data.savings}`:'',data.outOfPocket&&data.outOfPocket!=='分からない・答えたくない'?`自己負担 ${data.outOfPocket}`:''].filter(Boolean);
  const emergencyParts=[data.emergencyCount!==''?`救急搬送・救急受診 ${data.emergencyCount}回`:'',data.cprCount&&data.cprCount!=='分からない・未回答'?`心肺蘇生 ${data.cprCount}`:''].filter(Boolean);
  const impact=impactText(data.outOfPocket,data.incomeLoss);

  document.getElementById('demoKeyfacts').innerHTML=`
    ${card('亡くなった年齢',data.deathAge?`${data.deathAge}歳`:'—',data.ageBand?`年代回答：${data.ageBand}`:'')}
    ${card('診断・介護から亡くなるまで',durationParts[0]||'—',durationParts[1]||'')}
    ${card('退職・仕事を離れた年齢',data.retirementAge?`${data.retirementAge}歳`:'—',data.retirementContext||'')}
    ${card('貯蓄と出費',financeParts[0]||'—',financeParts[1]||'','money')}
    ${card('救急搬送・蘇生',emergencyParts[0]||'—',emergencyParts[1]||'','emergency')}
    ${card('亡くなるまでの家計への影響',impact.main,impact.sub,'money')}
  `;

  function card(label,main,sub,cls=''){
    return `<div class="demo-keyfact ${cls}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(main||'—')}</strong><p>${escapeHtml(sub||'')}</p></div>`;
  }

  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function parseBand(text){
    if(!text||/分からない|不明|該当なし/.test(text))return null;
    const nums=(text.match(/\d+/g)||[]).map(Number);
    if(/未満/.test(text)&&nums.length)return [0,Math.max(0,nums[0]-1)];
    if(/以上/.test(text)&&nums.length)return [nums[0],null];
    if(nums.length>=2)return [nums[0],nums[1]];
    return nums.length?[nums[0],nums[0]]:null;
  }
  function impactText(outOfPocket,incomeLoss){
    const a=parseBand(outOfPocket),b=parseBand(incomeLoss);
    if(!a&&!b)return{main:'—',sub:'自己負担や収入減が入力されると概算できます'};
    if(a&&!b)return{main:outOfPocket||'—',sub:'家計自己負担のみ'};
    if(!a&&b)return{main:incomeLoss||'—',sub:'失った収入のみ'};
    const low=(a[0]||0)+(b[0]||0);
    const open=a[1]===null||b[1]===null;
    const high=open?null:a[1]+b[1];
    return{main:open?`${low}万円以上`:`${low}〜${high}万円`,sub:`自己負担 ${outOfPocket} ＋ 失った収入 ${incomeLoss} の単純合算`};
  }
})();