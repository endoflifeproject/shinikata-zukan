(function(){
  const ROOT = document.querySelector('[data-disease-evidence-dashboard]');
  if(!ROOT) return;

  const esc = (v='') => String(v).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

  fetch('assets/data/disease_evidence.json')
    .then(r => { if(!r.ok) throw new Error('fetch failed'); return r.json(); })
    .then(data => {
      const entries = Object.entries(data.diseases || {});
      const nav = entries.map(([key,d]) => `<a class="data-jump" href="#data-${esc(key)}">${esc(d.name)}</a>`).join('');
      const cards = entries.map(([key,d]) => {
        const z = d.zukan || {};
        const e = d.evidence || {};
        const fields = (z.planned_fields || []).map(x => `<li>${esc(x)}</li>`).join('');
        const count = Number.isFinite(z.sample_size) ? z.sample_size : 0;
        return `<article class="disease-data-card" id="data-${esc(key)}">
          <div class="data-card-head"><div><span class="data-disease-name">${esc(d.name)}</span><h3>根拠と図鑑データを並べて見る</h3></div><a class="data-page-link" href="${esc(d.page)}">病気ページへ →</a></div>
          <div class="data-two-col">
            <section class="data-evidence-panel"><span class="data-panel-label">ネット上の根拠</span><h4>${esc(e.source_name)}</h4><p>${esc(e.summary)}</p><div class="data-scope"><b>この根拠の範囲</b>${esc(e.scope)}</div><a class="data-source-link" href="${esc(e.source_url)}" target="_blank" rel="noopener">公式情報を見る →</a></section>
            <section class="data-zukan-panel"><div class="data-zukan-top"><span class="data-panel-label zukan">アノトキで集めたデータ</span><span class="data-count">n=${count}</span></div><h4>${count === 0 ? '実データ未接続' : '集計結果'}</h4><p>${esc(z.summary)}</p>${count === 0 ? `<div class="data-empty">現在はデモ表示です。データが0件のため、割合や平均値は表示しません。</div>` : ''}<div class="data-planned"><b>集める項目</b><ul>${fields}</ul></div></section>
          </div>
        </article>`;
      }).join('');
      ROOT.innerHTML = `<div class="data-rule"><b>共通表示ルール</b><span>${esc(data.meta?.rule || '')}</span><small>データ定義更新：${esc(data.meta?.updated || '')}</small></div><nav class="data-jumps" aria-label="疾患データへ移動">${nav}</nav><div class="disease-data-list">${cards}</div>`;
    })
    .catch(() => {
      ROOT.innerHTML = '<div class="data-load-error">図鑑データを読み込めませんでした。</div>';
    });
})();
