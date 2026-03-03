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
      .then(data => {
        resolve(data);
      })
      .catch(reject)
      .finally(() => {
        activeSearches--;
      });
  }
}

// Wrapper to enqueue searchProduct calls
function enqueueSearchProduct(product_id) {
  return new Promise((resolve, reject) => {
    searchQueue.push({ product_id, resolve, reject });
  });
}

setInterval(processSearchQueue, 333);

// Wakes the SW when you click the toolbar icon (nice manual test)
chrome.action.onClicked.addListener((tab) => {
});

// Normal navigation/reload (URL changes with full load)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
  }
});

// SPA navigation (history.pushState/replaceState)
chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    chrome.tabs.sendMessage(details.tabId, { type: "SPA_URL", url: details.url });
  },
  { url: [{ hostContains: "meesho.com" }] }
);

// Optional: also log committed/completed
chrome.webNavigation.onCommitted.addListener(d => {
});
chrome.webNavigation.onCompleted.addListener(d => {
});

// Receive pings/messages from content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === "download") {
    if (msg.url) {
      chrome.downloads.download(
        {
          url: msg.url,
          filename: msg.filename || "meesho-product.webp",
          conflictAction: "uniquify",
          saveAs: false
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
          } else {
          }
        }
      );

    }

    if (msg.csv) {
      const csvText = "\uFEFF" + msg.csv; // BOM for Excel
      const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csvText);
      chrome.downloads.download(
        {
          url: dataUrl,
          filename: msg.filename || `reviews_${new Date().toISOString().slice(0, 10)}.csv`,
          conflictAction: "uniquify",
          saveAs: false
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
          } else {
          }
        }
      );
      sendResponse({ ok: true });
      return true;
    }

  }

  if (msg?.type === "MEESHO_SEARCH") {
    enqueueSearchProduct(msg?.query)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true; // keep the channel open for async response
  }

  if (msg?.type === "MEESHO_LIST") {
    listProducts(msg?.query)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true; // keep the channel open for async response
  }

  sendResponse({ ok: true });
});

// --- HEARTBEAT (proves SW can wake) ---
chrome.alarms.create("heartbeat", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "heartbeat") {
  }
});


// Reusable fetch with timeout
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
    const data = await apiPost("/search", product_id, page = 1, limit = 20);
    return data;
  } catch (e) {
  }
}

async function listProducts(productIds) {
  try {
    const ids = productIds.split(",").map(id => id.trim()).filter(Boolean);
    const results = {};
    for (const id of ids) {
      const searchData = await enqueueSearchProduct(id);
      if (searchData) {
        const product = searchData?.data;
        if (product) {
          results[String(id)] = product;
        }
      }
    }
    return { data: results };
  } catch (e) {
    return { error: e.message };
  }
}
