(function(){
  function init(){
    const form=document.getElementById('caseForm');
    if(!form||document.getElementById('progressiveFlow'))return;

    const sections={
      setup:document.getElementById('setup'),
      core:document.getElementById('core'),
      course:document.getElementById('course'),
      suffering:document.getElementById('suffering'),
      care:document.getElementById('care'),
      cost:document.getElementById('cost'),
      decision:document.getElementById('decision'),
      reflection:document.getElementById('reflection'),
      complete:document.getElementById('complete')
    };
    if(Object.values(sections).some(x=>!x))return;

    /* The old long questionnaire remains in the DOM as the question bank.
       This layer only changes how much is shown at once. */
    document.getElementById('experienceWizard')?.remove();
    document.querySelector('.form-nav')?.closest('.panel')?.classList.add('progressive-old-nav');

    const depthRadios=[...form.querySelectorAll('input[name="answer_depth"]')];
    const depthField=depthRadios[0]?.closest('.field');
    if(depthField)depthField.classList.add('progressive-depth-hidden');

    const setDepth=(value)=>{
      const radio=form.querySelector(`input[name="answer_depth"][value="${value}"]`);
      if(!radio)return;
      radio.checked=true;
      radio.dispatchEvent(new Event('change',{bubbles:true}));
    };

    /* Move the graph questionnaire out of the core course page. */
    const graphModule=document.getElementById('graphDataModule');
    let graphSection=null;
    if(graphModule){
      graphSection=document.createElement('section');
      graphSection.id='progressiveGraphModule';
      graphSection.className='panel progressive-screen progressive-module-screen';
      graphSection.innerHTML='<div class="section-head"><div><span class="step">任意｜図鑑化</span><h2>この体験を「負担の波」グラフにする</h2><p>まず大きな出来事を3つだけ。3件そろえば、その場でグラフを作れます。もっと詳しく残したい場合だけ4〜6件目を追加できます。</p></div></div><div class="progressive-module-intro"><b>目安 3〜5分</b><span>ここは完全に任意です。基本回答はすでに完成しています。</span></div>';
      sections.complete.before(graphSection);
      graphSection.appendChild(graphModule);
      graphModule.open=true;
    }

    /* Research-only details are useful, but should not block a normal contributor. */
    const researchSection=document.createElement('section');
    researchSection.id='progressiveResearchModule';
    researchSection.className='panel progressive-screen progressive-module-screen';
    researchSection.innerHTML='<div class="section-head"><div><span class="step">任意｜研究用の追加情報</span><h2>さらに細かい背景を残す</h2><p>地域差、診断前の経過、既往歴など、研究や詳細分析に役立つ情報です。分かるところだけで構いません。</p></div></div><div class="progressive-module-intro"><b>目安 5〜10分</b><span>この項目に答えなくても、体験談は完成しています。</span></div><div id="progressiveResearchBody"></div>';
    sections.complete.before(researchSection);
    const researchBody=researchSection.querySelector('#progressiveResearchBody');
    ['openingNarrative','preDiagnosisJourney','medicalHistoryContext','regionContext'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)researchBody.appendChild(el);
    });

    /* Core-complete hub: psychologically, the questionnaire is finished here. */
    const hub=document.createElement('section');
    hub.id='progressiveModuleHub';
    hub.className='panel progressive-screen';
    hub.innerHTML=`
      <div class="progressive-complete-hero">
        <span class="progressive-check">✓</span>
        <div><span class="step">基本回答 完了</span><h2>ここまでで、ひとつの体験記録として完成です。</h2><p>ありがとうございました。ここから先は全部任意です。覚えているテーマだけ追加すると、体験談の比較項目やグラフが少しずつ充実します。</p></div>
      </div>
      <div class="progressive-reward"><b>ここからは「質問に答える」ではなく、「残したいところを足す」</b><span>全部やる必要はありません。1つだけでも、ここで終わっても大丈夫です。</span></div>
      <div class="progressive-module-grid" id="progressiveModuleGrid"></div>
      <div class="progressive-hub-actions"><button type="button" class="progressive-back-core">← 基本回答を見直す</button><button type="button" class="progressive-final">この内容で確認へ →</button></div>`;
    sections.complete.before(hub);

    const coreSteps=[
      {id:'setup',num:'00',title:'まず、誰の体験か',short:'設定',note:'回答者の立場と症例コードだけ。ここから始めます。'},
      {id:'core',num:'01',title:'その人の基本情報',short:'基本',note:'年代、病気、本人が大切にしていたことなど、比較の背骨だけ。'},
      {id:'course',num:'02',title:'何が起き、どう進んだか',short:'経過',note:'細かな出来事は後回し。まず大きな流れだけ。'},
      {id:'suffering',num:'03',title:'どのくらいつらかったか',short:'苦痛',note:'本人の苦痛を、分かる範囲で残します。'},
      {id:'care',num:'04',title:'治療と介護',short:'治療・介護',note:'病気に応じた最低限と、介護の大きさを記録します。'},
      {id:'cost',num:'05',title:'お金の全体像',short:'費用',note:'まずは大まかな金額帯だけで十分です。'},
      {id:'decision',num:'06',title:'何を決め、結局どうしたか',short:'意思決定',note:'最も大きな判断と、最終的な医療・ケアの方向性を残します。'},
      {id:'reflection',num:'07',title:'振り返ってどうだったか',short:'振り返り',note:'最後に納得感と、自分ならどうしたいかを記録します。'}
    ];

    const moduleDefs=[
      {key:'course',title:'経過を詳しく残す',time:'約3〜5分',desc:'診断前、救急・入院、最終期の医療などをもう少し詳しく。'},
      {key:'suffering',title:'苦痛を詳しく残す',time:'約3〜5分',desc:'痛み、息苦しさ、だるさなど、つらさの内訳を追加。'},
      {key:'care',title:'治療・介護を詳しく残す',time:'約3〜5分',desc:'サービス、介護時間、仕事や生活への影響を追加。'},
      {key:'cost',title:'お金を詳しく残す',time:'約3〜5分',desc:'貯蓄、保険、収入減、制度利用などを分かる範囲で追加。'},
      {key:'decision',title:'意思決定を詳しく残す',time:'約3〜5分',desc:'情報源、相談相手、本人の希望、迷いの背景を追加。'},
      ...(graphSection?[{key:'graph',title:'この体験をグラフにする',time:'約3〜5分',desc:'重要な出来事を3つ入れると、その場で「負担の波」を可視化。',featured:true}]:[]),
      {key:'research',title:'研究用の追加情報を残す',time:'約5〜10分',desc:'地域差、診断前の経過、既往歴など。詳しく残せる人向け。'}
    ];

    const style=document.createElement('style');
    style.id='progressiveFlowStyle';
    style.textContent=`
      .progressive-old-nav,.progressive-depth-hidden{display:none!important}
      .progressive-hidden{display:none!important}
      #progressiveFlow{margin:18px 0 20px;border:1px solid #d6e3eb;border-radius:17px;background:#fff;box-shadow:0 8px 28px rgba(34,70,95,.05);overflow:hidden}
      .progressive-top{padding:15px 17px 13px;background:linear-gradient(135deg,#fbfdfe,#f1f7fa)}
      .progressive-meta{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
      .progressive-page{font-size:9px;font-weight:900;letter-spacing:.08em;color:#788e9e}
      .progressive-title{margin:3px 0 3px;font-size:18px;font-weight:900;color:#174b75}
      .progressive-note{margin:0;font-size:10px;line-height:1.7;color:#6a7f8f}
      .progressive-core-pill{border:1px solid #cfe0e9;background:#fff;border-radius:999px;padding:6px 10px;color:#476d86;font-size:9px;font-weight:900;white-space:nowrap}
      .progressive-progress{height:6px;background:#e6eef3;border-radius:999px;overflow:hidden;margin-top:13px}.progressive-progress span{display:block;height:100%;background:#2f78a8;border-radius:999px;transition:width .2s ease}
      .progressive-tabs{display:flex;gap:6px;padding:10px 12px 12px;overflow-x:auto;border-top:1px solid #e3edf2}.progressive-tab{flex:0 0 auto;border:1px solid #d9e4ea;background:#fff;color:#758895;border-radius:999px;padding:7px 10px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}.progressive-tab.is-current{background:#174b75;border-color:#174b75;color:#fff}.progressive-tab.is-done{background:#f6fafc;border-color:#bcd2df;color:#315f80}
      .progressive-actions{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:18px;padding-top:14px;border-top:1px solid #e0e9ee}.progressive-actions>div{display:flex;gap:8px;align-items:center}.progressive-actions button,.progressive-hub-actions button,.progressive-module-done{border-radius:999px;padding:10px 15px;font:inherit;font-size:10px;font-weight:900;cursor:pointer}.progressive-prev,.progressive-back-core{border:1px solid #ccdbe4;background:#fff;color:#567184}.progressive-next,.progressive-final,.progressive-module-done{border:1px solid #174b75;background:#174b75;color:#fff}.progressive-skip{font-size:9px;color:#7c8e9a}
      .progressive-core-banner{margin:0 0 14px;padding:11px 13px;border-radius:12px;background:#f7fafc;border:1px solid #e1eaf0;color:#657c8b;font-size:9.5px;line-height:1.7}.progressive-core-banner b{color:#315f80}
      .progressive-complete-hero{display:flex;gap:14px;align-items:flex-start;padding:4px 0 16px}.progressive-check{display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:50%;background:#edf7f1;border:1px solid #c6dfcf;color:#367553;font-size:20px;font-weight:900}.progressive-complete-hero h2{margin:4px 0 6px;color:#174b75}.progressive-complete-hero p{margin:0;color:#667d8c;line-height:1.8}
      .progressive-reward{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 14px;margin:0 0 14px;border-radius:13px;background:#fff9ed;border:1px solid #ecd8aa;color:#7b6431}.progressive-reward b{font-size:11px}.progressive-reward span{font-size:9.5px}
      .progressive-module-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.progressive-module-card{display:block;width:100%;text-align:left;border:1px solid #d9e5ec;border-radius:14px;background:#fbfdfe;padding:14px;cursor:pointer;color:#315f80}.progressive-module-card:hover{border-color:#9dbdce;background:#f6fafc}.progressive-module-card.is-featured{border-color:#d9c28c;background:#fffaf0}.progressive-module-card strong{display:block;font-size:12px;margin-bottom:4px}.progressive-module-card small{display:inline-block;margin-bottom:6px;border:1px solid #d6e3ea;border-radius:999px;padding:2px 7px;background:#fff;color:#6a8090;font-weight:800}.progressive-module-card p{margin:0;color:#6b7f8d;font-size:9.5px;line-height:1.65}.progressive-module-card.is-done:after{content:'✓ 追加済み';display:inline-block;margin-top:8px;color:#3e7659;font-size:9px;font-weight:900}
      .progressive-hub-actions{display:flex;justify-content:space-between;gap:10px;margin-top:18px;padding-top:14px;border-top:1px solid #e0e9ee}
      .progressive-module-intro{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 12px;margin:0 0 14px;border-radius:12px;background:#f8fbfd;border:1px solid #e0e9ef}.progressive-module-intro b{color:#315f80}.progressive-module-intro span{color:#718592;font-size:9px}
      .progressive-addon-banner{padding:11px 13px;margin-bottom:14px;border-left:3px solid #94b9d0;background:#f6fafc;border-radius:9px;color:#647b8b;font-size:9.5px;line-height:1.7}.progressive-addon-banner b{color:#315f80}
      .progressive-module-footer{display:flex;justify-content:flex-end;margin-top:18px;padding-top:14px;border-top:1px solid #e1e9ee}
      body.progressive-core-mode #costFinancialDetail,body.progressive-core-mode #moneyPrecisionIntro,body.progressive-core-mode .money-refine{display:none!important}
      body.progressive-core-mode #graphDataModule{display:none!important}
      body.progressive-flow-active form#caseForm>section.panel{animation:progressiveFade .14s ease}@keyframes progressiveFade{from{opacity:.35;transform:translateY(3px)}to{opacity:1;transform:none}}
      @media(max-width:720px){.progressive-module-grid{grid-template-columns:1fr}.progressive-title{font-size:16px}.progressive-actions{align-items:flex-end}.progressive-actions>div:last-child{justify-content:flex-end}.progressive-skip{max-width:140px}.progressive-hub-actions{flex-direction:column-reverse}.progressive-hub-actions button{width:100%}}
    `;
    document.head.appendChild(style);
    document.body.classList.add('progressive-flow-active');

    const flow=document.createElement('section');
    flow.id='progressiveFlow';
    flow.innerHTML=`<div class="progressive-top"><div class="progressive-meta"><div><div class="progressive-page" id="progressivePage"></div><div class="progressive-title" id="progressiveTitle"></div><p class="progressive-note" id="progressiveNote"></p></div><span class="progressive-core-pill">まずは5〜10分の基本回答</span></div><div class="progressive-progress"><span id="progressiveBar"></span></div></div><div class="progressive-tabs" id="progressiveTabs"></div>`;
    const oldNavPanel=document.querySelector('.progressive-old-nav');
    if(oldNavPanel)oldNavPanel.after(flow); else form.before(flow);

    const tabs=document.getElementById('progressiveTabs');
    coreSteps.forEach((s,i)=>{
      const button=document.createElement('button');
      button.type='button';button.className='progressive-tab';button.dataset.index=String(i);button.textContent=`${s.num} ${s.short}`;
      button.addEventListener('click',()=>showCore(i,true));
      tabs.appendChild(button);
    });

    const baseScreens=[...Object.values(sections),hub,researchSection,...(graphSection?[graphSection]:[])];
    baseScreens.forEach(el=>el.classList.add('progressive-screen'));

    coreSteps.forEach((s,i)=>{
      const section=sections[s.id];
      if(!section)return;
      if(!section.querySelector(':scope > .progressive-core-banner')){
        const banner=document.createElement('div');banner.className='progressive-core-banner';banner.innerHTML='<b>基本回答</b>｜ここでは比較に必要な最小限だけ。細かい質問は基本回答が完成したあと、好きなテーマだけ追加できます。';
        const head=section.querySelector(':scope > .section-head');
        if(head)head.after(banner); else section.prepend(banner);
      }
      const actions=document.createElement('div');actions.className='progressive-actions';
      const prev=i>0?'<button type="button" class="progressive-prev">← 前へ</button>':'<span></span>';
      const next=i<coreSteps.length-1?'<button type="button" class="progressive-next">次へ →</button>':'<button type="button" class="progressive-next">基本回答を完成する ✓</button>';
      actions.innerHTML=`<div>${prev}</div><div><span class="progressive-skip">分からない項目は空欄のまま進めます</span>${next}</div>`;
      actions.querySelector('.progressive-prev')?.addEventListener('click',()=>showCore(i-1,true));
      actions.querySelector('.progressive-next')?.addEventListener('click',()=>i<coreSteps.length-1?showCore(i+1,true):showHub(true));
      section.appendChild(actions);
    });

    const moduleGrid=hub.querySelector('#progressiveModuleGrid');
    const completedModules=new Set();
    moduleDefs.forEach(m=>{
      const b=document.createElement('button');b.type='button';b.className='progressive-module-card'+(m.featured?' is-featured':'');b.dataset.module=m.key;
      b.innerHTML=`<strong>${m.title}</strong><small>${m.time}</small><p>${m.desc}</p>`;
      b.addEventListener('click',()=>showModule(m.key,true));
      moduleGrid.appendChild(b);
    });
    hub.querySelector('.progressive-back-core').addEventListener('click',()=>showCore(coreSteps.length-1,true));
    hub.querySelector('.progressive-final').addEventListener('click',()=>showFinal(true));

    function ensureModuleFooter(section,key){
      if(!section||section.querySelector(`:scope > .progressive-module-footer[data-module="${key}"]`))return;
      let banner=section.querySelector(':scope > .progressive-addon-banner');
      if(!banner){banner=document.createElement('div');banner.className='progressive-addon-banner';banner.innerHTML='<b>任意の追加モジュールです。</b> 基本回答はすでに完成しています。覚えているところだけ追加して、いつでも戻れます。';const head=section.querySelector(':scope > .section-head');if(head)head.after(banner);else section.prepend(banner);}
      const footer=document.createElement('div');footer.className='progressive-module-footer';footer.dataset.module=key;footer.innerHTML='<button type="button" class="progressive-module-done">この追加を終える ✓</button>';
      footer.querySelector('button').addEventListener('click',()=>{completedModules.add(key);refreshModuleCards();showHub(true);});
      section.appendChild(footer);
    }
    ['course','suffering','care','cost','decision'].forEach(key=>ensureModuleFooter(sections[key],key));
    if(graphSection)ensureModuleFooter(graphSection,'graph');
    ensureModuleFooter(researchSection,'research');

    const pageEl=document.getElementById('progressivePage');
    const titleEl=document.getElementById('progressiveTitle');
    const noteEl=document.getElementById('progressiveNote');
    const bar=document.getElementById('progressiveBar');
    let coreIndex=0;

    function hideAll(){baseScreens.forEach(el=>el.classList.add('progressive-hidden'));}
    function scrollFlow(){const y=flow.getBoundingClientRect().top+window.scrollY-78;window.scrollTo({top:Math.max(0,y),behavior:'smooth'});}
    function refreshTabs(){[...tabs.children].forEach((b,i)=>{b.classList.toggle('is-current',i===coreIndex);b.classList.toggle('is-done',i<coreIndex);});}
    function refreshModuleCards(){moduleGrid.querySelectorAll('[data-module]').forEach(b=>b.classList.toggle('is-done',completedModules.has(b.dataset.module)));}

    function showCore(index,scroll){
      coreIndex=Math.max(0,Math.min(coreSteps.length-1,index));
      setDepth('easy');
      document.body.classList.add('progressive-core-mode');document.body.classList.remove('progressive-addon-mode');
      hideAll();
      const step=coreSteps[coreIndex];sections[step.id].classList.remove('progressive-hidden');
      flow.classList.remove('progressive-hidden');
      pageEl.textContent=`${coreIndex+1} / ${coreSteps.length}｜基本回答`;
      titleEl.textContent=`${step.num}｜${step.title}`;noteEl.textContent=step.note;
      bar.style.width=`${((coreIndex+1)/coreSteps.length)*100}%`;
      refreshTabs();if(scroll)scrollFlow();
    }

    function showHub(scroll){
      setDepth('easy');document.body.classList.add('progressive-core-mode');document.body.classList.remove('progressive-addon-mode');
      hideAll();hub.classList.remove('progressive-hidden');flow.classList.add('progressive-hidden');refreshModuleCards();if(scroll)scrollFlow();
    }

    function showModule(key,scroll){
      setDepth('deep');document.body.classList.remove('progressive-core-mode');document.body.classList.add('progressive-addon-mode');
      hideAll();flow.classList.add('progressive-hidden');
      let target=null;
      if(['course','suffering','care','cost','decision'].includes(key))target=sections[key];
      else if(key==='graph')target=graphSection;
      else if(key==='research')target=researchSection;
      if(!target){showHub(scroll);return;}
      target.classList.remove('progressive-hidden');
      target.querySelector('.progressive-core-banner')?.classList.add('progressive-hidden');
      if(scroll)scrollFlow();
    }

    function showFinal(scroll){
      /* Deep mode at final keeps completed optional answers available to the existing preview code. */
      setDepth('deep');document.body.classList.remove('progressive-core-mode');document.body.classList.remove('progressive-addon-mode');
      hideAll();flow.classList.add('progressive-hidden');sections.complete.classList.remove('progressive-hidden');
      const summaryDepth=document.getElementById('summaryDepth');if(summaryDepth)summaryDepth.textContent=completedModules.size?`基本＋追加 ${completedModules.size}テーマ`:'基本回答';
      if(scroll)scrollFlow();
    }

    /* Old hash navigation still works, but routes through the new flow. */
    document.querySelectorAll('.form-nav a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
      const id=(a.getAttribute('href')||'').slice(1);const idx=coreSteps.findIndex(s=>s.id===id);if(idx>=0){e.preventDefault();showCore(idx,true);}
    }));

    showCore(0,false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();