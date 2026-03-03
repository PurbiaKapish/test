// ---- your existing logic (unchanged) ----
function injectFindOnMeeshoBelow() {
  const PRODUCT_LINKS = {}; // optional map

  function findTitle() {
    return document.querySelector('#desktop-table h1, #desktop-table h2, #desktop-table h3, #desktop-table h4');
  }

  function getFirstRowProductId() {
    const firstTr = document.querySelector('#desktop-table table tbody tr');
    if (!firstTr) return null;

    const source = firstTr.querySelector('picture source[srcset]');
    const img = firstTr.querySelector('picture img[src], img[src]');
    const url = source?.getAttribute('srcset')?.split(/\s+/)[0] || img?.getAttribute('src') || '';

    const m = url?.match(/\/products\/(\d+)\//i);
    return m?.[1] || null;
  }

  function urlForProduct(pid) {
    if (!pid) return 'https://www.meesho.com';
    if (PRODUCT_LINKS[pid]) return PRODUCT_LINKS[pid];
    return `https://www.meesho.com/search?q=${pid}`;
  }

  const h = findTitle();
  if (!h) return;

  const pid = getFirstRowProductId();
  const href = urlForProduct(pid);

  let block = h.parentNode.querySelector('a[data-meesho-block="1"]');
  if (!block) {
    block = document.createElement('a');
    block.dataset.meeshoBlock = '1';
    block.target = '_blank';
    block.rel = 'noopener noreferrer';
    block.textContent = 'Find on Meesho.com';
    Object.assign(block.style, {
      display: 'inline-block',
      marginTop: '8px',
      padding: '10px 14px',
      borderRadius: '6px',
      background: '#3c29b7',
      color: '#fff',
      fontWeight: '600',
      textDecoration: 'none',
    });
    h.insertAdjacentElement('afterend', block);
  }
  block.href = href;
  block.title = pid ? `Find on Meesho.com (Product ID: ${pid})` : 'Find on Meesho.com';
}
// -----------------------------------------

// UTIL: wait for an element to appear (with timeout)
function waitForEl(selector, { timeout = 15000, root = document } = {}) {
  return new Promise((resolve, reject) => {
    const el = root.querySelector(selector);
    if (el) return resolve(el);

    const obs = new MutationObserver(() => {
      const found = root.querySelector(selector);
      if (found) {
        obs.disconnect();
        resolve(found);
      }
    });
    obs.observe(root, { childList: true, subtree: true });

    setTimeout(() => {
      obs.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
  });
}

// UTIL: debounce
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// INIT: run after table exists, and re-run on table updates
(async function boot() {
  // Optional tiny delay to let heavy SPAs settle
  setTimeout(() => {}, 0);

  try {
    // Wait for the stable anchor
    const container = await waitForEl('#desktop-table', { timeout: 20000 });
    // First run
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => injectFindOnMeeshoBelow());
    } else {
      setTimeout(() => injectFindOnMeeshoBelow(), 50);
    }

    // Re-run when the table content changes (SPA updates)
    const rerun = debounce(() => injectFindOnMeeshoBelow(), 200);
    const mo = new MutationObserver(rerun);
    mo.observe(container, { childList: true, subtree: true });

    // Also re-run on route changes (common in SPAs)
    const pushState = history.pushState;
    history.pushState = function (...a) {
      const ret = pushState.apply(this, a);
      setTimeout(() => injectFindOnMeeshoBelow(), 50);
      return ret;
    };
    window.addEventListener('popstate', () => setTimeout(() => injectFindOnMeeshoBelow(), 50));
  } catch {
  }
})();
