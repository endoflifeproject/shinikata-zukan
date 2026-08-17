(function(){
  function init(){
    const form=document.getElementById('caseForm');
    if(!form||document.getElementById('experienceWizard'))return;

    const graphModule=document.getElementById('graphDataModule');
    let bonusGraph=null;
    if(graphModule){
      bonusGraph=document.createElement('section');
      bonusGraph.id='bonusGraph';
      bonusGraph.className='panel';
      bonusGraph.innerHTML='<div class="section-head"><div><span class="step">08｜任意ボーナス</span><h2>グラフまで残したい人だけ、もう少し詳しく</h2><p>ここは全員に必要な質問ではありません。重要な出来事を3件以上残すと、本人と支える人の「負担の波」をその場で可視化できます。</p></div></div>';
      graphModule.parentNode.insertBefore(bonusGraph,graphModule);
      bonusGraph.appendChild(graphModule);
      const complete=document.getElementById('complete');
      if(complete&&bonusGraph.nextElementSibling!==complete)complete.before(bonusGraph);
      graphModule.open=true;
    }

    const stepDefs=[
      {id:'setup',num:'00',title:'回答の設定',short:'設定',layer:'CORE',note:'まず誰の視点か、回答の深さを決めます。'},
      {id:'core',num:'01',title:'基本情報',short:'基本',layer:'CORE',note:'比較に必要な、その人の基本情報と病気の背景です。'},
      {id:'course',num:'02',title:'経過',short:'経過',layer:'CORE＋条件',note:'何が起きて、どう進んだかを記録します。'},
      {id:'suffering',num:'03',title:'苦痛',short:'苦痛',layer:'CORE＋条件',note:'本人のつらさを、分かる範囲で記録します。'},
      {id:'care',num:'04',title:'治療・介護',short:'治療・介護',layer:'条件で追加',note:'病気や介護状況に応じて必要な質問だけ表示します。'},
      {id:'cost',num:'05',title:'費用・貯蓄',short:'費用',layer:'CORE＋ボーナス',note:'大まかな金額帯だけでも大丈夫です。'},
      {id:'decision',num:'06',title:'意思決定',short:'意思決定',layer:'CORE＋条件',note:'何を決め、何を根拠に、最終的にどうしたかを残します。'},
      {id:'reflection',num:'07',title:'振り返り',short:'振り返り',layer:'CORE＋ボーナス',note:'最後に、その経験をどう振り返るかを記録します。'},
      ...(bonusGraph?[{id:'bonusGraph',num:'08',title:'グラフ用追加',short:'グラフ',layer:'任意ボーナス',note:'ここはスキップOK。詳しい人だけ追加できます。'}]:[]),
      {id:'complete',num:bonusGraph?'09':'08',title:'確認',short:'確認',layer:'確認',note:'入力内容のデータ構造を確認します。'}
    ].filter(s=>document.getElementById(s.id));

    const css=document.createElement('style');
    css.id='experienceWizardStyle';
    css.textContent=`
      .wizard-step-hidden{display:none!important}
      #experienceWizard{margin:18px 0 20px;border:1px solid #d6e3eb;border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(34,70,95,.05);overflow:hidden}
      .wizard-top{padding:14px 16px 12px;background:linear-gradient(135deg,#fbfdfe,#f2f7fa)}
      .wizard-meta{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
      .wizard-kicker{font-size:9px;font-weight:900;letter-spacing:.08em;color:#71889a;text-transform:uppercase}
      .wizard-title{margin:3px 0 2px;color:#174b75;font-size:18px;font-weight:900}
      .wizard-note{margin:0;color:#6c7e8c;font-size:10px;line-height:1.7}
      .wizard-layer{display:inline-flex;align-items:center;border:1px solid #d8e5ec;border-radius:999px;padding:6px 10px;background:#fff;color:#4f6f86;font-size:9px;font-weight:900;white-space:nowrap}
      .wizard-progress{height:5px;background:#e8f0f4;border-radius:999px;overflow:hidden;margin-top:12px}
      .wizard-progress>span{display:block;height:100%;background:#2f78a8;border-radius:999px;transition:width .2s ease}
      .wizard-steps{display:flex;gap:6px;padding:10px 12px 12px;overflow-x:auto;border-top:1px solid #e4edf2;background:#fff}
      .wizard-step-btn{flex:0 0 auto;border:1px solid #d9e4ea;background:#fff;color:#748796;border-radius:999px;padding:7px 10px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}
      .wizard-step-btn.is-current{background:#174b75;border-color:#174b75;color:#fff}
      .wizard-step-btn.is-done{border-color:#b8cfdd;color:#315f80;background:#f6fafc}
      .wizard-page-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:18px;padding-top:14px;border-top:1px solid #e0e9ee}
      .wizard-page-actions .wizard-side{display:flex;gap:8px;align-items:center}
      .wizard-page-actions button{border-radius:999px;padding:9px 14px;font:inherit;font-size:10px;font-weight:900;cursor:pointer}
      .wizard-prev{border:1px solid #cfdce4;background:#fff;color:#557082}
      .wizard-next{border:1px solid #174b75;background:#174b75;color:#fff}
      .wizard-skip{font-size:9px;color:#7b8d99}
      .wizard-layer-guide{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 16px;padding:10px 12px;border-radius:12px;background:#f7fafc;border:1px solid #e2ebf0;color:#687c8b;font-size:9px;line-height:1.6}
      .wizard-layer-guide b{color:#315f80}
      .wizard-layer-guide span{display:inline-flex;align-items:center;gap:4px}
      .wizard-layer-guide i{font-style:normal;border:1px solid #d4e1e8;background:#fff;border-radius:999px;padding:2px 7px;font-weight:900;color:#456a83}
      body.wizard-active form#caseForm>section.panel{animation:wizardFade .16s ease}
      @keyframes wizardFade{from{opacity:.35;transform:translateY(3px)}to{opacity:1;transform:none}}
      body.wizard-active .form-nav{display:none}
      #bonusGraph #graphDataModule{margin-top:0}
      #bonusGraph #graphDataModule>summary{display:none}
      #bonusGraph #graphDataModule>.graph-extra-body{border:0;border-radius:0;padding:0;background:transparent}
      @media(max-width:720px){
        #experienceWizard{margin-top:12px}.wizard-title{font-size:16px}.wizard-page-actions{align-items:flex-end}.wizard-page-actions button{padding:9px 12px}.wizard-skip{display:block;max-width:150px}
      }
    `;
    document.head.appendChild(css);
    document.body.classList.add('wizard-active');

    const oldNav=document.querySelector('.form-nav')?.closest('.panel');
    const wizard=document.createElement('section');
    wizard.id='experienceWizard';
    wizard.innerHTML=`
      <div class="wizard-top">
        <div class="wizard-meta">
          <div><div class="wizard-kicker" id="wizardKicker"></div><div class="wizard-title" id="wizardTitle"></div><p class="wizard-note" id="wizardNote"></p></div>
          <span class="wizard-layer" id="wizardLayer"></span>
        </div>
        <div class="wizard-progress" aria-label="回答の進み具合"><span id="wizardProgressBar"></span></div>
      </div>
      <div class="wizard-steps" id="wizardSteps" aria-label="質問ページ"></div>`;
    if(oldNav)oldNav.after(wizard); else form.before(wizard);

    const stepsHost=document.getElementById('wizardSteps');
    stepDefs.forEach((s,i)=>{
      const b=document.createElement('button');
      b.type='button';b.className='wizard-step-btn';b.dataset.index=String(i);b.textContent=`${s.num} ${s.short}`;
      b.addEventListener('click',()=>showStep(i,true));
      stepsHost.appendChild(b);
    });

    function addGuide(section){
      if(!section||section.querySelector(':scope > .wizard-layer-guide'))return;
      const head=section.querySelector(':scope > .section-head');
      if(!head)return;
      const guide=document.createElement('div');
      guide.className='wizard-layer-guide';
      guide.innerHTML='<span><i>CORE</i><b>比較に必要な基本項目</b></span><span><i>条件</i>病気・立場・回答内容によって追加</span><span><i>ボーナス</i>詳しく残したい人だけ。飛ばしてOK</span>';
      head.after(guide);
    }
    stepDefs.forEach(s=>addGuide(document.getElementById(s.id)));

    stepDefs.forEach((s,i)=>{
      const section=document.getElementById(s.id);
      if(!section||section.querySelector(':scope > .wizard-page-actions'))return;
      const actions=document.createElement('div');
      actions.className='wizard-page-actions';
      const prev=i>0?'<button type="button" class="wizard-prev">← 前へ</button>':'<span></span>';
      const next=i<stepDefs.length-1?'<button type="button" class="wizard-next">次へ →</button>':'<span></span>';
      const skip=(s.layer.includes('ボーナス')||s.layer.includes('条件'))?'<span class="wizard-skip">分からない項目は空欄のまま進めます</span>':'<span class="wizard-skip">入力は後から戻って直せます</span>';
      actions.innerHTML=`<div class="wizard-side">${prev}</div><div class="wizard-side">${skip}${next}</div>`;
      actions.querySelector('.wizard-prev')?.addEventListener('click',()=>showStep(i-1,true));
      actions.querySelector('.wizard-next')?.addEventListener('click',()=>showStep(i+1,true));
      section.appendChild(actions);
    });

    let current=0;
    const kicker=document.getElementById('wizardKicker');
    const title=document.getElementById('wizardTitle');
    const note=document.getElementById('wizardNote');
    const layer=document.getElementById('wizardLayer');
    const bar=document.getElementById('wizardProgressBar');

    function visibleStepIndex(index){
      const max=stepDefs.length-1;
      return Math.max(0,Math.min(max,index));
    }
    function showStep(index,scroll){
      current=visibleStepIndex(index);
      stepDefs.forEach((s,i)=>{
        const el=document.getElementById(s.id);
        if(el)el.classList.toggle('wizard-step-hidden',i!==current);
      });
      const s=stepDefs[current];
      kicker.textContent=`${current+1} / ${stepDefs.length} ページ`;
      title.textContent=`${s.num}｜${s.title}`;
      note.textContent=s.note;
      layer.textContent=s.layer;
      bar.style.width=`${((current+1)/stepDefs.length)*100}%`;
      [...stepsHost.children].forEach((b,i)=>{
        b.classList.toggle('is-current',i===current);
        b.classList.toggle('is-done',i<current);
        b.setAttribute('aria-current',i===current?'step':'false');
      });
      if(scroll){
        const y=wizard.getBoundingClientRect().top+window.scrollY-84;
        window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
      }
    }

    document.querySelectorAll('.form-nav a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{
        const id=(a.getAttribute('href')||'').replace('#','');
        const idx=stepDefs.findIndex(s=>s.id===id);
        if(idx>=0){e.preventDefault();showStep(idx,true);}
      });
    });

    showStep(0,false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();