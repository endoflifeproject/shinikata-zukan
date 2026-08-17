(function(){
  const stories={
    dementia:{
      deathAge:'87歳',
      course:['診断から約5年','介護開始から約5年'],
      retirement:'65歳',
      finance:['療養開始時の貯蓄 約720万円','医療・介護の自己負担 約180万円'],
      emergency:['救急搬送 4回','心肺蘇生 0回'],
      total:'家計への影響 約300万円',
      totalNote:'自己負担 約180万円＋失った収入 約120万円の表示用概算'
    },
    lung:{
      deathAge:'63歳',
      course:['診断から約8か月','家族の継続支援 約7か月'],
      retirement:'62歳ごろに実質休業',
      finance:['療養開始時の貯蓄 約760万円','医療等の自己負担 約380万円'],
      emergency:['救急搬送 2回','心肺蘇生 0回'],
      total:'家計への影響 約800万円',
      totalNote:'自己負担 約380万円＋失った収入 約420万円の表示用概算'
    }
  };

  const key=new URLSearchParams(location.search).get('story')||'dementia';
  const data=stories[key]||stories.dementia;
  const indicators=document.getElementById('burdenIndicators');
  if(!indicators)return;

  const title=document.querySelector('.burden-indicators-title');
  if(title)title.textContent='この体験を、6つの数字でつかむ';

  const style=document.createElement('style');
  style.textContent=`
    #burdenIndicators.story-keyfacts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}
    .story-keyfact{border:1px solid #d7e3eb;background:#fff;border-radius:13px;padding:13px 14px;min-height:108px}
    .story-keyfact .keyfact-label{display:block;font-size:8.5px;font-weight:900;color:#728694;margin-bottom:5px;letter-spacing:.02em}
    .story-keyfact strong{display:block;font-family:"Yu Mincho","Hiragino Mincho ProN",serif;color:#285d83;font-size:19px;line-height:1.45;margin-bottom:4px}
    .story-keyfact p{margin:0;font-size:10px;line-height:1.75;color:#627787}
    .story-keyfact .keyfact-sub{display:block;font-size:8.5px;color:#89969f;line-height:1.6;margin-top:4px}
    .story-keyfact.money strong{color:#765f34}
    .story-keyfact.emergency strong{color:#8a5c38}
    .story-keyfacts-note{margin:9px 0 0;font-size:8px;line-height:1.7;color:#8b979f}
    @media(max-width:760px){#burdenIndicators.story-keyfacts{grid-template-columns:1fr 1fr}}
    @media(max-width:500px){#burdenIndicators.story-keyfacts{grid-template-columns:1fr}.story-keyfact{min-height:0}}
  `;
  document.head.appendChild(style);

  indicators.className='burden-indicators story-keyfacts';
  indicators.innerHTML=`
    <div class="story-keyfact"><span class="keyfact-label">亡くなった年齢</span><strong>${data.deathAge}</strong><p>この体験談の本人が亡くなった年齢</p></div>
    <div class="story-keyfact"><span class="keyfact-label">診断・介護から亡くなるまで</span><strong>${data.course[0]}</strong><p>${data.course[1]}</p></div>
    <div class="story-keyfact"><span class="keyfact-label">退職・仕事を離れた年齢</span><strong>${data.retirement}</strong><p>病気や療養と仕事の関係を見る目安</p></div>
    <div class="story-keyfact money"><span class="keyfact-label">貯蓄と出費</span><strong>${data.finance[0]}</strong><p>${data.finance[1]}</p></div>
    <div class="story-keyfact emergency"><span class="keyfact-label">救急搬送・蘇生</span><strong>${data.emergency[0]}</strong><p>${data.emergency[1]}</p></div>
    <div class="story-keyfact money"><span class="keyfact-label">亡くなるまでに家計へかかった負担</span><strong>${data.total}</strong><p>${data.totalNote}</p></div>
  `;

  const note=document.createElement('p');
  note.className='story-keyfacts-note';
  note.textContent='※ 現在は架空のダミーデータです。本番では年齢・期間・回数・費用の取得精度と公開範囲を回答者ごとに明示し、特定につながる場合は年代・金額帯などに丸めます。';
  indicators.insertAdjacentElement('afterend',note);
})();