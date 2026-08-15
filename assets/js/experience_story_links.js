(function(){
  const params=new URLSearchParams(location.search);
  const requested=params.get('story')||'dementia';
  const conditions={dementia:'認知症',lung:'肺がん'};
  const condition=conditions[requested]||'その他';
  const themes=[
    {label:'治療・介護',section:'care',desc:'治療・ケア・介護・支援'},
    {label:'苦痛',section:'suffering',desc:'本人の身体・精神・全体のつらさ'},
    {label:'費用',section:'cost',desc:'医療費・収入減・貯蓄・保険'},
    {label:'意思決定',section:'decision',desc:'何を決め、誰と相談し、何を見たか'},
    {label:'振り返り',section:'reflection',desc:'納得・後悔・助け・想像とのズレ'}
  ];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hrefFor=theme=>`experience_read.html?condition=${encodeURIComponent(condition)}&theme=${encodeURIComponent(theme)}#results`;

  const style=document.createElement('style');
  style.textContent=`
    .story-crossnav{margin:14px 0 16px;border:1px solid #d7e3eb;background:#fbfdfe;border-radius:16px;padding:13px 15px}
    .story-crossnav-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
    .story-crossnav-head b{font-family:"Yu Mincho","Hiragino Mincho ProN",serif;color:#315d7d;font-size:13px}
    .story-crossnav-head span{font-size:8px;color:#87959e}
    .story-crossnav-links{display:flex;gap:6px;flex-wrap:wrap}
    .story-crossnav-links a{border:1px solid #d2dfe7;border-radius:999px;background:#fff;padding:6px 9px;font-size:9px;color:#416983;font-weight:800}
    .story-crossnav-links a:hover,.story-crossnav-links a.active{background:#183f68;border-color:#183f68;color:#fff}
    .story-theme-more{margin-top:14px;padding-top:12px;border-top:1px solid #e7edf1;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .story-theme-more span{font-size:8.5px;color:#84929c}
    .story-theme-more a{display:inline-flex;align-items:center;gap:6px;border:1px solid #cbdce7;background:#f8fbfd;border-radius:999px;padding:7px 11px;color:#315f82;font-size:9px;font-weight:900}
    .story-theme-more a:hover{background:#edf5fb;border-color:#9cbcd1}
    .story-theme-anchor{scroll-margin-top:82px}
    @media(max-width:640px){.story-crossnav-head{display:block}.story-crossnav-head span{display:block;margin-top:2px}.story-crossnav-links a{flex:1 1 calc(50% - 6px);text-align:center}.story-theme-more a{width:100%;justify-content:center}}
  `;
  document.head.appendChild(style);

  const layout=document.querySelector('.layout');
  if(layout&&!document.querySelector('.story-crossnav')){
    const nav=document.createElement('div');
    nav.className='story-crossnav';
    nav.innerHTML=`<div class="story-crossnav-head"><b>${esc(condition)}の体験を、テーマ別に見る</b><span>今見ている疾患を保ったまま一覧へ戻れます</span></div><div class="story-crossnav-links">${themes.map(t=>`<a href="${hrefFor(t.label)}" data-theme="${esc(t.label)}">${esc(t.label)}</a>`).join('')}</div>`;
    layout.before(nav);
  }

  themes.forEach(t=>{
    const section=document.getElementById(t.section);
    if(!section)return;
    section.classList.add('story-theme-anchor');
    if(section.querySelector('.story-theme-more'))return;
    const more=document.createElement('div');
    more.className='story-theme-more';
    more.innerHTML=`<span>${esc(t.desc)}について、ほかの人の体験も見る</span><a href="${hrefFor(t.label)}">同じ ${esc(condition)} × ${esc(t.label)} の体験談を見る →</a>`;
    section.appendChild(more);
  });

  const currentTheme=params.get('theme');
  if(currentTheme){
    const item=themes.find(t=>t.label===currentTheme);
    document.querySelectorAll('.story-crossnav-links a').forEach(a=>a.classList.toggle('active',a.dataset.theme===currentTheme));
    if(item){
      requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(item.section)?.scrollIntoView({behavior:'smooth',block:'start'})));
    }
  }
})();
