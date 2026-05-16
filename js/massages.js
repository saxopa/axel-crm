const Massages = (() => {
  async function render(container, action, id) {
    if (!Auth.guard()) return;
    if (action === 'new') return renderForm(container, null);
    if (action === 'edit' && id) return renderForm(container, id);
    return renderList(container);
  }

  async function renderList(container) {
    container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
    const { data, error } = await db.from('massage_types').select('*').order('nom');
    if (error) { showError(container, error.message); return; }

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <span class="view-eyebrow">Catalogue</span>
          <h1 class="view-title">Types de massage</h1>
        </div>
        <button class="btn btn--primary" onclick="Router.navigate('massages','new')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau
        </button>
      </div>

      <div class="massage-grid animate-in">
        ${data && data.length ? data.map(m => `
          <div class="massage-card">
            <div class="massage-card-header">
              <h3 class="massage-card-title">${m.nom}</h3>
              <div class="massage-card-actions">
                <button class="icon-btn" onclick="Router.navigate('massages','edit','${m.id}')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" onclick="Massages.delete('${m.id}')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
            ${m.description ? `<p class="massage-card-desc">${m.description}</p>` : ''}
            ${m.duree_defaut_minutes ? `<span class="massage-tag">${m.duree_defaut_minutes} min</span>` : ''}
            ${m.prix ? `<span class="massage-tag massage-tag--gold">${m.prix} €</span>` : ''}
          </div>
        `).join('') : `
          <div class="empty-state empty-state--full">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 12l2 2 4-4"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>
            <p>Aucun type de massage</p>
          </div>
        `}
      </div>
    `;
  }

  async function renderForm(container, id) {
    let m = {};
    if (id) {
      const { data, error } = await db.from('massage_types').select('*').eq('id', id).single();
      if (error) { showError(container, error.message); return; }
      m = data;
    }
    const isEdit = !!id;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <button class="back-btn" onclick="Router.navigate('massages')">← Types de massage</button>
          <h1 class="view-title">${isEdit ? 'Modifier' : 'Nouveau type'}</h1>
        </div>
      </div>

      <form class="form-card animate-in" id="massage-form">
        <div class="form-group">
          <label class="form-label">Nom <span class="required">*</span></label>
          <input class="form-input" name="nom" type="text" value="${m.nom || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input form-textarea" name="description">${m.description || ''}</textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Durée par défaut (min)</label>
            <input class="form-input" name="duree_defaut_minutes" type="number" min="0" value="${m.duree_defaut_minutes || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Prix (€)</label>
            <input class="form-input" name="prix" type="number" min="0" step="0.01" value="${m.prix || ''}">
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn--ghost" onclick="Router.navigate('massages')">Annuler</button>
          <button type="submit" class="btn btn--primary">${isEdit ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    `;

    document.getElementById('massage-form').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      Object.keys(payload).forEach(k => { if (!payload[k]) payload[k] = null; });

      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Enregistrement…';

      let error;
      if (isEdit) {
        ({ error } = await db.from('massage_types').update(payload).eq('id', id));
      } else {
        ({ error } = await db.from('massage_types').insert(payload));
      }

      if (error) {
        btn.disabled = false;
        btn.textContent = isEdit ? 'Enregistrer' : 'Créer';
        showToast(error.message, 'error');
      } else {
        showToast(isEdit ? 'Massage modifié' : 'Massage créé');
        Router.navigate('massages');
      }
    });
  }

  async function deleteMassage(id) {
    if (!confirm('Supprimer ce type de massage ?')) return;
    const { error } = await db.from('massage_types').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Type supprimé');
    Router.navigate('massages');
  }

  return { render, delete: deleteMassage };
})();
