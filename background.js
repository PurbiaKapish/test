// --- API CALL QUEUE WITH RATE LIMIT (max 3/sec) ---
const searchQueue = [];
let activeSearches = 0;
const MAX_CALLS_PER_SEC = 3;
const API_BASE = "https://sr.oneclickoms.com/api/v1";
const LOGIN_URL = "https://sr.oneclickoms.com/api/auth/sign-in";
const SIGNUP_URL = "https://sr.oneclickoms.com/api/auth/sign-up";
const PAYMENT_URL = "https://sr.oneclickoms.com/api/payment/submit";
const API = "https://www.meesho.com/api/v1/products";
const AUTH_COOKIE_NAME = "auth_token_seller";
const EMAIL_COOKIE_NAME = "email_seller";
const FULL_NAME_COOKIE_NAME = "full_name_seller";
const PLAN_EXPIRE_COOKIE_NAME = "plan_expire_seller";
const AUTH_COOKIE_URL = "https://meesho.com/"; // cookie origin (must match when set)


function processSearchQueue() {
  while (activeSearches < MAX_CALLS_PER_SEC && searchQueue.length > 0) {
    const { product_id, resolve, reject } = searchQueue.shift();
    activeSearches++;
    searchProduct(product_id)
      .then(data => {
        return sendListingData(data).then(listingRes => {
          resolve(listingRes);
        });
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

  if (msg?.type === "auth_status") {
    isLoggedIn().then(sendResponse);
    return true; // async
  }

  if (msg?.type === "logout") {
    chrome.cookies.remove(
      { url: AUTH_COOKIE_URL, name: AUTH_COOKIE_NAME },
      () => {
        chrome.cookies.remove(
          { url: AUTH_COOKIE_URL, name: EMAIL_COOKIE_NAME },
          () => {
            chrome.cookies.remove(
              { url: AUTH_COOKIE_URL, name: PLAN_EXPIRE_COOKIE_NAME },
              () => {
                chrome.cookies.remove(
                  { url: AUTH_COOKIE_URL, name: FULL_NAME_COOKIE_NAME },
                  () => {
                    const err = chrome.runtime.lastError;
                    sendResponse({ ok: !err, error: err?.message || null });
                  }
                );
              }
            );
          }
        );
      }
    );
    return true; // async
  }

  if (msg?.type === "refresh_user") {
    isLoggedIn().then(async (authData) => {
      if (!authData.loggedIn || !authData.token) {
        sendResponse({ ok: false, error: "Not logged in" });
        return;
      }
      try {
        const resp = await fetch("https://sr.oneclickoms.com/api/user/me", {
          headers: { "Authorization": `Bearer ${authData.token}` }
        });
        const data = await resp.json();

        if (data.email) {
          // Update cookies
          await new Promise(r => chrome.cookies.set({ url: AUTH_COOKIE_URL, name: EMAIL_COOKIE_NAME, value: data.email, expirationDate: (Date.now() / 1000) + (86400 * 30) }, r));
          await new Promise(r => chrome.cookies.set({ url: AUTH_COOKIE_URL, name: FULL_NAME_COOKIE_NAME, value: data.full_name, expirationDate: (Date.now() / 1000) + (86400 * 30) }, r));
          await new Promise(r => chrome.cookies.set({ url: AUTH_COOKIE_URL, name: PLAN_EXPIRE_COOKIE_NAME, value: data.plan_expired, expirationDate: (Date.now() / 1000) + (86400 * 30) }, r));

          sendResponse({ ok: true, data });
        } else {
          sendResponse({ ok: false, error: "Invalid response" });
        }
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    });
    return true; // async
  }

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
    // searchProduct(msg?.query).then(data => sendResponse({ ok: true, data }))
    //        .catch(err => sendResponse({ ok: false, error: String(err) }));
    enqueueSearchProduct(msg?.query)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true; // keep the channel open for async response
  }

  if (msg?.type === "MEESHO_LIST") {
    ListingProduct(msg?.query)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true; // keep the channel open for async response
  }

  if (msg?.type === "auth_login") {
    sendLoginData(msg?.payload)
      .then(data => sendResponse({ ok: true, data }))
      .catch(e => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg?.type === "auth_signup") {
    sendSignupData(msg?.payload)
      .then(data => sendResponse({ ok: true, data }))
      .catch(e => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg?.type === "submit_payment") {
    submitPayment(msg?.payload)
      .then(data => sendResponse({ ok: true, data }))
      .catch(e => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg?.type === "get_plans") {
    getPlans()
      .then(data => sendResponse({ ok: true, data }))
      .catch(e => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg?.type === "set_cookie") {
    const { url, name, value, days = 30 } = msg;
    const expirationDate = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;

    chrome.cookies.set(
      {
        url,
        name,
        value,
        path: "/",
        secure: true,                 // required for SameSite=None
        sameSite: "no_restriction",   // cookie sent cross-site
        // httpOnly: true,            // enable if you do NOT need JS access
        expirationDate
      },
      (cookie) => {
        const err = chrome.runtime.lastError;
        if (err) sendResponse({ ok: false, error: err.message });
        else sendResponse({ ok: true, cookie });
      }
    );
    return true;
  }

  sendResponse({ ok: true });
});

// Optional: notify content/popup when auth cookie changes
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie?.name !== AUTH_COOKIE_NAME) return;
  // Push an "auth_changed" event to active tabs
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "auth_changed" }).catch?.(() => { });
      }
    }
  });
});

// --- HEARTBEAT (proves SW can wake) ---
chrome.alarms.create("heartbeat", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "heartbeat") {
  }
});


function getCookie(name) {
  return new Promise((resolve) => {
    chrome.cookies.get(
      { url: AUTH_COOKIE_URL, name },
      (cookie) => resolve(cookie?.value || null)
    );
  });
}

async function isLoggedIn() {
  const token = await getCookie(AUTH_COOKIE_NAME);
  const email = await getCookie(EMAIL_COOKIE_NAME);
  const full_name = await getCookie(FULL_NAME_COOKIE_NAME);
  const plan_expire = await getCookie(PLAN_EXPIRE_COOKIE_NAME);
  return { loggedIn: Boolean(token), token, email, full_name, plan_expire };
}


// Reusable fetch with timeout and query params
async function apiGet(path, { headers = {}, params = {}, timeoutMs = 1500000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort("timeout"), timeoutMs);
  // Build query string if params provided
  const queryString = Object.keys(params).length
    ? `?${new URLSearchParams(params).toString()}`
    : "";
  const res = await fetch(`${API_BASE}${path}${queryString}`, {
    method: "GET",
    headers: {
      ...headers,
    },
    signal: controller.signal
  }).finally(() => clearTimeout(t));

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  try {
    return await res.json();
  } catch {
    return await res.text();
  }
}

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

async function ListingProduct(productIds) {
  try {
    const token = await getCookie(AUTH_COOKIE_NAME);
    if (!token) throw new Error("No auth cookie found");
    const data = await apiGet("/listing-data", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        product_ids: productIds
      }
    });

    // Check if API returned a "plan expired" error
    if (data?.detail && data.detail.toLowerCase().includes("plan has expired")) {
      return { error: "plan_expired", detail: data.detail };
    }

    return data;
  } catch (e) {
    return { error: e.message };
  }
}

async function sendListingData(data) {
  const token = await getCookie(AUTH_COOKIE_NAME);
  if (!token) throw new Error("No auth cookie found");
  const res = await fetch(`${API_BASE}/listing-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`ListingData HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

async function sendLoginData(data) {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`LoginData HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

async function sendSignupData(data) {
  const res = await fetch(SIGNUP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`SignupData HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

async function submitPayment(data) {
  // Get auth token from cookies
  const cookie = await chrome.cookies.get({ url: AUTH_COOKIE_URL, name: AUTH_COOKIE_NAME });
  const token = cookie?.value;

  if (!token) {
    throw new Error("Not authenticated. Please login first.");
  }

  const res = await fetch(PAYMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Payment HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

async function getPlans() {
  const cookie = await chrome.cookies.get({ url: AUTH_COOKIE_URL, name: AUTH_COOKIE_NAME });
  const token = cookie?.value;

  if (!token) {
    throw new Error("Not authenticated. Please login first.");
  }

  const res = await fetch("https://sr.oneclickoms.com/api/payment/plans", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error(`Plans HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}
