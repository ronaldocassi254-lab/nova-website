/* ==========================================================================
   Viva Nova — flavour product page  (flavour.html?f=<flavour-id>)
   ========================================================================== */
(() => {
  'use strict';
  const VN = window.VN;
  const { $, $$ } = VN;
  const main = $('#page');

  const f = VN.flavourById(new URLSearchParams(location.search).get('f'));
  if (!f) {
    main.innerHTML = `
      <section class="section"><div class="container" style="text-align:center">
        <h1 class="display section-title">Flavour<br>not found</h1>
        <p class="section-sub" style="margin:20px auto 30px">That can must have been drunk already. Pick another from the line-up.</p>
        <a class="btn btn--ink btn--lg" href="index.html#flavours">See all flavours</a>
      </div></section>`;
    return;
  }

  const p = VN.productById(f.id);
  const params = new URLSearchParams(location.search);
  const state = { fmt: VN.validFormat(p, params.get('fmt')), size: 12, sub: false, qty: 1, view: 'front' };
  const VIEWS = ['front', 'angle', 'back'];
  const viewLabel = (v) => ({ front: `Front of ${VN.unitName(state.fmt)}`, angle: 'Angled view', back: 'Back label with nutrition' })[v];
  const cheapest = (fmt) => VN.packsFor(p, fmt)[0];

  document.title = `${f.name} — Viva Nova Electrolyte Hydration`;
  $('meta[name="description"]').setAttribute('content', `${f.name}: ${f.notes} Low-sugar electrolyte hydration in cans and bottles, from ${VN.fmt(cheapest('can').price)}.`);
  document.documentElement.style.setProperty('--flav', f.c);

  main.innerHTML = `
  <div class="container">
    <ol class="crumbs">
      <li><a href="index.html">Home</a></li>
      <li><a href="index.html#flavours">Flavours</a></li>
      <li aria-current="page">${f.name}</li>
    </ol>

    <section class="pdp" style="--c:${f.c};--t:${f.t}">
      <div class="gallery">
        <div class="gallery__stage">
          <div class="ring" aria-hidden="true"></div>
          <div class="gallery__word" aria-hidden="true">${f.name.split(' ')[0]}</div>
          ${f.badge ? `<span class="badge">${f.badge}</span>` : ''}
          <img class="can" id="mainCan" src="${VN.productImg(f.id, state.fmt, 'front')}" alt="" width="520" height="1000">
        </div>
        <div class="gallery__thumbs" id="thumbs" role="group" aria-label="Product views"></div>
      </div>

      <div class="info">
        <p class="eyebrow"><span class="dot"></span>Electrolyte hydration · 500ml</p>
        <h1 class="display info__title">${f.name.replace(' ', '<br>')}</h1>
        <p class="info__tagline"><span class="mark" style="--mark:${f.c}">${f.tagline}</span></p>
        <p class="info__desc">${f.description}</p>
        <div class="tags">
          ${f.tags.map((t) => `<span class="chip">${t}</span>`).join('')}
          <span class="chip">${VN.icon('leaf')} Vegan</span>
          <span class="chip">Caffeine-free</span>
        </div>

        <div class="info__price" aria-live="polite"><b id="price"></b><s id="was" hidden></s><small id="per"></small></div>

        <p class="opt-label">Format</p>
        <div class="packs" id="fmtPacks" role="radiogroup" aria-label="Format">
          ${VN.formatsFor(p).map((fmt) => `
            <button type="button" class="pack pack--fmt" role="radio" aria-checked="false" data-fmt="${fmt}">
              <span class="pack__name">${VN.FORMATS[fmt].label}</span>
              <span class="pack__per">${VN.FORMATS[fmt].blurb}</span>
              <span class="pack__per">From ${VN.fmt(cheapest(fmt).price)}</span>
            </button>`).join('')}
        </div>

        <p class="opt-label"><b class="opt-label__q">How many <i id="unitsLabel"></i>?</b><span id="sizeNote"></span></p>
        <div class="packs" id="sizePacks" role="radiogroup" aria-label="Pack size"></div>

        <p class="opt-label">Purchase type</p>
        <div class="ptype" role="radiogroup" aria-label="Purchase type">
          <button type="button" class="pack" role="radio" data-sub="0">
            <span class="radio" aria-hidden="true"></span>
            <span><span class="pack__name">One-time purchase</span><br><span class="pack__per">No commitment</span></span>
            <span class="pack__price" id="oncePrice"></span>
          </button>
          <button type="button" class="pack" role="radio" data-sub="1">
            <span class="radio" aria-hidden="true"></span>
            <span><span class="pack__name">Subscribe &amp; save 15%</span><br><span class="pack__per" id="subNote"></span></span>
            <span class="pack__price" id="subPrice"></span>
          </button>
        </div>

        <div class="buy-row" id="buyRow">
          <div class="stepper">
            <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
            <output id="qty" aria-live="polite">1</output>
            <button type="button" data-step="1" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="btn btn--ink btn--lg" id="addBtn">Add to cart <span aria-hidden="true">→</span></button>
        </div>

        <ul class="perks">
          <li>${VN.icon('truck')} Free UK delivery on orders over ${VN.fmt(VN.FREE_SHIPPING)}</li>
          <li>${VN.icon('clock')} Order before 2pm for same-day dispatch</li>
          <li>${VN.icon('return')} 30-day returns on unopened packs</li>
        </ul>

        <div class="profile">
          <h3>Flavour profile</h3>
          ${Object.entries(f.profile).map(([k, v]) => `
            <div class="meter"><span>${k}</span>
              <span class="meter__bar" role="img" aria-label="${v} out of 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= v ? 'on' : ''}"></i>`).join('')}</span>
            </div>`).join('')}
        </div>
      </div>
    </section>
  </div>

  <section class="section section--tight bg-surface">
    <div class="container keystats">
      <div class="keystat reveal"><b data-count="5">5</b><span>Electrolytes</span></div>
      <div class="keystat reveal"><b data-count="25">25</b><span>Calories per can</span></div>
      <div class="keystat reveal"><b data-count="3" data-suffix="g">3g</b><span>Sugar</span></div>
      <div class="keystat reveal"><b data-count="0" data-suffix="mg">0mg</b><span>Caffeine</span></div>
    </div>
  </section>

  <section class="section">
    <div class="container details-grid">
      <div class="reveal">
        <p class="eyebrow"><span class="dot"></span>The details</p>
        <h2 class="display section-title section-title--sm">What's<br>inside</h2>
        <p class="section-sub" style="margin-top:20px">The same performance formula goes into every flavour. Here's the full breakdown for ${f.name}.</p>
      </div>
      <div class="acc reveal">
        <details open>
          <summary>Nutrition</summary>
          <div class="table-wrap">
            <table class="nutri">
              <thead><tr><th scope="col">Typical values</th><th scope="col">Per 500ml</th><th scope="col">Per 100ml</th></tr></thead>
              <tbody>${VN.NUTRITION.map(([a, b, c]) => `<tr class="${a.startsWith('of which') ? 'sub-row' : ''}"><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody>
            </table>
          </div>
        </details>
        <details>
          <summary>Ingredients &amp; allergens</summary>
          <div><p>${VN.ingredients(f)}</p><p><b>Allergens:</b> none. Suitable for vegans. Gluten-free.</p></div>
        </details>
        <details>
          <summary>How to enjoy</summary>
          <p>Best served ice-cold. Drink one can or bottle around 30 minutes before training, sip during longer sessions, and finish one afterwards to rehydrate. Once opened, keep refrigerated and drink within 24 hours.</p>
        </details>
        <details>
          <summary>Delivery &amp; returns</summary>
          <p>Free UK delivery on orders over ${VN.fmt(VN.FREE_SHIPPING)}, otherwise £3.95. Orders placed before 2pm on a working day ship the same day. Unopened packs can be returned within 30 days.</p>
        </details>
      </div>
    </div>
  </section>

  <section class="section bg-surface-2">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow"><span class="dot"></span>Best for</p>
          <h2 class="display section-title section-title--sm">Where it<br>performs best</h2>
        </div>
        <p class="section-sub">${f.name} is a favourite for these sports. Tap one for a full hydration game plan.</p>
      </div>
      <div class="sportlinks">
        ${f.sports.map((id) => {
          const s = VN.sportById(id);
          return `<a class="sportlink reveal" href="${VN.sportUrl(s.id)}" style="--c:${s.c}"><span class="tile__icon">${VN.icon(s.id)}</span><span><b>${s.name}</b><small>${s.tagline}</small></span><span aria-hidden="true">→</span></a>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow"><span class="dot"></span>The line-up</p>
          <h2 class="display section-title section-title--sm">Try another<br>flavour</h2>
        </div>
        <a class="btn btn--ghost" href="index.html#shop">Shop everything</a>
      </div>
      <div class="mini-grid">
        ${VN.FLAVOURS.filter((o) => o.id !== f.id).map((o) => `<a class="mini reveal" href="${VN.flavourUrl(o.id, state.fmt)}" data-id="${o.id}" style="--c:${o.c};--t:${o.t}">${VN.productTag(o, state.fmt)}<b>${o.name}</b></a>`).join('')}
      </div>
    </div>
  </section>

  ${VN.newsletterHTML()}

  <div class="buybar" id="buybar" aria-hidden="true">
    <div><b id="barPrice"></b><small id="barMeta"></small></div>
    <button type="button" class="btn btn--lime btn--sm" id="barAdd" tabindex="-1">Add to cart</button>
  </div>`;

  /* ---------- Format: gallery, pack sizes, links ---------- */
  function renderFormat() {
    const { fmt } = state;
    VN.setShot($('#mainCan'), f, fmt, state.view);
    $('#mainCan').alt = `${f.name} ${VN.unitName(fmt)}, ${viewLabel(state.view).toLowerCase()}`;
    $('#thumbs').innerHTML = VIEWS.map((v) =>
      `<button type="button" data-view="${v}" aria-pressed="${v === state.view}" aria-label="${viewLabel(v)}">${VN.productTag(f, fmt, v, '', false)}</button>`).join('');
    $('#sizePacks').innerHTML = VN.packsFor(p, fmt).map((k) => {
      const save = VN.savingFor(p, fmt, k.size);
      return `
      <button type="button" class="pack" role="radio" aria-checked="false" data-size="${k.size}">
        ${k.tag ? `<span class="pack__tag">${k.tag}</span>` : ''}
        <span class="pack__name">${k.label}</span>
        <span class="pack__price">${VN.fmt(k.price)}</span>
        <span class="pack__per">${VN.fmt(k.price / k.size)} per ${VN.unitName(fmt)}${save ? ` · <span class="pack__save">save ${save}%</span>` : ''}</span>
      </button>`;
    }).join('');
    $('#unitsLabel').textContent = VN.unitName(fmt, 2);
    $$('#fmtPacks .pack').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.fmt === fmt)));
    $$('.mini').forEach((a) => {
      a.href = VN.flavourUrl(a.dataset.id, fmt);
      VN.setShot($('img', a), VN.flavourById(a.dataset.id), fmt);
    });
  }

  function setFormat(fmt) {
    if (fmt === state.fmt) return;
    state.fmt = fmt;
    state.size = VN.nearestSize(p, fmt, state.size);
    history.replaceState(null, '', VN.flavourUrl(f.id, fmt));
    renderFormat();
    update();
  }

  /* ---------- Purchase state ---------- */
  function update() {
    const { fmt } = state;
    const canSub = VN.canSubscribe(state.size);
    if (!canSub) state.sub = false;
    const once = VN.priceFor(p, fmt, state.size, false);
    const unit = VN.priceFor(p, fmt, state.size, state.sub);

    $$('#sizePacks .pack').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.size) === state.size)));
    $('.ptype [data-sub="1"]').disabled = !canSub;
    $$('.ptype .pack').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.sub === '1') === state.sub)));
    $('#oncePrice').textContent = VN.fmt(once);
    $('#subPrice').textContent = canSub ? VN.fmt(VN.priceFor(p, fmt, state.size, true)) : '';
    $('#subNote').textContent = canSub ? 'Every 4 weeks · skip or cancel any time' : 'Choose a 12 or 24-pack to subscribe';

    $('#price').textContent = VN.fmt(unit * state.qty);
    $('#was').hidden = !state.sub;
    $('#was').textContent = VN.fmt(once * state.qty);
    $('#per').textContent = `${state.qty > 1 ? `${state.qty} × ` : ''}${VN.packLabel(fmt, state.size)} · ${VN.fmt(unit / state.size)} per ${VN.unitName(fmt)}`;
    $('#qty').textContent = state.qty;
    const total = state.size * state.qty;
    $('#sizeNote').textContent = total === 1 ? 'Just the one? No problem.' : `${total} ${VN.unitName(fmt, total)} in total`;
    $('#barPrice').textContent = VN.fmt(unit * state.qty);
    $('#barMeta').textContent = `${f.name} · ${VN.packLabel(fmt, state.size)}`;
  }

  main.addEventListener('click', (e) => {
    const fmtPack = e.target.closest('#fmtPacks .pack');
    if (fmtPack) { setFormat(fmtPack.dataset.fmt); return; }
    const pack = e.target.closest('#sizePacks .pack');
    if (pack) { state.size = Number(pack.dataset.size); update(); return; }
    const type = e.target.closest('.ptype .pack');
    if (type && !type.disabled) { state.sub = type.dataset.sub === '1'; update(); return; }
    const step = e.target.closest('[data-step]');
    if (step) { state.qty = Math.min(99, Math.max(1, state.qty + Number(step.dataset.step))); update(); return; }
    if (e.target.closest('#addBtn, #barAdd')) { VN.addToCart(f.id, state.fmt, state.size, state.sub, state.qty); return; }
    const thumb = e.target.closest('[data-view]');
    if (thumb) {
      state.view = thumb.dataset.view;
      const img = $('#mainCan');
      VN.setShot(img, f, state.fmt, state.view);
      img.alt = `${f.name} ${VN.unitName(state.fmt)}, ${viewLabel(state.view).toLowerCase()}`;
      $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b === thumb)));
    }
  });

  // Keyboard arrows within radio groups
  main.addEventListener('keydown', (e) => {
    const group = e.target.closest('[role="radiogroup"]');
    if (!group || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    const items = $$('[role="radio"]:not(:disabled)', group);
    const i = items.indexOf(e.target.closest('[role="radio"]'));
    const next = items[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    e.preventDefault();
    next.focus();
    next.click();
  });

  // Mobile sticky buy bar appears once the main button scrolls away
  if ('IntersectionObserver' in window) {
    const bar = $('#buybar');
    new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('show', show);
      bar.setAttribute('aria-hidden', String(!show));
      $('#barAdd').tabIndex = show ? 0 : -1;
    }).observe($('#buyRow'));
  }

  renderFormat();
  update();
  VN.observe();
})();
