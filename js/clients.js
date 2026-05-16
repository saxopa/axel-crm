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
      query = query.or(`prenom.ilike.%${searchQuery}%,nom.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await query.order('nom').range(from, to);
    if (error) { showError(container, error.message); return; }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <span class="view-eyebrow">Gestion</span>
          <h1 class="view-title">Clients</h1>
        </div>
        <button class="btn btn--primary" onclick="Router.navigate('clients','new')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau
        </button>
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
                    <span class="client-avatar">${(c.prenom?.[0] || '').toUpperCase()}${(c.nom?.[0] || '').toUpperCase()}</span>
                    <span>${c.prenom} ${c.nom}</span>
                  </div>
                </td>
                <td>${c.email || '—'}</td>
                <td>${c.telephone || '—'}</td>
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

    const { data: sessions } = await db.from('sessions')
      .select('*, massage_types(nom)')
      .eq('client_id', id)
      .order('date', { ascending: false })
      .limit(5);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <button class="back-btn" onclick="Router.navigate('clients')">← Clients</button>
          <h1 class="view-title">${c.prenom} ${c.nom}</h1>
        </div>
        <button class="btn btn--primary" onclick="Router.navigate('clients','edit','${c.id}')">Modifier</button>
      </div>

      <div class="detail-grid animate-in">
        <div class="detail-card">
          <h3 class="detail-card-title">Informations</h3>
          <dl class="detail-list">
            ${c.email ? `<div class="detail-row"><dt>Email</dt><dd><a href="mailto:${c.email}">${c.email}</a></dd></div>` : ''}
            ${c.telephone ? `<div class="detail-row"><dt>Téléphone</dt><dd>${c.telephone}</dd></div>` : ''}
            ${c.date_naissance ? `<div class="detail-row"><dt>Naissance</dt><dd>${new Date(c.date_naissance).toLocaleDateString('fr-FR')}</dd></div>` : ''}
          </dl>
        </div>

        ${c.contre_indications ? `
        <div class="detail-card detail-card--warning">
          <h3 class="detail-card-title">Contre-indications médicales</h3>
          <p class="detail-text">${c.contre_indications}</p>
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
                <span class="session-date">${new Date(s.date).toLocaleDateString('fr-FR')}</span>
                <span class="session-type">${s.massage_types?.nom || '—'}</span>
                ${s.duree_minutes ? `<span class="session-duration">${s.duree_minutes} min</span>` : ''}
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
            <input class="form-input" name="prenom" type="text" value="${c.prenom || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Nom <span class="required">*</span></label>
            <input class="form-input" name="nom" type="text" value="${c.nom || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" name="email" type="email" value="${c.email || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input class="form-input" name="telephone" type="tel" value="${c.telephone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Date de naissance</label>
            <input class="form-input" name="date_naissance" type="date" value="${c.date_naissance || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Contre-indications médicales</label>
          <textarea class="form-input form-textarea" name="contre_indications">${c.contre_indications || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Notes libres</label>
          <textarea class="form-input form-textarea" name="notes">${c.notes || ''}</textarea>
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
      const payload = Object.fromEntries(fd.entries());
      Object.keys(payload).forEach(k => { if (!payload[k]) payload[k] = null; });

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

  return { render, delete: deleteClient, prevPage, nextPage };
})();
