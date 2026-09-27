/* ==========================================================================
   Viva Nova — shared site shell: header, footer, cart, toast, reveal
   Loaded on every page after data.js.
   ========================================================================== */
(() => {
  'use strict';
  const VN = window.VN;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  VN.$ = $;
  VN.$$ = $$;
  VN.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  VN.fmt = (n) => money.format(n);
  VN.round2 = (n) => Math.round(n * 100) / 100;

  /* ---------- Products & pricing ---------- */
  VN.productById = (id) => {
    if (id === 'variety') return VN.VARIETY;
    const f = VN.flavourById(id);
    return f && { id: f.id, type: 'flavour', name: f.name, notes: f.notes, badge: f.badge, flav: f };
  };
  // Formats (can, bottle) a product comes in; the first is its default.
  VN.formatsFor = (p) => Object.keys(VN.PACKS[p.type]);
  VN.validFormat = (p, fmt) => (VN.formatsFor(p).includes(fmt) ? fmt : VN.formatsFor(p)[0]);
  VN.packsFor = (p, fmt) => VN.PACKS[p.type][fmt] || [];
  VN.packFor = (p, fmt, size) => VN.packsFor(p, fmt).find((k) => k.size === Number(size));
  VN.canSubscribe = (size) => Number(size) >= VN.SUB_MIN_PACK;
  VN.priceFor = (p, fmt, size, sub) => {
    const pack = VN.packFor(p, fmt, size);
    if (!pack) return 0;
    return sub && VN.canSubscribe(size) ? VN.round2(pack.price * (1 - VN.SUB_DISCOUNT)) : pack.price;
  };
  // % saved per unit versus the smallest pack of that product in the same format
  VN.savingFor = (p, fmt, size) => {
    const packs = VN.packsFor(p, fmt);
    const base = packs[0].price / packs[0].size;
    const pack = VN.packFor(p, fmt, size);
    return Math.max(0, Math.round((1 - pack.price / pack.size / base) * 100));
  };
  VN.unitName = (fmt, n = 1) => (Number(n) === 1 ? VN.FORMATS[fmt].unit : VN.FORMATS[fmt].units);
  VN.packLabel = (fmt, size) => (Number(size) === 1 ? `Single ${VN.unitName(fmt)}` : `${size}-pack of ${VN.unitName(fmt, size)}`);
  // Pick the same pack size in another format, or the nearest one it offers.
  VN.nearestSize = (p, fmt, size) => {
    const sizes = VN.packsFor(p, fmt).map((k) => k.size);
    return sizes.reduce((best, s) => (Math.abs(s - size) < Math.abs(best - size) ? s : best), sizes[0]);
  };

  // Product image. Bottles share the cans' 520×1000 canvas, so they reuse every .can layout rule.
  VN.productTag = (f, fmt = 'can', view = 'front', cls = '', lazy = true) =>
    `<img class="can ${fmt === 'can' ? '' : `can--${fmt}`} ${cls}" src="${VN.productImg(f.id, fmt, view)}" alt="${f.name} ${VN.unitName(fmt)}${view === 'back' ? ', back label' : ''}" width="520" height="1000" decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
  VN.canTag = (f, view = 'front', cls = '', lazy = true) => VN.productTag(f, 'can', view, cls, lazy);
  // Can / Bottle switch. Renders nothing for products sold in one format.
  VN.formatSeg = (p, selected) => {
    const fmts = VN.formatsFor(p);
    if (fmts.length < 2) return '';
    return `
    <div class="fmt" role="radiogroup" aria-label="Format">
      ${fmts.map((k) => `<button type="button" role="radio" aria-checked="${k === selected}" data-fmt="${k}">${VN.FORMATS[k].label}</button>`).join('')}
    </div>`;
  };
  VN.varietyTag = () =>
    `<div class="multi">${['blue-voltage', 'citrus-surge', 'berry-blitz'].map((id) => VN.canTag(VN.flavourById(id))).join('')}</div>`;

  /* ---------- Icons ---------- */
  const ICONS = {
    running: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5M12 2.5v3.5M18.5 6.5l1.5-1.5"/>',
    football: '<circle cx="12" cy="12" r="9"/><path d="M12 7.6l3.8 2.8-1.4 4.5H9.6l-1.4-4.5z"/><path d="M12 3v4.6M15.8 10.4l4.5-1.5M14.4 14.9l2.8 3.9M9.6 14.9l-2.8 3.9M8.2 10.4 3.7 8.9"/>',
    gym: '<path d="M6.5 6v12M17.5 6v12M3 9v6M21 9v6M6.5 12h11"/>',
    cycling: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6.5l3 7.5M9 9l3.5 7.5L15.5 9M7.5 6h3M14 6h2l1 3"/>',
    court: '<ellipse cx="14.5" cy="9.5" rx="5.5" ry="6.5" transform="rotate(45 14.5 9.5)"/><path d="M10.2 13.8 4 20M11 9.5l4 4M13 7.5l4 4"/><circle cx="5" cy="5" r="2"/>',
    recovery: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    truck: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    return: '<path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19 13 11"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
  };
  VN.icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  const LOGO = '<svg class="logo__mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#C8FF1A" stroke="#0E0E14" stroke-width="4"/><path d="M32 12l5.5 14.5L52 32l-14.5 5.5L32 52l-5.5-14.5L12 32l14.5-5.5z" fill="#0E0E14"/></svg>';

  /* ---------- Header ---------- */
  function renderHeader() {
    const mount = $('#site-header');
    if (!mount) return;
    const offers = ['New: every flavour now in bottles', 'Free UK delivery over £30', 'Singles from £2.29', 'Subscribe &amp; save 15%', '10% off your first order'];
    const offerRun = (hidden) => offers.map((o) => `<span${hidden ? ' aria-hidden="true"' : ''}>${o}</span><i aria-hidden="true">✦</i>`).join('');
    mount.outerHTML = `
    <div class="announce" aria-label="Offers"><div class="announce__track">${offerRun(false)}${offerRun(true)}</div></div>
    <header class="nav" id="nav">
      <div class="container nav__inner">
        <a href="index.html" class="logo" aria-label="Viva Nova home">${LOGO}<span class="logo__word">Viva Nova</span></a>
        <nav class="nav__links" id="navLinks" aria-label="Main">
          <div class="dd">
            <a class="dd__trigger" href="index.html#flavours">Flavours ${VN.icon('chevron')}</a>
            <div class="dd__panel">
              ${VN.FLAVOURS.map((f) => `
                <a href="${VN.flavourUrl(f.id)}"><span class="dd__thumb" style="--c:${f.c}">${VN.canTag(f)}</span><span>${f.name}<small>${f.tags.slice(0, 2).join(' · ')}</small></span></a>`).join('')}
            </div>
          </div>
          <div class="dd">
            <a class="dd__trigger" href="index.html#sports">Sports ${VN.icon('chevron')}</a>
            <div class="dd__panel">
              ${VN.SPORTS.map((s) => `
                <a href="${VN.sportUrl(s.id)}"><span class="dd__thumb" style="--c:${s.c}">${VN.icon(s.id)}</span><span>${s.name}<small>${s.kicker.split(' · ')[0]}</small></span></a>`).join('')}
            </div>
          </div>
          <a href="index.html#bottles">Bottles <span class="nav__new">New</span></a>
          <a href="index.html#science">The Formula</a>
          <a href="index.html#shop">Shop</a>
          <a href="index.html#faq">FAQ</a>
        </nav>
        <div class="nav__actions">
          <a class="btn btn--ink btn--sm nav__shop" href="index.html#shop">Shop now</a>
          <button class="cart-btn" id="cartOpen" aria-label="Open cart" aria-controls="cart">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
            <span class="cart-count" id="cartCount">0</span>
          </button>
          <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navLinks"><span></span><span></span></button>
        </div>
      </div>
    </header>`;
  }

  /* ---------- Footer, cart drawer, toast ---------- */
  function renderFooter() {
    const mount = $('#site-footer');
    if (!mount) return;
    mount.outerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a href="index.html" class="logo">${LOGO}<span class="logo__word">Viva Nova</span></a>
            <p>Electrolyte hydration for people who don't do half effort.</p>
            <div class="socials">
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
              <a href="#" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 5 5.5 5"/></svg></a>
              <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg></a>
              <a href="#" aria-label="X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l16 16M20 4L4 20"/></svg></a>
            </div>
          </div>
          <div class="footer__col"><h4>Flavours</h4>${VN.FLAVOURS.map((f) => `<a href="${VN.flavourUrl(f.id)}">${f.name}</a>`).join('')}</div>
          <div class="footer__col"><h4>Sports</h4>${VN.SPORTS.map((s) => `<a href="${VN.sportUrl(s.id)}">${s.name}</a>`).join('')}</div>
          <div class="footer__col"><h4>Help</h4><a href="index.html#faq">FAQ</a><a href="index.html#faq">Delivery</a><a href="index.html#faq">Returns</a><a href="mailto:hello@vivanova.com">Contact us</a></div>
          <div class="footer__col"><h4>Company</h4><a href="index.html#science">The formula</a><a href="index.html#shop">Subscriptions</a><a href="#">Wholesale</a><a href="#">Careers</a></div>
        </div>
        <div class="footer__word" aria-hidden="true">Viva Nova</div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} Viva Nova Ltd. All rights reserved.</span>
          <span><a href="#">Terms</a> · <a href="#">Privacy</a> · <a href="#">Cookies</a></span>
        </div>
      </div>
    </footer>
    <div class="scrim" id="scrim"></div>
    <aside class="cart" id="cart" aria-label="Shopping cart" aria-hidden="true">
      <div class="cart__head">
        <h2 class="display">Your cart</h2>
        <button class="icon-btn" id="cartClose" aria-label="Close cart"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
      </div>
      <div class="ship"><p id="shipText"></p><div class="ship__bar"><div class="ship__fill" id="shipFill"></div></div></div>
      <ul class="cart__items" id="cartItems"></ul>
      <div class="cart__foot">
        <div class="cart__total"><span>Subtotal</span><span id="cartSubtotal">£0.00</span></div>
        <p class="cart__note">Taxes included. Delivery calculated at checkout.</p>
        <button class="btn btn--ink btn--lg btn--block" id="checkoutBtn">Checkout <span aria-hidden="true">→</span></button>
      </div>
    </aside>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  }

  renderHeader();
  renderFooter();

  /* ---------- Toast ---------- */
  let toastTimer;
  VN.toast = (message, action) => {
    const el = $('#toast');
    el.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = message;
    el.append(span);
    if (action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = action.label;
      b.addEventListener('click', () => { el.classList.remove('show'); action.onClick(); });
      el.append(b);
    }
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
  };

  /* ---------- Cart ---------- */
  // Lines are { key: 'id|fmt|size|sub', id, fmt, size, sub, qty }. v2 carts (cans only) are migrated.
  const CART_KEY = 'vivanova.cart.v3';
  const LEGACY_CART_KEY = 'vivanova.cart.v2';
  const cartEl = $('#cart');
  const scrim = $('#scrim');
  const cartOpenBtn = $('#cartOpen');
  const lineKey = (id, fmt, size, sub) => `${id}|${fmt}|${size}|${sub ? 1 : 0}`;
  let cart = loadCart();

  function loadCart() {
    try {
      let raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (!raw) {
        raw = (JSON.parse(localStorage.getItem(LEGACY_CART_KEY)) || []).map((l) => ({ ...l, fmt: 'can' }));
      }
      return raw
        .map((l) => ({ ...l, key: lineKey(l.id, l.fmt, l.size, l.sub) }))
        .filter((l) => {
          const p = VN.productById(l.id);
          return p && VN.packFor(p, l.fmt, l.size) && l.qty > 0;
        });
    } catch {
      return [];
    }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ }
  }

  VN.addToCart = (id, fmt, size, sub, qty = 1) => {
    const p = VN.productById(id);
    fmt = VN.validFormat(p, fmt);
    size = Number(size);
    sub = Boolean(sub) && VN.canSubscribe(size);
    const key = lineKey(id, fmt, size, sub);
    const line = cart.find((l) => l.key === key);
    if (line) line.qty += qty;
    else cart.push({ key, id, fmt, size, sub, qty });
    saveCart();
    renderCart();
    const count = $('#cartCount');
    count.classList.remove('bump');
    void count.offsetWidth;
    count.classList.add('bump');
    VN.toast(`${qty > 1 ? `${qty} × ` : ''}${p.name} (${VN.packLabel(fmt, size)}) added`, { label: 'View cart', onClick: openCart });
  };

  function renderCart() {
    const items = $('#cartItems');
    const totalQty = cart.reduce((s, l) => s + l.qty, 0);
    const subtotal = VN.round2(cart.reduce((s, l) => s + VN.priceFor(VN.productById(l.id), l.fmt, l.size, l.sub) * l.qty, 0));

    $('#cartCount').textContent = totalQty;
    cartOpenBtn.setAttribute('aria-label', `Open cart, ${totalQty} item${totalQty === 1 ? '' : 's'}`);
    cartEl.classList.toggle('cart--empty', cart.length === 0);

    if (!cart.length) {
      items.innerHTML = `
        <li class="cart__empty">
          <p class="display">Running on empty</p>
          <p>Your cart's thirstier than you are.</p>
          <a href="index.html#shop" class="btn btn--ink" data-close-cart>Start shopping</a>
        </li>`;
    } else {
      items.innerHTML = cart.map((l) => {
        const p = VN.productById(l.id);
        const f = p.flav || VN.flavourById('blue-voltage');
        const title = p.flav ? `<a href="${VN.flavourUrl(p.id, l.fmt)}">${p.name}</a>` : p.name;
        return `
        <li class="line" data-key="${l.key}">
          <div class="line__thumb ${p.flav ? '' : 'line__thumb--variety'}" style="--c:${f.c}">${VN.productTag(f, l.fmt)}</div>
          <div>
            <p class="line__name">${title}</p>
            <p class="line__meta">${VN.packLabel(l.fmt, l.size)} · ${l.sub ? 'Subscribe, every 4 weeks' : 'One-time'}</p>
            <div class="qty">
              <button type="button" data-dec aria-label="Decrease quantity">−</button>
              <span>${l.qty}</span>
              <button type="button" data-inc aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="line__right">
            <span class="line__price">${VN.fmt(VN.priceFor(p, l.fmt, l.size, l.sub) * l.qty)}</span>
            <button type="button" class="line__remove" data-remove>Remove</button>
          </div>
        </li>`;
      }).join('');
    }

    $('#cartSubtotal').textContent = VN.fmt(subtotal);
    const remaining = VN.round2(VN.FREE_SHIPPING - subtotal);
    $('#shipText').innerHTML = remaining > 0
      ? `You're <b>${VN.fmt(remaining)}</b> away from free delivery`
      : `<b>Nice!</b> You've unlocked free UK delivery`;
    $('#shipFill').style.width = `${Math.min(100, (subtotal / VN.FREE_SHIPPING) * 100)}%`;
  }

  $('#cartItems').addEventListener('click', (e) => {
    if (e.target.closest('[data-close-cart]') || e.target.closest('.line__name a')) { closeCart(false); return; }
    const row = e.target.closest('.line');
    if (!row) return;
    const line = cart.find((l) => l.key === row.dataset.key);
    if (!line) return;
    if (e.target.closest('[data-inc]')) line.qty += 1;
    else if (e.target.closest('[data-dec]')) line.qty -= 1;
    else if (e.target.closest('[data-remove]')) line.qty = 0;
    else return;
    cart = cart.filter((l) => l.qty > 0);
    saveCart();
    renderCart();
  });

  function openCart() {
    cartEl.classList.add('open');
    scrim.classList.add('open');
    cartEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#cartClose').focus();
  }
  function closeCart(restoreFocus = true) {
    if (!cartEl.classList.contains('open')) return;
    cartEl.classList.remove('open');
    scrim.classList.remove('open');
    cartEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (restoreFocus) cartOpenBtn.focus();
  }
  VN.openCart = openCart;
  cartOpenBtn.addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', () => closeCart());
  scrim.addEventListener('click', () => closeCart());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
  $('#checkoutBtn').addEventListener('click', () => {
    // Replace with your payment provider (e.g. Shopify Buy Button or Stripe Checkout).
    VN.toast('Checkout is in demo mode. Connect Stripe or Shopify to take payments.');
  });
  window.addEventListener('storage', (e) => { if (e.key === CART_KEY) { cart = loadCart(); renderCart(); } });
  renderCart();

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const burger = $('#burger');
  const navLinks = $('#navLinks');
  const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('open', open);
  });
  navLinks.addEventListener('click', (e) => {
    if (!e.target.closest('a')) return;
    burger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  });

  /* ---------- Count-up & reveal ---------- */
  function countUp(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (VN.reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const io = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Also reveal anything already scrolled past (e.g. after an anchor jump).
      if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
      const el = entry.target;
      if (el.classList.contains('reveal')) el.classList.add('in');
      if (el.matches('[data-count]')) countUp(el);
      $$('[data-count]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

  // Call after rendering new content so its .reveal elements animate in.
  VN.observe = (root = document) => {
    $$('.reveal:not([data-observed])', root).forEach((el) => {
      el.dataset.observed = '';
      if (!io) { el.classList.add('in'); return; }
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 70}ms`;
      io.observe(el);
    });
    $$('[data-count]:not([data-observed])', root).forEach((el) => {
      if (el.closest('.reveal')) return;
      el.dataset.observed = '';
      if (io) io.observe(el);
    });
  };

  /* ---------- Newsletter ---------- */
  document.addEventListener('submit', (e) => {
    if (!e.target.matches('.newsletter__form')) return;
    e.preventDefault();
    // Hook this up to your email platform (e.g. Klaviyo or Mailchimp).
    e.target.reset();
    VN.toast("You're in the Nova Squad. Check your inbox for 10% off.");
  });

  /* ---------- Buy cards (format + pack size + subscribe + add) ----------
     Markup: <article class="buycard" data-id data-fmt data-size> with a [data-seg] wrapper around
     VN.sizeSeg(), optional VN.formatSeg() buttons, img.can (swapped on format change),
     a[data-fmt-link], [data-units], optional [data-sub] checkbox + [data-subnote],
     [data-price] [data-was] [data-per] [data-add] */
  VN.sizeSeg = (p, fmt, selected) => `
    <div class="seg" role="radiogroup" aria-label="Pack size">
      ${VN.packsFor(p, fmt).map((k) => `<button type="button" role="radio" aria-checked="${k.size === selected}" data-size="${k.size}"><b>${k.size}</b><small>${VN.unitName(fmt, k.size)}</small></button>`).join('')}
    </div>`;

  // Point a product image at another format/view without re-rendering it.
  VN.setShot = (img, f, fmt, view = 'front') => {
    img.src = VN.productImg(f.id, fmt, view);
    img.alt = `${f.name} ${VN.unitName(fmt)}${view === 'back' ? ', back label' : ''}`;
    Object.keys(VN.FORMATS).forEach((k) => img.classList.toggle(`can--${k}`, k === fmt && k !== 'can'));
  };

  const updateCard = (card) => {
    const p = VN.productById(card.dataset.id);
    const fmt = VN.validFormat(p, card.dataset.fmt);
    const size = Number(card.dataset.size);
    const canSub = VN.canSubscribe(size);
    const subInput = $('[data-sub]', card);
    if (subInput) {
      subInput.disabled = !canSub;
      if (!canSub) subInput.checked = false;
      const note = $('[data-subnote]', card);
      if (note) note.textContent = canSub ? 'Every 4 weeks · cancel any time' : 'Available on 12- and 24-packs';
    }
    const sub = Boolean(subInput && subInput.checked);
    const price = VN.priceFor(p, fmt, size, sub);
    $('[data-price]', card).textContent = VN.fmt(price);
    const was = $('[data-was]', card);
    if (was) { was.hidden = !sub; was.textContent = VN.fmt(VN.packFor(p, fmt, size).price); }
    const save = VN.savingFor(p, fmt, size);
    $('[data-per]', card).textContent = `${VN.fmt(price / size)} per ${VN.unitName(fmt)}${save ? ` · save ${save}%` : ''}`;
    $$('.seg button', card).forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.size) === size)));
  };

  // Switch a buy card to another format. Ignored for products that don't come in it.
  VN.setCardFormat = (card, fmt) => {
    const p = VN.productById(card.dataset.id);
    if (!VN.formatsFor(p).includes(fmt)) return;
    card.dataset.fmt = fmt;
    card.dataset.size = VN.nearestSize(p, fmt, Number(card.dataset.size));
    $('[data-seg]', card).innerHTML = VN.sizeSeg(p, fmt, Number(card.dataset.size));
    $$('.fmt button', card).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.fmt === fmt)));
    $$('img.can', card).forEach((img) => VN.setShot(img, p.flav, fmt));
    $$('a[data-fmt-link]', card).forEach((a) => { a.href = VN.flavourUrl(p.id, fmt); });
    $$('[data-units]', card).forEach((el) => { el.textContent = VN.unitName(fmt, 2); });
    updateCard(card);
  };

  VN.bindBuyCards = (container) => {
    $$('.buycard', container).forEach(updateCard);
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.buycard');
      if (!card) return;
      const fmtBtn = e.target.closest('.fmt button');
      if (fmtBtn) VN.setCardFormat(card, fmtBtn.dataset.fmt);
      const sizeBtn = e.target.closest('.seg button');
      if (sizeBtn) { card.dataset.size = sizeBtn.dataset.size; updateCard(card); }
      if (e.target.closest('[data-add]')) {
        const subInput = $('[data-sub]', card);
        const p = VN.productById(card.dataset.id);
        VN.addToCart(card.dataset.id, VN.validFormat(p, card.dataset.fmt), card.dataset.size, subInput && subInput.checked);
      }
    });
    container.addEventListener('change', (e) => {
      if (e.target.matches('[data-sub]')) updateCard(e.target.closest('.buycard'));
    });
  };

  VN.newsletterHTML = () => `
    <section class="newsletter">
      <div class="container newsletter__inner reveal">
        <h2 class="display newsletter__title">Join the<br>Nova Squad</h2>
        <div>
          <p>Get early flavour drops, athlete-only offers and <b>10% off your first order</b>.</p>
          <form class="newsletter__form">
            <label class="sr-only" for="email">Email address</label>
            <input id="email" name="email" type="email" placeholder="you@email.com" required autocomplete="email">
            <button class="btn btn--ink" type="submit">Sign me up</button>
          </form>
          <small>No spam. Unsubscribe any time.</small>
        </div>
      </div>
    </section>`;
})();
