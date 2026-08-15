(function(){
  const config = window.SHINIKATA_API_CONFIG || {};
  if (!config.enablePublicStats || !config.baseUrl) return;
  const condition = document.getElementById('condition');
  const role = document.getElementById('role');
  const searchBtn = document.getElementById('searchBtn');
  const count = document.getElementById('aggregateCount');
  const average = document.getElementById('metricAverage');
  const note = document.querySelector('.mock-note');
  if (!searchBtn || !count || !average) return;

  const conditionMap = {'認知症':'dementia','肺がん':'lung_cancer','心不全':'heart_failure','COPD・呼吸器疾患':'copd','腎不全':'kidney_failure'};
  const roleMap = {'闘病している当事者':'patient','患者を支える家族・身近な人':'family','医療・介護に関わる方':'professional'};
  function activeMetric(){
    const group = document.querySelector('.group-tab.active')?.dataset.group || 'patient';
    if (group === 'family') return 'caregiver_burden_overall';
    if (group === 'care') return 'overall_acceptance';
    return 'total_suffering_overall';
  }
  async function refresh(){
    const params = new URLSearchParams();
    if (condition?.value && conditionMap[condition.value]) params.set('condition', conditionMap[condition.value]);
    if (role?.value && roleMap[role.value]) params.set('role_group', roleMap[role.value]);
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/,'')}/v1/public/stats?${params.toString()}`, {cache:'no-store'});
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      if (body.suppressed) {
        count.textContent = '—';
        average.textContent = '—';
        if (note) note.textContent = `実データAPI接続中｜プライバシー保護のため n<${body.min_cell_size} の集計は非表示です。`;
        return;
      }
      count.textContent = String(body.n);
      const metric = body.metrics?.[activeMetric()];
      average.textContent = metric && !metric.suppressed ? String(metric.average) : '—';
      if (note) note.textContent = '実データAPI接続中｜件数と主要平均のみ実データ。詳細比較カードはまだ表示設計用です。';
    } catch (e) {
      if (note) note.textContent = `実データAPIへ接続できません：${e.message}`;
    }
  }
  searchBtn.addEventListener('click', () => setTimeout(refresh, 0));
  document.querySelectorAll('.group-tab').forEach(btn => btn.addEventListener('click', () => setTimeout(refresh, 0)));
  refresh();
})();
