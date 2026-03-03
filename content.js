(function () {
  // Patch SPA history to detect in-page route changes
  const fire = () => {
    chrome.runtime.sendMessage({ type: "URL_CHANGED", url: location.href }, () => void 0);
  };

  ["pushState", "replaceState"].forEach(m => {
    const orig = history[m];
    history[m] = function () {
      const ret = orig.apply(this, arguments);
      fire();
      return ret;
    };
  });
  window.addEventListener("popstate", fire);

  fire();
  var lastSent = null;
  function getProductIdFromOg() {
    const el = document.querySelector('meta[property="og:image"]');
    if (!el?.content) return null;
    try {
      const { pathname } = new URL(el.content);
      const parts = pathname.split('/');
      const i = parts.indexOf('products');
      return i >= 0 ? parts[i + 1] : null;
    } catch {
      return null;
    }
  }

  function loadExtScript(filePath) {
    floatingButton();
    setTimeout(() => {
      if (filePath.includes('product-list')) {
        productList();
      }
      if (filePath.includes('product-details')) {
        const id = getProductIdFromOg();
        if (id && id !== lastSent) {
          lastSent = id;
          chrome.runtime.sendMessage(
            { type: "MEESHO_SEARCH", query: id },
            resp => {
              if (resp && resp.ok) {
                const data = (resp.data?.data || resp.data || {});
                if (data) {
                  const urlObj = new URL(window.location.href);
                  const segments = urlObj.pathname.split("/").filter(Boolean);
                  const productCode = segments.pop();
                  if (String(data.encrypted_product_id) == String(productCode)) {
                    productDetails(data);
                  }
                }
              }
            }
          );
        }
      }
    }, 1000);
  }

  window.loadExtScript = loadExtScript;
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "SPA_URL") {
      loadExtScript("product-list");
      if (window.location.href.includes('/p/')) {
        loadExtScript("product-details");
      }
    }
  });

  const obs = new MutationObserver(() => { });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  // Initial load
  loadExtScript("product-list");
  if (window.location.href.includes('/p/')) {
    loadExtScript("product-details");
  }
})();

function floatingButton() {
  if (document.getElementById("SellerRadar")) return;

  const fab = document.createElement("button");
  fab.id = "SellerRadar";
  fab.setAttribute("data-tooltip", "Seller Radar");

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("img/icon256.png");

  Object.assign(img.style, {
    width: "70%",
    height: "70%",
    borderRadius: "50%",
    objectFit: "cover",
    pointerEvents: "none"
  });
  fab.appendChild(img);

  Object.assign(fab.style, {
    position: "fixed",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    background: "#ffffff",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    cursor: "pointer",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0"
  });



  fab.addEventListener("click", () => {
    window.loadExtScript("product-list");
    if (window.location.href.includes('/p/')) {
      window.loadExtScript("product-details");
    }
  });

  document.body.appendChild(fab);
}

function productList() {
  const L = (function () {
    const prefix = "[SR]";
    const api = {
      info: (...a) => console.log(prefix, ...a),
      debug: (...a) => console.log(prefix, ...a),
      warn: (...a) => console.warn(prefix, ...a),
      error: (...a) => console.error(prefix, ...a),
    };
    try { return (window.SR_LOG && typeof window.SR_LOG.info === "function") ? window.SR_LOG : api; }
    catch { return api; }
  })();


  // --------- selectors / constants ---------
  const PRODUCTS_SELECTOR = '.products';
  const CARD_SELECTOR = '[class*="NewProductCardstyled__CardStyled"]';
  const PRICE_ROW_SELECTOR = CARD_SELECTOR; // we treat the whole card as the row
  const INFO_CLASS = 'my-custom-div';

  // caching & fetch control
  const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  const BATCH_SIZE = 20;             // request up to 10 pids per call
  const COOLDOWN_MS = 60 * 1000;      // 60s cooldown for misses/failures

  /** pid -> { data, t, sig } */
  const cache = new Map();
  /** pids currently being fetched */
  const inflight = new Set();
  /** pid -> timestamp (ms) until which we skip refetch */
  const missUntil = new Map();

  const now = () => Date.now();
  const isStale = (e) => !e || (now() - e.t) > CACHE_TTL_MS;

  const sendRuntimeMessage = (payload) => new Promise(res => {
    try { chrome.runtime.sendMessage(payload, (resp) => res(resp)); }
    catch (err) { }
  });

  // only include fields that are actually displayed (prevents unnecessary rerenders)
  const buildSignature = (info) => {
    const pick = v => v == null ? '' : String(v);
    return [
      pick(info.category_name),
      pick(info.listing_price),
      pick(info.shipping_charge),
      pick(info.catalog_activated),
      pick(info.quality),
      pick(info.orders_per_day),
    ].join('|');
  };

  // ---------- DOM helpers ----------
  function getProductIdFromRow(row) {
    try {
      const imageRow = row.querySelector('[class*="NewProductCardstyled__ProductImage"]');
      const imgUrl = imageRow?.querySelector("picture img")?.getAttribute("src");
      const match = imgUrl?.match(/products\/(\d+)\//);
      const pid = match ? match[1] : null;

      return pid;
    } catch (e) {
      return null;
    }
  }

  function findCardContainer(row) {
    return row.closest(CARD_SELECTOR) || row;
  }

  // we append inside the card and then pin to its bottom
  function insertionPoint(priceRow) {
    return findCardContainer(priceRow); // the card element
  }

  // ---------- pinned bottom utilities ----------
  function pinInsideCardBottom(card, box) {
    const cs = getComputedStyle(card);

    // make card positioned
    if (cs.position === 'static' || !cs.position) {
      card.dataset.srPosWasStatic = '1';
      card.style.position = 'relative';
    }

    // we’ll pin **flush** to the inner edge of the card (ignore its padding)
    const INSET_X = 0;   // 0 = no left/right space
    const INSET_Y = 0;   // 0 = no bottom space

    Object.assign(box.style, {
      position: 'absolute',
      left: INSET_X + 'px',
      right: INSET_X + 'px',
      bottom: INSET_Y + 'px',
      margin: '0',
    });

    // Reserve exactly the panel height (no extra breathing room)
    requestAnimationFrame(() => {
      const pb = parseFloat(cs.paddingBottom || '0');
      const h = box.offsetHeight;
      const need = h + INSET_Y;                 // no extra
      const want = Math.max(pb, need);
      if (!card.dataset.srPbOrig) card.dataset.srPbOrig = String(pb);
      card.style.paddingBottom = want + 'px';
    });
  }

  function toRoundedInt(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null; // or return 0 / "" based on your needs
    return Math.round(n);
  }

  function unpinFromCard(card) {
    if (!card) return;
    if (card.dataset.srPbOrig != null) {
      card.style.paddingBottom = `${card.dataset.srPbOrig}px`;
      delete card.dataset.srPbOrig;
    }
    if (card.dataset.srPosWasStatic === '1') {
      card.style.position = '';
      delete card.dataset.srPosWasStatic;
    }
  }

  function toDDMMYYYY(input) {
    if (input == "") {
      return input;
    }

    const m = String(input).match(
      /^(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2}:\d{2})?$/
    );
    if (!m) return ""; // or throw new Error("Invalid date format")
    const [, y, mo, d] = m;
    return `${d}-${mo}-${y}`;
  }


  // ---------- info box (fixed height, no wrap, ellipsis) ----------
  function buildInfoBox(data) {
    const FIXED_H = 140;
    const box = document.createElement("div");
    box.className = INFO_CLASS;

    Object.assign(box.style, {
      padding: "8px 10px",
      background: "rgb(248, 248, 255)",
      color: "#111",
      border: "1px solid #ececf5",
      borderRadius: "8px",
      width: "100%",
      boxSizing: "border-box",
      lineHeight: "1.3",
      fontSize: "13px",
      height: FIXED_H + "px",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      columnGap: "10px",
      rowGap: "6px",
      alignItems: "start",
      position: "relative"   // <<— required for absolute logo
    });

    // → Add Logo (top-right corner)
    const logo = document.createElement("img");
    logo.id = "Oneclickoms-logo-img";
    logo.alt = "OneClickOMS Logo";
    Object.assign(logo.style, {
      position: "absolute",
      right: "0px",
      width: "32px",
      height: "32px",
      borderRadius: "25%",
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      background: "#fff",
      cursor: "pointer"
    });

    // Load extension image correctly
    logo.src = chrome.runtime.getURL("img/icon256.png");

    box.appendChild(logo);

    const cellCSS = "white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
    const cat = data.category_name ?? "";
    const list = `₹${toRoundedInt(data.listing_price ?? 0)}`;
    const ship = `₹${toRoundedInt(data.shipping_charge ?? 0)}`;
    const created = toDDMMYYYY(data.catalog_activated ?? "");
    const state_name = data.state_name ?? "";
    const qual = data.quality_score;
    const orderperday = data.daily_order ?? "0 - 0 / day";

    box.innerHTML += `
    <div style="color:#6b7280; ${cellCSS}">Category:</div>   <div style="font-weight:600; ${cellCSS}" title="${cat}">${cat}</div>
    <div style="color:#6b7280; ${cellCSS}">Listing:</div>    <div style="font-weight:700; ${cellCSS}" title="${list}">${list}</div>
    <div style="color:#6b7280; ${cellCSS}">Shipping:</div>   <div style="font-weight:700; ${cellCSS}" title="${ship}">${ship}</div>
    <div style="color:#6b7280; ${cellCSS}">Created:</div>    <div style="font-weight:700; ${cellCSS}" title="${created}">${created}</div>
    <div style="color:#6b7280; ${cellCSS}">State:</div>      <div style="font-weight:700; ${cellCSS}" title="${state_name}">${state_name}</div>
    <div style="color:#6b7280; ${cellCSS}">Quality:</div>    <div style="font-weight:600; ${cellCSS}" title="${qual}">${qual} %</div>
    <div style="color:#6b7280; ${cellCSS}">Orders/Day*:</div><div style="font-weight:700; ${cellCSS}" title="${orderperday}">${orderperday}</div>
  `;

    return box;
  }


  // ---------- upsert/remove ----------
  function upsertInfoBoxForRow(priceRow, pid, info) {
    const sig = buildSignature(info);
    const card = insertionPoint(priceRow);

    let existing = card.querySelector(`.${INFO_CLASS}[data-sr-pid="${pid}"]`);
    if (existing && existing.dataset.srSig === sig) {
      return;
    }
    if (existing) existing.remove();

    const box = buildInfoBox(info);
    box.dataset.srPid = pid;
    box.dataset.srSig = sig;

    card.appendChild(box);
    pinInsideCardBottom(card, box);

  }

  function removeInfoBoxForRow(priceRow, pid) {
    const card = insertionPoint(priceRow);
    const existing = card.querySelector(`.${INFO_CLASS}[data-sr-pid="${pid}"]`);
    if (existing) {
      existing.remove();
      const still = card.querySelector(`.${INFO_CLASS}[data-sr-pid]`);
      if (!still) unpinFromCard(card);
    }
  }

  // ---------- main cycle ----------
  async function ensureInfoBoxes(root = document) {
    const t0 = performance.now();

    const products = root.querySelector(PRODUCTS_SELECTOR);
    if (!products) { ; return; }

    const rows = products.querySelectorAll(PRICE_ROW_SELECTOR);
    if (!rows.length) { return; }

    const pidToRow = new Map();
    rows.forEach(row => {
      const pid = getProductIdFromRow(row);
      if (pid) { pidToRow.set(pid, row); row.dataset.srPid = pid; }
    });

    const pids = [...pidToRow.keys()];

    // compute which pids to fetch (respect cooldown)
    const needFetch = [];
    for (const pid of pids) {
      const entry = cache.get(pid);
      const until = missUntil.get(pid) || 0;
      if (now() < until) continue;
      if (isStale(entry)) needFetch.push(pid);
    }

    // render from cache first
    for (const [pid, row] of pidToRow.entries()) {
      const entry = cache.get(pid);
      if (entry && !isStale(entry)) upsertInfoBoxForRow(row, pid, entry.data);
    }

    // filter inflight/cooldown and batch fetch
    const ready = needFetch.filter(pid => !inflight.has(pid) && (now() >= (missUntil.get(pid) || 0)));
    if (ready.length) {
      ready.forEach(pid => inflight.add(pid));

      for (let i = 0; i < ready.length; i += BATCH_SIZE) {
        const chunk = ready.slice(i, i + BATCH_SIZE);
        try {
          const resp = await sendRuntimeMessage({ type: "MEESHO_LIST", query: chunk.join(",") });

          if (!resp || !resp.ok) {
            const until = now() + COOLDOWN_MS;
            chunk.forEach(pid => missUntil.set(pid, until));

            // Check for plan expired error
            const errorType = resp?.data?.error;
            const errorDetail = resp?.data?.detail;
            if (errorType === "plan_expired") {
              console.warn("plan_expired error", errorDetail);
            }
          } else {
            // Check if error is in successful response
            if (resp.data?.error === "plan_expired") {
              console.warn("plan_expired", resp.data?.detail);
              return;
            }

            const payload = resp.data?.data;
            const dataMap =
              payload && !Array.isArray(payload)
                ? payload
                : Array.isArray(payload)
                  ? Object.fromEntries(payload.map(item => [String(item.product_id), item]))
                  : {};

            for (const pid of chunk) {
              const info = dataMap[String(pid)];
              const row = pidToRow.get(pid);

              if (info) {
                cache.set(pid, { data: info, t: now(), sig: buildSignature(info) });
                if (row) upsertInfoBoxForRow(row, pid, info);
              } else {
                missUntil.set(pid, now() + COOLDOWN_MS);
                if (row) removeInfoBoxForRow(row, pid);
              }
            }
          }
        } catch (err) {
          const until = now() + COOLDOWN_MS;
          chunk.forEach(pid => missUntil.set(pid, until));
        } finally {
          chunk.forEach(pid => inflight.delete(pid));
        }
      }
    }

    // cleanup orphans
    const live = new Set(pids);
    document.querySelectorAll(`.${INFO_CLASS}[data-sr-pid]`).forEach(box => {
      const pid = box.dataset.srPid;
      if (pid && !live.has(pid)) {
        const card = box.closest(CARD_SELECTOR);
        box.remove();
        if (card && !card.querySelector(`.${INFO_CLASS}[data-sr-pid]`)) unpinFromCard(card);
      }
    });

    const ms = (performance.now() - t0).toFixed(1);
  }

  let rafId = null;
  function scheduleEnsure() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => { rafId = null; ensureInfoBoxes(); });
  }

  let observer = null;
  function startObserving(productsRoot) {
    if (observer) observer.disconnect();
    observer = new MutationObserver((muts) => {
      scheduleEnsure();
    });
    observer.observe(productsRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset']
    });
    ensureInfoBoxes();
  }

  // ---------- attach to DOM ----------
  function tryAttach() {
    const productsRoot = document.querySelector(PRODUCTS_SELECTOR);
    if (productsRoot) {
      clearInterval(waitId);
      startObserving(productsRoot);
    } else {
    }
  }

  const waitId = setInterval(tryAttach, 800);
  tryAttach();

  // optional: react to SPA messages (keep cache for offline-first)
  try {
    chrome.runtime?.onMessage?.addListener?.((msg) => {
      if (msg?.type === "SPA_URL") {
        scheduleEnsure();
      }
    });
  } catch (e) {
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options); // e.g. "Aug 15"
}

function productDetails(resp) {
  if (!resp || !resp.product_id) return;

  const reviews = resp.reviews;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    counts[r.review_rating] = (counts[r.review_rating] || 0) + 1;
  });

  const total = reviews.length;

  const avg = total === 0 ? 0 : (reviews.reduce((sum, r) => sum + r.review_rating, 0) / total).toFixed(1);

  const negative_review = (counts[1] ?? 0) + (counts[2] ?? 0);

  const report = {
    total,
    negative_review,
    avg: parseFloat(avg),
    ratings: {}
  };

  const qualityScore = report.total > 0
    ? ((report.negative_review ?? 0) / report.total * 100).toFixed(2)
    : "0.00";

  for (let star = 5; star >= 1; star--) {
    const count = counts[star] || 0;
    report.ratings[star] = {
      count,
      percentage: total === 0 ? "0%" : Math.round((count / total) * 100) + "%"
    };
  }

  let chipsContainerInnerHTML = "";
  Object.entries(report.ratings).forEach(([star, data]) => {
    const chip = `
      <div class="chip c${star}">
        <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
          <b>${star}★</b>
          <span>${data.count}</span>
          <span style="color:#6b7280;">(${data.percentage})</span>
        </div>
      </div>`;
    chipsContainerInnerHTML += chip;
  });

  const mall_verified = resp.mall_verified || false; // <-- replace with backend value

  mallStatusDivInnerHTML = ''

  if (mall_verified) {
    mallStatusDivInnerHTML = `
      🏬 Meesho Mall: <b><span style="color:#16a34a; font-weight:700;">✔</span></b>
    `;
  } else {
    mallStatusDivInnerHTML = `
      🏬 Meesho Mall: <b><span style="color:#b91c1c; font-weight:700;">✖</span></b>
    `;
  }

  affiliateCommissionTextInnerHTML = ''
  if (resp.affiliate_commission_text && resp.affiliate_commission_text != '') {
    affiliateCommissionTextInnerHTML = `
      🤝 Affiliate: <b><span style="color:#16a34a; font-weight:700;"></span></b> 
      <b><span style="color:#000;">${resp.affiliate_commission_text}</span></b>
    `;
  } else {
    affiliateCommissionTextInnerHTML = `
      🤝 Affiliate: <b><span style="color:#b91c1c; font-weight:700;">✖</span></b>
    `;
  }

  let reviewsTrackInnerHTML = "";
  reviews.forEach(r => {
    const card = `
      <div class="card" style="min-width:250px; max-width:300px; height:160px; flex:0 0 auto; padding:10px; box-sizing:border-box; border:1px solid #e5e7eb; border-radius:8px;">

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong>${r.review_author}</strong>
          <small style="color:#6b7280;">${formatDate(r.review_date)}</small>
        </div>

        <div style="color:#f59e0b; margin:2px 0;">
          ${"★".repeat(r.review_rating)}${"☆".repeat(5 - r.review_rating)}
        </div>

        <div style="
            color:#374151;
            display:-webkit-box;
            -webkit-line-clamp:3;
            -webkit-box-orient:vertical;
            overflow:hidden;
            text-overflow:ellipsis;
            line-height:1.4;
            max-height:4.2em;
          ">
          ${r.review_comment}
        </div>
      </div>`;
    reviewsTrackInnerHTML += card;
  });

  const container = document.createElement("div");
  container.style.cssText = `
  	margin-bottom: 16px;
    width: 100%;
    border: 1px solid rgb(234, 234, 242);
    border-radius: 12px;
    font-family: "Mier bold";
  `;

  container.innerHTML = `
  <style>
    /* Scoped to this container only */
    #mm-wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111; }
    #mm-wrap .section {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;   /* <<< partition line */
    }
    #mm-wrap .section:last-of-type { border-bottom: 0; } /* no line after last */
    #mm-wrap .grid-two {
      display:grid; grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 16px;
    }
    #mm-wrap .chips {
      display:flex; flex-wrap:nowrap; gap:10px; overflow-x:auto; -ms-overflow-style:none; scrollbar-width:none;
    }
    #mm-wrap .chips::-webkit-scrollbar { display:none; }
    #mm-wrap .chip {
		flex:1 1 0;
		min-width:70px;
		height:80px;                /* fixed equal height */
		display:flex; ̰
		align-items:center;
		justify-content:center;
		border-radius:10px;
		border:1px solid transparent;
		}
  
  .grid-two > div{
    color: rgb(139, 139, 163);
  }
 
  .grid-two > div b {
    color: #000; 
    font-weight:500;
  }

  .icon-btn{
    width:34px; height:34px; border-radius:999px;
    border:1px solid #e5e7eb; background:#f3f4f6;
    display:inline-flex; align-items:center; justify-content:center;
    font-size:14px; cursor:pointer; line-height:1; user-select:none;
    transition:transform .05s ease, background .15s ease;
  }
  .icon-btn:hover{ background:#e5e7eb; }
  .icon-btn:active{ transform:scale(0.98); }

	#mm-wrap .chip > div {
		display:flex;
		flex-direction:column;
		align-items:center;
		justify-content:center;
		line-height:1.3;
	}
    #mm-wrap .chip.c5 { background:#e8f7e8; border-color:#e5efe5; }
    #mm-wrap .chip.c4 { background:#eff9ef; border-color:#e5efe5; }
    #mm-wrap .chip.c3 { background:#fff3d9; border-color:#f4e9c6; }
    #mm-wrap .chip.c2, #mm-wrap .chip.c1 { background:#ffe6e6; border-color:#f6d3d3; }

    #mm-wrap .reviews-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    #mm-wrap .cards-track {
      display:flex; gap:12px; overflow-x:auto; scroll-behavior:smooth; padding:2px 0 4px;
      -ms-overflow-style:none; scrollbar-width:none;
    }
    #mm-wrap .cards-track::-webkit-scrollbar { display:none; }
    #mm-wrap .card {
      flex:0 0 300px; background:#fff;
      border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.06);
      padding:12px;
    }
    #mm-wrap .arrow {
      width:34px; height:34px; border:none; border-radius:50%;
      background:#f3f4f6; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.08);
    }
  </style>

  <div id="mm-wrap">
    <!-- SECTION 1: Props / Metrics -->
	<!-- <div class="section" style="color:#d32f2f;font-weight:bold;margin-bottom:8px;">
	 ⚠️ Possible Review Manipulation Detected
	 </div>-->
    <div class="section">
      <div class="grid-two">
        <div>📈 Orders/Day*: <b>${resp.daily_order}</b></div>
        <div>📈 Lifetime Orders*: <b>${resp.lifetime_order}</b></div>

        <div>📈 Quality Score: <b>${resp.quality_score}%</b></div>
        <div>📅 Created Date: <b>${resp.catalog_activated}</b></div>

        <div style="overflow:hidden; text-overflow:ellipsis;">
          🏷️ Category:
          <span style="white-space:normal; word-wrap:break-word;">
            <b>${resp.category_name}</b>
          </span>
        </div>

        <div>📍 Supplier State: <b>${resp.state_code}</b></div>

        <div>🆔 Product ID: <b>${resp.product_id}</b></div>
        <div>🗂️ Catalog ID: <b>${resp.catalog_id}</b></div>

        <div>${mallStatusDivInnerHTML}</div>
        <div>${affiliateCommissionTextInnerHTML}</div>
      </div>
    </div>

    <!-- SECTION 2: Reviews header + 5 chips (single line) -->
    <div class="section">
      <div class="reviews-head" style="margin-top:10px; margin-bottom:20px;">
       <h3 style="margin:0; font-size:18px;">
        📊 <span style="font-weight:700;">Customer Reviews</span>
        <span style="font-size:12px; color:#6b7280; font-weight:500;">(Last 30 days)</span>
      </h3>
      <div style="display:flex; align-items:center; gap:8px;">
        <span id="avg-rating" style="font-weight:700; font-size:16px;">${report.avg}</span>
        <span id="stars" aria-hidden="true" style="color:#f59e0b; letter-spacing:1px;">${("★★★★★".slice(0, Math.round(report.avg)) + "☆☆☆☆☆".slice(Math.round(report.avg)))}</span>
        <span id="total-reviews" style="color:#6b7280; font-size:13px;">${report.total} reviews</span>
      </div>
      </div>
      <div class="chips" id="chips-container">${chipsContainerInnerHTML}</div>
    </div>

    <!-- SECTION 3: Recent Reviews + cards -->
    <div class="section">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <h4 style="margin:0; font-size:16px;">Recent Reviews</h4>

        <div style="display:flex; gap:8px; align-items:center;">
          <!-- Export icon button -->
          <button id="btn-export" type="button" aria-label="Export CSV"
            class="icon-btn" title="Export CSV">⬇︎</button>

          <button id="btn-left"  type="button" class="icon-btn" aria-label="Scroll left">←</button>
          <button id="btn-right" type="button" class="icon-btn" aria-label="Scroll right">→</button>
        </div>
      </div>

      <div id="reviews-track" class="cards-track">
		      ${reviewsTrackInnerHTML}
      </div>
    </div>
    <div class="section">
    </div
  </div>
`;

  function buildCsvFromReviews(reviews) {
    const headers = ["Review Date", "Review Rating", "Review Author", "Review Comment"];
    const esc = v => {
      v = v == null ? "" : String(v);
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const lines = [headers.join(",")];
    for (const r of reviews) {
      lines.push([
        formatDate(esc(r.review_date)),
        esc(r.review_rating),
        esc(r.review_author),
        esc(r.review_comment)
      ].join(","));
    }
    return lines.join("\n");
  }

  function exportReviewsToCSV() {
    const rows = reviews || [];
    if (!rows.length) {
      alert("No reviews to export");
      return;
    }

    const csv = buildCsvFromReviews(rows);
    chrome.runtime.sendMessage({
      action: "download",
      csv: csv,                                    // send CSV text
      filename: `${resp.product_id}_reviews_${new Date().toISOString().slice(0, 10)}.csv`
    });
  }

  // arrows behavior
  (() => {
    const track = container.querySelector('#reviews-track');
    const left = container.querySelector('#btn-left');
    const right = container.querySelector('#btn-right');
    const step = 320;
    if (track && left && right) {
      left.addEventListener('click', () => (track.scrollLeft -= step));
      right.addEventListener('click', () => (track.scrollLeft += step));
      track.addEventListener('wheel', e => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          track.scrollLeft += e.deltaY; e.preventDefault();
        }
      }, { passive: false });
    }

    const btn_export = container.querySelector('#btn-export');
    btn_export.addEventListener('click', () => exportReviewsToCSV());

  })();

  const targetNode = document.querySelector('div[class*="ProductDescription"]');
  // 3. Insert before the target
  if (targetNode && targetNode.parentNode) {
    targetNode.parentNode.insertBefore(container, targetNode);
  }
  // Append the chart section inside the "Recent Reviews" section
  (function appendNativeChart() {
    const mm = container.querySelector('#mm-wrap');
    const recentSec = mm?.querySelectorAll('.section')[3];
    if (!recentSec) return;

    recentSec.insertAdjacentHTML('beforeend', `
    <div style="margin-top:14px; border-top:1px dashed #eee; padding-top:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <h4 style="margin:0; font-size:16px;">Review Analytics</h4>
      </div>
      <div id="native-chart-wrap" style="position:relative; height:280px;">
        <canvas id="native-reviews-chart" width="640" height="280" style="width:100%; height:280px;"></canvas>
        <div id="native-tooltip" style="
          position:absolute; pointer-events:none; background:rgba(0,0,0,.85); color:#fff;
          font-size:12px; padding:8px 10px; border-radius:8px; display:none; max-width:220px;
          transform:translate(-50%, -100%); white-space:pre-line;
        "></div>
      </div>
    </div>
  `);

    // ---------------------------
    // GROUP BY DATE
    // ---------------------------
    function groupReviewsByDate(reviews) {
      const grouped = {};

      reviews.forEach(r => {
        const label = formatDateLabel(r.review_date); // "Nov 11"

        if (!grouped[label]) {
          grouped[label] = { label, total: 0, s5: 0, s4: 0, s3: 0, s2: 0, s1: 0 };
        }

        grouped[label].total += 1;
        grouped[label][`s${r.review_rating}`] += 1;
      });

      return Object.values(grouped);
    }

    // ---------------------------
    // SORT REVIEWS CHRONOLOGICALLY
    // ---------------------------
    const reviewsSort = reviews.sort((a, b) => {
      return new Date(a.review_date) - new Date(b.review_date);
    });

    const data = groupReviewsByDate(reviewsSort);

    // ---------------------------
    // DRAW CHART
    // ---------------------------
    const canvas = document.getElementById('native-reviews-chart');
    const tip = document.getElementById('native-tooltip');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Handle Retina scaling
    (function scaleCanvas() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;

      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    })();

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const pad = { top: 20, right: 16, bottom: 40, left: 36 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const maxY = Math.max(2, ...data.map(d => d.total));
    const yStep = Math.max(1, Math.ceil(maxY / 4));
    const finalMax = yStep * Math.ceil(maxY / yStep);

    const bars = [];
    const barWidth = (plotW / data.length) * 0.6;
    const xStep = (plotW / data.length);

    function yScale(v) {
      return pad.top + plotH - (v / finalMax) * plotH;
    }

    ctx.clearRect(0, 0, W, H);

    // ---------------------------
    // GRID + Y AXIS
    // ---------------------------
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = 0; y <= finalMax; y += yStep) {
      const yPix = yScale(y);
      ctx.beginPath();
      ctx.moveTo(pad.left, yPix);
      ctx.lineTo(W - pad.right, yPix);
      ctx.stroke();
      ctx.fillText(String(y), pad.left - 6, yPix);
    }

    // ---------------------------
    // X LABELS (HIDE EVEN INDEXES)
    // ---------------------------
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#6b7280';

    data.forEach((d, i) => {
      if (i % 2 === 1) return;  // ← HIDE EVEN LABELS

      const cx = pad.left + i * xStep + xStep / 2;
      ctx.save();
      ctx.translate(cx - 14, H - pad.bottom + 10);
      ctx.rotate(-Math.PI / 8);
      ctx.fillText(d.label, 0, 0);
      ctx.restore();
    });

    // ---------------------------
    // BARS
    // ---------------------------
    data.forEach((d, i) => {
      const cx = pad.left + i * xStep + xStep / 2;
      const x = cx - barWidth / 2;
      const y = yScale(d.total);
      const h = pad.top + plotH - y;

      ctx.fillStyle = 'rgba(59,130,246,0.45)';
      ctx.fillRect(x, y, barWidth, h);

      bars.push({ x, y, w: barWidth, h, i });
    });

    // ---------------------------
    // TOOLTIP
    // ---------------------------
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      let hovered = null;
      for (const b of bars) {
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
          hovered = b;
          break;
        }
      }

      if (!hovered) {
        tip.style.display = 'none';
        return;
      }

      const d = data[hovered.i];
      tip.innerText =
        `${d.label}\n` +
        `Daily Reviews: ${d.total}\n` +
        `5★: ${d.s5}\n4★: ${d.s4}\n3★: ${d.s3}\n2★: ${d.s2}\n1★: ${d.s1}`;

      tip.style.left = `${px}px`;
      tip.style.top = `${py - 8}px`;
      tip.style.display = 'block';
    });

    canvas.addEventListener('mouseleave', () => {
      tip.style.display = 'none';
    });
  })();

  // Select by base class only
  const priceRow = document.querySelector('div[class*="ShippingInfo__PriceRow"]');
  if (priceRow) {
    // Create wrapper for extra info on the right
    const extra = document.createElement('div');
    extra.style.marginLeft = "auto";   // push to right side
    extra.style.display = "flex";
    extra.style.gap = "12px";
    extra.style.alignItems = "center";


    // Shipping block
    const shipping = document.createElement('div');
    shipping.style.textAlign = "right";
    shipping.style.marginRight = "16px";   //
    shipping.innerHTML = `
    <div style="font-size:14px; color:#555; margin-bottom:2px;">
      🚚 <b>Shipping</b>
    </div>
    <div style="font-size:32px; font-weight:bold; color:#111;">
      ₹${(parseInt(resp.shipping_charge) || 0)}
    </div>
  `;

    // Listing block
    const listing = document.createElement('div');
    listing.style.textAlign = "right";
    listing.innerHTML = `
    <div style="font-size:14px; color:#555; margin-bottom:2px;">
      💰 <b>Listing</b>
    </div>
    <div style="font-size:32px; font-weight:bold; color:#111;">
      ₹${(parseInt(resp.listing_price) || 0)}
    </div>
  `;


    // Append
    extra.appendChild(shipping);
    extra.appendChild(listing);

    priceRow.appendChild(extra);
  }

  // ---- config/selectors ----
  const carousel = document.querySelector('[class*="ProductCard__StyledCarousel"]');
  if (carousel) {
    // ---------- helpers ----------
    function toBaseJpg(urlStr) {
      try {
        const u = new URL(urlStr, location.href);
        const newPath = u.pathname.replace(
          /\/([^\/]+?)_(\d+w?|\d+)?\.(avif|webp|png|jpeg|jpg)$/i,
          (_, name) => `/${name}.jpg`
        );
        return `${u.origin}${newPath}`;
      } catch {
        const clean = urlStr.split(/[?#]/)[0];
        const base = clean.replace(/(_\d+w?|\.(avif|webp|png|jpeg|jpg))$/i, '');
        return base + '.jpg';
      }
    }

    function collectPictureJpgs(root) {
      const urls = new Set();
      root.querySelectorAll('picture source[srcset]').forEach(src => {
        const parts = (src.getAttribute('srcset') || '')
          .split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length) {
          const biggest = parts[parts.length - 1].split(' ')[0];
          urls.add(toBaseJpg(biggest));
        }
      });
      return [...urls];
    }

    async function smartDownload(url, filename = 'image.jpg') {
      try {
        chrome.runtime.sendMessage({
          action: "download",
          url: url,
          filename: filename
        });
      } catch (err) {
        console.error('CORS blocked download:', err);
        // window.open(url, '_blank'); // fallback: open in new tab
      }
    }

    // ---------- UI button ----------
    const btn = document.createElement('button');
    btn.textContent = 'Download Images';
    Object.assign(btn.style, {
      border: '1px solid #a20079',
      background: 'transparent',
      color: '#a20079',
      fontWeight: '600',
      fontSize: '14px',
      padding: '6px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      marginTop: '10px'
    });
    btn.addEventListener('mouseenter', () => { btn.style.background = '#a20079'; btn.style.color = '#fff'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = '#a20079'; });

    const translatedDiv = carousel.querySelector('div[translate]') || carousel;
    translatedDiv.appendChild(btn);

    btn.addEventListener('click', async () => {
      const urls = collectPictureJpgs(carousel);
      if (!urls.length) {
        alert('No images found in <picture> tags.');
        return;
      }
      let i = 1;
      for (const u of urls) {
        const jpg = toBaseJpg(u);
        const parts = jpg.split("/");
        const productId = parts[parts.indexOf("products") + 1];
        smartDownload(jpg, `meesho_image/${productId}_${i++}.jpg`);
        await new Promise(r => setTimeout(r, 150)); // small gap
      }
    });
  }

}