(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('#primary-nav');
  if (header && toggle && primaryNav) {
    const setOpen = (open) => {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')));
    primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
  }

  const currentPage = location.pathname.split('/').pop() || 'index.html';

  // Highlight the current page in the top-level nav (plain page links, no #hash).
  document.querySelectorAll('.nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href.includes('#')) return;
    if ((href || 'index.html') === currentPage) link.classList.add('active');
  });

  // Scrollspy for in-page anchors — including "index.html#section" dropdown links,
  // which only spy on sections that actually live on the current page.
  const linkFor = new Map();
  const sections = [];
  document.querySelectorAll('.nav a[href*="#"]').forEach((link) => {
    const [page, hash] = link.getAttribute('href').split('#');
    if (!hash) return;
    if (page && page !== currentPage) return;
    const section = document.getElementById(hash);
    if (!section) return;
    if (!linkFor.has(section)) linkFor.set(section, []);
    linkFor.get(section).push(link);
    if (!sections.includes(section)) sections.push(section);
  });
  if (sections.length) {
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      linkFor.forEach((links) => links.forEach((l) => l.classList.remove('active')));
      const current = sections.find((section) => visible.has(section));
      if (current) linkFor.get(current)?.forEach((l) => l.classList.add('active'));
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((section) => spy.observe(section));
  }
})();

// Lightbox for grids marked data-lightbox. Discourages saving: image is a CSS
// background (no <img> to "save as"), context menu and drag are blocked.
// (Browsers can't fully prevent downloads of anything they display.)
(function () {
  const grid = document.querySelector('[data-lightbox]');
  if (!grid) return;
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<div class="lightbox-img"></div>'
    + '<button class="lightbox-close" type="button" aria-label="關閉">×</button>'
    + '<button class="lightbox-nav lightbox-prev" type="button" aria-label="上一張">‹</button>'
    + '<button class="lightbox-nav lightbox-next" type="button" aria-label="下一張">›</button>';
  document.body.appendChild(box);
  const view = box.querySelector('.lightbox-img');
  let items = [];
  let index = 0;
  // Size the frame to the photo's exact fitted box so the watermark sits in the photo's corner.
  let ratio = 1.5;
  const fit = () => {
    const maxW = innerWidth * 0.92, maxH = innerHeight * 0.92;
    const w = Math.min(maxW, maxH * ratio);
    view.style.width = `${w}px`;
    view.style.height = `${w / ratio}px`;
  };
  const show = (i) => {
    index = (i + items.length) % items.length;
    const img = items[index];
    const src = img.dataset.full || img.currentSrc || img.src;
    view.setAttribute('aria-label', img.alt);
    const probe = new Image();
    probe.onload = () => {
      if (items[index] !== img) return;
      ratio = probe.naturalWidth / probe.naturalHeight;
      fit();
      view.style.backgroundImage = `url("${src}")`;
    };
    probe.src = src;
  };
  window.addEventListener('resize', fit);
  const close = () => { box.classList.remove('open'); view.style.backgroundImage = ''; };
  grid.addEventListener('click', (e) => {
    const img = e.target.closest('.project-media')?.querySelector('img');
    if (!img) return;
    // navigate only through photos currently shown (respects the filter)
    items = [...grid.querySelectorAll('.project-media img')].filter((im) => im.offsetParent !== null);
    show(items.indexOf(img));
    box.classList.add('open');
  });
  box.addEventListener('click', close);
  box.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
  box.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
  let touchX = null;
  box.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1)); e.preventDefault(); }
  });
  ['contextmenu', 'dragstart'].forEach((t) =>
    document.addEventListener(t, (e) => { if (e.target.closest('[data-lightbox], .lightbox')) e.preventDefault(); }));
})();

// Photo grid: feed each photo's aspect ratio to CSS so rows justify without cropping,
// and keep the (possibly short) last row at natural size, centered.
(function () {
  const grid = document.querySelector('.photo-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.project-card')];
  // Force the first row to hold exactly 3 photos (bigger) via a full-width spacer.
  const rowBreak = document.createElement('div');
  rowBreak.className = 'row-break';
  const placeBreak = () => {
    const fourth = cards.filter((c) => c.offsetParent !== null || !c.classList.contains('hidden'))[3];
    if (fourth) { if (rowBreak.nextElementSibling !== fourth) grid.insertBefore(rowBreak, fourth); }
    else rowBreak.remove();
  };
  const markLastRow = () => {
    placeBreak();
    const shown = cards.filter((c) => c.offsetParent !== null);
    const top = shown.length ? Math.max(...shown.map((c) => c.offsetTop)) : 0;
    // toggle(force) doesn't mutate when unchanged, so the observer below can't loop
    cards.forEach((c) => c.classList.toggle('last-row', shown.includes(c) && Math.abs(c.offsetTop - top) < 3));
  };
  cards.forEach((card) => {
    const img = card.querySelector('img');
    if (!img) return;
    const set = () => {
      if (img.naturalWidth) card.style.setProperty('--r', (img.naturalWidth / img.naturalHeight).toFixed(4));
      markLastRow();
    };
    if (img.complete) set(); else img.addEventListener('load', set);
  });
  window.addEventListener('resize', markLastRow);
  new MutationObserver(markLastRow).observe(grid, { subtree: true, attributes: true, attributeFilter: ['class'] });
  markLastRow();
})();
