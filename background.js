// --- API CALL QUEUE WITH RATE LIMIT (max 3/sec) ---
const searchQueue = [];
let activeSearches = 0;
const MAX_CALLS_PER_SEC = 3;
const API = "https://www.meesho.com/api/v1/products";

function processSearchQueue() {
  while (activeSearches < MAX_CALLS_PER_SEC && searchQueue.length > 0) {
    const { product_id, resolve, reject } = searchQueue.shift();
    activeSearches++;
    searchProduct(product_id)
      .then(data => resolve(data))
      .catch(reject)
      .finally(() => { activeSearches--; });
  }
}

function enqueueSearchProduct(product_id) {
  return new Promise((resolve, reject) => {
    searchQueue.push({ product_id, resolve, reject });
  });
}

setInterval(processSearchQueue, 333);

chrome.action.onClicked.addListener((tab) => {});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {}
});

chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    chrome.tabs.sendMessage(details.tabId, { type: "SPA_URL", url: details.url });
  },
  { url: [{ hostContains: "meesho.com" }] }
);

chrome.webNavigation.onCommitted.addListener(d => {});
chrome.webNavigation.onCompleted.addListener(d => {});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "download") {
    if (msg.url) {
      chrome.downloads.download({
        url: msg.url,
        filename: msg.filename || "meesho-product.webp",
        conflictAction: "uniquify",
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {}
      });
    }
    if (msg.csv) {
      const csvText = "\uFEFF" + msg.csv;
      const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csvText);
      chrome.downloads.download({
        url: dataUrl,
        filename: msg.filename || `reviews_${new Date().toISOString().slice(0, 10)}.csv`,
        conflictAction: "uniquify",
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {}
      });
      sendResponse({ ok: true });
      return true;
    }
  }

  if (msg?.type === "MEESHO_SEARCH") {
    enqueueSearchProduct(msg?.query)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "MEESHO_LIST") {
    const productIds = (msg?.query || "").split(",").map(id => id.trim()).filter(Boolean);

    Promise.all(
      productIds.map(pid =>
        searchProduct(pid)
          .then(result => {
            const catalogs = result?.catalogs || [];
            for (const catalog of catalogs) {
              const products = catalog?.products || [];
              for (const product of products) {
                if (String(product.id) === String(pid)) {
                  return {
                    product_id: pid,
                    category_name: catalog.category_name || product.category_name || "",
                    listing_price: product.listing_price || product.price || 0,
                    shipping_charge: product.shipping_charge || 0,
                    catalog_activated: catalog.catalog_activated || "",
                    state_name: catalog.state_name || "",
                    quality_score: catalog.quality_score || product.quality_score || "",
                    daily_order: catalog.daily_order || "N/A",
                  };
                }
              }
            }
            return null;
          })
          .catch(() => null)
      )
    ).then(results => {
      const dataMap = {};
      results.filter(Boolean).forEach(item => {
        dataMap[String(item.product_id)] = item;
      });
      sendResponse({ ok: true, data: { data: dataMap } });
    }).catch(err => {
      sendResponse({ ok: false, error: String(err) });
    });
    return true;
  }

  sendResponse({ ok: true });
});

chrome.alarms.create("heartbeat", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "heartbeat") {}
});

async function apiPost(path, product_id, { timeoutMs = 150000, page = 1, limit = 20 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort("timeout"), timeoutMs);

  const body = JSON.stringify({
    query: product_id,
    type: "text_search",
    page: page,
    offset: 0,
    limit: limit,
    isDevicePhone: false
  });

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "content-type": "application/json",
    },
    body,
    signal: controller.signal,
  }).finally(() => clearTimeout(t));

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  try { return await res.json(); } catch { return await res.text(); }
}

async function searchProduct(product_id) {
  try {
    const data = await apiPost("/search", product_id, { page: 1, limit: 20 });
    return data;
  } catch (e) {
    return null;
  }
}
