const Auth = (() => {
  let _session = null;

  async function init() {
    const { data } = await db.auth.getSession();
    _session = data.session;
    db.auth.onAuthStateChange((_event, session) => {
      _session = session;
      if (!session) Router.navigate('login');
    });
    return _session;
  }

  async function login(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    _session = data.session;
    return _session;
  }

  async function logout() {
    await db.auth.signOut();
    _session = null;
    Router.navigate('login');
  }

  function guard() {
    if (!_session) {
      Router.navigate('login');
      return false;
    }
    return true;
  }

  function session() { return _session; }

  return { init, login, logout, guard, session };
})();
