# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Viva Nova: a static marketing and shop site for an electrolyte sports drink sold in cans and bottles. It is plain HTML, CSS and vanilla JS with no build step, package manager, framework, tests or linter. It is not a git repository.

## Commands

```bash
python3 -m http.server 8123          # serve the site (also the "viva-nova" config in .claude/launch.json)
python3 tools/render_cans.py         # regenerate every can image in images/cans/
python3 tools/render_bottles.py      # regenerate every bottle image in images/bottles/
```

The scripts must be served over HTTP. Opening the HTML as a local file, or in a `data:` preview, loads none of the JS.

Both render scripts need `numpy` and `Pillow`, which the system Python here doesn't have, so use a venv. They load macOS system fonts (`/System/Library/Fonts/Avenir Next*.ttc`), so they only run on macOS as written. `render_bottles.py` imports its flavour list, fonts and text helpers from `render_cans.py`.

## Architecture

**All catalogue data lives in `js/data.js`** on the global `window.VN` namespace. It holds flavours, formats, pack sizes and prices, subscription rules, nutrition, the ingredients template, sports and URL/image helpers. Every page renders from it, so adding a flavour or changing a price is a data change, not a markup change.

**Products, formats and packs.** A product is either a flavour (`type: 'flavour'`) or the variety pack (`type: 'variety'`). Pack sizes are keyed by type, then by format: `VN.PACKS[type][fmt]`, where `fmt` is a key of `VN.FORMATS` (`can`, `bottle`). The formats a product comes in are simply the keys under its type (`VN.formatsFor(p)`), and the first one is the default. Flavours come in both formats; the variety pack comes in cans only. Every pricing helper in `site.js` takes the format explicitly: `packsFor(p, fmt)`, `packFor(p, fmt, size)`, `priceFor(p, fmt, size, sub)`, `savingFor(p, fmt, size)`, `packLabel(fmt, size)`. Use `VN.unitName(fmt, n)` for "can/cans/bottle/bottles" rather than hard-coding "can".

**Script load order matters.** Each page loads `data.js` → `site.js` → one page script (`home.js`, `flavour.js`, `sport.js`). Each file is an IIFE that reads from or adds to `VN`.

**`js/site.js` is the shared shell.** It:
- replaces the `#site-header` / `#site-footer` placeholders with the nav, footer, cart drawer and toast. The nav dropdowns and footer links are generated from `VN.FLAVOURS` and `VN.SPORTS`.
- owns the pricing helpers above.
- owns the cart. It is kept in `localStorage` under `vivanova.cart.v3`, and each line is `{ key: 'id|fmt|size|sub', id, fmt, size, sub, qty }`. `loadCart()` migrates old `v2` carts (cans only) and silently drops lines whose product, format or pack size no longer exists. Changing the line shape needs another key version bump plus a migration.
- provides `VN.productTag(f, fmt, view)` (the `<img class="can">` builder, with `VN.canTag` as its can-only shorthand), `VN.setShot()`, `VN.formatSeg()`, `VN.sizeSeg()`, `VN.bindBuyCards()`, `VN.setCardFormat()` and `VN.observe()`.

**Buy card contract** (`VN.bindBuyCards`): `<article class="buycard" data-id data-fmt data-size>` containing:
- the size buttons from `VN.sizeSeg()`, inside a `[data-seg]` wrapper so they can be re-rendered when the format changes
- an optional `VN.formatSeg()` Can/Bottle switch
- `img.can` images, which are swapped on a format change
- `a[data-fmt-link]` links and `[data-units]` text, both updated on a format change
- an optional `[data-sub]` checkbox and `[data-subnote]`
- `[data-price]`, `[data-was]`, `[data-per]` and `[data-add]`

The home shop grid and the sport page's recommended cards use this contract. The home page's shop-wide Cans/Bottles switch calls `VN.setCardFormat()` on every card. The flavour page (`flavour.js`) has its own separate purchase-state logic (`state.fmt/size/sub/qty/view`) and does not use buy cards.

**Pages** are routed by query string: `flavour.html?f=<flavour-id>[&fmt=bottle]` and `sport.html?s=<sport-id>`. Build these URLs with `VN.flavourUrl(id, fmt)`. The flavour page rewrites `fmt` in the URL with `history.replaceState` when the format changes. Each page's `<main id="page">` is rendered entirely by JS, with a "not found" fallback for unknown ids. `index.html` has static section markup and JS fills the hero carousel, flavour grid, the "Can or bottle?" section, sport tiles and the shop grid.

**After injecting markup that contains `.reveal` or `[data-count]` elements, call `VN.observe()`**, or those elements stay invisible.

**Product images** are generated, not photographed. Paths are `images/<cans|bottles>/<flavour-id>-<front|angle|back>.webp` (via `VN.productImg(id, fmt, view)`). Cans and bottles share the same 520×1000 transparent canvas, so a bottle drops into any slot styled for `.can`. That is why bottle images also carry the `.can` class (plus `.can--bottle`). Much of the CSS sizes these images by `height` with `width: auto`, and the layout assumes that tall aspect ratio.

## Duplicated data to keep in sync

- **The flavour list and colours** exist in both `js/data.js` (`VN.FLAVOURS`) and `tools/render_cans.py` (`FLAVOURS`), which `render_bottles.py` also uses. A new flavour needs both, then a re-run of both scripts.
- **The nutrition values and ingredients** printed on the can and bottle back labels are hard-coded in each render script, separately from `VN.NUTRITION` / `VN.ingredients`.
- **The newsletter block** is static in `index.html` and also generated by `VN.newsletterHTML()` for the other pages.
- **Marketing copy** in `index.html`, `flavour.js`, the flavour taglines and the header announcement bar hard-codes some figures and wording, such as "£2.29", "15%", "12 and 24-packs", the FAQ's pack sizes, and "A sunset in a can." These are not derived from `VN.PACKS` or `VN.SUB_DISCOUNT`.

## Stubs

Checkout (`#checkoutBtn`) and the newsletter form only show a toast. Payments and email are not connected. Bottle prices in `VN.PACKS.flavour.bottle` are placeholders.
