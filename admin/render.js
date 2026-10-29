// Page renderers shared by build.js (Node) and the CMS live preview (browser): data in, <main> HTML out.
// In Node, build.js sets globalThis.marked first; in the browser, marked comes from a <script> tag.
(function (root) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const iso = (d) => { const x = new Date(d); return isNaN(x) ? '' : x.toISOString(); };
  const md = (s) => root.marked.parse(String(s || ''));
  const mdInline = (s) => root.marked.parseInline(String(s || ''));

  const ARROW_L = (px) => `<svg width="1em" height="1em" viewBox="0 0 256 256" style="width:${px}px;height:${px}px" aria-hidden="true"><path fill="currentColor" d="M228 128a12 12 0 0 1-12 12H69l51.52 51.51a12 12 0 0 1-17 17l-72-72a12 12 0 0 1 0-17l72-72a12 12 0 0 1 17 17L69 116h147a12 12 0 0 1 12 12"/></svg>`;
  const ARROW_R = (px) => `<svg width="1em" height="1em" viewBox="0 0 256 256" style="width:${px}px;height:${px}px" aria-hidden="true"><path fill="currentColor" d="M228 128a12 12 0 0 1-12 12H69l51.52 51.51a12 12 0 0 1-17 17l-72-72a12 12 0 0 1 0-17l72-72a12 12 0 0 1 17 17L69 116h147a12 12 0 0 1 12 12" transform="matrix(-1 0 0 1 256 0)"/></svg>`;
  const ARROW_UR = `<svg width="1em" height="1em" viewBox="0 0 256 256" class="press__arrow" style="width:20px;height:20px" aria-hidden="true"><path fill="currentColor" d="M204 64v104a12 12 0 0 1-24 0V93L72.49 200.49a12 12 0 0 1-17-17L163 76H88a12 12 0 0 1 0-24h104a12 12 0 0 1 12 12"/></svg>`;
  const FIST = `<svg width="1em" height="1em" viewBox="0 0 256 256" style="width:1.25em;height:1.25em" aria-hidden="true"><path fill="currentColor" d="M200 76h-12V64a36 36 0 0 0-60-26.8a36 36 0 0 0-58.73 17.34A36 36 0 0 0 20 88v40a108 108 0 0 0 216 0v-16a36 36 0 0 0-36-36m-60-12a12 12 0 0 1 24 0v12h-24Zm-48 0a12 12 0 0 1 24 0v40a12 12 0 0 1-24 0ZM44 88a12 12 0 0 1 24 0v16a12 12 0 0 1-24 0Zm168 40a84 84 0 0 1-167.39 10.15A35.93 35.93 0 0 0 80 130.8a35.89 35.89 0 0 0 43.65 3.34a36.2 36.2 0 0 0 6.35 6.36a51.82 51.82 0 0 0-14 35.5a12 12 0 0 0 24 0a28 28 0 0 1 28-28a12 12 0 0 0 0-24h-16a12 12 0 0 1-12-12v-12h60a12 12 0 0 1 12 12Z"/></svg>`;

  const meta = (p) => `${esc(p.author || '')} · <time datetime="${iso(p.date)}">${fmtDate(p.date)}</time>`;
  const img = (src, cls, extra = '') => (src ? `<img src="${esc(src)}" alt="" ${extra} class="${cls}" decoding="async">` : '');

  function blogIndex(posts, top) {
    const [lead, ...rest] = posts;
    const leadHtml = lead ? `<a href="/blog/${lead.slug}" class="lead"><div class="lead__media">${img(lead.cover, 'lead__img', 'loading="eager"')}</div><div class="lead__body"><span class="tag font-sub">Latest</span><h2 class="lead__title">${esc(lead.title)}</h2><p class="lead__desc">${esc(lead.description)}</p><span class="meta font-sub">${meta(lead)}</span></div></a>` : '';
    const cards = rest.map((p, i) => `<li class="card-item" data-reveal="pop" style="--reveal-delay:${(i % 6) * 70}ms"><a href="/blog/${p.slug}" class="card"><div class="card__media">${img(p.cover, 'card__img', 'loading="lazy"')}</div><div class="card__body"><h2 class="card__title">${esc(p.title)}</h2><p class="card__desc">${esc(p.description)}</p><span class="meta font-sub">${meta(p)}</span></div></a></li>`).join('');
    return `${top}<section class="posts"><div class="wrap">${leadHtml}<ul class="grid" role="list">${cards}</ul><p class="source">Posts are published first on our Substack. <a href="https://babevote.substack.com/" target="_blank" rel="noopener noreferrer" class="source__link">Subscribe there<span class="sr-only"> (opens in a new tab)</span></a> to get them by email.</p></div></section>`;
  }

  function post(p, older, newer) {
    const navLink = (q, dir) => q ? `<a href="/blog/${q.slug}" class="post-nav__link post-nav__link--${dir === 'Older' ? 'prev' : 'next'}"><span class="post-nav__dir font-sub">${dir === 'Older' ? ARROW_L(14) + ' Older' : 'Newer ' + ARROW_R(14)}</span><span class="post-nav__title">${esc(q.title)}</span></a>` : '';
    return `<article class="post"><header class="post__head"><div class="wrap-narrow"><a href="/blog" class="back font-sub">${ARROW_L(16)} All posts</a><h1 class="post__title">${esc(p.title)}</h1><p class="post__meta font-sub">${meta(p)}</p></div></header>` +
      (p.cover ? `<div class="wrap-narrow"><div class="post__cover">${img(p.cover, '', 'loading="eager"')}</div></div>` : '') +
      `<div class="wrap-narrow"><div class="prose">${md(p.body)}</div><nav class="post-nav" aria-label="More posts">${navLink(older, 'Older')}${navLink(newer, 'Newer')}</nav><div class="post__cta"><a href="/join-us" class="btn btn--primary btn--lg">${FIST} Join us</a></div></div></article>`;
  }

  const initials = (n) => String(n || '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  function people(data, top) {
    const groups = (data.groups || []).map((g, gi) => {
      const id = `g${gi}-title`;
      const list = g.people || [], np = g.not_pictured || [];
      const cards = list.map((p, i) => {
        const media = p.photo ? `<img src="${esc(p.photo)}" alt="Portrait of ${esc(p.name)}." width="440" height="440" loading="lazy" decoding="async">` : `<span class="pcard__initials" style="display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:1;font-size:2.4rem;font-weight:900;background:#d1bfff;color:#2b1a5a">${esc(initials(p.name))}</span>`;
        return `<li data-reveal="pop" style="--reveal-delay:${(i % 8) * 45}ms" class="grid__cell"><article class="pcard"><div class="pcard__media">${media}</div><div class="pcard__body"><h3 class="pcard__name font-sub">${esc(p.name)}</h3>${p.role ? `<p class="pcard__role font-sub">${esc(p.role)}</p>` : ''}${p.detail ? `<p class="pcard__sub">${esc(p.detail)}</p>` : ''}</div></article></li>`;
      }).join('');
      const npHtml = np.length ? `<div class="np"><h3 class="np__title font-sub">Not pictured</h3><ul class="np__list" role="list">${np.map((n) => `<li><span class="np__name font-sub">${esc(n.name)}</span> ${esc(n.detail)}</li>`).join('')}</ul></div>` : '';
      return `<section class="roster${gi % 2 ? ' roster--alt' : ''}" aria-labelledby="${id}"><div class="wrap"><div class="roster__head"><h2 id="${id}" class="roster__title">${esc(g.title)}</h2><span class="roster__count" aria-hidden="true">${list.length + np.length}</span></div><ul class="grid${gi === 0 ? ' grid--board' : ''}" role="list">${cards}</ul>${npHtml}</div></section>`;
    }).join('');
    return top + groups;
  }

  function press(data, top) {
    const years = data.years || [];
    const all = years.flatMap((y) => y.items || []);
    const yrs = years.map((y) => +y.year).filter(Boolean);
    const range = yrs.length ? `${Math.min(...yrs)}–${Math.max(...yrs)}` : '';
    const head = top.replace(/\d+ stories about our work, [^<]*?\./, `${all.length} stories about our work, ${range}.`);
    const sections = years.map((y) => `<section class="press__year" aria-labelledby="year-${esc(y.year)}"><h2 id="year-${esc(y.year)}" class="press__year-title">${esc(y.year)}</h2><ul class="press__grid" role="list">${(y.items || []).map((it, i) => `<li class="press__item" data-reveal style="--reveal-delay:${(i % 8) * 50}ms"><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer" class="press__card">${it.thumb ? `<span class="press__thumb"><img src="${esc(it.thumb)}" alt="" loading="lazy" decoding="async"></span>` : ''}<span class="press__body"><span class="press__meta font-sub"><span class="press__outlet">${esc(it.outlet)}</span><span class="press__date">${esc(it.date)}</span></span><span class="press__headline">${esc(it.headline)}</span></span>${ARROW_UR}<span class="sr-only"> (opens in a new tab)</span></a></li>`).join('')}</ul></section>`).join('');
    return `${head}<section class="press"><div class="wrap">${sections}</div></section>`;
  }

  const inlineLinks = (text) => mdInline(text).replace(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="timeline__link">$2<span class="sr-only"> (opens in a new tab)</span></a>');
  function about(history, topHtml, bottomHtml) {
    const eras = (history.eras || []).map((e, i) => `<li class="timeline__era" data-reveal style="--reveal-delay:${i * 60}ms"><h3 class="timeline__year">${esc(e.when)}</h3><div class="timeline__entries">${(e.entries || []).map((x) => `<p class="timeline__text">${inlineLinks(x.text)}</p>`).join('')}</div></li>`).join('');
    return `${topHtml}<section class="about-sec about-sec--alt" id="history" aria-labelledby="history-title"><div class="wrap history__head"><h2 id="history-title" class="about-sec__title">${esc(history.title || 'History')}</h2></div><div class="wrap history"><ol class="timeline" role="list">${eras}</ol></div></section>${bottomHtml}`;
  }

  function custom(page, isMarkdown) {
    const lead = page.description ? `<p class="page-lead font-sub">${esc(page.description)}</p>` : '';
    return `<section class="page-head"><div class="wrap"><h1 class="page-title">${esc(page.title)}</h1>${lead}</div></section><section class="about-sec"><div class="wrap-narrow"><div class="prose">${isMarkdown ? md(page.body) : page.body}</div></div></section>`;
  }

  root.BVRender = { esc, blogIndex, post, people, press, about, custom };
})(globalThis);
