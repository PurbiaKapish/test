# SellerRadar Free - Meesho Seller Tool

A **free, open-source** Chrome extension for Meesho sellers. No account, no subscription, no backend server required — it works entirely by calling Meesho's public API directly.

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

1. On this GitHub page, click the green **`<> Code`** button (top-right of the file list).
2. Click **`Download ZIP`**.
3. Once downloaded, **right-click** the ZIP file and choose **Extract All** (Windows) or double-click to unzip (Mac).
4. You should now have a folder ending in `-main` (e.g. `test-main`) containing all the extension files.

> **Alternative:** If you have Git installed, run `git clone https://github.com/PurbiaKapish/test.git`

### Step 2 — Load the extension into Chrome

1. Open Chrome and paste `chrome://extensions/` in the address bar, then press **Enter**.
2. Turn on **Developer mode** using the toggle in the **top-right corner**.
3. Click the **Load unpacked** button that appears.
4. In the file picker, select the folder you extracted in Step 1 — it must be the folder that directly contains `manifest.json` (not a parent folder).
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
| `common.css` | Shared styles |
| `icon256.png` | Extension icon |

## License

MIT License — free to use, modify, and distribute.
