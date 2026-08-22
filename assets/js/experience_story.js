(function(){
  const stories={
    dementia:{
      meta:{status:'架空のダミーデータ',role:'家族・身近な人の視点',age:'80代',sex:'女性',state:'死亡',center:'認知症',theme:'看取り',contributing:['骨折・転倒による生活機能低下','高血圧'],duration:'最初の変化から約6年'},
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
      cost:{oop:'100〜299万円',copay:'主に1〜2割',income:'50〜199万円',insurance:'民間医療保険から一部給付あり',noncovered:'保険外の家事支援を一時利用。保険外医療は特になし。',items:['保険適用の医療費','通院・交通費','介護用品','デイサービス等の介護サービス','家族の収入減'],strain:['いつまで続くか分からず、費用の見通しが立たなかった','本人の貯蓄だけでは足りず、家族の持ち出しがあった','子育て・教育費と介護費が重なった']},
      decision:{focus:'救急搬送・入院をどこまで続けるか',lead:'本人の以前の言葉を家族と医療者で確認して決めた',info:['医師・看護師の説明','病院の資料','自治体の介護情報','一般のWeb検索','家族介護の体験談'],sources:'自治体の介護保険ページ、病院でもらった誤嚥性肺炎の資料、家族介護の体験ブログなど。',wishes:'「管だらけになるのは嫌」「できれば家にいたい」という以前の言葉は家族で共有できていた。'},
      reflection:{acceptance:'かなり納得している',same:'同じ状況なら、概ね同じ選択をすると思う',helped:'訪問看護師が「救急車を呼ばない選択もあり得る」と具体的に説明してくれたこと。',hard:'家族だけで「本当に病院へ行かなくていいのか」を決める瞬間が一番怖かった。',mismatch:'「最期は眠る時間が増えて静かに亡くなる」と想像していたが、せん妄のように落ち着かない時間があり、家族はかなり驚いた。'},
      sourceNote:'このページの文章・数値はすべて画面設計確認用の架空データです。実在の患者・家族の体験ではありません。'
    },
    lung:{
      meta:{status:'架空のダミーデータ',role:'家族・身近な人の視点',age:'60代',sex:'男性',state:'死亡',center:'肺がん',theme:'治療と選択',contributing:['糖尿病','慢性の呼吸器症状'],duration:'最初の受診から約8か月'},
      title:'「風邪だろう」から大きな病院へ。治療と情報探しが一気に押し寄せた8か月',
      dek:'仕事を続けていた60代男性。咳と微熱で近所のクリニックを受診し、画像検査をきっかけに大きな病院へ紹介。肺がんと分かってからは、治療、仕事、お金、保険外治療の情報まで家族で一気に調べることになった——という架空症例です。',
      overview:'本人は自営業で、病院にはできるだけ行かず仕事を優先するタイプでした。咳と微熱が続き、最初は風邪だと思って近所のクリニックへ。検査で気になる所見があり、大きな病院を紹介され、精密検査の後に肺がんと説明されました。そこから治療方針の説明、仕事をどうするか、民間保険の請求、家族の付き添いが一気に始まりました。薬物療法を受けながら一時は通院中心で過ごせましたが、息苦しさと体力低下が進み入退院が増加。家族は標準治療だけでなく、ネットで保険適用外・未承認の治療情報まで探しましたが、主治医や公的ながん情報も確認し、受ける治療を一つずつ整理しました。最終的には治療を続ける負担と自宅で過ごす時間のバランスを家族で何度も話し合いました。',
      quote:'診断された瞬間から、病気のことだけじゃなく、仕事、保険、お金、治療法を全部同時に決めなきゃいけない感じでした。',
      timeline:[
        {when:'約8か月前',title:'咳と微熱で近所のクリニックへ',text:'風邪だと思って受診。症状が続いたため画像検査を受け、詳しい検査が必要と言われた。'},
        {when:'数週間後',title:'大きな病院へ紹介・精密検査',text:'紹介先で複数の検査を受け、肺がんと説明された。家族も同席して治療方針の説明を聞いた。',major:true},
        {when:'診断後1〜2か月',title:'治療開始と仕事の調整',text:'薬物療法を開始。本人は仕事を減らし、家族が通院付き添い・保険請求・制度調査を分担した。'},
        {when:'治療中',title:'家族が情報を大量に探す',text:'標準治療の説明に加え、ネット上の体験談、動画、保険適用外・未承認治療の情報まで検索。公的ながん情報や主治医にも確認しながら整理した。'},
        {when:'最終2〜3か月',title:'息苦しさと入退院が増える',text:'酸素療法を使う場面が増え、治療を続けるか、症状緩和を優先するかを繰り返し相談した。'},
        {when:'最終数週間',title:'治療より苦痛を減らすことを優先',text:'本人の「家に帰りたい」という希望を踏まえ、家族と医療者で療養場所と治療強度を調整した。',major:true}
      ],
      experiences:['クリニック受診','大きな病院への紹介','精密検査','薬物療法','入退院','酸素療法','緩和ケア相談','在宅療養の調整'],
      suffering:{physical:{score:8,text:'息苦しさ、強いだるさ、食欲低下が目立ち、治療後は横になっている時間が増えた。'},whole:{score:9,text:'病気そのものに加え、仕事を止めること、家計、治療選択への不安が重なっていたように見えた。'}},
      care:{hours:'診断直後は週数時間、最終期はほぼ毎日',night:'最終期に夜間対応あり',burden:'短期間に負担が集中した',effects:['通院付き添いで家族の仕事調整が急に必要になった','治療法と制度を調べる時間が毎日続いた','状態が週単位で変わり、予定を立てにくかった']},
      cost:{oop:'300〜499万円',copay:'主に3割（高額療養費も利用）',income:'300〜499万円',insurance:'民間医療保険・がん保険から給付あり',noncovered:'保険適用外・未承認治療の情報を検討したが、このダミー症例では実際には受けていない。',items:['保険適用の医療費','差額ベッド等の入院関連費','通院・交通費','家族の付き添い費用','本人の収入減'],strain:['診断から短期間で支出と収入減が同時に起きた','いつまで治療が続くか分からず家計の見通しが立たなかった','保険外治療を選ぶべきかまで考え、お金と治療の判断が絡んだ']},
      decision:{focus:'体力が落ちた後も治療を続けるか、症状を楽にすることを優先するか',lead:'本人の希望を中心に、家族と主治医・看護師が相談して決めた',info:['主治医・看護師の説明','国立がん研究センター がん情報サービス','病院の患者向け資料','一般のWeb検索','患者・家族のブログ','YouTubeの体験談','生成AI'],sources:'国立がん研究センター「がん情報サービス」の肺がん情報、病院の治療説明資料、患者・家族のブログや動画、検索エンジン、生成AIなど。保険適用外・未承認治療についても検索した。',wishes:'本人は「できる治療はやりたい」と言っていた一方、息苦しさが強くなってからは「病院だけで時間を使いたくない」「家に帰りたい」と話すようになった。'},
      reflection:{acceptance:'大きな後悔はないが、迷いは残っている',same:'情報を整理する人をもっと早く頼りたい',helped:'主治医だけでなく看護師とがん相談の窓口で、治療以外の仕事・お金・生活も含めて相談できたこと。',hard:'ネットには「これで治った」という強い情報が大量にあり、何を信じるか決めること自体が負担だった。',mismatch:'治療を始めればしばらく通院中心で生活できると思っていたが、数週間単位で体調が変わり、入院や酸素療法が急に必要になった。家族が想像していたより、判断の間隔がずっと短かった。'},
      sourceNote:'このページの文章・数値はすべて画面設計確認用の架空データです。肺がん情報源の表示例として、実在する公的情報源名を含みますが、症例そのものは実在しません。'
    }
  };

  const params=new URLSearchParams(location.search);
  const requested=params.get('story')||'dementia';
  const story=stories[requested]||stories.dementia;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function tags(items,cls=''){return items.map(x=>`<span class="tag ${cls}">${esc(x)}</span>`).join('')}
  function render(){
    document.title=story.title+'｜体験談詳細（ダミー）｜アノトキ';
    $('storyTitle').textContent=story.title;
    $('storyDek').textContent=story.dek;
    $('rolePill').textContent=story.meta.role;
    $('conditionPill').textContent=story.meta.center;
    $('themePill').textContent=story.meta.theme;
    $('metaAge').textContent=story.meta.age+' '+story.meta.sex;
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
    $('costInsurance').textContent=story.cost.insurance;
    $('costNoncovered').textContent=story.cost.noncovered;
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