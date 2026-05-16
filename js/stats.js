const Stats = (() => {
  async function render(container) {
    if (!Auth.guard()) return;

    container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;

    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    const [revenueMonthRes, revenueMassageRes, sessionsYearRes] = await Promise.all([
      db.from('revenue_by_month').select('*').limit(6),
      db.from('revenue_by_massage_type').select('*'),
      db.from('sessions').select('price_charged').gte('session_date', firstDayOfYear),
    ]);

    if (revenueMonthRes.error) { showError(container, revenueMonthRes.error.message); return; }
    if (revenueMassageRes.error) { showError(container, revenueMassageRes.error.message); return; }
    if (sessionsYearRes.error) { showError(container, sessionsYearRes.error.message); return; }

    const revenueMonths = revenueMonthRes.data || [];
    const revenueMassages = (revenueMassageRes.data || []).slice(0, 8);
    const sessionsYear = sessionsYearRes.data || [];

    // KPI calculations
    const caAnnee = sessionsYear.reduce((sum, s) => sum + (parseFloat(s.price_charged) || 0), 0);

    const bestMonth = revenueMonths.reduce((best, m) => {
      return (!best || (parseFloat(m.total_revenue) || 0) > (parseFloat(best.total_revenue) || 0)) ? m : best;
    }, null);

    const totalSessions = revenueMonths.reduce((sum, m) => sum + (parseInt(m.session_count) || 0), 0);

    // Format best month label
    let bestMonthLabel = '—';
    if (bestMonth && bestMonth.month) {
      // month field expected as "YYYY-MM" or a date string
      const d = new Date(bestMonth.month + '-01');
      bestMonthLabel = (parseFloat(bestMonth.total_revenue) || 0).toFixed(0) + ' € — ' +
        d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }

    // Build last 6 months array (including current month, even if no data)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const found = revenueMonths.find(m => m.month && m.month.startsWith(key));
      last6Months.push({
        key,
        label: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '.'),
        revenue: found ? (parseFloat(found.total_revenue) || 0) : 0,
      });
    }

    const maxRevenue = Math.max(...last6Months.map(m => m.revenue), 1);

    // SVG bar chart
    const barW = 72;
    const barGap = 16;
    const startX = 20;
    const chartH = 160;
    const chartTopY = 20;

    const svgBars = last6Months.map((m, i) => {
      const x = startX + i * (barW + barGap);
      const barH = m.revenue > 0 ? Math.max(4, (m.revenue / maxRevenue) * chartH) : 4;
      const barY = chartTopY + (chartH - barH);
      const opacity = m.revenue > 0 ? 0.8 : 0.15;
      return `
        <rect x="${x}" y="${barY}" width="${barW}" height="${barH}"
          rx="4" fill="rgba(45,106,79,${opacity})"/>
        <text class="chart-bar-label" x="${x + barW / 2}" y="196" text-anchor="middle">${m.label}</text>
        ${m.revenue > 0 ? `<text class="chart-bar-value" x="${x + barW / 2}" y="${barY - 5}" text-anchor="middle">${m.revenue.toFixed(0)}€</text>` : ''}
      `;
    }).join('');

    const svgWidth = startX + 6 * (barW + barGap) - barGap + startX;

    // Massage type bars
    const maxMassageRevenue = Math.max(...revenueMassages.map(m => parseFloat(m.total_revenue) || 0), 1);

    const massageListHTML = revenueMassages.length === 0
      ? `<div class="empty-state"><p class="empty-state-title">Aucune donnée disponible</p></div>`
      : `<ul class="massage-stats-list">
          ${revenueMassages.map(m => {
            const rev = parseFloat(m.total_revenue) || 0;
            const pct = Math.max(2, (rev / maxMassageRevenue) * 100).toFixed(1);
            return `
              <li class="massage-stat-item">
                <span class="massage-stat-label" title="${m.massage_name || '—'}">${m.massage_name || '—'}</span>
                <div class="massage-stat-bar-wrap">
                  <div class="massage-stat-bar" style="width:${pct}%"></div>
                </div>
                <span class="massage-stat-value">${rev.toFixed(0)} €</span>
              </li>`;
          }).join('')}
        </ul>`;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <span class="view-eyebrow">Analyse</span>
          <h1 class="view-title">Statistiques</h1>
        </div>
      </div>

      <div class="stats-kpi-row">
        <div class="stat-card stat-card--primary animate-in">
          <div class="stat-card-bg"></div>
          <div class="stat-value">${caAnnee.toFixed(0)} €</div>
          <div class="stat-label">Chiffre d'affaires ${now.getFullYear()}</div>
        </div>
        <div class="stat-card animate-in" style="animation-delay:.08s">
          <div class="stat-value" style="font-size:1.1rem">${bestMonthLabel}</div>
          <div class="stat-label">Meilleur mois</div>
        </div>
        <div class="stat-card animate-in" style="animation-delay:.16s">
          <div class="stat-value">${totalSessions}</div>
          <div class="stat-label">Sessions enregistrées</div>
        </div>
      </div>

      <div class="revenue-chart-wrap animate-in">
        <div class="chart-title">Revenus mensuels</div>
        <div>
          <svg class="chart-svg" viewBox="0 0 ${svgWidth} 210" height="210">
            ${svgBars}
          </svg>
        </div>
      </div>

      <div class="revenue-chart-wrap animate-in">
        <div class="chart-title">Revenus par type de massage</div>
        ${massageListHTML}
      </div>
    `;
  }

  return { render };
})();
