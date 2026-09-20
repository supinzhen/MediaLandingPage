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
