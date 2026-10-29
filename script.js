'use strict';

const progress = document.getElementById('progress');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const typedText = document.getElementById('typedText');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Update scroll progress at the top of the screen.
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// Responsive navigation.
function closeMenu() {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
}
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

// Persist theme choice on the same browser.
try {
  if (localStorage.getItem('pk-theme') === 'light') document.body.classList.add('light');
} catch (_) { /* Storage can be unavailable in some browser modes. */ }
function updateThemeButton() {
  const isLight = document.body.classList.contains('light');
  themeToggle.textContent = isLight ? '☾' : '☀';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}
updateThemeButton();
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  updateThemeButton();
  try { localStorage.setItem('pk-theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch (_) {}
});

// Animated hero typing, disabled when reduced motion is preferred.
const phrases = ['modern websites', 'creative interfaces', 'responsive experiences'];
if (!prefersReducedMotion) {
  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let deleting = true;
  function typeLoop() {
    const phrase = phrases[phraseIndex];
    if (deleting) charIndex--; else charIndex++;
    typedText.textContent = phrase.slice(0, charIndex);
    let delay = deleting ? 55 : 95;
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 380;
    } else if (!deleting && charIndex === phrase.length) {
      deleting = true;
      delay = 1800;
    }
    window.setTimeout(typeLoop, delay);
  }
  window.setTimeout(typeLoop, 1800);
}

// Reveal elements as they enter the viewport.
const revealItems = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(item => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach(item => revealObserver.observe(item));
}

// Highlight the current section in the navigation.
const sections = document.querySelectorAll('main section[id]');
const navAnchors = navLinks.querySelectorAll('a');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px' });
  sections.forEach(section => sectionObserver.observe(section));
}

document.getElementById('year').textContent = new Date().getFullYear();
