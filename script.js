const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project-card');

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    const selected = filter.dataset.filter;

    projects.forEach((project) => {
      const shouldShow = selected === 'all' || project.dataset.category === selected;
      project.classList.toggle('hidden', !shouldShow);
    });
  });
});

const revealTargets = document.querySelectorAll('.project-card, .service-list > div, .about-main');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach((target) => {
  target.classList.add('reveal');
  revealObserver.observe(target);
});

const heroSlides = document.querySelectorAll('.hero-slide');
const previousHeroButton = document.querySelector('[data-carousel-prev]');
const nextHeroButton = document.querySelector('[data-carousel-next]');
const heroStatus = document.querySelector('.hero-carousel-status');
const heroCarousel = document.querySelector('.hero-carousel');
let activeHeroSlide = 0;

function showHeroSlide(index, direction = 'next') {
  activeHeroSlide = (index + heroSlides.length) % heroSlides.length;
  heroCarousel?.classList.remove('direction-next', 'direction-prev');
  void heroCarousel?.offsetWidth;
  heroCarousel?.classList.add(`direction-${direction}`);
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === activeHeroSlide);
  });
  heroStatus.textContent = `0${activeHeroSlide + 1} / 0${heroSlides.length}`;
}

previousHeroButton?.addEventListener('click', () => showHeroSlide(activeHeroSlide - 1, 'prev'));
nextHeroButton?.addEventListener('click', () => showHeroSlide(activeHeroSlide + 1, 'next'));

if (heroSlides.length > 1) {
  let heroRotation = setInterval(() => showHeroSlide(activeHeroSlide + 1, 'next'), 12000);
  const resetHeroRotation = () => {
    clearInterval(heroRotation);
    heroRotation = setInterval(() => showHeroSlide(activeHeroSlide + 1, 'next'), 12000);
  };
  previousHeroButton?.addEventListener('click', resetHeroRotation);
  nextHeroButton?.addEventListener('click', resetHeroRotation);
}
