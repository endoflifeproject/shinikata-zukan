(function(){
  const story={
    meta:{status:'架空のダミーデータ',role:'家族・身近な人の視点',age:'80代',sex:'女性',state:'死亡',center:'認知症',contributing:['骨折・転倒による生活機能低下','高血圧'],duration:'最初の変化から約6年'},
    title:'物忘れから始まり、転倒を境に生活が一気に変わった6年間',
    dek:'旅行と庭いじりが好きだった80代女性。物忘れが少しずつ増え、徘徊中の転倒・大腿骨頸部骨折をきっかけに救急入院。その後、家族介護と通院が生活の中心になり、肺炎を繰り返しながら最期を迎えた——という架空症例です。',
    overview:'もともとは一人暮らしで、近所への買い物や庭いじりを楽しんでいました。数年前から同じ話を繰り返すことが増えましたが、本人は「年だから」と受診を嫌がっていました。ある夜、外へ出て転倒し、大腿骨頸部骨折で救急搬送。その入院をきっかけに認知症の診断を受けました。退院後は娘家族が通いながら介護し、デイサービスや訪問看護も利用しました。徐々に食事量と歩く力が落ち、誤嚥性肺炎で何度か入退院。最後は本人が以前から嫌がっていた大きな治療は行わず、自宅で家族と過ごす時間を優先しました。',
    quote:'母にとっては「病気を治す」より、知らない場所に長くいることの方がつらかったのかもしれません。',
    timeline:[
      {when:'約6年前',title:'家族が物忘れに気づく',text:'同じ買い物を何度もする、約束を忘れるなどの変化が出始めた。本人は受診を希望しなかった。'},
      {when:'約5年前',title:'転倒・骨折で救急搬送',text:'外出中に転倒し大腿骨頸部骨折。救急搬送・入院となり、入院中の評価から認知症が明確になった。',major:true},
      {when:'その後',title:'リハビリ後、自宅へ',text:'歩行能力は以前より低下。娘家族の支援、デイサービス、訪問看護を利用しながら自宅生活を継続。'},
      {when:'2〜3年前から',title:'肺炎と入退院を繰り返す',text:'食事中のむせが増え、誤嚥性肺炎で複数回入院。救急搬送するか、自宅で見るかを家族で何度も迷った。'},
      {when:'最終数か月',title:'食事量・活動量が低下',text:'通院の負担も大きくなり、家族は医療者と相談しながら「苦痛を増やさないこと」を優先する方針に変わった。'},
      {when:'最期',title:'自宅で家族と過ごす',text:'急変時も大きな処置は行わず、訪問診療・訪問看護の支援を受けながら自宅で亡くなった。',major:true}
    ],
    experiences:['救急搬送','手術','リハビリ','訪問診療','訪問看護','デイサービス','肺炎による再入院','酸素療法'],
    suffering:{physical:{score:6,text:'骨折後の痛み、息苦しさ、食事時のむせが目立った。'},whole:{score:8,text:'環境が変わると強い不安があり、入院中は落ち着かない時間が増えた。'}},
    care:{hours:'平日2〜4時間、休日は長時間',night:'夜間対応あり',burden:'かなり重かった',effects:['仕事を早退・欠勤することが増えた','夜間の電話や見守りで睡眠が細切れになった','兄弟間で介護量の差に不満が出た']},
    cost:{oop:'100〜299万円',copay:'主に1〜2割',income:'50〜199万円',items:['保険適用の医療費','通院・交通費','介護用品','デイサービス等の介護サービス','家族の収入減'],strain:['いつまで続くか分からず、費用の見通しが立たなかった','本人の貯蓄だけでは足りず、家族の持ち出しがあった','子育て・教育費と介護費が重なった']},
    decision:{focus:'救急搬送・入院をどこまで続けるか',lead:'本人の以前の言葉を家族と医療者で確認して決めた',info:['医師・看護師の説明','病院の資料','自治体の介護情報','一般のWeb検索','家族介護の体験談'],sources:'自治体の介護保険ページ、病院でもらった誤嚥性肺炎の資料、家族介護の体験ブログなど。',wishes:'「管だらけになるのは嫌」「できれば家にいたい」という以前の言葉は家族で共有できていた。'},
    reflection:{acceptance:'かなり納得している',same:'同じ状況なら、概ね同じ選択をすると思う',helped:'訪問看護師が「救急車を呼ばない選択もあり得る」と具体的に説明してくれたこと。',hard:'家族だけで「本当に病院へ行かなくていいのか」を決める瞬間が一番怖かった。',mismatch:'「最期は眠る時間が増えて静かに亡くなる」と想像していたが、せん妄のように落ち着かない時間があり、家族はかなり驚いた。'},
    sourceNote:'このページの文章・数値はすべて画面設計確認用の架空データです。実在の患者・家族の体験ではありません。'
  };

  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function tags(items,cls=''){return items.map(x=>`<span class="tag ${cls}">${esc(x)}</span>`).join('')}
  function render(){
    $('storyTitle').textContent=story.title;
    $('storyDek').textContent=story.dek;
    $('rolePill').textContent=story.meta.role;
    $('metaAge').textContent=story.meta.age;
    $('metaState').textContent=story.meta.state;
    $('metaCenter').textContent=story.meta.center;
    $('metaDuration').textContent=story.meta.duration;
    $('overviewText').textContent=story.overview;
    $('overviewQuote').innerHTML=esc(story.quote)+'<small>— 回答者の振り返り（ダミー）</small>';
    $('conditionTags').innerHTML=tags([story.meta.center,...story.meta.contributing]);
    $('timeline').innerHTML=story.timeline.map(e=>`<div class="event${e.major?' major':''}"><span class="dot"></span><b>${esc(e.title)}</b><span class="when">${esc(e.when)}</span><p>${esc(e.text)}</p></div>`).join('');
    $('experienceTags').innerHTML=tags(story.experiences);
    $('physicalScore').textContent=story.suffering.physical.score+'/10';
    $('physicalBar').style.width=(story.suffering.physical.score*10)+'%';
    $('physicalText').textContent=story.suffering.physical.text;
    $('wholeScore').textContent=story.suffering.whole.score+'/10';
    $('wholeBar').style.width=(story.suffering.whole.score*10)+'%';
    $('wholeText').textContent=story.suffering.whole.text;
    $('careHours').textContent=story.care.hours;
    $('careNight').textContent=story.care.night;
    $('careBurden').textContent=story.care.burden;
    $('careEffects').innerHTML=story.care.effects.map(x=>`<li>${esc(x)}</li>`).join('');
    $('costOop').textContent=story.cost.oop;
    $('costCopay').textContent=story.cost.copay;
    $('costIncome').textContent=story.cost.income;
    $('costItems').innerHTML=tags(story.cost.items,'warn');
    $('costStrain').innerHTML=story.cost.strain.map(x=>`<li>${esc(x)}</li>`).join('');
    $('decisionFocus').textContent=story.decision.focus;
    $('decisionLead').textContent=story.decision.lead;
    $('decisionInfo').innerHTML=tags(story.decision.info,'soft');
    $('decisionSources').textContent=story.decision.sources;
    $('decisionWishes').textContent=story.decision.wishes;
    $('reflectionAcceptance').textContent=story.reflection.acceptance;
    $('reflectionSame').textContent=story.reflection.same;
    $('reflectionHelped').textContent=story.reflection.helped;
    $('reflectionHard').textContent=story.reflection.hard;
    $('reflectionMismatch').textContent=story.reflection.mismatch;
    $('sourceNote').textContent=story.sourceNote;
  }
  render();
})();
