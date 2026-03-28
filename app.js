/* ===================================================
   COMPANY NAME — Premium Construction Website
   app.js
   =================================================== */

'use strict';

// ─── Page routing ────────────────────────────────────
const pages = ['home','about','services','projects','beforeafter','testimonials','quote','faq','contact'];
let currentPage = 'home';

function showPage(name) {
  // Hide all pages
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });

  // Show target
  const target = document.getElementById('page-' + name);
  if (target) {
    target.classList.add('active');
    currentPage = name;
  }

  // Update nav active state
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active-link', a.dataset.page === name);
  });

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-trigger reveal animations for the new page
  setTimeout(triggerReveal, 80);

  // Init sliders for this page
  if (name === 'beforeafter') initBeforeAfterSliders();
  if (name === 'home') initHomeSliders();
  if (name === 'testimonials') initTestimonialsPage();
}

// ─── Navbar scroll effect ─────────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ─── Hamburger ────────────────────────────────────────
function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('navLinks').classList.remove('open');
  const backdrop = document.getElementById('navBackdrop');
  if (backdrop) backdrop.classList.remove('visible');
}

function openMenu() {
  document.getElementById('hamburger').classList.add('open');
  document.getElementById('navLinks').classList.add('open');
  const backdrop = document.getElementById('navBackdrop');
  if (backdrop) backdrop.classList.add('visible');
}

document.getElementById('hamburger').addEventListener('click', () => {
  const isOpen = document.getElementById('navLinks').classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

// Close menu on nav link click (covers both click and touch)
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', closeMenu);
  a.addEventListener('touchend', closeMenu, { passive: true });
});

// Backdrop click closes menu
document.getElementById('navBackdrop').addEventListener('click', closeMenu);
document.getElementById('navBackdrop').addEventListener('touchend', closeMenu, { passive: true });

// ─── Scroll Reveal (Intersection Observer) ───────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function triggerReveal() {
  const activeEl = document.querySelector('.page.active');
  if (!activeEl) return;
  activeEl.querySelectorAll('.reveal:not(.visible)').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.06) + 's';
    revealObserver.observe(el);
  });
}

// ─── Before / After Slider ───────────────────────────
function makeSlider(sliderId, handleId) {
  const slider = document.getElementById(sliderId);
  const handle = document.getElementById(handleId);
  if (!slider || !handle) return;

  const after = slider.querySelector('.ba-after');
  let dragging = false;
  let pos = 50; // percent

  function setPos(p) {
    p = Math.max(5, Math.min(95, p));
    pos = p;
    after.style.width = p + '%';
    handle.style.left = p + '%';
  }

  function getPercent(clientX) {
    const rect = slider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  slider.addEventListener('mousedown', e => { dragging = true; setPos(getPercent(e.clientX)); });
  slider.addEventListener('touchstart', e => { dragging = true; setPos(getPercent(e.touches[0].clientX)); }, { passive: true });

  window.addEventListener('mousemove', e => { if (dragging) setPos(getPercent(e.clientX)); });
  window.addEventListener('touchmove', e => { if (dragging) setPos(getPercent(e.touches[0].clientX)); }, { passive: true });

  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('touchend', () => { dragging = false; });

  // Init at 50%
  setPos(50);
}

function initBeforeAfterSliders() {
  ['slider1','slider2','slider3','slider4'].forEach((id, i) => makeSlider(id, 'handle' + (i+1)));
}

function initHomeSliders() {
  makeSlider('heroSlider', 'heroHandle');
}

// ─── Testimonials Slider ─────────────────────────────
const testiState = {};

function initTestimonialsPage() {
  // Nothing extra needed for static grid
}

function slideTestimonials(id, dir) {
  const track = document.getElementById(id + 'TestiTrack');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const count = cards.length;
  const perPage = getPerPage();
  const maxIndex = Math.max(0, count - perPage);

  if (!testiState[id]) testiState[id] = 0;
  testiState[id] = Math.max(0, Math.min(maxIndex, testiState[id] + dir));

  const offset = testiState[id] * (100 / perPage);
  track.style.transform = `translateX(-${offset}%)`;

  updateDots(id, testiState[id], maxIndex + 1);
}

function getPerPage() {
  return window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 1 : 3;
}

function updateDots(id, current, total) {
  const dotsEl = document.getElementById(id + 'TestiDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'slider-dot' + (i === current ? ' active' : '');
    dot.onclick = () => { testiState[id] = i; slideTestimonials(id, 0); };
    dotsEl.appendChild(dot);
  }
}

// Init home testimonials dots
function initHomeTestimonials() {
  updateDots('home', 0, 2);
}

// ─── FAQ Accordion ────────────────────────────────────
function toggleFAQ(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-question.open').forEach(q => {
    q.classList.remove('open');
    q.nextElementSibling.classList.remove('open');
  });

  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}

// ─── Projects Filter ─────────────────────────────────
function filterProjects(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.pf-card').forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.style.display = '';
      card.classList.remove('visible');
      // Re-animate
      setTimeout(() => card.classList.add('visible'), 50);
    } else {
      card.style.display = 'none';
    }
  });
}

// ─── Form Handlers ────────────────────────────────────
function handleQuoteSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('quoteForm');
  const success = document.getElementById('quoteSuccess');
  form.classList.add('hidden');
  success.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('✅ Quote request submitted! We\'ll be in touch within 24 hours.');
}

function handleQuickContact(e) {
  e.preventDefault();
  e.target.reset();
  showToast('✅ Message sent! We\'ll be in touch shortly.');
}

function handleContact(e) {
  e.preventDefault();
  e.target.reset();
  showToast('✅ Message sent! We\'ll respond within 24 hours.');
}

function showFileNames(input) {
  const names = Array.from(input.files).map(f => f.name).join(', ');
  const display = document.getElementById('fileNames');
  if (display) display.textContent = names;
}

// ─── Toast ───────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ─── Auto-advance testimonials ────────────────────────
let autoSlideInterval = null;

function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    if (currentPage === 'home') slideTestimonials('home', 1);
  }, 5000);
}

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initial page
  showPage('home');
  triggerReveal();
  initHomeSliders();
  initHomeTestimonials();
  startAutoSlide();

  // Handle resize
  window.addEventListener('resize', () => {
    updateDots('home', testiState['home'] || 0, 2);
  });
});
