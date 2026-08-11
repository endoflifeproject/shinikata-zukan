(function(){
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}
  function options(name,type,items){
    return items.map(function(item){
      var value=Array.isArray(item)?item[0]:item;
      var label=Array.isArray(item)?item[1]:item;
      return '<label class="choice"><input type="'+type+'" name="'+name+'" value="'+esc(value)+'"><span>'+esc(label)+'</span></label>';
    }).join('');
  }
  function row(label,id,fallback){
    return '<div class="sumrow"><b>'+esc(label)+'</b><span class="sumval" id="'+id+'">'+(fallback||'未回答')+'</span></div>';
  }

  var step4=document.getElementById('step4');
  if(!step4) return;

  var willSources=[
    '書面に残っている','本人から直接聞いたことがある',
    ['これまでの本人の言葉や行動から、ある程度想像できる','これまでの言葉や行動から想像できる'],
    ['他の家族や身近な人が本人から聞いている','他の家族や身近な人が聞いている'],
    ['手がかりはあるが、今回のことについては分からない','手がかりはあるが、今回は分からない'],
    ['今のところ、手がかりになるものが思い当たらない','今のところ思い当たらない'],
    'この質問には答えたくない'
  ];
  var foodValues=['できるだけ口から食べたい','食べられなくなったら無理をしなくていい','できる治療は受けたい','特に聞いたことはない','この質問には答えたくない'];
  var identityValues=[
    '食べること・食事の楽しみ','家族や大切な人と過ごすこと','人と話したり、つながったりすること',
    '自宅や慣れた場所で過ごすこと','できることは自分ですること','自分のことは自分で決めること',
    '好きなこと・趣味・日課を続けること','家族や周囲の中での役割を持つこと','特に思い当たらない','この質問には答えたくない','その他'
  ];
  var careValues=[
    'できるだけ長く生きること','苦痛やつらさをできるだけ少なくすること','できるだけ口から食べること',
    ['医療処置による負担をできるだけ少なくすること','医療処置による負担を少なくすること'],
    'できる治療や方法をまず試してみること',
    ['状況や本人の負担を見ながら、治療や方法を見直すこと','状況や負担を見ながら見直すこと'],
    '今のところ分からない','この質問には答えたくない','その他'
  ];
  var unknownValues=[
    '今回の治療や栄養について、本人がどう考えるか分からない',
    ['本人がどの程度の治療負担まで受け入れたかったか分からない','どの程度の治療負担まで受け入れたかったか分からない'],
    ['本人がどこで過ごしたかったか分からない','どこで過ごしたかったか分からない'],
    ['本人の希望と、家族として望むことが同じか分からない','本人の希望と、家族の希望が同じか分からない'],
    '家族の中でも考えが違っている','もう少し医療者から説明を聞いて考えたい','今のところ特にない','この質問には答えたくない','その他'
  ];

  step4.innerHTML=`
<section class="hero">
  <span class="kicker">STEP 4｜本人にとって何が大切？</span>
  <h1>「本人なら、何を大事にする？」を一緒に整理する</h1>
  <p class="lead">ここでは胃ろうを「する／しない」と決めません。ご本人について分かっていること、これまで大切にしてきたこと、まだ分からないことを整理して、STEP3で見た医学情報と一緒に医療者へ伝えられる形にします。</p>
  <div class="notice"><b>ここで決定しなくて大丈夫です。</b> 「分からない」「迷っている」「答えたくない」も大切な回答です。ご本人の代わりに答えを決める必要はありません。</div>
</section>
<section class="section">
  <h2>ご本人を理解するための5つの問い</h2>

  <div class="accordion">
    <button class="acc-head" onclick="toggleAcc(this)" type="button"><span>1｜ご本人の希望を知る手がかりはありますか？<small>書面・本人から聞いた言葉・これまでの言動など。複数選んで構いません</small></span><span>⌃</span></button>
    <div class="acc-body">
      <div class="q"><div class="qtitle">手がかりになりそうなものを選んでください。（複数選択可）</div><div class="hint">はっきりした希望でなくても、思い当たるものがあれば大丈夫です。</div><div class="opts">${options('s4_will_sources','checkbox',willSources)}</div></div>
      <div class="q"><div class="qtitle">それらを踏まえて、今回の「食べること・栄養」について、ご本人がどう考えるかはどのくらい分かりそうですか？</div><div class="opts">${options('s4_will_clarity','radio',['かなり分かりそう','ある程度分かりそう','判断が難しい','ほとんど分からない','この質問には答えたくない'])}</div></div>
    </div>
  </div>

  <div class="accordion">
    <button class="acc-head" onclick="toggleAcc(this)" type="button"><span>2｜これまでに、食べることについて何か話していましたか？<small>覚えているご本人の言葉があれば、そのまま残します</small></span><span>⌃</span></button>
    <div class="acc-body">
      <div class="q"><div class="qtitle">近いものがあれば選んでください。（複数選択可）</div><div class="opts" id="s4FoodValues">${options('s4_food_values','checkbox',foodValues)}</div></div>
      <div class="q"><div class="qtitle">ご本人の言葉で覚えていること</div><textarea id="s4_food_memory" placeholder="例：「食べることが一番の楽しみ」「食べられなくなったら無理はしなくていい」など"></textarea></div>
    </div>
  </div>

  <div class="accordion">
    <button class="acc-head" onclick="toggleAcc(this)" type="button"><span>3｜これまでの暮らしで、ご本人が大切にしていたことは？<small>今回の治療だけでなく、その人らしい暮らしや人との関わりを思い浮かべます</small></span><span>⌃</span></button>
    <div class="acc-body">
      <div class="q"><div class="qtitle">近いものを選んでください。（複数選択可）</div><div class="opts" id="s4IdentityValues">${options('s4_identity_values','checkbox',identityValues)}</div></div>
      <div class="q"><div class="qtitle">その他、ご本人らしさを感じることや、大切にしていたこと</div><textarea id="s4_identity_other" placeholder="例：毎朝庭を見るのが好きだった／孫と過ごす時間を大切にしていた／自分のことは自分で決めたいと言っていた など"></textarea></div>
    </div>
  </div>

  <div class="accordion">
    <button class="acc-head" onclick="toggleAcc(this)" type="button"><span>4｜今回の医療・ケアで、ご本人が大切にしそうなことは？<small>二者択一ではありません。両立したいことや、まず試して見直す考え方も選べます</small></span><span>⌃</span></button>
    <div class="acc-body">
      <div class="q"><div class="qtitle">近いと思うものを選んでください。（複数選択可）</div><div class="opts">${options('s4_care_values','checkbox',careValues)}</div></div>
      <div class="q"><div class="qtitle">その他、今回大切にしそうだと思うこと</div><textarea id="s4_care_other" placeholder="例：家族と過ごせること／一度試して、負担が大きければやめたい など"></textarea></div>
    </div>
  </div>

  <div class="accordion">
    <button class="acc-head" onclick="toggleAcc(this)" type="button"><span>5｜ここまで考えて、まだ分からないことや迷うことは？<small>分からないことを、そのまま医療者との話し合いに持っていきます</small></span><span>⌃</span></button>
    <div class="acc-body">
      <div class="q"><div class="hint">分からないことが残っていても大丈夫です。ご本人の代わりに答えを決める必要はありません。</div><div class="opts">${options('s4_unknowns','checkbox',unknownValues)}</div></div>
      <div class="q"><div class="qtitle">医療者と一緒に考えたいこと、確認したいこと</div><textarea id="s4_unknown_other" placeholder="例：今すぐ決める必要があるのか／試してから見直すことはできるのか など"></textarea></div>
      <div class="q"><div class="qtitle">もし、ご本人のこれまでの言葉や人柄から、今回のことについて思い浮かぶ言葉があれば</div><div class="hint">任意です。思い浮かばなければ、書かなくて大丈夫です。</div><textarea id="s4_imagined_voice" placeholder="例：「無理をしすぎなくていい」「できることはやってほしい」など"></textarea></div>
    </div>
  </div>

  <div class="softcard family" style="margin-top:14px">
    <h3>ここまで考えて、今の気持ちに近いもの</h3><div class="hint">これは最終決定ではありません。今の時点での「現在地」を残します。</div>
    <div class="opts">${options('s4_current_position','radio',['人工栄養を検討したい','口から食べることを中心に考えたい','まだ決められない',['もっと医学情報を知ってから考えたい','もっと医学情報を知りたい'],'家族で話したい','医療者と相談したい'])}</div>
  </div>
  <div class="bottomnav"><button class="btn secondary" onclick="goStep(3)" type="button">← STEP 3へ</button><div class="nextcopy">次は、ここまで分かったことと「まだ分からないこと」を、医療者と一緒に考えるための1枚にまとめます。</div><button class="btn primary bigbtn" onclick="goStep(5)" type="button">STEP 5へ →</button></div>
</section>`;

  try{
    var raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      var data=JSON.parse(raw), saved=data.inputs||{};
      document.querySelectorAll('#step4 input,#step4 textarea').forEach(function(el){
        var key=inputKey(el); if(!key || !(key in saved)) return;
        if(el.type==='radio'||el.type==='checkbox') el.checked=!!saved[key]; else el.value=saved[key]||'';
      });
    }
  }catch(e){}

  var clarity=document.getElementById('f-willclarity');
  if(clarity && !document.getElementById('f-willsources')) clarity.closest('.sumrow').insertAdjacentHTML('beforebegin',row('本人の希望を知る手がかり','f-willsources'));

  var identity=document.getElementById('f-identity');
  if(identity){ var b=identity.closest('.sumrow').querySelector('b'); if(b)b.textContent='これまでの暮らしで大切にしていたこと'; }
  var imagined=document.getElementById('f-imagined');
  if(imagined){ var ib=imagined.closest('.sumrow').querySelector('b'); if(ib)ib.textContent='今回について思い浮かぶ本人の言葉（任意）'; }
  var scale=document.getElementById('f-scale'); if(scale) scale.closest('.sumrow').remove();
  var identityOther=document.getElementById('f-identityother');
  if(identityOther && !document.getElementById('f-carevalues')) identityOther.closest('.sumrow').insertAdjacentHTML('afterend',row('今回の医療・ケアで大切にしそうなこと','f-carevalues')+row('その他、今回大切にしそうなこと','f-careother','未記入'));

  var qrow=document.getElementById('f-questions');
  if(qrow && !document.getElementById('f-step4questions')) qrow.closest('.sumrow').insertAdjacentHTML('afterend',row('STEP4で医療者と一緒に考えたいこと','f-step4questions','未記入'));

  var oldUpdate=updateFinalSummary;
  updateFinalSummary=function(){
    try{ oldUpdate(); }catch(e){}
    var sources=multiByName('s4_will_sources');
    var care=multiByName('s4_care_values');
    var unknowns4=multiByName('s4_unknowns');
    setFinal('f-willsources',sources.length?sources.join('、'):'未回答');
    setFinal('f-carevalues',care.length?care.join('、'):'未回答');
    setFinal('f-careother',txt('s4_care_other'),'未記入');
    setFinal('f-step4questions',txt('s4_unknown_other'),'未記入');

    var unknown=[];
    var clarityNow=sel('s4_will_clarity');
    if(['判断が難しい','ほとんど分からない','この質問には答えたくない'].includes(clarityNow)) unknown.push('今回についてどのくらい分かりそうか：'+clarityNow);
    if(sources.includes('手がかりはあるが、今回のことについては分からない')) unknown.push('希望の手がかりはあるが、今回については分からない');
    if(sources.includes('今のところ、手がかりになるものが思い当たらない')) unknown.push('希望の手がかりが今のところ思い当たらない');
    unknowns4.forEach(function(v){ if(v!=='今のところ特にない') unknown.push(v); });
    var other=txt('s4_unknown_other'); if(other!=='未記入') unknown.push('医療者と一緒に考えたいこと：'+other);
    var box=document.getElementById('f-unknown-person');
    if(box) box.innerHTML=unknown.length?'<ul style="margin:0 0 0 18px;padding:0">'+unknown.map(function(x){return '<li>'+escapeHtml(x)+'</li>';}).join('')+'</ul>':'今のところ、明確な「分からない・迷っている」の回答はありません。';
  };

  document.addEventListener('input',function(){ if(currentStep===5) updateFinalSummary(); });
  document.addEventListener('change',function(){ if(currentStep===5) updateFinalSummary(); });
  updateFinalSummary();
})();
