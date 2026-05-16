const perf = (() => {
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function lazyRender(items, renderFn, container) {
    if (!container) return;
    container.innerHTML = '';
    const BATCH = 50;
    let index = 0;

    function renderBatch() {
      const fragment = document.createDocumentFragment();
      const end = Math.min(index + BATCH, items.length);
      for (; index < end; index++) {
        try {
          const node = renderFn(items[index], index);
          if (node) fragment.appendChild(node);
        } catch (e) {
          console.error('[perf] lazyRender renderFn error at index', index, e);
        }
      }
      container.appendChild(fragment);
      if (index < items.length) requestAnimationFrame(renderBatch);
    }

    requestAnimationFrame(renderBatch);
  }

  function measureView(viewName, fn) {
    const start = performance.now();
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then((val) => {
        console.debug(`[perf] ${viewName} loaded in ${(performance.now() - start).toFixed(1)}ms`);
        return val;
      });
    }
    console.debug(`[perf] ${viewName} loaded in ${(performance.now() - start).toFixed(1)}ms`);
    return result;
  }

  return { debounce, lazyRender, measureView };
})();
