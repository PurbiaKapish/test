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

## Installation (Load as Unpacked Extension)

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the folder containing this repository.
5. Navigate to [meesho.com](https://www.meesho.com) to use the extension.

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
