const Clients = (() => {
  const PAGE_SIZE = 10;
  let currentPage = 0;
  let searchQuery = '';
  let searchTimeout = null;

  async function render(container, action, id) {
    if (!Auth.guard()) return;
    if (action === 'new') return renderForm(container, null);
    if (action === 'edit' && id) return renderForm(container, id);
    if (action === 'view' && id) return renderDetail(container, id);
    return renderList(container);
  }

  async function renderList(container) {
    container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
    await loadList(container);
  }

  async function loadList(container) {
    let query = db.from('clients').select('*', { count: 'exact' });
    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await query.order('last_name').range(from, to);
    if (error) { showError(container, error.message); return; }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <span class="view-eyebrow">Gestion</span>
          <h1 class="view-title">Clients</h1>
        </div>
        <div style="display:flex;gap:.5rem;align-items:center">
          <button class="btn btn--ghost" onclick="Clients.exportCSV()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter
          </button>
          <button class="btn btn--primary" onclick="Router.navigate('clients','new')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouveau
          </button>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-input" id="client-search" type="text" placeholder="Rechercher…" value="${searchQuery}">
        </div>
        <span class="record-count">${count ?? 0} client${(count ?? 0) > 1 ? 's' : ''}</span>
      </div>

      <div class="table-wrap animate-in">
        ${data && data.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${data.map(c => `
              <tr class="table-row" onclick="Router.navigate('clients','view','${c.id}')">
                <td>
                  <div class="client-name-cell">
                    <span class="client-avatar">${(c.first_name?.[0] || '').toUpperCase()}${(c.last_name?.[0] || '').toUpperCase()}</span>
                    <span>${c.first_name} ${c.last_name}${c.status === 'pending' ? ' <span class="pending-badge">En attente</span>' : ''}</span>
                  </div>
                </td>
                <td>${c.email || '—'}</td>
                <td>${c.phone || '—'}</td>
                <td class="table-actions" onclick="event.stopPropagation()">
                  <button class="icon-btn" title="Modifier" onclick="Router.navigate('clients','edit','${c.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="icon-btn icon-btn--danger" title="Supprimer" onclick="Clients.delete('${c.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : `<div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p>Aucun client trouvé</p>
        </div>`}
      </div>

      ${totalPages > 1 ? `
      <div class="pagination">
        <button class="btn btn--ghost btn--sm" ${currentPage === 0 ? 'disabled' : ''} onclick="Clients.prevPage()">← Précédent</button>
        <span class="page-info">Page ${currentPage + 1} / ${totalPages}</span>
        <button class="btn btn--ghost btn--sm" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="Clients.nextPage()">Suivant →</button>
      </div>
      ` : ''}
    `;

    const searchEl = document.getElementById('client-search');
    if (searchEl) {
      searchEl.addEventListener('input', e => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          searchQuery = e.target.value.trim();
          currentPage = 0;
          loadList(container);
        }, 300);
      });
    }
  }

  async function renderDetail(container, id) {
    container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
    const { data: c, error } = await db.from('clients').select('*').eq('id', id).single();
    if (error) { showError(container, error.message); return; }

    const [{ data: sessions }, { data: sessData, count: sessCount }] = await Promise.all([
      db.from('sessions')
        .select('*, massage_types(name)')
        .eq('client_id', id)
        .order('session_date', { ascending: false })
        .limit(5),
      db.from('sessions')
        .select('price_charged', { count: 'exact' })
        .eq('client_id', id),
    ]);
    const totalRevenue = (sessData || []).reduce((sum, s) => sum + (s.price_charged || 0), 0);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <button class="back-btn" onclick="Router.navigate('clients')">← Clients</button>
          <h1 class="view-title">${c.first_name} ${c.last_name}</h1>
        </div>
        <button class="btn btn--primary" onclick="Router.navigate('clients','edit','${c.id}')">Modifier</button>
      </div>

      <div class="detail-grid animate-in">
        <div class="detail-card">
          <h3 class="detail-card-title">Informations</h3>
          <dl class="detail-list">
            ${c.email ? `<div class="detail-row"><dt>Email</dt><dd><a href="mailto:${c.email}">${c.email}</a></dd></div>` : ''}
            ${c.phone ? `<div class="detail-row"><dt>Téléphone</dt><dd>${c.phone}</dd></div>` : ''}
            ${c.date_of_birth ? `<div class="detail-row"><dt>Naissance</dt><dd>${new Date(c.date_of_birth).toLocaleDateString('fr-FR')}</dd></div>` : ''}
            <div class="detail-row">
              <dt>Newsletter</dt>
              <dd>${c.email_consent ? '<span class="consent-badge consent-badge--yes">✓ Inscrit</span>' : '<span class="consent-badge consent-badge--no">Non inscrit</span>'}</dd>
            </div>
            ${c.status === 'pending' ? '<div class="detail-row"><dt>Statut</dt><dd><span class="pending-badge">En attente de validation</span></dd></div>' : ''}
          </dl>
        </div>

        <div class="detail-card">
          <h3 class="detail-card-title">Fidélité</h3>
          <div class="loyalty-wrap">
            <div class="loyalty-stat">
              <div class="loyalty-stat-value">${sessCount || 0}</div>
              <div class="loyalty-stat-label">Sessions</div>
            </div>
            <div class="loyalty-stat">
              <div class="loyalty-stat-value">${totalRevenue.toFixed(0)} €</div>
              <div class="loyalty-stat-label">Total dépensé</div>
            </div>
          </div>
        </div>

        ${c.contraindications ? `
        <div class="detail-card detail-card--warning">
          <h3 class="detail-card-title">Contre-indications médicales</h3>
          <p class="detail-text">${c.contraindications}</p>
        </div>` : ''}

        ${c.notes ? `
        <div class="detail-card">
          <h3 class="detail-card-title">Notes</h3>
          <p class="detail-text">${c.notes}</p>
        </div>` : ''}

        <div class="detail-card">
          <h3 class="detail-card-title">Dernières sessions</h3>
          ${sessions && sessions.length ? `
          <ul class="session-list">
            ${sessions.map(s => `
              <li class="session-item">
                <span class="session-date">${new Date(s.session_date).toLocaleDateString('fr-FR')}</span>
                <span class="session-type">${s.massage_types?.name || '—'}</span>
                ${s.duration_minutes ? `<span class="session-duration">${s.duration_minutes} min</span>` : ''}
              </li>
            `).join('')}
          </ul>` : '<p class="empty-text">Aucune session enregistrée</p>'}
        </div>
      </div>
    `;
  }

  async function renderForm(container, id) {
    let c = {};
    if (id) {
      const { data, error } = await db.from('clients').select('*').eq('id', id).single();
      if (error) { showError(container, error.message); return; }
      c = data;
    }
    const isEdit = !!id;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <button class="back-btn" onclick="Router.navigate('clients')">← Clients</button>
          <h1 class="view-title">${isEdit ? 'Modifier' : 'Nouveau client'}</h1>
        </div>
      </div>

      <form class="form-card animate-in" id="client-form">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Prénom <span class="required">*</span></label>
            <input class="form-input" name="first_name" type="text" value="${c.first_name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Nom <span class="required">*</span></label>
            <input class="form-input" name="last_name" type="text" value="${c.last_name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" name="email" type="email" value="${c.email || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input class="form-input" name="phone" type="tel" value="${c.phone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Date de naissance</label>
            <input class="form-input" name="date_of_birth" type="date" value="${c.date_of_birth || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Contre-indications médicales</label>
          <textarea class="form-input form-textarea" name="contraindications">${c.contraindications || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Notes libres</label>
          <textarea class="form-input form-textarea" name="notes">${c.notes || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="consent-form-row">
            <input type="checkbox" name="email_consent" ${c.email_consent ? 'checked' : ''}>
            <span>Accepte de recevoir des actualités par email (newsletter)</span>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn--ghost" onclick="Router.navigate('clients')">Annuler</button>
          <button type="submit" class="btn btn--primary">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    `;

    document.getElementById('client-form').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const emailConsentChecked = fd.has('email_consent');
      const payload = Object.fromEntries(fd.entries());
      delete payload['email_consent'];
      payload.email_consent = emailConsentChecked;
      payload.email_consent_date = emailConsentChecked
        ? (c.email_consent_date || new Date().toISOString())
        : null;
      Object.keys(payload).forEach(k => { if (k !== 'email_consent' && k !== 'email_consent_date' && !payload[k]) payload[k] = null; });

      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Enregistrement…';

      let error;
      if (isEdit) {
        ({ error } = await db.from('clients').update(payload).eq('id', id));
      } else {
        ({ error } = await db.from('clients').insert(payload));
      }

      if (error) {
        btn.disabled = false;
        btn.textContent = isEdit ? 'Enregistrer' : 'Créer';
        showToast(error.message, 'error');
      } else {
        showToast(isEdit ? 'Client modifié' : 'Client créé');
        Router.navigate('clients');
      }
    });
  }

  async function deleteClient(id) {
    if (!confirm('Supprimer ce client ?')) return;
    const { error } = await db.from('clients').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Client supprimé');
    currentPage = 0;
    Router.navigate('clients');
  }

  function prevPage() { if (currentPage > 0) { currentPage--; Router.navigate('clients'); } }
  function nextPage() { currentPage++; Router.navigate('clients'); }

  async function exportCSV() {
    const { data, error } = await db.from('clients')
      .select('first_name, last_name, email, phone, date_of_birth, email_consent, created_at')
      .order('last_name');
    if (error) { showToast('Erreur export', 'error'); return; }
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date de naissance', 'Newsletter', 'Inscrit le'];
    const rows = (data || []).map(c => [
      c.first_name || '',
      c.last_name || '',
      c.email || '',
      c.phone || '',
      c.date_of_birth || '',
      c.email_consent ? 'Oui' : 'Non',
      c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'axel-clients.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Export téléchargé');
  }

  return { render, delete: deleteClient, prevPage, nextPage, exportCSV };
})();
