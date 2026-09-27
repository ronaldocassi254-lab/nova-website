/* ==========================================================================
   Viva Nova — sport page  (sport.html?s=<sport-id>)
   ========================================================================== */
(() => {
  'use strict';
  const VN = window.VN;
  const { $ } = VN;
  const main = $('#page');

  // Line-art backgrounds drawn from each sport's playing surface
  const PATTERNS = {
    football: '<rect x="60" y="60" width="1080" height="580"/><line x1="600" y1="60" x2="600" y2="640"/><circle cx="600" cy="350" r="110"/><circle cx="600" cy="350" r="7" fill="currentColor"/><rect x="60" y="190" width="170" height="320"/><rect x="60" y="270" width="60" height="160"/><rect x="970" y="190" width="170" height="320"/><rect x="1080" y="270" width="60" height="160"/><path d="M230 290a80 80 0 0 1 0 120M970 290a80 80 0 0 0 0 120"/>',
    running: [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${60 + i * 42}" y="${60 + i * 42}" width="${1080 - i * 84}" height="${580 - i * 84}" rx="${290 - i * 42}"/>`).join('') + '<path d="M600 60v252" stroke-dasharray="14 12"/>',
    gym: '<line x1="-20" y1="350" x2="1220" y2="350" stroke-width="10"/><circle cx="250" cy="350" r="230"/><circle cx="250" cy="350" r="180"/><circle cx="250" cy="350" r="40"/><circle cx="950" cy="350" r="230"/><circle cx="950" cy="350" r="180"/><circle cx="950" cy="350" r="40"/><rect x="520" y="300" width="160" height="100" rx="12"/>',
    cycling: '<polyline points="0,560 120,520 220,540 340,420 420,450 520,300 600,340 700,190 780,230 880,380 980,330 1080,460 1200,420"/><polyline points="0,610 120,570 220,590 340,470 420,500 520,350 600,390 700,240 780,280 880,430 980,380 1080,510 1200,470" stroke-dasharray="6 14"/><line x1="0" y1="660" x2="1200" y2="660" stroke-dasharray="46 30"/><circle cx="700" cy="190" r="12" fill="currentColor"/>',
    court: '<rect x="100" y="80" width="1000" height="540"/><line x1="100" y1="150" x2="1100" y2="150"/><line x1="100" y1="550" x2="1100" y2="550"/><line x1="600" y1="60" x2="600" y2="640" stroke-width="8"/><line x1="330" y1="150" x2="330" y2="550"/><line x1="870" y1="150" x2="870" y2="550"/><line x1="330" y1="350" x2="870" y2="350"/><line x1="100" y1="350" x2="120" y2="350"/><line x1="1080" y1="350" x2="1100" y2="350"/>',
    recovery: '<path d="M0 350H380l40-120 60 240 50-180 30 60H1200"/>' + [120, 200, 500, 580].map((y) => `<path d="M0 ${y}Q150 ${y - 50} 300 ${y}T600 ${y}T900 ${y}T1200 ${y}"/>`).join(''),
  };

  const s = VN.sportById(new URLSearchParams(location.search).get('s'));
  if (!s) {
    main.innerHTML = `
      <section class="section"><div class="container" style="text-align:center">
        <h1 class="display section-title">Sport<br>not found</h1>
        <p class="section-sub" style="margin:20px auto 30px">Pick your sport from the list and we'll build your hydration plan.</p>
        <a class="btn btn--ink btn--lg" href="index.html#sports">See all sports</a>
      </div></section>`;
    return;
  }

  const recs = s.flavours.map(VN.flavourById);
  const others = VN.SPORTS.filter((o) => o.id !== s.id);
  document.title = `Viva Nova for ${s.name} — Hydration Game Plan`;
  $('meta[name="description"]').setAttribute('content', `${s.tagline} ${s.intro}`);
  document.documentElement.style.setProperty('--flav', s.c);

  main.innerHTML = `
  <section class="shero" style="--c:${s.c};--t:${s.t}">
    <svg class="shero__pattern" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true">${PATTERNS[s.id]}</svg>
    <div class="container">
      <ol class="crumbs">
        <li><a href="index.html">Home</a></li>
        <li><a href="index.html#sports">Sports</a></li>
        <li aria-current="page">${s.name}</li>
      </ol>
      <div class="shero__grid">
        <div>
          <span class="shero__kicker"><span class="tile__icon" style="--c:${s.c}">${VN.icon(s.id)}</span>${s.kicker}</span>
          <h1 class="display shero__title">${s.name}</h1>
          <p class="shero__tagline">${s.tagline}</p>
          <p class="shero__intro">${s.intro}</p>
          <div class="hero__cta">
            <a class="btn btn--ink btn--lg" href="#kit">Shop for ${s.name.toLowerCase()} <span aria-hidden="true">→</span></a>
            <a class="btn btn--ghost btn--lg" href="#plan">Game plan</a>
          </div>
        </div>
        <div class="shero__cans">${recs.map((f) => VN.canTag(f, 'front', '', false)).join('')}</div>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="container">
      <div class="sstats">
        ${s.stats.map(([v, l]) => `<div class="sstat reveal" style="--c:${s.c}"><b>${v}</b><span>${l}</span></div>`).join('')}
      </div>
      <p style="margin:16px 0 0;font-size:13px;color:var(--muted)">Typical figures. Individual needs vary with body size, climate and intensity.</p>
    </div>
  </section>

  <section class="section bg-surface">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow"><span class="dot"></span>The challenge</p>
          <h2 class="display section-title section-title--sm">What ${s.name.toLowerCase()}<br>takes out of you</h2>
        </div>
        <p class="section-sub">Know what you're up against, then plan your hydration around it.</p>
      </div>
      <div class="challenges">
        ${s.challenges.map(([t, d], i) => `<article class="challenge reveal" style="--c:${s.c}"><span class="challenge__n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="plan">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow"><span class="dot"></span>Game plan</p>
          <h2 class="display section-title section-title--sm">Your ${s.name.toLowerCase()}<br><span class="mark" style="--mark:${s.c}">hydration plan</span></h2>
        </div>
        <p class="section-sub">A simple routine to follow before, during and after every session.</p>
      </div>
      <div class="timeline on-ink reveal" style="margin-top:0">
        ${s.plan.map(([tag, h, d]) => `<div class="step"><span class="step__tag">${tag}</span><h4>${h}</h4><p>${d}</p></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section bg-surface-2" id="kit">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow"><span class="dot"></span>Recommended</p>
          <h2 class="display section-title section-title--sm">Picked for<br>${s.name.toLowerCase()}</h2>
        </div>
        <p class="section-sub">The flavours ${s.name.toLowerCase()} fans reach for most. Grab a single can or bottle to try, or stock up and save.</p>
      </div>
      <div class="recs" id="recs">
        ${recs.map((f) => {
          const p = VN.productById(f.id);
          return `
          <article class="rec buycard reveal" style="--c:${f.c}" data-id="${f.id}" data-fmt="can" data-size="4">
            <a class="rec__media" href="${VN.flavourUrl(f.id)}" data-fmt-link aria-label="${f.name} details">${VN.productTag(f, 'can')}</a>
            <div class="rec__body">
              <div><h3>${f.name}</h3><p>${f.notes}</p></div>
              ${VN.formatSeg(p, 'can')}
              <div data-seg>${VN.sizeSeg(p, 'can', 4)}</div>
              <div class="rec__row">
                <div class="price"><b data-price></b><small data-per></small></div>
                <button type="button" class="btn btn--ink" data-add>Add to cart</button>
              </div>
              <a href="${VN.flavourUrl(f.id)}" data-fmt-link style="font-size:13px;font-weight:800;text-decoration:underline;text-underline-offset:3px">Flavour details and nutrition →</a>
            </div>
          </article>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow"><span class="dot"></span>Pro tips</p>
          <h2 class="display section-title section-title--sm">Train smarter,<br>drink smarter</h2>
        </div>
      </div>
      <ol class="tips" style="--c:${s.c}">${s.tips.map((t) => `<li class="reveal">${t}</li>`).join('')}</ol>
    </div>
  </section>

  <section class="section bg-surface">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow"><span class="dot"></span>More sports</p>
          <h2 class="display section-title section-title--sm">Play something<br>else too?</h2>
        </div>
      </div>
      <div class="tiles">
        ${others.map((o, i) => `
          <a class="tile reveal" href="${VN.sportUrl(o.id)}" style="--c:${o.c};--t:${o.t}">
            <div class="tile__top"><span class="tile__num">0${i + 1}</span><span class="tile__icon">${VN.icon(o.id)}</span></div>
            <div><h3 class="display">${o.name}</h3><p>${o.tagline}</p><span class="tile__go">See the game plan <span aria-hidden="true">→</span></span></div>
          </a>`).join('')}
        <a class="tile reveal" href="index.html#shop" style="--c:var(--lime);--t:var(--ink)">
          <div class="tile__top"><span class="tile__num">✦</span><span class="tile__icon">${VN.icon('leaf')}</span></div>
          <div><h3 class="display">Variety Pack</h3><p>Can't decide? Try every flavour in one box.</p><span class="tile__go">Shop now <span aria-hidden="true">→</span></span></div>
        </a>
      </div>
    </div>
  </section>

  ${VN.newsletterHTML()}`;

  VN.bindBuyCards($('#recs'));
  VN.observe();
})();
