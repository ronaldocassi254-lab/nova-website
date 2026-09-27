/* ==========================================================================
   Viva Nova — home page
   ========================================================================== */
(() => {
  'use strict';
  const VN = window.VN;
  const { $, $$ } = VN;

  /* ---------- Hero carousel ---------- */
  const hero = $('#hero');
  const heroCans = $('#heroCans');
  const heroPicker = $('#heroPicker');
  const n = VN.FLAVOURS.length;
  let current = 0;
  let autoplay;

  heroCans.innerHTML = VN.FLAVOURS.map((f, i) =>
    `<div class="hero-can" data-i="${i}"><div class="float" style="animation-delay:${-i * 0.8}s">${VN.canTag(f, 'front', '', i > 1 && i < n - 1)}</div></div>`
  ).join('');
  heroPicker.innerHTML = VN.FLAVOURS.map((f, i) =>
    `<button role="tab" data-i="${i}" style="--c:${f.c}" aria-label="${f.name}"></button>`
  ).join('');

  function setHero(i) {
    current = (i + n) % n;
    const f = VN.FLAVOURS[current];
    hero.style.setProperty('--flav', f.c);
    $$('.hero-can', heroCans).forEach((el) => {
      let d = Number(el.dataset.i) - current;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      el.dataset.pos = Math.abs(d) <= 1 ? String(d) : 'hide';
    });
    $$('button', heroPicker).forEach((b, k) => b.setAttribute('aria-selected', String(k === current)));
    $('#heroFlavName').innerHTML = `<a href="${VN.flavourUrl(f.id)}">${f.name}</a>`;
    $('#heroIndex').textContent = `${String(current + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  }
  function startAutoplay() {
    if (VN.reduceMotion) return;
    clearInterval(autoplay);
    autoplay = setInterval(() => setHero(current + 1), 3800);
  }
  heroPicker.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    setHero(Number(b.dataset.i));
    startAutoplay();
  });
  heroCans.addEventListener('click', (e) => {
    const can = e.target.closest('.hero-can');
    if (!can) return;
    if (can.dataset.pos === '0') { location.href = VN.flavourUrl(VN.FLAVOURS[current].id); return; }
    setHero(Number(can.dataset.i));
    startAutoplay();
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(autoplay) : startAutoplay()));
  setHero(0);
  startAutoplay();

  /* ---------- Flavour cards ---------- */
  const fromPrice = VN.fmt(VN.PACKS.flavour.can[0].price);
  $('#flavourGrid').innerHTML = VN.FLAVOURS.map((f, i) => `
    <a class="fcard reveal" href="${VN.flavourUrl(f.id)}" style="--c:${f.c};--t:${f.t}">
      <span class="fcard__num">0${i + 1}</span>
      ${f.badge ? `<span class="badge">${f.badge}</span>` : ''}
      <div class="fcard__word" aria-hidden="true">${f.name.split(' ')[0]}</div>
      <h3 class="display fcard__name">${f.name.replace(' ', '<br>')}</h3>
      <p class="fcard__notes">${f.notes}</p>
      <div class="fcard__can">${VN.canTag(f)}</div>
      <div class="fcard__foot">
        <span class="fcard__price">From ${fromPrice} a can</span>
        <span class="fcard__cta">Explore <span aria-hidden="true">→</span></span>
      </div>
    </a>`).join('');

  /* ---------- Sport tiles ---------- */
  $('#sportTiles').innerHTML = VN.SPORTS.map((s, i) => `
    <a class="tile reveal" href="${VN.sportUrl(s.id)}" style="--c:${s.c};--t:${s.t}">
      <div class="tile__top"><span class="tile__num">0${i + 1}</span><span class="tile__icon">${VN.icon(s.id)}</span></div>
      <div>
        <h3 class="display">${s.name}</h3>
        <p>${s.tagline} ${s.kicker}.</p>
        <span class="tile__go">See the game plan <span aria-hidden="true">→</span></span>
      </div>
    </a>`).join('');

  /* ---------- Can or bottle ---------- */
  const fmtFacts = {
    can: ['Chills fast and fits the fridge door', 'Infinitely recyclable aluminium'],
    bottle: ['Push-pull sports cap, drink on the move', 'Resealable, so it survives the kit bag'],
  };
  const fanIds = ['citrus-surge', 'blue-voltage', 'berry-blitz'];
  $('#formatCards').innerHTML = Object.entries(VN.FORMATS).map(([fmt, F]) => {
    const packs = VN.PACKS.flavour[fmt];
    return `
    <article class="fmtcard reveal">
      <div class="fmtcard__media">${fanIds.map((id) => VN.productTag(VN.flavourById(id), fmt)).join('')}</div>
      <div class="fmtcard__body">
        <p class="eyebrow"><span class="dot"></span>${F.blurb}</p>
        <h3 class="display">The ${F.unit}</h3>
        <ul class="checklist">${fmtFacts[fmt].map((t) => `<li>${t}</li>`).join('')}<li>Packs of ${packs.map((k) => k.size).join(', ').replace(/, (\d+)$/, ' or $1')}</li></ul>
        <div class="fmtcard__foot">
          <span class="fmtcard__price">From <b>${VN.fmt(packs[0].price)}</b> a ${F.unit}</span>
          <a class="btn btn--ink" href="#shop" data-shop-fmt="${fmt}">Shop ${F.units} <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </article>`;
  }).join('');
  $('#bottleRow').innerHTML = VN.FLAVOURS.map((f) => `
    <a class="bottle-row__item reveal" href="${VN.flavourUrl(f.id, 'bottle')}" style="--c:${f.c}">
      ${VN.productTag(f, 'bottle')}
      <b>${f.name}</b>
    </a>`).join('');

  /* ---------- Shop ---------- */
  const products = [VN.VARIETY, ...VN.FLAVOURS.map((f) => VN.productById(f.id))];
  const shopGrid = $('#shopGrid');
  shopGrid.innerHTML = products.map((p) => {
    const variety = p.type === 'variety';
    const fmt = VN.formatsFor(p)[0];
    const media = variety ? VN.varietyTag() : VN.productTag(p.flav, fmt);
    const mediaInner = `${p.badge ? `<span class="badge">${p.badge}</span>` : ''}${media}`;
    return `
    <article class="pcard buycard ${variety ? 'pcard--featured' : ''} reveal" data-id="${p.id}" data-fmt="${fmt}" data-size="12">
      ${variety
        ? `<div class="pcard__media">${mediaInner}</div>`
        : `<a class="pcard__media" href="${VN.flavourUrl(p.id)}" data-fmt-link style="--c:${p.flav.c}" aria-label="${p.name} details">${mediaInner}</a>`}
      <div class="pcard__body">
        <div>
          <h3 class="pcard__name">${variety ? p.name : `<a href="${VN.flavourUrl(p.id)}" data-fmt-link>${p.name}</a>`}</h3>
          <p class="pcard__notes">${p.notes}</p>
        </div>
        ${VN.formatSeg(p, fmt)}
        <fieldset class="sizes">
          <legend>How many <span data-units>${VN.unitName(fmt, 2)}</span>?</legend>
          <div data-seg>${VN.sizeSeg(p, fmt, 12)}</div>
        </fieldset>
        <label class="sub">
          <input type="checkbox" data-sub>
          <span class="sub__box" aria-hidden="true"></span>
          <span>Subscribe &amp; <em>save 15%</em><small data-subnote></small></span>
        </label>
        <div class="pcard__buy">
          <div class="price"><span><b data-price></b><s data-was hidden></s></span><small data-per></small></div>
          <button type="button" class="btn btn--lime" data-add>Add to cart</button>
        </div>
      </div>
    </article>`;
  }).join('');
  VN.bindBuyCards(shopGrid);

  // Shop-wide Cans / Bottles switch, also driven by the "Shop cans/bottles" buttons above.
  const shopFmt = $('#shopFmt');
  shopFmt.innerHTML = Object.entries(VN.FORMATS).map(([fmt, F], i) =>
    `<button type="button" role="radio" aria-checked="${i === 0}" data-fmt="${fmt}">${F.units}</button>`).join('');
  const setShopFormat = (fmt) => {
    $$('button', shopFmt).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.fmt === fmt)));
    $$('.buycard', shopGrid).forEach((card) => VN.setCardFormat(card, fmt));
  };
  shopFmt.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) setShopFormat(b.dataset.fmt);
  });
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-shop-fmt]');
    if (link) setShopFormat(link.dataset.shopFmt);
  });

  VN.observe();
})();
