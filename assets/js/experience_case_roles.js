(function(){
  function init(){
    const form=document.getElementById('caseForm');
    const setup=document.getElementById('setup');
    if(!form||!setup||document.documentElement.dataset.roleExtensionReady)return;
    document.documentElement.dataset.roleExtensionReady='1';

    const css=document.createElement('style');
    css.textContent=`
      .compact-select-wrap{margin-top:8px}
      .compact-select{width:100%;border:1px solid #cbd9e2;border-radius:11px;background:#fff;padding:11px 38px 11px 12px;font:inherit;color:#29485f;min-height:44px}
      .compact-select:focus{outline:none;border-color:#8eafc5;box-shadow:0 0 0 3px rgba(57,104,137,.08)}
      .compact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .compact-card{margin-top:14px;padding:16px;border:1px solid #dbe6ec;border-radius:14px;background:#fbfdfe}
      .compact-card h3{margin:0 0 4px}
      .compact-card .field{margin-top:12px}
      .legacy-hidden{display:none!important}
      @media(max-width:720px){.compact-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(css);

    const roleLabels={patient:'本人',family:'家族・身近な人',professional:'医療・介護・福祉職',post_death_support:'死後の手続き・身元保証等を支援した人'};
    const professions=[['','選択してください'],['doctor','医師'],['nurse','看護師'],['nursing_assistant','看護助手・看護補助者'],['care_worker','介護福祉士・介護職員'],['care_manager','ケアマネジャー'],['rehab_pt','理学療法士（PT）'],['rehab_ot','作業療法士（OT）'],['rehab_st','言語聴覚士（ST）'],['pharmacist','薬剤師'],['msw','MSW・医療ソーシャルワーカー'],['social_worker','社会福祉士・相談員'],['community_support','地域包括支援センター職員'],['public_official','行政・福祉職'],['other','その他']];
    const workplaces=[['','選択してください'],['acute_hospital','急性期病院'],['recovery_hospital','回復期病院'],['chronic_hospital','慢性期・療養病院'],['clinic','診療所・クリニック'],['emergency_icu','救急・ICU'],['home_medicine','在宅医療・訪問診療'],['home_nursing','訪問看護'],['palliative_hospice','緩和ケア病棟・ホスピス'],['tokuyo','特別養護老人ホーム（特養）'],['roken','介護老人保健施設（老健）'],['kaigo_iryouin','介護医療院'],['paid_home','有料老人ホーム'],['sakoju','サービス付き高齢者向け住宅'],['group_home','グループホーム'],['small_multifunction','小規模多機能'],['day_service','デイサービス'],['home_help','訪問介護'],['care_management','居宅介護支援'],['community_center','地域包括支援センター'],['other','その他']];
    const specialties=[['','選択してください'],['general','総合診療・一般内科'],['respiratory','呼吸器内科・呼吸器外科'],['gastro','消化器内科・消化器外科'],['cardio','循環器内科・心臓血管外科'],['neuro','脳神経内科・脳神経外科'],['renal','腎臓内科・透析'],['hematology','血液内科'],['oncology','腫瘍内科・がん診療'],['orthopedics','整形外科'],['psychiatry','精神科・心療内科'],['emergency','救急科'],['icu','集中治療'],['geriatrics','老年医学・高齢者医療'],['palliative','緩和ケア'],['home','在宅・訪問診療'],['rehab','リハビリテーション'],['none','特定の診療科には属していない'],['other','その他']];
    const involvement=[['','選択してください'],['primary','主に担当していた'],['continuous','継続的に関わった'],['temporary','一時的に関わった'],['final_stage','最期の時期のみ関わった'],['post_death','死後の支援で関わった'],['other','その他']];
    const family=[['','選択してください'],['partner','配偶者・パートナー'],['daughter','娘'],['son','息子'],['child_spouse','子の配偶者（嫁・婿など）'],['parent','親'],['grandchild','孫'],['sibling','きょうだい'],['other_relative','その他の親族'],['friend','友人・知人'],['other','その他']];
    const familyCare=[['','選択してください'],['main','主な介護者だった'],['shared','他の人と分担していた'],['support','補助的に関わった'],['little','介護にはほぼ関わっていない'],['unknown','分からない・答えたくない']];
    const postDeath=[['','選択してください'],['lifetime_support','高齢者等終身サポート事業者'],['post_death_mandate','死後事務の受任者'],['guardian','成年後見等の支援者'],['public_welfare','行政・福祉関係者'],['funeral_related','葬送・葬儀等の支援者'],['other','その他']];
    const sourceOptions=[['','選択してください'],['memory','自分の記憶'],['personal_notes','自分・家族の手元の記録'],['clinical_memory','診療・ケアでの記憶'],['authorized_record','許可された範囲の記録を参照'],['heard_from_person','本人・家族から聞いた話'],['other','その他']];
    const selectHtml=(id,name,items)=>`<select class="compact-select" id="${id}"${name?` name="${name}"`:''}>${items.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>`;

    /* 回答者の立場：大分類だけを1回聞く */
    const roleRadio=form.querySelector('input[name="respondent_role"]');
    const roleBox=roleRadio?.closest('.options');
    const roleField=roleBox?.closest('.field');
    if(!roleBox||!roleField)return;
    roleBox.classList.add('legacy-hidden');
    const roleUI=document.createElement('div');
    roleUI.className='compact-select-wrap';
    roleUI.innerHTML=selectHtml('respondentRoleCategory','',[
      ['','選択してください'],['patient','本人'],['family','家族・身近な人'],['professional','医療・介護・福祉職'],['post_death_support','死後の手続き・身元保証等を支援した人']
    ]);
    roleBox.before(roleUI);
    const roleSelect=document.getElementById('respondentRoleCategory');

    const familyPanel=setup.querySelector('[data-role-panel="family"]');
    if(familyPanel){
      familyPanel.innerHTML=`<h3>ご本人との関係</h3><p class="intro">続柄と、介護にどの程度関わったかを分けて記録します。</p><div class="compact-grid"><div class="field"><label for="relationshipSelect">続柄</label>${selectHtml('relationshipSelect','relationship',family)}</div><div class="field"><label for="familyCareSelect">介護への関わり（任意）</label>${selectHtml('familyCareSelect','family_care_role',familyCare)}</div></div>`;
    }

    const professionalPanel=setup.querySelector('[data-role-panel="professional"]');
    let recordSelect=null,professionSelect=null;
    if(professionalPanel){
      const recordRadio=professionalPanel.querySelector('input[name="record_type"]');
      const recordOptions=recordRadio?.closest('.options');
      if(recordOptions){
        recordOptions.classList.add('legacy-hidden');
        const rec=document.createElement('div');rec.className='compact-select-wrap';
        rec.innerHTML=selectHtml('recordTypeSelect','',[['case','特定の一症例について回答する'],['professional_overview','複数症例の一般的傾向を回答する']]);
        recordOptions.before(rec);recordSelect=document.getElementById('recordTypeSelect');
      }
      document.getElementById('professionalDetail')?.remove();
      const detail=document.createElement('div');detail.id='professionalDetail';detail.className='compact-card';
      detail.innerHTML=`<h3>職種・所属・関わり方</h3><p class="intro">上では大きな立場だけを選び、ここで詳しい職種・所属を記録します。</p><div class="compact-grid"><div class="field"><label for="professionSelect">詳しい職種</label>${selectHtml('professionSelect','professional_role_detail',professions)}</div><div class="field"><label for="workplaceSelect">主な勤務・活動の場</label>${selectHtml('workplaceSelect','professional_workplace',workplaces)}</div><div class="field"><label for="specialtySelect">主な診療科・専門領域</label>${selectHtml('specialtySelect','professional_specialty',specialties)}</div><div class="field"><label for="involvementSelect">この症例との関わり方</label>${selectHtml('involvementSelect','case_involvement',involvement)}</div></div><div class="field"><label for="caseContactLength">この方との関わりの長さ（任意）</label><input id="caseContactLength" type="text" name="case_contact_length" maxlength="80" placeholder="例：救急搬送時のみ／数日／6か月／3年間 など"></div>`;
      professionalPanel.appendChild(detail);
      professionSelect=document.getElementById('professionSelect');
    }

    let postPanel=setup.querySelector('[data-role-panel="post_death_support"]');
    if(!postPanel){postPanel=document.createElement('div');postPanel.className='subpanel role-hidden';postPanel.dataset.rolePanel='post_death_support';const sourceField=Array.from(setup.querySelectorAll('.field')).find(x=>x.textContent.includes('この回答の情報源'));if(sourceField)sourceField.before(postPanel);else setup.appendChild(postPanel);}
    postPanel.innerHTML=`<h3>死後の手続き・身元保証等での立場</h3><p class="intro">家族以外が、身元保証・死後事務・葬送・行政手続きなどを支えたケースも記録できます。</p><div class="compact-grid"><div class="field"><label for="postRoleSelect">詳しい立場</label>${selectHtml('postRoleSelect','post_death_support_role',postDeath)}</div><div class="field"><label for="postInvolvementSelect">この症例との関わり方</label>${selectHtml('postInvolvementSelect','case_involvement',involvement)}</div></div><div class="field"><label for="postCaseContactLength">この方との関わりの長さ（任意）</label><input id="postCaseContactLength" type="text" name="case_contact_length" maxlength="80" placeholder="例：生前から2年／死後事務のみ など"></div>`;

    /* 情報源も縦長リストをやめて主な1つをプルダウンに */
    const sourceField=Array.from(setup.querySelectorAll('.field')).find(x=>x.textContent.includes('この回答の情報源'));
    const sourceChecks=sourceField?.querySelectorAll('input[name="answer_source"]');
    if(sourceField&&sourceChecks?.length){
      const sourceOptionsBox=sourceChecks[0].closest('.options');
      sourceOptionsBox?.classList.add('legacy-hidden');
      const sourceUI=document.createElement('div');sourceUI.className='compact-select-wrap';
      sourceUI.innerHTML=selectHtml('answerSourceSelect','',sourceOptions)+`<p class="help">複数ある場合は、今回の回答で最も中心になった情報源を選んでください。</p>`;
      sourceOptionsBox?.before(sourceUI);
      const sourceSelect=document.getElementById('answerSourceSelect');
      sourceSelect?.addEventListener('change',()=>{sourceChecks.forEach(x=>x.checked=false);const hit=Array.from(sourceChecks).find(x=>x.value===sourceSelect.value);if(hit)hit.checked=true;});
    }

    function setBaseRole(value,dispatch=true){
      const baseValue=value==='professional'||value==='post_death_support'?'other_professional':value;
      const radios=Array.from(form.querySelectorAll('input[name="respondent_role"]'));
      radios.forEach(x=>x.checked=x.value===baseValue);
      const hit=radios.find(x=>x.checked);
      if(dispatch&&hit)hit.dispatchEvent(new Event('change',{bubbles:true}));
    }
    function syncProfessionToBase(){
      if(roleSelect.value!=='professional')return;
      const v=professionSelect?.value||'';
      const base=['doctor','nurse','care_worker'].includes(v)?v:'other_professional';
      const radios=Array.from(form.querySelectorAll('input[name="respondent_role"]'));
      radios.forEach(x=>x.checked=x.value===base);
      const hit=radios.find(x=>x.checked);if(hit)hit.dispatchEvent(new Event('change',{bubbles:true}));
      syncPanels();
    }
    function setRecordType(value){
      const radios=Array.from(form.querySelectorAll('input[name="record_type"]'));
      radios.forEach(x=>x.checked=x.value===value);
      const hit=radios.find(x=>x.checked);if(hit)hit.dispatchEvent(new Event('change',{bubbles:true}));
    }
    function syncPanels(){
      const role=roleSelect.value;
      if(familyPanel)familyPanel.classList.toggle('role-hidden',role!=='family');
      if(professionalPanel)professionalPanel.classList.toggle('role-hidden',role!=='professional');
      if(postPanel)postPanel.classList.toggle('role-hidden',role!=='post_death_support');
      const summary=document.getElementById('summaryRole');if(summary)summary.textContent=roleLabels[role]||'—';
    }

    roleSelect.addEventListener('change',()=>{setBaseRole(roleSelect.value);syncPanels();});
    professionSelect?.addEventListener('change',syncProfessionToBase);
    recordSelect?.addEventListener('change',()=>setRecordType(recordSelect.value));

    const hiddenChecked=form.querySelector('input[name="respondent_role"]:checked')?.value||'';
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const requestedRole=hash.get('role')||hiddenChecked;
    if(requestedRole==='patient')roleSelect.value='patient';
    else if(requestedRole==='family')roleSelect.value='family';
    else if(requestedRole){roleSelect.value='professional';if(professionSelect&&professions.some(([v])=>v===requestedRole))professionSelect.value=requestedRole;}
    if(hash.get('role')==='post_death_support')roleSelect.value='post_death_support';
    setBaseRole(roleSelect.value,false);
    if(roleSelect.value==='professional'&&professionSelect?.value)syncProfessionToBase();
    syncPanels();

    /* プレビュー時に、UI上の大分類と詳細属性も明示して残す */
    const previewBtn=document.getElementById('previewBtn');
    if(previewBtn)previewBtn.addEventListener('click',()=>setTimeout(()=>{
      syncPanels();
      const preview=document.getElementById('jsonPreview');if(!preview)return;
      try{
        const data=JSON.parse(preview.textContent||'{}');
        const get=id=>(document.getElementById(id)?.value||'').trim();
        if(data.response)data.response.respondent_role=roleSelect.value||data.response.respondent_role;
        data.respondent_metadata={
          respondent_category:roleSelect.value||undefined,
          relationship:get('relationshipSelect')||undefined,
          family_care_role:get('familyCareSelect')||undefined,
          professional_role_detail:get('professionSelect')||undefined,
          professional_workplace:get('workplaceSelect')||undefined,
          professional_specialty:get('specialtySelect')||undefined,
          case_involvement:roleSelect.value==='post_death_support'?get('postInvolvementSelect'):get('involvementSelect')||undefined,
          case_contact_length:roleSelect.value==='post_death_support'?get('postCaseContactLength'):get('caseContactLength')||undefined,
          post_death_support_role:get('postRoleSelect')||undefined
        };
        Object.keys(data.respondent_metadata).forEach(k=>{if(data.respondent_metadata[k]===undefined||data.respondent_metadata[k]==='')delete data.respondent_metadata[k];});
        preview.textContent=JSON.stringify(data,null,2);
      }catch(_){ }
    },0));

    document.getElementById('resetBtn')?.addEventListener('click',()=>setTimeout(()=>{roleSelect.value='';if(professionSelect)professionSelect.value='';syncPanels();},0));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
