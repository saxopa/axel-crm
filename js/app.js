function showError(container, msg) {
  container.innerHTML = `<div class="error-state"><p>Erreur : ${msg}</p><button class="btn btn--ghost" onclick="history.back()">Retour</button></div>`;
}

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  document.getElementById('toast-container').appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast--visible'));
  setTimeout(() => {
    t.classList.remove('toast--visible');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

const Router = (() => {
  function navigate(view, action, id) {
    let hash = '#' + view;
    if (action) hash += '/' + action;
    if (id) hash += '/' + id;
    window.location.hash = hash;
  }

  function parse() {
    const raw = window.location.hash.slice(1) || 'dashboard';
    const parts = raw.split('/');
    return { view: parts[0] || 'dashboard', action: parts[1], id: parts[2] };
  }

  async function dispatch() {
    const { view, action, id } = parse();
    const content = document.getElementById('content');

    if (view !== 'login' && !Auth.session()) {
      navigate('login');
      return;
    }
    if (view === 'login' && Auth.session()) {
      navigate('dashboard');
      return;
    }

    setActiveNav(view);

    switch (view) {
      case 'dashboard': await Dashboard.render(content); break;
      case 'clients': await Clients.render(content, action, id); break;
      case 'massages': await Massages.render(content, action, id); break;
      case 'sessions': await Sessions.render(content, action, id); break;
      case 'login': renderLogin(content); break;
      default: navigate('dashboard');
    }
  }

  function setActiveNav(view) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('nav-link--active', el.dataset.view === view);
    });
    const sidebar = document.getElementById('sidebar');
    const isLogin = view === 'login';
    sidebar.style.display = isLogin ? 'none' : '';
    document.getElementById('topbar').style.display = isLogin ? 'none' : '';
    document.getElementById('content').className = isLogin ? 'content content--login' : 'content';
  }

  return { navigate, dispatch };
})();

function renderLogin(container) {
  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-brand">
          <div class="login-logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4z" fill="#2D6A4F" opacity=".15"/>
              <path d="M20 8c6.627 0 12 5.373 12 12S26.627 32 20 32 8 26.627 8 20 13.373 8 20 8z" fill="#2D6A4F" opacity=".2"/>
              <path d="M20 14a3 3 0 0 1 3 3c0 2.5-3 7-3 7s-3-4.5-3-7a3 3 0 0 1 3-3z" fill="#2D6A4F"/>
              <path d="M14 22c1.5-1 3.5-1.5 6-1.5s4.5.5 6 1.5" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="login-title">Axel<br><em>la main verte</em></h1>
        </div>
        <p class="login-sub">Espace professionnel — accès sécurisé</p>
        <form id="login-form" class="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" name="email" type="email" autocomplete="email" required placeholder="votre@email.com">
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input class="form-input" name="password" type="password" autocomplete="current-password" required placeholder="••••••••">
          </div>
          <p class="login-error" id="login-error" hidden></p>
          <button class="btn btn--primary btn--full" type="submit">Connexion</button>
        </form>
      </div>
      <div class="login-visual">
        <div class="login-visual-inner">
          <div class="botanical-motif"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Connexion…';
    const errEl = document.getElementById('login-error');
    errEl.hidden = true;
    try {
      await Auth.login(fd.get('email'), fd.get('password'));
      Router.navigate('dashboard');
    } catch (err) {
      errEl.textContent = err.message || 'Identifiants incorrects';
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Connexion';
    }
  });
}

async function init() {
  await Auth.init();
  window.addEventListener('hashchange', Router.dispatch);
  Router.dispatch();

  document.getElementById('logout-btn').addEventListener('click', Auth.logout.bind(Auth));
}

document.addEventListener('DOMContentLoaded', init);
