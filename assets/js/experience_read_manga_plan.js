(function(){
  const mangaPlans={
    '転倒・骨折':'転倒 → 骨折 → 入院 → 生活機能の低下や介護量の増加',
    '救急・入院反復':'発熱・肺炎など → 救急搬送 → 入退院のくり返し → 家族の判断負担',
    '在宅療養':'自宅での療養 → 訪問診療・訪問看護・介護サービス → 在宅生活の継続',
    '夜間介護あり':'夜間の不穏・徘徊・トイレ介助など → 睡眠不足 → 支える人の負担'
  };

  const style=document.createElement('style');
  style.textContent=`
    .mini-stat.manga-planned{position:relative;padding-bottom:11px}
    .manga-plan-badge{display:inline-flex;align-items:center;gap:4px;margin-top:7px;padding:3px 7px;border-radius:999px;background:#fff7e8;border:1px solid #ead7ad;color:#7b6333;font-size:7.5px;font-weight:900;line-height:1.5}
    .manga-plan-copy{margin:5px 0 0;font-size:7.7px;line-height:1.6;color:#72828d}
    .dementia-manga-plan-note{margin-top:10px;padding:10px 11px;border:1px dashed #d9c493;border-radius:11px;background:#fffbf2;font-size:8.5px;line-height:1.7;color:#76643f}
    .dementia-manga-plan-note b{color:#725a29}
  `;
  document.head.appendChild(style);

  function clearPlans(){
    document.querySelectorAll('#aggregateFoot .manga-plan-badge,#aggregateFoot .manga-plan-copy').forEach(el=>el.remove());
    document.querySelectorAll('#aggregateFoot .manga-planned').forEach(el=>el.classList.remove('manga-planned'));
    document.getElementById('dementiaMangaPlanNote')?.remove();
  }

  function enhance(){
    const condition=document.getElementById('condition');
    const foot=document.getElementById('aggregateFoot');
    if(!condition||!foot)return;
    if(condition.value!=='認知症'){
      clearPlans();
      return;
    }

    const cards=Array.from(foot.querySelectorAll('.mini-stat'));
    cards.forEach(card=>{
      const label=card.querySelector('b')?.textContent.trim()||'';
      const plan=mangaPlans[label];
      if(!plan||card.querySelector('.manga-plan-badge'))return;
      card.classList.add('manga-planned');
      const badge=document.createElement('span');
      badge.className='manga-plan-badge';
      badge.textContent='📖 エピソード漫画を掲載予定';
      const copy=document.createElement('p');
      copy.className='manga-plan-copy';
      copy.textContent=plan;
      card.append(badge,copy);
    });

    let note=document.getElementById('dementiaMangaPlanNote');
    if(!note){
      note=document.createElement('div');
      note.id='dementiaMangaPlanNote';
      note.className='dementia-manga-plan-note';
      note.innerHTML='<b>制作メモ｜この4つの傾向それぞれに漫画を付ける予定</b><br>数字 → エピソード漫画 → 対処法・相談先 → 関連する体験談、の順につなげる。現在の割合はプレテスト用の架空集計です。';
      foot.insertAdjacentElement('afterend',note);
    }
  }

  const foot=document.getElementById('aggregateFoot');
  if(foot){
    new MutationObserver(()=>setTimeout(enhance,0)).observe(foot,{childList:true});
  }
  document.getElementById('condition')?.addEventListener('change',()=>setTimeout(enhance,0));
  document.getElementById('searchBtn')?.addEventListener('click',()=>setTimeout(enhance,0));
  document.getElementById('resetBtn')?.addEventListener('click',()=>setTimeout(enhance,0));
  document.querySelectorAll('[data-condition]').forEach(el=>el.addEventListener('click',()=>setTimeout(enhance,0)));
  setTimeout(enhance,0);
})();
