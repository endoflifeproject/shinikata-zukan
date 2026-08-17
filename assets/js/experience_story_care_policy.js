(function(){
  const demo={
    dementia:{
      direction:'看取りを中心とした方針',
      place:'自宅',
      basis:['本人の以前の言葉','エンディングノート・本人のメモ','家族での話し合い','医師・訪問看護師の説明','病状の進行・通院負担'],
      wishes:'「管だらけになるのは嫌」「できれば家にいたい」という以前の言葉に加え、家族の手元にあったエンディングノートにも、負担の大きい延命は望まず自宅で過ごしたいという希望が残されていた。',
      summary:'負担の大きい延命目的の治療は控え、訪問診療・訪問看護で苦痛を和らげながら、自宅で家族と過ごすことを優先して看取った。'
    },
    lung:{
      direction:'生活・苦痛緩和を優先',
      place:'自宅を目指して調整',
      basis:['本人の「家に帰りたい」という希望','本人・家族との話し合い','主治医・看護師の説明','治療による負担と体力低下','息苦しさなどの症状'],
      wishes:'本人は当初「できる治療はやりたい」と話していたが、息苦しさと体力低下が進んでからは「病院だけで時間を使いたくない」「家に帰りたい」という希望が強くなった。',
      summary:'治療を続ける負担が大きくなった段階で治療強度を下げ、症状緩和を優先しながら、自宅で過ごせる時間を確保する方針へ変更した。'
    }
  };
  const key=new URLSearchParams(location.search).get('story')||'dementia';
  const data=demo[key]||demo.dementia;
  const decision=document.getElementById('decision');
  const wishesText=document.getElementById('decisionWishes');
  const wishes=wishesText?.closest('.mini-card');
  if(!decision||!wishes||document.getElementById('finalCarePolicyStory'))return;
  if(wishesText&&data.wishes)wishesText.textContent=data.wishes;

  const style=document.createElement('style');
  style.textContent=`
    /* 06｜意思決定：ラベルではなく「回答内容」を約3px大きくする */
    #decision .mini-card p{font-size:12.5px;line-height:1.9;color:#5d7281}
    #decision .tags .tag{font-size:12px;line-height:1.55;padding:6px 10px}

    .final-policy-story{margin-top:14px;padding:16px;border:1px solid #cfdfe9;border-radius:14px;background:linear-gradient(145deg,#f7fbfd,#fff)}
    .final-policy-story .policy-kicker{font-size:9px;font-weight:900;color:#8b6a2e;letter-spacing:.08em}
    .final-policy-story h3{margin:4px 0 10px;font-size:16px;color:#2e5d7d}
    .policy-summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .policy-summary-card{padding:11px 12px;border:1px solid #dce7ed;border-radius:11px;background:#fff}
    .policy-summary-card b{display:block;font-size:8.5px;color:#7b8d98;margin-bottom:3px}
    .policy-summary-card strong{display:block;font-size:16px;color:#315f80;line-height:1.55}
    .policy-basis-title{margin:12px 0 7px;font-size:9px;font-weight:900;color:#5c7282}
    .policy-basis{display:flex;flex-wrap:wrap;gap:6px}
    .policy-basis span{display:inline-flex;padding:6px 10px;border:1px solid #d9e3e9;border-radius:999px;background:#fff;font-size:11.5px;line-height:1.55;color:#586f7f}
    .policy-outcome{margin-top:12px;padding:12px 13px;border-left:3px solid #8eb1c8;background:#f8fbfd;border-radius:8px;font-size:13px;line-height:1.9;color:#526b7b}
    .policy-outcome b{color:#315f80}
    @media(max-width:640px){.policy-summary-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const box=document.createElement('div');
  box.id='finalCarePolicyStory';
  box.className='final-policy-story';
  box.innerHTML=`
    <div class="policy-kicker">意思決定の着地点</div>
    <h3>最終的に選んだ医療・ケアの方針</h3>
    <div class="policy-summary-grid">
      <div class="policy-summary-card"><b>医療・ケアの方向性</b><strong>${esc(data.direction)}</strong></div>
      <div class="policy-summary-card"><b>主に過ごした／目指した場所</b><strong>${esc(data.place)}</strong></div>
    </div>
    <div class="policy-basis-title">その方針を決める根拠になったもの</div>
    <div class="policy-basis">${data.basis.map(x=>`<span>${esc(x)}</span>`).join('')}</div>
    <div class="policy-outcome"><b>結局どうしたか</b><br>${esc(data.summary)}</div>
  `;
  wishes.insertAdjacentElement('afterend',box);
})();
