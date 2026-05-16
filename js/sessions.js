const Sessions = (() => {
  async function render(container, action, id) {
    if (!Auth.guard()) return;
    if (action === 'new') return renderForm(container, null);
    if (action === 'edit' && id) return renderForm(container, id);
    return renderList(container);
  }

  async function renderList(container) {
    container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
    const { data, error } = await db.from('sessions')
      .select('*, clients(first_name, last_name), massage_types(name)')
      .order('session_date', { ascending: false })
      .limit(50);

    if (error) { showError(container, error.message); return; }

    const grouped = {};
    (data || []).forEach(s => {
      const month = new Date(s.session_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(s);
    });

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <span class="view-eyebrow">Historique</span>
          <h1 class="view-title">Sessions</h1>
        </div>
        <button class="btn btn--primary" onclick="Router.navigate('sessions','new')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle
        </button>
      </div>

      <div class="sessions-container animate-in">
        ${Object.keys(grouped).length ? Object.entries(grouped).map(([month, sessions]) => `
          <div class="session-month-group">
            <h2 class="session-month-title">${month}</h2>
            <div class="session-timeline">
              ${sessions.map(s => `
                <div class="session-timeline-item">
                  <div class="session-timeline-dot"></div>
                  <div class="session-timeline-card">
                    <div class="session-timeline-header">
                      <div>
                        <strong class="session-client-name">${s.clients?.first_name || ''} ${s.clients?.last_name || ''}</strong>
                        <span class="session-type-badge">${s.massage_types?.name || '—'}</span>
                      </div>
                      <div class="session-meta">
                        <span class="session-date-small">${new Date(s.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        ${s.duration_minutes ? `<span class="session-duration">${s.duration_minutes} min</span>` : ''}
                        ${s.price_charged ? `<span class="session-price">${s.price_charged} €</span>` : ''}
                      </div>
                    </div>
                    ${s.notes ? `<p class="session-notes">${s.notes}</p>` : ''}
                    ${s.intensity ? `<div class="intensity-display">${[1,2,3,4,5].map(i => `<span class="intensity-dot${i <= s.intensity ? ' filled' : ''}"></span>`).join('')}</div>` : ''}
                    ${s.body_zones && s.body_zones.length ? `<div class="session-zones-badges">${s.body_zones.map(z => `<span class="zone-badge">${z}</span>`).join('')}</div>` : ''}
                    <div class="session-item-actions">
                      <button class="icon-btn" onclick="Router.navigate('sessions','edit','${s.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="icon-btn icon-btn--danger" onclick="Sessions.delete('${s.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('') : `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p>Aucune session enregistrée</p>
          </div>
        `}
      </div>
    `;
  }

  async function renderForm(container, id) {
    let s = {};
    if (id) {
      const { data, error } = await db.from('sessions').select('*').eq('id', id).single();
      if (error) { showError(container, error.message); return; }
      s = data;
    }
    const isEdit = !!id;

    const [clientsRes, massagesRes] = await Promise.all([
      db.from('clients').select('id, first_name, last_name').order('last_name'),
      db.from('massage_types').select('id, name, duration_minutes, price').order('name'),
    ]);

    const clients = clientsRes.data || [];
    const massages = massagesRes.data || [];

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <button class="back-btn" onclick="Router.navigate('sessions')">← Sessions</button>
          <h1 class="view-title">${isEdit ? 'Modifier session' : 'Nouvelle session'}</h1>
        </div>
      </div>

      <form class="form-card animate-in" id="session-form">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Client <span class="required">*</span></label>
            <select class="form-input form-select" name="client_id" required>
              <option value="">Sélectionner…</option>
              ${clients.map(c => `<option value="${c.id}" ${s.client_id === c.id ? 'selected' : ''}>${c.first_name} ${c.last_name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Type de massage <span class="required">*</span></label>
            <select class="form-input form-select" name="massage_type_id" id="massage-type-select" required>
              <option value="">Sélectionner…</option>
              ${massages.map(m => `<option value="${m.id}" data-duree="${m.duration_minutes || ''}" data-prix="${m.price || ''}" ${s.massage_type_id === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Date <span class="required">*</span></label>
            <input class="form-input" name="session_date" type="date" value="${s.session_date ? s.session_date.slice(0,10) : new Date().toISOString().slice(0,10)}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Durée (min)</label>
            <input class="form-input" name="duration_minutes" id="duree-input" type="number" min="0" value="${s.duration_minutes || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Prix (€)</label>
            <input class="form-input" name="price_charged" id="prix-input" type="number" min="0" step="0.01" value="${s.price_charged || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Intensité</label>
          <div class="intensity-picker" id="intensity-picker">
            <input type="hidden" name="intensity" id="intensity-val" value="${s.intensity || ''}">
            ${[1,2,3,4,5].map(n => `<button type="button" class="intensity-btn${s.intensity === n ? ' active' : ''}" data-val="${n}">${n}</button>`).join('')}
          </div>
          <small style="color:var(--text-3);font-size:.78rem;margin-top:4px;display:block">1 = très léger · 5 = très intense</small>
        </div>

        <div class="form-group">
          <label class="form-label">Zones travaillées</label>
          <div class="body-zones-grid">
            ${['Dos', 'Épaules', 'Nuque', 'Jambes', 'Pieds', 'Bras', 'Abdomen', 'Visage'].map(z => `
              <label class="zone-checkbox">
                <input type="checkbox" name="body_zones" value="${z}" ${(s.body_zones || []).includes(z) ? 'checked' : ''}>
                <span>${z}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-input form-textarea" name="notes">${s.notes || ''}</textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn--ghost" onclick="Router.navigate('sessions')">Annuler</button>
          <button type="submit" class="btn btn--primary">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    `;

    document.getElementById('massage-type-select').addEventListener('change', e => {
      const opt = e.target.selectedOptions[0];
      const dureeInput = document.getElementById('duree-input');
      const prixInput = document.getElementById('prix-input');
      if (!dureeInput.value && opt.dataset.duree) dureeInput.value = opt.dataset.duree;
      if (!prixInput.value && opt.dataset.prix) prixInput.value = opt.dataset.prix;
    });

    document.getElementById('intensity-picker').addEventListener('click', e => {
      const btn = e.target.closest('.intensity-btn');
      if (!btn) return;
      document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('intensity-val').value = btn.dataset.val;
    });

    document.getElementById('session-form').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const zones = [...e.target.querySelectorAll('[name=body_zones]:checked')].map(c => c.value);
      const payload = Object.fromEntries(fd.entries());
      Object.keys(payload).forEach(k => { if (k !== 'body_zones' && !payload[k]) payload[k] = null; });
      payload.body_zones = zones.length > 0 ? zones : null;

      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Enregistrement…';

      let error;
      if (isEdit) {
        ({ error } = await db.from('sessions').update(payload).eq('id', id));
      } else {
        ({ error } = await db.from('sessions').insert(payload));
      }

      if (error) {
        btn.disabled = false;
        btn.textContent = isEdit ? 'Enregistrer' : 'Créer';
        showToast(error.message, 'error');
      } else {
        showToast(isEdit ? 'Session modifiée' : 'Session créée');
        Router.navigate('sessions');
      }
    });
  }

  async function deleteSession(id) {
    if (!confirm('Supprimer cette session ?')) return;
    const { error } = await db.from('sessions').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Session supprimée');
    Router.navigate('sessions');
  }

  return { render, delete: deleteSession };
})();
