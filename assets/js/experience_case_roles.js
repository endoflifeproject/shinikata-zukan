(function(){
  const form=document.getElementById('caseForm');
  const setup=document.getElementById('setup');
  if(!form||!setup)return;

  const roles={
    patient:'本人',family:'家族・身近な人',doctor:'医師',nurse:'看護師',nursing_assistant:'看護助手・看護補助者',care_worker:'介護職',other_professional:'その他医療・福祉職',post_death_support:'死後の手続き・身元保証等を支援した人'
  };
  const family=[['partner','配偶者・パートナー'],['daughter','娘'],['son','息子'],['child_spouse','子の配偶者（嫁・婿など）'],['parent','親'],['grandchild','孫'],['sibling','きょうだい'],['other_relative','その他の親族'],['friend','友人・知人'],['other','その他']];
  const professions=[['doctor','医師'],['nurse','看護師'],['nursing_assistant','看護助手・看護補助者'],['care_worker','介護福祉士・介護職員'],['care_manager','ケアマネジャー'],['rehab_pt','理学療法士（PT）'],['rehab_ot','作業療法士（OT）'],['rehab_st','言語聴覚士（ST）'],['pharmacist','薬剤師'],['msw','MSW・医療ソーシャルワーカー'],['social_worker','社会福祉士・相談員'],['community_support','地域包括支援センター職員'],['public_official','行政・福祉職'],['other','その他']];
  const specialties=[['general','総合診療・一般内科'],['respiratory','呼吸器内科・呼吸器外科'],['gastro','消化器内科・消化器外科'],['cardio','循環器内科・心臓血管外科'],['neuro','脳神経内科・脳神経外科'],['renal','腎臓内科・透析'],['hematology','血液内科'],['oncology','腫瘍内科・がん診療'],['orthopedics','整形外科'],['psychiatry','精神科・心療内科'],['emergency','救急科'],['icu','集中治療'],['geriatrics','老年医学・高齢者医療'],['palliative','緩和ケア'],['home','在宅・訪問診療'],['rehab','リハビリテーション'],['other','その他'],['none','特定の診療科には属していない']];
  const workplaces=[['acute_hospital','急性期病院'],['recovery_hospital','回復期病院'],['chronic_hospital','慢性期・療養病院'],['clinic','診療所・クリニック'],['emergency_icu','救急・ICU'],['home_medicine','在宅医療・訪問診療'],['home_nursing','訪問看護'],['palliative_hospice','緩和ケア病棟・ホスピス'],['tokuyo','特別養護老人ホーム（特養）'],['roken','介護老人保健施設（老健）'],['kaigo_iryouin','介護医療院'],['paid_home','有料老人ホーム'],['sakoju','サービス付き高齢者向け住宅'],['group_home','グループホーム'],['small_multifunction','小規模多機能'],['day_service','デイサービス'],['home_help','訪問介護'],['care_management','居宅介護支援'],['community_center','地域包括支援センター'],['other','その他']];
  const involvement=[['primary','主に担当していた'],['continuous','継続的に関わった'],['temporary','一時的に関わった'],['final_stage','最期の時期のみ関わった'],['post_death','死後の支援で関わった'],['other','その他']];
  const postDeath=[['lifetime_support','高齢者等終身サポート事業者'],['post_death_mandate','死後事務の受任者'],['guardian','成年後見等の支援者'],['public_welfare','行政・福祉関係者'],['funeral_related','葬送・葬儀等の支援者'],['other','その他']];
  function radio(name,items,prefix){return items.map(([v,l])=>`<div class="choice"><input type="radio" name="${name}" id="${prefix}_${v}" value="${v}"><label for="${prefix}_${v}">${l}</label></div>`).join('')}
  function checks(name,items,prefix){return items.map(([v,l])=>`<div class="choice"><input type="checkbox" name="${name}" id="${prefix}_${v}" value="${v}"><label for="${prefix}_${v}">${l}</label></div>`).join('')}

  const roleBox=form.querySelector('input[name="respondent_role"]')?.closest('.options');
  if(roleBox){
    roleBox.innerHTML=Object.entries(roles).map(([v,l])=>`<div class="choice"><input type="radio" name="respondent_role" id="role_${v}" value="${v}"><label for="role_${v}">${l}</label></div>`).join('');
  }
  const oldFamily=setup.querySelector('[data-role-panel="family"]');
  if(oldFamily) oldFamily.innerHTML='<h3>ご本人との関係</h3><p class="intro">同じ「家族」でも、続柄や介護への関わり方を分けて記録します。</p><div class="options three">'+radio('relationship',family,'rel')+'</div><div class="field"><label>介護への関わり（任意）</label><div class="options three">'+radio('family_care_role',[['main','主な介護者だった'],['shared','他の人と分担していた'],['support','補助的に関わった'],['little','介護にはほぼ関わっていない'],['unknown','分からない・答えたくない']],'famcare')+'</div></div>';

  const professional=setup.querySelector('[data-role-panel="professional"]');
  if(professional){
    professional.insertAdjacentHTML('beforeend',`<div id="professionalDetail"><div class="divider"></div><h3>職種・所属・関わり方</h3><p class="intro">「誰が、どこで、どの領域から、どの程度この症例を見ていたか」を分けて記録します。</p><div class="field"><label>職種</label><div class="options three">${radio('professional_role_detail',professions,'profdetail')}</div></div><div class="field"><label>主な勤務・活動の場（複数可）</label><div class="options three">${checks('professional_workplace',workplaces,'workplace')}</div></div><div class="field"><label>主に関わっている診療科・専門領域（複数可）</label><div class="options three">${checks('professional_specialty',specialties,'specialty')}</div></div><div class="field"><label>この症例との関わり方</label><div class="options three">${radio('case_involvement',involvement,'involve')}</div></div><div class="field"><label for="caseContactLength">この方との関わりの長さ（任意）</label><input id="caseContactLength" type="text" name="case_contact_length" maxlength="80" placeholder="例：救急搬送時のみ／数日／6か月／3年間 など"></div></div>`);
  }
  const post=document.createElement('div');post.className='subpanel role-hidden';post.dataset.rolePanel='post_death_support';post.innerHTML='<h3>死後の手続き・身元保証等での立場</h3><p class="intro">家族以外が、身元保証・死後事務・葬送・行政手続きなどを支えたケースも記録できます。</p><div class="options three">'+radio('post_death_support_role',postDeath,'postdeath')+'</div><div class="field"><label>この症例との関わり方</label><div class="options three">'+radio('case_involvement',involvement,'postinvolve')+'</div></div>';
  const sourceField=Array.from(setup.querySelectorAll('.field')).find(x=>x.textContent.includes('この回答の情報源'));
  if(sourceField) sourceField.before(post); else setup.appendChild(post);

  function sync(){
    const role=form.querySelector('input[name="respondent_role"]:checked')?.value||'';
    setup.querySelectorAll('[data-role-panel]').forEach(p=>p.classList.add('role-hidden'));
    if(role==='family')setup.querySelector('[data-role-panel="family"]')?.classList.remove('role-hidden');
    if(['doctor','nurse','nursing_assistant','care_worker','other_professional'].includes(role))setup.querySelector('[data-role-panel="professional"]')?.classList.remove('role-hidden');
    if(role==='post_death_support')post.classList.remove('role-hidden');
    const detail=form.querySelector('input[name="professional_role_detail"]:checked');
    if(['doctor','nurse','nursing_assistant','care_worker'].includes(role)&&detail&&!detail.dataset.touched){
      detail.checked=false;
    }
  }
  form.addEventListener('change',e=>{if(e.target.name==='respondent_role')sync();if(e.target.name==='professional_role_detail')e.target.dataset.touched='1';});
  sync();
})();
