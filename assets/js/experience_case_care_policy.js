(function(){
  function init(){
    const form=document.getElementById('caseForm');
    const decision=document.getElementById('decision');
    if(!form||!decision||document.getElementById('finalCarePolicyBlock'))return;

    const eventModule=decision.querySelector('.event-module');
    const anchor=eventModule||decision.querySelector('.depth-hidden[data-depth-min="deep"]');

    const policyOptions=[
      ['','選択してください'],
      ['life_prolonging_priority','治療・生命維持を優先'],
      ['treatment_palliative_parallel','治療と苦痛緩和を両立'],
      ['comfort_life_priority','生活・苦痛緩和を優先'],
      ['end_of_life_care_focus','看取りを中心とした方針'],
      ['selective_treatment','一部の治療のみ行う'],
      ['changed_or_other','その他・途中で変化した'],
      ['unknown','分からない・該当なし']
    ];
    const placeOptions=[
      ['','選択してください'],
      ['home','自宅'],
      ['hospital','病院'],
      ['palliative_unit','緩和ケア病棟・ホスピス'],
      ['facility','施設・高齢者住宅等'],
      ['multiple','状況に応じて複数'],
      ['other','その他'],
      ['unknown','分からない・該当なし']
    ];
    const basisOptions=[
      ['patient_words','本人の言葉・以前からの希望'],
      ['ending_note','エンディングノート・本人のメモ'],
      ['acp_advance_directive','ACP・事前指示・リビングウィル'],
      ['family_discussion','家族・身近な人との話し合い'],
      ['physician_explanation','医師の説明'],
      ['nurse_care_advice','看護師・ケアマネ等の助言'],
      ['condition_progression','病状・身体機能の変化'],
      ['symptom_burden','苦痛・治療負担の大きさ'],
      ['preferred_life_place','本人が望む暮らし・療養場所'],
      ['financial_care_burden','費用・介護負担'],
      ['other','その他']
    ];
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const options=items=>items.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');
    const checks=basisOptions.map(([v,l],i)=>`<div class="choice"><input type="checkbox" name="care_policy_basis" id="cpb_${i}" value="${esc(v)}"><label for="cpb_${i}">${esc(l)}</label></div>`).join('');

    const block=document.createElement('div');
    block.id='finalCarePolicyBlock';
    block.className='subpanel';
    block.innerHTML=`
      <span class="tag">意思決定の着地点</span>
      <h3>最終的に選んだ医療・ケアの方針</h3>
      <p class="intro">「何を決めたか」とは別に、その人の最終的な医療・ケア全体の方向性を記録します。治療の優劣を示すものではありません。</p>
      <div class="grid2">
        <div class="field"><label for="carePolicyDirection">医療・ケアの方向性</label><select id="carePolicyDirection" name="care_policy_direction">${options(policyOptions)}</select></div>
        <div class="field"><label for="carePolicyPlace">主に過ごした／看取りを目指した場所</label><select id="carePolicyPlace" name="care_policy_place">${options(placeOptions)}</select></div>
      </div>
      <div class="field"><label>その方針を決める根拠になったもの（複数可）</label><div class="options three">${checks}</div></div>
      <div class="field"><label for="carePolicySummary">結局どうしたか（任意）</label><textarea id="carePolicySummary" name="care_policy_summary" maxlength="600" placeholder="例：本人のエンディングノートと以前の言葉をもとに、負担の大きい延命目的の治療は控え、訪問診療・訪問看護を利用しながら自宅での看取りを選んだ。"></textarea><p class="help">「全部治療する／何もしない」の二択ではなく、実際に選んだ方針を短く残してください。</p></div>
    `;
    if(anchor)anchor.before(block); else decision.appendChild(block);

    /* プレビューJSONにも意味のまとまりとして残す */
    const previewBtn=document.getElementById('previewBtn');
    previewBtn?.addEventListener('click',()=>setTimeout(()=>{
      const preview=document.getElementById('jsonPreview');
      if(!preview)return;
      try{
        const data=JSON.parse(preview.textContent||'{}');
        const basis=Array.from(form.querySelectorAll('input[name="care_policy_basis"]:checked')).map(x=>x.value);
        data.final_care_policy={
          direction:document.getElementById('carePolicyDirection')?.value||undefined,
          place:document.getElementById('carePolicyPlace')?.value||undefined,
          basis:basis.length?basis:undefined,
          summary:(document.getElementById('carePolicySummary')?.value||'').trim()||undefined
        };
        Object.keys(data.final_care_policy).forEach(k=>data.final_care_policy[k]===undefined&&delete data.final_care_policy[k]);
        preview.textContent=JSON.stringify(data,null,2);
      }catch(_){ }
    },0));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
