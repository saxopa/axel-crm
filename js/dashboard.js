const Dashboard = (() => {
  async function render(container) {
    container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [clientsRes, sessionsRes, lastClientRes, caRes, pendingRes] = await Promise.all([
      db.from('clients').select('id', { count: 'exact', head: true }),
      db.from('sessions').select('id', { count: 'exact', head: true }).gte('session_date', firstDay),
      db.from('clients').select('first_name, last_name, created_at').order('created_at', { ascending: false }).limit(1),
      db.from('sessions').select('price_charged').gte('session_date', firstDay),
      db.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const totalClients = clientsRes.count ?? 0;
    const sessionsMonth = sessionsRes.count ?? 0;
    const lastClient = lastClientRes.data?.[0];
    const caMonth = (caRes.data || []).reduce((sum, s) => sum + (s.price_charged || 0), 0);
    const pendingCount = pendingRes.count ?? 0;

    const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <span class="view-eyebrow">Vue d'ensemble</span>
          <h1 class="view-title">Bonjour, Axel</h1>
          <p class="view-subtitle">${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="header-motif"></div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-card--primary animate-in">
          <div class="stat-card-bg"></div>
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="stat-value">${totalClients}</div>
          <div class="stat-label">Clients</div>
        </div>

        <div class="stat-card animate-in" style="animation-delay:.08s">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="stat-value">${sessionsMonth}</div>
          <div class="stat-label">Sessions — ${monthName}</div>
        </div>

        <div class="stat-card animate-in" style="animation-delay:.16s">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div class="stat-value stat-value--sm">${lastClient ? lastClient.first_name + ' ' + lastClient.last_name : '—'}</div>
          <div class="stat-label">Dernier client</div>
        </div>

        <div class="stat-card animate-in" style="animation-delay:.24s">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="stat-value">${caMonth.toFixed(0)} <span style="font-size:1.2rem">€</span></div>
          <div class="stat-label">CA — ${monthName}</div>
        </div>
      </div>

      ${pendingCount > 0 ? `
      <div class="pending-alert">
        <span>🕐 <strong>${pendingCount} client${pendingCount > 1 ? 's' : ''}</strong> en attente de validation (formulaire public)</span>
        <button class="btn btn--ghost btn--sm" onclick="Router.navigate('clients')">Voir les clients →</button>
      </div>
      ` : ''}

      <div class="dashboard-actions animate-in" style="animation-delay:.32s">
        <h2 class="section-title">Actions rapides</h2>
        <div class="quick-actions">
          <button class="quick-action-btn" onclick="Router.navigate('sessions', 'new')">
            <span class="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </span>
            <span>Nouvelle session</span>
          </button>
          <button class="quick-action-btn" onclick="Router.navigate('clients', 'new')">
            <span class="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            </span>
            <span>Nouveau client</span>
          </button>
          <button class="quick-action-btn" onclick="Router.navigate('clients')">
            <span class="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span>Voir clients</span>
          </button>
          <button class="quick-action-btn" onclick="Router.navigate('massages')">
            <span class="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1h-1V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2h1c.552 0 1-.448 1-1v-3c0-.552-.448-1-1-1z"/></svg>
            </span>
            <span>Types de massage</span>
          </button>
        </div>
      </div>
    `;
  }

  return { render };
})();
