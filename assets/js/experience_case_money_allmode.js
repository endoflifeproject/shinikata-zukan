(function(){
  function init(){
    const form=document.getElementById('caseForm');
    if(!form||document.documentElement.dataset.moneyAllModeReady)return;
    document.documentElement.dataset.moneyAllModeReady='1';

    const style=document.createElement('style');
    style.id='moneyAllModeStyle';
    style.textContent=`
      .money-original-select{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
      .money-replaced-refine{display:none!important}
      .money-stepper{display:grid;grid-template-columns:auto minmax(120px,1fr) auto auto;align-items:center;gap:7px;margin-top:4px}
      .money-stepper button{min-width:46px;height:44px;border:1px solid #cbdce6;border-radius:11px;background:#f8fbfd;color:#315f80;font:inherit;font-size:11px;font-weight:900;cursor:pointer}
      .money-stepper button:hover{background:#eef6fa;border-color:#9fbdcf}
      .money-stepper input{width:100%;height:44px;border:1px solid #cbd9e2;border-radius:11px;background:#fff;padding:8px 11px;font:inherit;color:#29485f;font-size:13px;font-weight:800;box-sizing:border-box}
      .money-stepper input:focus{outline:none;border-color:#7ea8c2;box-shadow:0 0 0 3px rgba(49,95,128,.08)}
      .money-stepper-unit{font-size:11px;font-weight:900;color:#526e82;white-space:nowrap}
      .money-stepper-help{margin:6px 0 0;font-size:9px;line-height:1.6;color:#788b98}
      .devil-all-card{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:14px;padding:13px 14px;border:1px solid #d7c8e5;border-radius:14px;background:linear-gradient(135deg,#fcf9ff,#f8f3fc)}
      .devil-all-card b{display:block;color:#59446c;font-size:11px;margin-bottom:3px}.devil-all-card span{display:block;color:#7a6b86;font-size:9.5px;line-height:1.6}
      .devil-all-button{flex:0 0 auto;border:1px solid #604675!important;background:#604675!important;color:#fff!important;border-radius:999px!important;padding:10px 15px!important;font:inherit!important;font-size:10px!important;font-weight:900!important;cursor:pointer!important}
      .allmode-banner{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:16px 0;padding:13px 15px;border:1px solid #d8c9e5;border-radius:14px;background:#fbf8fd;color:#655474}
      .allmode-banner b{display:block;font-size:11px;margin-bottom:2px}.allmode-banner span{display:block;font-size:9.5px;line-height:1.6;color:#7d7087}
      .allmode-return{flex:0 0 auto;border:1px solid #cfc0dc;border-radius:999px;background:#fff;color:#604675;padding:8px 12px;font:inherit;font-size:9.5px;font-weight:900;cursor:pointer}
      body.all-answer-mode .depth-cards{display:none!important}
      body.all-answer-mode .field:has(.depth-cards){display:none!important}
      @media(max-width:720px){.money-stepper{grid-template-columns:auto 1fr auto}.money-stepper-unit{grid-column:2/3}.devil-all-card,.allmode-banner{align-items:flex-start;flex-direction:column}.devil-all-button,.allmode-return{width:100%}}
    `;
    document.head.appendChild(style);

    const TRANSFER_KEY='shinikata_case_transfer_v1';

    function saveTransfer(){
      const state=[...form.elements].filter(el=>el.name||el.id).map(el=>({
        id:el.id||'',name:el.name||'',type:el.type||'',value:el.value??'',checked:!!el.checked
      }));
      try{sessionStorage.setItem(TRANSFER_KEY,JSON.stringify(state));}catch(_){ }
    }

    function restoreTransfer(){
      let state=null;
      try{state=JSON.parse(sessionStorage.getItem(TRANSFER_KEY)||'null');}catch(_){ }
      if(!Array.isArray(state))return;
      state.forEach(item=>{
        let el=item.id?document.getElementById(item.id):null;
        if(!el&&item.name){
          if(item.type==='radio'||item.type==='checkbox')el=form.querySelector(`[name="${CSS.escape(item.name)}"][value="${CSS.escape(String(item.value))}"]`);
          else el=form.querySelector(`[name="${CSS.escape(item.name)}"]`);
        }
        if(!el)return;
        if(item.type==='radio'||item.type==='checkbox')el.checked=!!item.checked;
        else if(item.value!==undefined)el.value=item.value;
      });
      try{sessionStorage.removeItem(TRANSFER_KEY);}catch(_){ }
      ['respondent_role','record_type','answer_depth','patient_status','additional_condition_presence'].forEach(name=>{
        form.querySelectorAll(`[name="${name}"]`).forEach(el=>el.dispatchEvent(new Event('change',{bubbles:true})));
      });
      ['disease','status','decisionFocus'].forEach(id=>document.getElementById(id)?.dispatchEvent(new Event('change',{bubbles:true})));
    }

    function bandBounds(text){
      const t=String(text||'').replace(/,/g,'').trim();
      const nums=(t.match(/\d+/g)||[]).map(Number);
      if(!t.includes('万円')||!nums.length)return null;
      if(t.includes('未満'))return [0,Math.max(0,nums[0]-1)];
      if(t.includes('以上'))return [nums[0],Infinity];
      if(nums.length>=2)return [nums[0],nums[1]];
      return null;
    }

    function syncLegacyBand(select,input){
      if(!select||!input)return;
      const raw=input.value;
      if(raw===''){select.selectedIndex=0;return;}
      const n=Number(raw);
      if(!Number.isFinite(n)||n<0)return;
      const options=[...select.options];
      const hit=options.find(o=>{const b=bandBounds(o.textContent);return b&&n>=b[0]&&n<=b[1];});
      if(hit)select.value=hit.value;
    }

    function installMoneyStepper(selectId,exactId,placeholder){
      const select=document.getElementById(selectId);
      if(!select)return;
      const field=select.closest('.field');
      if(!field||field.querySelector('.money-stepper'))return;
      let input=document.getElementById(exactId);
      if(!input){
        input=document.createElement('input');
        input.type='number';
        input.id=exactId;
        input.name=selectId==='savings'?'household_savings_start_estimate_man_yen':'out_of_pocket_total_estimate_man_yen';
      }
      input.type='number';input.min='0';input.step='10';input.inputMode='numeric';input.placeholder=placeholder;
      select.classList.add('money-original-select');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
      document.getElementById(`${selectId}MoneyRefine`)?.classList.add('money-replaced-refine');
      const wrap=document.createElement('div');wrap.className='money-stepper';
      const minus=document.createElement('button');minus.type='button';minus.textContent='−10';minus.setAttribute('aria-label','10万円減らす');
      const plus=document.createElement('button');plus.type='button';plus.textContent='＋10';plus.setAttribute('aria-label','10万円増やす');
      const unit=document.createElement('span');unit.className='money-stepper-unit';unit.textContent='万円';
      select.after(wrap);wrap.append(minus,input,plus,unit);
      const help=document.createElement('p');help.className='money-stepper-help';help.textContent='−10 / ＋10 で調整できます。数字を直接入力してもOKです。空欄なら「分からない・未回答」として扱います。';wrap.after(help);
      const adjust=delta=>{
        const cur=input.value===''?0:Number(input.value);
        input.value=String(Math.max(0,(Number.isFinite(cur)?cur:0)+delta));
        input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
      };
      minus.addEventListener('click',()=>adjust(-10));plus.addEventListener('click',()=>adjust(10));
      input.addEventListener('input',()=>syncLegacyBand(select,input));
      syncLegacyBand(select,input);
    }

    installMoneyStepper('savings','savingsEstimate','例：420');
    installMoneyStepper('totalCost','totalCostEstimate','例：180');

    const costHead=document.querySelector('#cost .section-head');
    if(costHead){
      const h2=costHead.querySelector('h2');const p=costHead.querySelector('p');
      if(h2)h2.textContent='「いくらかかったか」を、おおよその金額で残す';
      if(p)p.textContent='療養開始時の貯蓄と、死亡／現在までに家計から出た金額を、おおよそで記録します。10万円ずつ調整するか、覚えている数字を直接入力できます。';
    }
    const flowNote=document.querySelector('#progressiveFlow .progressive-note');
    if(flowNote){
      const fix=()=>{if(flowNote.textContent.includes('大まかな金額帯'))flowNote.textContent='10万円ずつ調整するか、覚えている数字を直接入力できます。';};
      fix();new MutationObserver(fix).observe(flowNote,{childList:true,subtree:true,characterData:true});
    }

    const allMode=new URLSearchParams(location.search).get('all')==='1';
    restoreTransfer();

    if(allMode){
      document.body.classList.add('all-answer-mode');
      const deep=form.querySelector('input[name="answer_depth"][value="deep"]');
      if(deep){deep.checked=true;deep.dispatchEvent(new Event('change',{bubbles:true}));}
      const anchor=document.getElementById('experienceWizard')||form;
      if(!document.getElementById('allModeBanner')){
        const banner=document.createElement('div');banner.id='allModeBanner';banner.className='allmode-banner';
        banner.innerHTML='<div><b>😈 全部回答モード</b><span>詳細項目までページ送りで表示しています。分からないところは空欄のまま進めます。</span></div><button type="button" class="allmode-return">通常の5〜10分版に戻る</button>';
        anchor.before(banner);
        banner.querySelector('.allmode-return').addEventListener('click',()=>{saveTransfer();location.href='experience_case.html';});
      }
      return;
    }

    const hub=document.getElementById('progressiveModuleHub');
    if(hub&&!document.getElementById('devilAllCard')){
      const actions=hub.querySelector('.progressive-hub-actions');
      const card=document.createElement('div');card.id='devilAllCard';card.className='devil-all-card';
      card.innerHTML='<div><b>全部まとめて残したい人へ</b><span>すべての追加項目をページ送りで回答するフル版です。研究協力や、かなり詳しく記録したい人向け。</span></div><button type="button" class="devil-all-button">😈 全部回答する（フル版）</button>';
      if(actions)actions.before(card);else hub.appendChild(card);
      card.querySelector('.devil-all-button').addEventListener('click',()=>{
        if(!confirm('フル版では詳細項目をすべて表示します。基本回答は引き継がれます。進みますか？'))return;
        saveTransfer();location.href='experience_case.html?all=1';
      });
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();