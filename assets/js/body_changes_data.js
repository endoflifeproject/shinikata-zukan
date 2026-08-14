(function(){
  var host=document.querySelector('[data-zukan-topic]');
  if(!host)return;
  var topic=host.getAttribute('data-zukan-topic');
  fetch('assets/data/body_changes_demo.json',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('data '+r.status);return r.json();})
    .then(function(data){
      var t=data.topics&&data.topics[topic];
      if(!t)throw new Error('topic not found');
      var count=Number(t.sample_size||0);
      var html='<div class="zukan-data-head"><div><span class="zukan-data-label">'+esc(data.meta.label)+'</span><h3>図鑑データ｜'+count+'件</h3></div><span class="zukan-data-state">'+(count?'集計表示':'デモ・未接続')+'</span></div>';
      html+='<p class="zukan-data-summary">'+esc(t.summary||'')+'</p>';
      if(t.items&&t.items.length){
        html+='<div class="zukan-data-items">';
        t.items.forEach(function(x){html+='<div class="zukan-data-item"><b>'+esc(x.label||'')+'</b><span>'+esc(String(x.value||''))+'</span></div>';});
        html+='</div>';
      }else{
        html+='<div class="zukan-data-empty">実データが入ると、ここに件数・割合・時期の分布などが表示されます。</div>';
      }
      if(t.quotes&&t.quotes.length){
        html+='<div class="zukan-quotes">';
        t.quotes.slice(0,3).forEach(function(q){html+='<blockquote>'+esc(q)+'</blockquote>';});
        html+='</div>';
      }
      html+='<p class="zukan-data-foot">'+esc(data.meta.note||'')+'</p>';
      host.innerHTML=html;
    })
    .catch(function(){host.innerHTML='<p class="zukan-data-empty">図鑑データを読み込めませんでした。</p>';});
  function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
})();