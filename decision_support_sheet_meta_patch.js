(function(){
  var finalSheet=document.getElementById('finalSheet');
  if(!finalSheet || document.getElementById('sheetMetaEditor')) return;

  var style=document.createElement('style');
  style.id='sheetMetaStyles';
  style.textContent=`
    .sheet-meta-editor{margin:10px 0 12px;border:1px solid #cbd9e4;border-radius:12px;background:#f8fbfd;padding:12px}
    .sheet-meta-editor h3{margin:0 0 3px;color:#28577f}
    .sheet-meta-note{font-size:10px;color:#687b8d;margin-bottom:9px}
    .sheet-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px}
    .sheet-meta-field label{display:block;font-size:10px;font-weight:800;color:#567086;margin-bottom:3px}
    .sheet-meta-field input,.sheet-meta-field select{width:100%;border:1px solid #bdd0df;border-radius:8px;padding:8px 9px;background:#fff;color:#233547;font:inherit;font-size:12px}
    .sheet-meta-print{display:none}
    @media(max-width:620px){.sheet-meta-grid{grid-template-columns:1fr}}
    @media print{
      .sheet-meta-print{display:grid!important;grid-template-columns:1.2fr 1fr 1fr;gap:2px 9px;border:1px solid #bccbd6;border-radius:5px;padding:4px 6px;margin:4px 0 6px;font-size:7.6px;line-height:1.2;color:#28465f}
      .sheet-meta-print b{font-size:7px;color:#567086;margin-right:3px}
      body.print-step5 #step5 .sheet{padding:9px!important;font-size:8.1px!important;line-height:1.26!important}
      body.print-step5 #step5 .softcard{padding:7px!important}
      body.print-step5 #step5 .softcard h3{font-size:10.5px!important;margin-bottom:2px!important}
      body.print-step5 #step5 .sumrow{padding:2px 0!important;font-size:8px!important}
      body.print-step5 #step5 .sumrow b{font-size:7.4px!important;margin-bottom:0!important}
      body.print-step5 #step5 .cols2{gap:0 12px!important;margin-top:7px!important}
      body.print-step5 #step5 .research-note{margin-top:5px!important;font-size:6.9px!important;line-height:1.2!important}
      body.print-step5 #step5 .sheet-head{margin-bottom:0!important}
      body.print-step5 #step5 .sheet h2{font-size:15px!important;margin-bottom:1px!important}
      body.print-step5 #step5 ul.micro{margin-top:4px!important;margin-bottom:0!important}
    }
  `;
  document.head.appendChild(style);

  var editor=document.createElement('div');
  editor.id='sheetMetaEditor';
  editor.className='sheet-meta-editor no-print';
  editor.innerHTML=`
    <h3>このシートについて</h3>
    <div class="sheet-meta-note">お名前は任意です。入力内容はこの端末のブラウザ内に保存されます。PDFに保存・共有する場合は、個人情報の取り扱いにご注意ください。</div>
    <div class="sheet-meta-grid">
      <div class="sheet-meta-field"><label for="sheet_patient_name">対象となるご本人のお名前（任意）</label><input type="text" id="sheet_patient_name" placeholder="例：山田 太郎"></div>
      <div class="sheet-meta-field"><label for="sheet_writer_name">このシートを記入した方のお名前（任意）</label><input type="text" id="sheet_writer_name" placeholder="例：山田 花子"></div>
      <div class="sheet-meta-field"><label for="sheet_writer_relation">ご本人との関係</label><select id="sheet_writer_relation"><option value="">選択してください</option><option>本人</option><option>配偶者・パートナー</option><option>子</option><option>きょうだい</option><option>親</option><option>その他の親族</option><option>友人・知人</option><option>医療・介護職</option><option>その他</option></select></div>
      <div class="sheet-meta-field"><label for="sheet_date">記入日</label><input type="date" id="sheet_date"></div>
      <div class="sheet-meta-field" style="grid-column:1/-1"><label for="sheet_with_others">ほかに一緒に考えた方（任意）</label><input type="text" id="sheet_with_others" placeholder="例：本人の妻・次女／家族で相談して記入 など"></div>
    </div>
  `;

  var printMeta=document.createElement('div');
  printMeta.id='sheetMetaPrint';
  printMeta.className='sheet-meta-print';
  printMeta.innerHTML=`
    <span><b>対象者</b><span id="pm_patient">―</span></span>
    <span><b>記入者</b><span id="pm_writer">―</span></span>
    <span><b>本人との関係</b><span id="pm_relation">―</span></span>
    <span><b>記入日</b><span id="pm_date">―</span></span>
    <span style="grid-column:2/-1"><b>一緒に考えた方</b><span id="pm_others">―</span></span>
  `;

  var sheetHead=finalSheet.querySelector('.sheet-head');
  if(sheetHead){
    sheetHead.insertAdjacentElement('afterend',printMeta);
    printMeta.insertAdjacentElement('afterend',editor);
  }else{
    finalSheet.prepend(editor);
    finalSheet.prepend(printMeta);
  }

  function todayLocal(){
    var d=new Date();
    var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }
  function displayDate(v){
    if(!v) return '―';
    var parts=v.split('-');
    if(parts.length!==3) return v;
    return Number(parts[0])+'年'+Number(parts[1])+'月'+Number(parts[2])+'日';
  }
  function val(id){
    var el=document.getElementById(id);
    return el && String(el.value||'').trim()?String(el.value).trim():'―';
  }
  function setText(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}
  function updateMeta(){
    setText('pm_patient',val('sheet_patient_name'));
    setText('pm_writer',val('sheet_writer_name'));
    setText('pm_relation',val('sheet_writer_relation'));
    var dateEl=document.getElementById('sheet_date');
    setText('pm_date',displayDate(dateEl?dateEl.value:''));
    setText('pm_others',val('sheet_with_others'));
  }

  try{
    var raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      var data=JSON.parse(raw),saved=data.inputs||{};
      editor.querySelectorAll('input,select').forEach(function(el){
        var key=(typeof inputKey==='function')?inputKey(el):(el.id?'id|'+el.id:null);
        if(key && key in saved) el.value=saved[key]||'';
      });
    }
  }catch(e){}

  var dateInput=document.getElementById('sheet_date');
  if(dateInput && !dateInput.value) dateInput.value=todayLocal();

  var previousUpdate=window.updateFinalSummary;
  window.updateFinalSummary=function(){
    if(typeof previousUpdate==='function'){
      try{previousUpdate();}catch(e){}
    }
    updateMeta();
  };

  editor.addEventListener('input',function(){
    updateMeta();
    try{savePrototypeState();}catch(e){}
  });
  editor.addEventListener('change',function(){
    updateMeta();
    try{savePrototypeState();}catch(e){}
  });

  updateMeta();
  try{savePrototypeState();}catch(e){}
})();
