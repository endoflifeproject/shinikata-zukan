(function(){
  const REVIEW_VERSION = 'questionnaire-expert-review-v1';
  const STORAGE_KEY = 'shinikata-zukan:expert-review:v1';
  const ISSUE_OPTIONS = [
    ['too_many_questions','設問数が多い'],
    ['unclear_questions','質問の意図・表現が分かりにくい'],
    ['missing_needed_information','必要な情報が十分に取れていない'],
    ['low_value_questions','得られる情報に対して有用性の低い設問・無駄が多い'],
    ['psychologically_difficult','心理的に答えにくい質問が多い'],
    ['fatigue','回答中に疲労感を感じる']
  ];
  const SCALE_DEFS = [
    {
      key:'mental_burden',
      title:'この質問は、回答者の精神的負担になりえる',
      labels:['0 問題なし','1 やや負担','2 負担が大きい','3 非常に強い負担']
    },
    {
      key:'ethical_concern',
      title:'この質問は、倫理上不適切である可能性がある',
      labels:['0 問題なし','1 懸念あり','2 不適切','3 重大な問題']
    },
    {
      key:'identification_risk',
      title:'この質問は、個人が特定される恐れがある',
      labels:['0 問題なし','1 低い懸念','2 注意が必要','3 高いリスク']
    }
  ];

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function safeParse(raw){ try { return JSON.parse(raw); } catch { return null; } }
  function normalizeText(s){ return String(s || '').replace(/\s+/g,' ').trim(); }
  function questionText(field){
    const direct = field.querySelector(':scope > label');
    if (direct) return normalizeText(direct.textContent.replace('必須',''));
    const title = field.querySelector(':scope > h3, :scope > .qtitle, :scope > b');
    if (title) return normalizeText(title.textContent);
    const any = field.querySelector('label');
    return normalizeText(any ? any.textContent : '設問');
  }
  function sectionMeta(field){
    const section = field.closest('section[id]');
    const heading = section && section.querySelector('h2');
    return {
      section_id: section ? section.id : 'unknown',
      section_title: normalizeText(heading ? heading.textContent : '')
    };
  }
  function baseQuestionId(field, index){
    const ctrl = field.querySelector('input[name], select[name], textarea[name]');
    const meta = sectionMeta(field);
    const key = ctrl ? (ctrl.getAttribute('name') || ctrl.id || `q${index+1}`) : `q${index+1}`;
    return `${meta.section_id}:${key}`;
  }
  function scaleHtml(questionId, def){
    const options = def.labels.map((label, i) => `<label class="expert-score-option"><input type="radio" name="review:${esc(questionId)}:${def.key}" value="${i}"><span>${esc(label)}</span></label>`).join('');
    return `<div class="expert-score-row" data-review-scale="${def.key}"><div class="expert-score-title">${esc(def.title)}</div><div class="expert-score-options">${options}</div></div>`;
  }
  function panelHtml(questionId, text, meta){
    return `<div class="expert-review-card" data-review-question-id="${esc(questionId)}" data-review-question-text="${esc(text)}" data-review-section-id="${esc(meta.section_id)}" data-review-section-title="${esc(meta.section_title)}">
      <div class="expert-review-head"><div><b>専門家評価｜この設問について</b><span>0＝問題なし。懸念がある場合は1〜3で程度を評価してください。</span></div><button type="button" class="expert-zero-all">3項目をすべて0</button></div>
      ${SCALE_DEFS.map(d => scaleHtml(questionId,d)).join('')}
      <label class="expert-comment-label">この設問へのコメント・改善案（任意）<textarea class="expert-question-comment" maxlength="1200" placeholder="例：回答者の状況によっては表現を弱めた方がよい／年代の粒度を粗くした方がよい など"></textarea></label>
    </div>`;
  }

  function injectStyles(){
    const style = document.createElement('style');
    style.id = 'expertReviewStyles';
    style.textContent = `
      body.expert-review-mode{--review:#745b8f;--review-soft:#f7f3fb;--review-line:#d9cde6}
      .expert-review-banner{max-width:1180px;margin:0 auto 14px;padding:15px 18px;border:2px solid var(--review-line);border-radius:16px;background:linear-gradient(135deg,#f5f0fb,#fff);color:#514264;box-shadow:0 8px 26px rgba(71,52,93,.06)}
      .expert-review-banner b{display:block;font-size:14px;margin-bottom:3px}.expert-review-banner span{font-size:10px;color:#776b82}.expert-progress{margin-top:8px;font-size:10px;font-weight:800;color:#665276}
      .expert-review-card{margin-top:13px;padding:13px 14px;border:1px solid var(--review-line);border-radius:13px;background:var(--review-soft)}
      .expert-review-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:9px}.expert-review-head b{display:block;color:#5b4770;font-size:11px}.expert-review-head span{display:block;color:#84778e;font-size:8.5px;margin-top:2px}.expert-zero-all{flex:0 0 auto;border:1px solid #cbbbd9;background:#fff;border-radius:999px;padding:6px 9px;color:#645076;font-size:8.5px;font-weight:900;cursor:pointer}
      .expert-score-row{padding:8px 0;border-top:1px dashed #ddd2e7}.expert-score-title{font-size:9.5px;font-weight:800;color:#5b4e68;margin-bottom:5px}.expert-score-options{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}.expert-score-option{position:relative}.expert-score-option input{position:absolute;opacity:0;pointer-events:none}.expert-score-option span{display:block;border:1px solid #d6cbe0;background:#fff;border-radius:8px;padding:6px 5px;text-align:center;font-size:8px;color:#645b6c;cursor:pointer}.expert-score-option input:checked+span{background:#684f80;color:#fff;border-color:#684f80}.expert-score-option input:focus-visible+span{outline:3px solid rgba(104,79,128,.2);outline-offset:2px}
      .expert-comment-label{display:block;margin-top:8px;font-size:9px;font-weight:800;color:#5b4e68}.expert-question-comment{width:100%;min-height:58px;margin-top:5px;border:1px solid #d6cbe0;border-radius:9px;background:#fff;padding:8px;font:inherit;font-size:9px;color:#4f4657;resize:vertical}
      .expert-overall{border:2px solid var(--review-line)!important;background:linear-gradient(135deg,#f8f4fb,#fff)!important}.expert-overall h2{color:#5b4770!important}.expert-overall-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:9px}.expert-overall-opt{position:relative}.expert-overall-opt input{position:absolute;opacity:0;pointer-events:none}.expert-overall-opt span{display:block;border:1px solid #d4c7df;border-radius:9px;background:#fff;padding:9px 5px;text-align:center;font-size:9px;cursor:pointer}.expert-overall-opt input:checked+span{background:#684f80;border-color:#684f80;color:#fff}.expert-issues{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px}.expert-issue{display:flex;gap:7px;align-items:flex-start;border:1px solid #dfd6e6;background:#fff;border-radius:9px;padding:8px;font-size:9px;color:#5d5365}.expert-issue input{margin-top:2px}.expert-overall textarea{width:100%;min-height:120px;border:1px solid #d4c7df;border-radius:10px;background:#fff;padding:10px;font:inherit;font-size:10px;resize:vertical}
      .expert-submit-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:14px}.expert-submit{border:0;border-radius:999px;background:#5c4475;color:#fff;padding:10px 17px;font-size:10px;font-weight:900;cursor:pointer}.expert-submit:disabled{opacity:.45;cursor:not-allowed}.expert-export{border:1px solid #c9bad7;border-radius:999px;background:#fff;color:#5f4b73;padding:9px 14px;font-size:9.5px;font-weight:900;cursor:pointer}.expert-submit-status{font-size:9px;color:#776b82}.expert-receipt{margin-top:10px;padding:10px;border:1px solid #cfe0d5;border-radius:10px;background:#f4fbf6;font-size:9px;color:#416450;word-break:break-all}
      @media(max-width:760px){.expert-score-options{grid-template-columns:1fr 1fr}.expert-issues{grid-template-columns:1fr}.expert-overall-grid{grid-template-columns:repeat(5,minmax(54px,1fr));overflow:auto}.expert-review-head{display:block}.expert-zero-all{margin-top:7px}}
    `;
    document.head.appendChild(style);
  }

  function injectBanner(total){
    const main = document.querySelector('main');
    if (!main) return;
    const banner = document.createElement('div');
    banner.className = 'expert-review-banner';
    banner.innerHTML = `<b>専門家レビュー版｜アンケート設計を評価してください</b><span>ここで送信するのは「設問への評価」だけです。フォームに仮入力した症例・体験の回答内容はレビュー送信には含めません。</span><div class="expert-progress" id="expertReviewProgress">評価済み 0 / ${total}設問</div>`;
    main.insertBefore(banner, main.firstChild);
  }

  function injectOverall(){
    const form = document.getElementById('caseForm');
    if (!form) return;
    const section = document.createElement('section');
    section.className = 'panel expert-overall';
    section.id = 'expertOverallReview';
    const overall = [1,2,3,4,5].map(n => `<label class="expert-overall-opt"><input type="radio" name="expert_overall_rating" value="${n}"><span>${n}<br>${n===1?'大幅修正が必要':n===2?'修正が必要':n===3?'要検討':n===4?'概ね良い':'非常に良い'}</span></label>`).join('');
    const issues = ISSUE_OPTIONS.map(([value,label]) => `<label class="expert-issue"><input type="checkbox" name="expert_issue" value="${value}"><span>${esc(label)}</span></label>`).join('');
    section.innerHTML = `<span class="step">専門家レビュー｜全体評価</span><h2>アンケート全体を通しての評価</h2><p class="intro">個々の設問評価とは別に、質問票全体の長さ・分かりやすさ・有用性・心理的負担を評価してください。</p>
      <div class="field"><label>総合評価（1〜5）</label><div class="expert-overall-grid">${overall}</div></div>
      <div class="field"><label>当てはまるものをすべて選択してください</label><div class="expert-issues">${issues}</div></div>
      <div class="field"><label for="expertOverallComment">全体を通しての評価・改善案（自由記載）</label><textarea id="expertOverallComment" maxlength="6000" placeholder="追加・削除した方がよい設問、表現の修正案、倫理面・心理面・再識別リスクへの懸念、実運用に向けた提案など"></textarea></div>
      <div class="expert-submit-row"><button class="expert-submit" id="expertReviewSubmit" type="button">この評価を送信</button><button class="expert-export" id="expertReviewExport" type="button">評価JSONを保存</button><span class="expert-submit-status" id="expertReviewStatus"></span></div>
      <div id="expertReviewReceipt"></div>`;
    form.after(section);
  }

  function allReviewCards(){ return [...document.querySelectorAll('.expert-review-card')]; }
  function readScore(card,key){
    const checked = card.querySelector(`[data-review-scale="${key}"] input:checked`);
    return checked ? Number(checked.value) : null;
  }
  function completedCard(card){ return SCALE_DEFS.every(d => readScore(card,d.key) != null); }
  function updateProgress(){
    const cards = allReviewCards();
    const done = cards.filter(completedCard).length;
    const el = document.getElementById('expertReviewProgress');
    if (el) el.textContent = `評価済み ${done} / ${cards.length}設問`;
  }
  function collectPayload(){
    const cards = allReviewCards();
    const questionReviews = cards.map(card => ({
      question_id: card.dataset.reviewQuestionId,
      question_text: card.dataset.reviewQuestionText,
      section_id: card.dataset.reviewSectionId,
      section_title: card.dataset.reviewSectionTitle,
      mental_burden: readScore(card,'mental_burden'),
      ethical_concern: readScore(card,'ethical_concern'),
      identification_risk: readScore(card,'identification_risk'),
      comment: normalizeText(card.querySelector('.expert-question-comment')?.value)
    }));
    const overall = document.querySelector('input[name="expert_overall_rating"]:checked');
    const issues = [...document.querySelectorAll('input[name="expert_issue"]:checked')].map(i => i.value);
    const versionText = document.querySelector('.kicker')?.textContent || '';
    const versionMatch = versionText.match(/v\d+(?:\.\d+)+/i);
    return {
      review_version: REVIEW_VERSION,
      questionnaire_version: versionMatch ? `experience-case-${versionMatch[0].toLowerCase()}` : 'experience-case-v1.14',
      reviewed_at_client: new Date().toISOString(),
      question_reviews: questionReviews,
      overall: {
        rating: overall ? Number(overall.value) : null,
        issues,
        comment: normalizeText(document.getElementById('expertOverallComment')?.value)
      },
      completion: {
        questions_total: questionReviews.length,
        questions_fully_rated: questionReviews.filter(q => q.mental_burden != null && q.ethical_concern != null && q.identification_risk != null).length
      }
    };
  }

  function saveDraft(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(collectPayload())); } catch {}
    updateProgress();
  }
  function restoreDraft(){
    let draft = null;
    try { draft = safeParse(localStorage.getItem(STORAGE_KEY)); } catch {}
    if (!draft) return;
    const map = new Map((draft.question_reviews || []).map(q => [q.question_id,q]));
    allReviewCards().forEach(card => {
      const q = map.get(card.dataset.reviewQuestionId); if (!q) return;
      SCALE_DEFS.forEach(d => {
        const value = q[d.key];
        if (value == null) return;
        const input = card.querySelector(`[data-review-scale="${d.key}"] input[value="${value}"]`);
        if (input) input.checked = true;
      });
      const comment = card.querySelector('.expert-question-comment');
      if (comment && q.comment) comment.value = q.comment;
    });
    if (draft.overall?.rating != null) {
      const input = document.querySelector(`input[name="expert_overall_rating"][value="${draft.overall.rating}"]`);
      if (input) input.checked = true;
    }
    (draft.overall?.issues || []).forEach(value => {
      const input = document.querySelector(`input[name="expert_issue"][value="${value}"]`);
      if (input) input.checked = true;
    });
    const overallComment = document.getElementById('expertOverallComment');
    if (overallComment && draft.overall?.comment) overallComment.value = draft.overall.comment;
    updateProgress();
  }
  function exportJson(){
    const blob = new Blob([JSON.stringify(collectPayload(),null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `shinikata-questionnaire-review-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }
  async function submitReview(){
    const cfg = window.SHINIKATA_API_CONFIG || {};
    const status = document.getElementById('expertReviewStatus');
    const button = document.getElementById('expertReviewSubmit');
    const payload = collectPayload();
    if (!cfg.enableReviewSubmission || !cfg.baseUrl) {
      if (status) status.textContent = '公開環境の評価送信先はまだ未接続です。右の「評価JSONを保存」は利用できます。';
      return;
    }
    button.disabled = true;
    if (status) status.textContent = '送信中…';
    try {
      const res = await fetch(`${cfg.baseUrl}/v1/questionnaire-evaluations`, {
        method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ review_payload: payload })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || body.error || `HTTP ${res.status}`);
      if (status) status.textContent = '送信しました。';
      const receipt = document.getElementById('expertReviewReceipt');
      if (receipt) receipt.innerHTML = `<div class="expert-receipt"><b>評価ID：</b>${esc(body.evaluation_id || '')}<br><b>撤回用コード：</b>${esc(body.withdrawal_secret || '')}<br>撤回用コードはこの画面を閉じる前に控えてください。</div>`;
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (e) {
      if (status) status.textContent = `送信できませんでした：${e.message}`;
    } finally { button.disabled = false; }
  }

  function init(){
    document.body.classList.add('expert-review-mode');
    injectStyles();
    const fields = [...document.querySelectorAll('#caseForm .field')].filter(field => field.querySelector('input[name], select[name], textarea[name]'));
    const seen = new Map();
    fields.forEach((field,index) => {
      let id = baseQuestionId(field,index);
      const n = (seen.get(id) || 0) + 1; seen.set(id,n); if (n > 1) id += `#${n}`;
      const text = questionText(field); const meta = sectionMeta(field);
      field.insertAdjacentHTML('beforeend', panelHtml(id,text,meta));
    });
    injectBanner(fields.length);
    injectOverall();
    document.addEventListener('change', e => { if (e.target.closest('.expert-review-card,.expert-overall')) saveDraft(); });
    document.addEventListener('input', e => { if (e.target.matches('.expert-question-comment,#expertOverallComment')) saveDraft(); });
    document.addEventListener('click', e => {
      const zero = e.target.closest('.expert-zero-all');
      if (zero) {
        const card = zero.closest('.expert-review-card');
        SCALE_DEFS.forEach(d => { const input = card.querySelector(`[data-review-scale="${d.key}"] input[value="0"]`); if (input) input.checked = true; });
        saveDraft();
      }
    });
    document.getElementById('expertReviewExport')?.addEventListener('click', exportJson);
    document.getElementById('expertReviewSubmit')?.addEventListener('click', submitReview);
    restoreDraft(); updateProgress();
    const cfg = window.SHINIKATA_API_CONFIG || {};
    const status = document.getElementById('expertReviewStatus');
    if (status) status.textContent = cfg.enableReviewSubmission ? '評価はこの端末に自動保存され、送信時は評価データだけが送られます。' : '評価はこの端末に自動保存されます。送信先未接続時はJSON保存が使えます。';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
