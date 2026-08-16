(function(){
  function init(){
    const form=document.getElementById('caseForm');
    const setup=document.getElementById('setup');
    if(!form||!setup||document.documentElement.dataset.roleExtensionReady)return;
    document.documentElement.dataset.roleExtensionReady='1';

    const roles=[
      ['patient','本人'],['family','家族・身近な人'],['doctor','医師'],['nurse','看護師'],
      ['nursing_assistant','看護助手・看護補助者'],['care_worker','介護職'],
      ['other_professional','その他医療・福祉職'],['post_death_support','死後の手続き・身元保証等を支援した人']
    ];
    const roleLabels=Object.fromEntries(roles);
    const family=[['partner','配偶者・パートナー'],['daughter','娘'],['son','息子'],['child_spouse','子の配偶者（嫁・婿など）'],['parent','親'],['grandchild','孫'],['sibling','きょうだい'],['other_relative','その他の親族'],['friend','友人・知人'],['other','その他']];
    const professions=[['doctor','医師'],['nurse','看護師'],['nursing_assistant','看護助手・看護補助者'],['care_worker','介護福祉士・介護職員'],['care_manager','ケアマネジャー'],['rehab_pt','理学療法士（PT）'],['rehab_ot','作業療法士（OT）'],['rehab_st','言語聴覚士（ST）'],['pharmacist','薬剤師'],['msw','MSW・医療ソーシャルワーカー'],['social_worker','社会福祉士・相談員'],['community_support','地域包括支援センター職員'],['public_official','行政・福祉職'],['other','その他']];
    const specialties=[['general','総合診療・一般内科'],['respiratory','呼吸器内科・呼吸器外科'],['gastro','消化器内科・消化器外科'],['cardio','循環器内科・心臓血管外科'],['neuro','脳神経内科・脳神経外科'],['renal','腎臓内科・透析'],['hematology','血液内科'],['oncology','腫瘍内科・がん診療'],['orthopedics','整形外科'],['psychiatry','精神科・心療内科'],['emergency','救急科'],['icu','集中治療'],['geriatrics','老年医学・高齢者医療'],['palliative','緩和ケア'],['home','在宅・訪問診療'],['rehab','リハビリテーション'],['other','その他'],['none','特定の診療科には属していない']];
    const workplaces=[['acute_hospital','急性期病院'],['recovery_hospital','回復期病院'],['chronic_hospital','慢性期・療養病院'],['clinic','診療所・クリニック'],['emergency_icu','救急・ICU'],['home_medicine','在宅医療・訪問診療'],['home_nursing','訪問看護'],['palliative_hospice','緩和ケア病棟・ホスピス'],['tokuyo','特別養護老人ホーム（特養）'],['roken','介護老人保健施設（老健）'],['kaigo_iryouin','介護医療院'],['paid_home','有料老人ホーム'],['sakoju','サービス付き高齢者向け住宅'],['group_home','グループホーム'],['small_multifunction','小規模多機能'],['day_service','デイサービス'],['home_help','訪問介護'],['care_management','居宅介護支援'],['community_center','地域包括支援センター'],['other','その他']];
    const involvement=[['primary','主に担当していた'],['continuous','継続的に関わった'],['temporary','一時的に関わった'],['final_stage','最期の時期のみ関わった'],['post_death','死後の支援で関わった'],['other','その他']];
    const postDeath=[['lifetime_support','高齢者等終身サポート事業者'],['post_death_mandate','死後事務の受任者'],['guardian','成年後見等の支援者'],['public_welfare','行政・福祉関係者'],['funeral_related','葬送・葬儀等の支援者'],['other','その他']];
    const familyCare=[['main','主な介護者だった'],['shared','他の人と分担していた'],['support','補助的に関わった'],['little','介護にはほぼ関わっていない'],['unknown','分からない・答えたくない']];

    const radio=(name,items,prefix)=>items.map(([v,l])=>`<div class="choice"><input type="radio" name="${name}" id="${prefix}_${v}" value="${v}"><label for="${prefix}_${v}">${l}</label></div>`).join('');
    const checks=(name,items,prefix)=>items.map(([v,l])=>`<div class="choice"><input type="checkbox" name="${name}" id="${prefix}_${v}" value="${v}"><label for="${prefix}_${v}">${l}</label></div>`).join('');

    const roleBox=form.querySelector('input[name="respondent_role"]')?.closest('.options');
    if(roleBox)roleBox.innerHTML=radio('respondent_role',roles,'role');

    const familyPanel=setup.querySelector('[data-role-panel="family"]');
    if(familyPanel)familyPanel.innerHTML=`<h3>ご本人との関係</h3><p class="intro">同じ「家族」でも、続柄と介護への関わり方を分けて記録します。</p><div class="options three">${radio('relationship',family,'rel')}</div><div class="field"><label>介護への関わり（任意）</label><div class="options three">${radio('family_care_role',familyCare,'famcare')}</div></div>`;

    const professionalPanel=setup.querySelector('[data-role-panel="professional"]');
    if(professionalPanel&&!document.getElementById('professionalDetail'))professionalPanel.insertAdjacentHTML('beforeend',`<div id="professionalDetail"><div class="divider"></div><h3>職種・所属・関わり方</h3><p class="intro">「誰が、どこで、どの領域から、どの程度この症例を見ていたか」を分けて記録します。</p><div class="field"><label>職種</label><div class="options three">${radio('professional_role_detail',professions,'profdetail')}</div></div><div class="field"><label>主な勤務・活動の場（複数可）</label><div class="options three">${checks('professional_workplace',workplaces,'workplace')}</div></div><div class="field"><label>主に関わっている診療科・専門領域（複数可）</label><div class="options three">${checks('professional_specialty',specialties,'specialty')}</div></div><div class="field"><label>この症例との関わり方</label><div class="options three">${radio('case_involvement',involvement,'involve')}</div></div><div class="field"><label for="caseContactLength">この方との関わりの長さ（任意）</label><input id="caseContactLength" type="text" name="case_contact_length" maxlength="80" placeholder="例：救急搬送時のみ／数日／6か月／3年間 など"></div></div>`);

    let postPanel=setup.querySelector('[data-role-panel="post_death_support"]');
    if(!postPanel){
      postPanel=document.createElement('div');postPanel.className='subpanel role-hidden';postPanel.dataset.rolePanel='post_death_support';
      postPanel.innerHTML=`<h3>死後の手続き・身元保証等での立場</h3><p class="intro">家族以外が、身元保証・死後事務・葬送・行政手続きなどを支えたケースも記録できます。</p><div class="options three">${radio('post_death_support_role',postDeath,'postdeath')}</div><div class="field"><label>この症例との関わり方</label><div class="options three">${radio('case_involvement',involvement,'postinvolve')}</div></div><div class="field"><label for="postCaseContactLength">この方との関わりの長さ（任意）</label><input id="postCaseContactLength" type="text" name="case_contact_length" maxlength="80" placeholder="例：生前から2年／死後事務のみ など"></div>`;
      const sourceField=Array.from(setup.querySelectorAll('.field')).find(x=>x.textContent.includes('この回答の情報源'));
      if(sourceField)sourceField.before(postPanel);else setup.appendChild(postPanel);
    }

    const proRoles=new Set(['doctor','nurse','nursing_assistant','care_worker','other_professional']);
    const roleGroup=role=>role==='family'?'family':(proRoles.has(role)||role==='post_death_support'?'professional':'patient');
    function autoProfession(role){
      if(!['doctor','nurse','nursing_assistant','care_worker'].includes(role))return;
      const el=form.querySelector(`input[name="professional_role_detail"][value="${role}"]`);
      if(el&&!form.querySelector('input[name="professional_role_detail"]:checked'))el.checked=true;
    }
    function sync(){
      const role=form.querySelector('input[name="respondent_role"]:checked')?.value||'';
      const group=roleGroup(role);
      document.querySelectorAll('[data-role-panel]').forEach(panel=>{
        if(panel.closest('#setup'))return;
        panel.classList.toggle('role-hidden',panel.dataset.rolePanel!==group);
      });
      if(familyPanel)familyPanel.classList.toggle('role-hidden',role!=='family');
      if(professionalPanel)professionalPanel.classList.toggle('role-hidden',!proRoles.has(role));
      if(postPanel)postPanel.classList.toggle('role-hidden',role!=='post_death_support');
      const summary=document.getElementById('summaryRole');if(summary)summary.textContent=roleLabels[role]||'—';
      autoProfession(role);
    }

    form.addEventListener('change',e=>{if(e.target.name==='respondent_role')sync();});

    const previewBtn=document.getElementById('previewBtn');
    if(previewBtn)previewBtn.addEventListener('click',()=>setTimeout(()=>{
      const preview=document.getElementById('jsonPreview');if(!preview)return;
      try{
        const data=JSON.parse(preview.textContent||'{}');
        const values=name=>Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map(x=>x.value);
        const one=name=>form.querySelector(`[name="${name}"]:checked`)?.value||'';
        data.respondent_metadata={
          family_care_role:one('family_care_role')||undefined,
          professional_role_detail:one('professional_role_detail')||undefined,
          professional_workplace:values('professional_workplace'),
          professional_specialty:values('professional_specialty'),
          case_involvement:one('case_involvement')||undefined,
          case_contact_length:(form.querySelector('[name="case_contact_length"]:not(.role-hidden *)')?.value||'').trim()||undefined,
          post_death_support_role:one('post_death_support_role')||undefined
        };
        Object.keys(data.respondent_metadata).forEach(k=>{const v=data.respondent_metadata[k];if(v===undefined||(Array.isArray(v)&&!v.length))delete data.respondent_metadata[k];});
        preview.textContent=JSON.stringify(data,null,2);
      }catch(_){ }
    },0));

    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const requestedRole=hash.get('role');
    if(requestedRole&&roleLabels[requestedRole]){
      const el=form.querySelector(`input[name="respondent_role"][value="${requestedRole}"]`);if(el)el.checked=true;
    }
    sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
