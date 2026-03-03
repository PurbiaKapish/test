# SellerRadar Free - Meesho Seller Tool

A **free, open-source** Chrome extension for Meesho sellers. No account, no subscription, no backend server required — it works entirely by calling Meesho's public API directly.

## 📦 Quick Download

> **Repository:** https://github.com/PurbiaKapish/test
>
> ### ⬇️ [Click here to Download ZIP](https://github.com/PurbiaKapish/test/archive/refs/heads/copilot/convert-extension-to-open-source.zip)
>
> Click the link above to download all extension files as a ZIP — no account or Git required.

## Features

- **Product List Info Boxes** — See category, listing price, shipping charge, creation date, supplier state, quality score, and orders/day directly on Meesho search/category pages.
- **Product Details Panel** — On individual product pages, view full analytics: daily & lifetime orders, quality score, catalog info, Meesho Mall status, affiliate commission, and review breakdown.
- **Review Analytics** — Interactive bar chart of reviews over time, per-star counts, and CSV export.
- **Image Downloader** — Download all product images from the product carousel with one click.
- **Floating Action Button** — Quick access button on all Meesho pages.
- **SPA Navigation Support** — Works seamlessly with Meesho's single-page app navigation.
- **Supplier Portal Link** — Adds a "Find on Meesho.com" button on supplier.meesho.com pages.

## Installation

### Step 1 — Download the extension files

### ⬇️ [Download ZIP](https://github.com/PurbiaKapish/test/archive/refs/heads/copilot/convert-extension-to-open-source.zip)

1. Click the **Download ZIP** link above (or on the GitHub page click the green **`<> Code`** button → **`Download ZIP`**).
2. Once downloaded, **right-click** the ZIP file and choose **Extract All** (Windows) or double-click to unzip (Mac).
3. After extraction you will have a folder. **Open it** — inside you will find another folder with the same name. That inner folder is the one that contains `manifest.json` and all the extension files. **You need to select that inner folder in Step 2, not the outer one.**

> **⚠️ Common mistake — "Manifest file is missing or unreadable":**  
> GitHub ZIPs always contain an extra wrapper folder. When Windows extracts the ZIP it creates *yet another* outer folder, so you end up two levels deep:  
> ```
> <downloaded-folder>\          ← do NOT select this
>   └── <inner-folder>\         ← select THIS folder (it contains manifest.json)
>         ├── manifest.json
>         ├── content.js
>         └── ...
> ```  
> Chrome requires the folder you select to have `manifest.json` directly inside it.

> **Alternative:** If you have Git installed, run `git clone https://github.com/PurbiaKapish/test.git` — the cloned folder has the correct flat structure with no nesting.

### Step 2 — Load the extension into Chrome

1. Open Chrome and paste `chrome://extensions/` in the address bar, then press **Enter**.
2. Turn on **Developer mode** using the toggle in the **top-right corner**.
3. Click the **Load unpacked** button that appears.
4. In the file picker, navigate into the extracted ZIP folder and select the **inner** folder that directly contains `manifest.json` (see the warning in Step 1 above if you are not sure which folder to pick).
5. The **SellerRadar Free** extension will appear in your extensions list.

### Step 3 — Use it

1. Go to [meesho.com](https://www.meesho.com) and browse any product category.
2. Product info boxes will appear automatically on product cards.
3. Open any product page to see the full analytics panel.

## How It Works

- The extension calls Meesho's public search API (`https://www.meesho.com/api/v1/products/search`) directly — no external server involved.
- Product data (listing price, shipping, orders, reviews, etc.) is fetched in the background service worker and displayed as overlays on product cards.
- API calls are rate-limited to 3 per second to avoid overloading Meesho's servers.
- Data is cached for 30 minutes to minimise repeat requests.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome extension manifest (MV3) |
| `background.js` | Service worker — API calls, downloads, rate limiting |
| `content.js` | Content script — UI overlays on meesho.com |
| `supplier_content.js` | Content script — supplier.meesho.com integration |
| `css/common.css` | Shared styles |
| `img/icon256.png` | Extension icon |

## License

MIT License — free to use, modify, and distribute.
