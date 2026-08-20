(function(){
  var main=document.querySelector('main');
  if(!main||document.querySelector('.home-life-preview')) return;
  var flow=main.querySelector('.flow');
  var howto=flow?flow.closest('.section'):null;
  var section=document.createElement('section');
  section.className='home-life-preview';
  section.setAttribute('aria-labelledby','home-life-title');
  section.innerHTML='\
    <div class="home-life-head">\
      <div><span class="route-tag">LIFE STORIES / DEMO</span><h2 id="home-life-title">みんなは、どう過ごしている？</h2><p>治療や介護だけじゃない。趣味、旅行、家族、介護の工夫。暮らしの記録をのぞいてみる。</p></div>\
      <a class="home-life-more" href="life_feed_demo.html">もっと見る <span>→</span></a>\
    </div>\
    <div class="home-life-grid">\
      <a class="home-life-card" href="life_feed_demo.html"><div class="home-life-photo"><img src="demo-ai-gardening-balcony.png" alt="ベランダで園芸を楽しむ高齢女性のAI生成デモ画像" loading="lazy"><span>DEMO｜AI生成画像</span></div><div class="home-life-body"><small># 社会・趣味</small><h3>朝の水やりが、毎日の予定になった</h3><p>退院してからベランダの鉢を少しずつ。朝の水やりが生活のリズムに。</p></div></a>\
      <a class="home-life-card" href="life_feed_demo.html"><div class="home-life-photo"><img src="demo-ai-travel-lake.png" alt="湖へ旅行する夫婦のAI生成デモ画像" loading="lazy"><span>DEMO｜AI生成画像</span></div><div class="home-life-body"><small># お金・体験</small><h3>遠出をやめて、夫婦で一泊だけ</h3><p>近場で、無理なく。豪華じゃなくても十分いい思い出になりました。</p></div></a>\
      <a class="home-life-card" href="life_feed_demo.html"><div class="home-life-photo"><img src="demo-ai-family-pets.png" alt="家族と犬猫と過ごす高齢女性のAI生成デモ画像" loading="lazy"><span>DEMO｜AI生成画像</span></div><div class="home-life-body"><small># 人間関係</small><h3>犬がいると、家族の会話が増えた</h3><p>体調の話ばかりにならず、いつもの家族の時間が戻ってきます。</p></div></a>\
      <a class="home-life-card" href="life_feed_demo.html"><div class="home-life-photo"><img src="demo-ai-care-tools.png" alt="介護用品を一緒に確認する家族のAI生成デモ画像" loading="lazy"><span>DEMO｜AI生成画像</span></div><div class="home-life-body"><small># 介護の工夫</small><h3>介護グッズは、一か所にまとめた</h3><p>探し物が減っただけで、毎日の介護が少し楽になりました。</p></div></a>\
    </div>\
    <div class="home-life-foot"><span>将来は、興味・不安・暮らし方に合わせて表示する投稿を変える想定です。</span><a href="life_feed_demo.html">投稿フィードのデモを見る →</a></div>';
  if(howto){main.insertBefore(section,howto);}else{main.appendChild(section);}
  var style=document.createElement('style');
  style.textContent='\
.home-life-preview{max-width:1280px;margin:0 auto;padding:8px 28px 70px}.home-life-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:18px}.home-life-head h2{font-family:"Yu Mincho","Hiragino Mincho ProN",serif;color:#153f68;font-weight:500;font-size:27px;letter-spacing:.09em;margin:4px 0 7px}.home-life-head p{font-size:10px;color:#788592;margin:0}.home-life-more{display:inline-flex;align-items:center;gap:12px;border:1px solid #cddde8;border-radius:999px;background:#fff;padding:9px 15px;color:#2c6289;font-size:10px;font-weight:800;white-space:nowrap}.home-life-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.home-life-card{overflow:hidden;border:1px solid #dce7ee;border-radius:17px;background:#fff;box-shadow:0 9px 28px rgba(30,66,94,.06);transition:.22s}.home-life-card:hover{transform:translateY(-4px);box-shadow:0 17px 35px rgba(30,66,94,.11)}.home-life-photo{aspect-ratio:4/3;position:relative;overflow:hidden;background:#eef4f7}.home-life-photo img{display:block;width:100%;height:100%;object-fit:cover}.home-life-photo span{position:absolute;left:9px;top:9px;padding:3px 7px;border:1px solid rgba(214,226,234,.9);border-radius:999px;background:rgba(255,255,255,.88);backdrop-filter:blur(8px);color:#607789;font-size:7px;font-weight:900}.home-life-body{padding:12px 13px 14px}.home-life-body small{color:#3c708d;font-size:8px;font-weight:900}.home-life-body h3{font-family:"Yu Mincho","Hiragino Mincho ProN",serif;color:#244e6c;font-weight:600;font-size:14px;line-height:1.55;margin:5px 0 6px}.home-life-body p{font-size:9px;color:#687b89;margin:0;line-height:1.75}.home-life-foot{margin-top:14px;padding:12px 14px;border:1px solid #e3eaee;border-radius:13px;background:#fafcfd;display:flex;justify-content:space-between;gap:14px;color:#7b8994;font-size:9px}.home-life-foot a{color:#2e6489;font-weight:800;white-space:nowrap}@media(max-width:950px){.home-life-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.home-life-preview{padding:8px 16px 52px}.home-life-head{display:block}.home-life-head h2{font-size:23px}.home-life-more{margin-top:12px}.home-life-grid{grid-template-columns:1fr 1fr;gap:10px}.home-life-body{padding:10px}.home-life-body h3{font-size:13px}.home-life-foot{display:block}.home-life-foot a{display:block;margin-top:6px}}@media(max-width:480px){.home-life-grid{grid-template-columns:1fr}}';
  document.head.appendChild(style);
})();

(function(){
  var brand=document.querySelector('.site-header .brand');
  if(!brand) return;
  brand.innerHTML='<img class="shukatsu-header-logo" src="assets/shukatsu-lab-header-logo.png" alt="終活ラボ">';
  var style=document.createElement('style');
  style.textContent='.site-header .brand{gap:0}.shukatsu-header-logo{display:block;height:48px;width:auto;max-width:150px;object-fit:contain}@media(max-width:700px){.shukatsu-header-logo{height:46px;max-width:145px}}';
  document.head.appendChild(style);
})();
