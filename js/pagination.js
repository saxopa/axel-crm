const pagination = (() => {
  const DEFAULT_PAGE_SIZE = 20;

  async function paginate(supabaseQuery, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabaseQuery
        .range(from, to)
        .throwOnError();

      if (error) throw error;

      const total = count ?? 0;
      return {
        data: data ?? [],
        count: total,
        hasNext: to < total - 1,
        hasPrev: page > 1,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (e) {
      console.error('[pagination] paginate error:', e);
      return { data: [], count: 0, hasNext: false, hasPrev: false, page, pageSize, totalPages: 0 };
    }
  }

  function renderPagination(container, state, onPageChange) {
    if (!container) return;

    const { page, totalPages, hasNext, hasPrev } = state;

    container.innerHTML = '';

    if (totalPages <= 1) return;

    const nav = document.createElement('nav');
    nav.className = 'pagination';
    nav.setAttribute('aria-label', 'Pagination');

    const btnPrev = document.createElement('button');
    btnPrev.textContent = '← Préc.';
    btnPrev.disabled = !hasPrev;
    btnPrev.addEventListener('click', () => { if (hasPrev) onPageChange(page - 1); });

    const info = document.createElement('span');
    info.className = 'pagination__info';
    info.textContent = `Page ${page} / ${totalPages}`;

    const btnNext = document.createElement('button');
    btnNext.textContent = 'Suiv. →';
    btnNext.disabled = !hasNext;
    btnNext.addEventListener('click', () => { if (hasNext) onPageChange(page + 1); });

    nav.append(btnPrev, info, btnNext);
    container.appendChild(nav);
  }

  return { paginate, renderPagination };
})();
