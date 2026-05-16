const Newsletter = (() => {
  async function render(container) {
    if (!Auth.guard()) return;

    container.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;

    const { data, error } = await db
      .from('clients')
      .select('id, first_name, last_name, email, email_consent_date')
      .eq('email_consent', true)
      .not('email', 'is', null)
      .order('last_name');

    if (error) { showError(container, error.message); return; }

    const clients = data || [];
    const count = clients.length;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-inner">
          <span class="view-eyebrow">Communication</span>
          <h1 class="view-title">Newsletter</h1>
        </div>
        <button class="btn btn--primary" id="copy-all-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copier tous les emails
        </button>
      </div>

      <p class="newsletter-meta">${count} contact${count > 1 ? 's' : ''} inscrit${count > 1 ? 's' : ''}</p>

      ${count === 0 ? `
        <div class="table-wrap animate-in">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <p class="empty-state-title">Aucun client inscrit à la newsletter</p>
            <p class="empty-state-sub">Invitez vos clients à s'inscrire via le formulaire public.</p>
          </div>
        </div>
      ` : `
        <div class="table-wrap animate-in">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Inscrit le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${clients.map(c => {
                const name = `${c.first_name || ''} ${c.last_name || ''}`.trim();
                const consentDate = c.email_consent_date
                  ? new Date(c.email_consent_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '—';
                return `
                <tr>
                  <td><span class="client-name">${name}</span></td>
                  <td><span class="text-mono">${c.email}</span></td>
                  <td>${consentDate}</td>
                  <td>
                    <button class="icon-btn copy-email-btn" title="Copier cet email" data-email="${c.email}">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    // Copy single email
    container.querySelectorAll('.copy-email-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.email;
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email copié !');
        });
      });
    });

    // Copy all emails
    const copyAllBtn = container.querySelector('#copy-all-btn');
    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', () => {
        if (clients.length === 0) { showToast('Aucun email à copier.', 'info'); return; }
        const allEmails = clients.map(c => c.email).join(', ');
        navigator.clipboard.writeText(allEmails).then(() => {
          showToast('📋 Emails copiés !');
        });
      });
    }
  }

  return { render };
})();
