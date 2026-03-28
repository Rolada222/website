/* ===================================================
   COMPANY NAME — app.js (multi-page version)
   No routing needed — real HTML pages handle navigation
   =================================================== */
'use strict';

// ─── Auto-highlight current page in nav ──────────────
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active-link');
    }
  });
})();

// ─── Navbar scroll effect ─────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ─── Mobile Menu ──────────────────────────────────────
function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('navLinks').classList.remove('open');
  const b = document.getElementById('navBackdrop');
  if (b) b.classList.remove('visible');
}
function openMenu() {
  document.getElementById('hamburger').classList.add('open');
  document.getElementById('navLinks').classList.add('open');
  const b = document.getElementById('navBackdrop');
  if (b) b.classList.add('visible');
}
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.contains('open') ? closeMenu() : openMenu();
});
document.getElementById('navBackdrop').addEventListener('click', closeMenu);
document.getElementById('navBackdrop').addEventListener('touchend', e => {
  e.preventDefault(); closeMenu();
}, { passive: false });

// ─── Scroll Reveal ────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.05) + 's';
  revealObserver.observe(el);
});

// ─── Before/After Sliders ─────────────────────────────
function makeSlider(sliderId, handleId) {
  const slider = document.getElementById(sliderId);
  const handle = document.getElementById(handleId);
  if (!slider || !handle) return;
  const after = slider.querySelector('.ba-after');
  let dragging = false;
  function setPos(p) {
    p = Math.max(5, Math.min(95, p));
    after.style.width = p + '%';
    handle.style.left = p + '%';
  }
  function pct(clientX) {
    return ((clientX - slider.getBoundingClientRect().left) / slider.offsetWidth) * 100;
  }
  slider.addEventListener('mousedown',  e => { dragging = true; setPos(pct(e.clientX)); });
  slider.addEventListener('touchstart', e => { dragging = true; setPos(pct(e.touches[0].clientX)); }, { passive: true });
  window.addEventListener('mousemove',  e => { if (dragging) setPos(pct(e.clientX)); });
  window.addEventListener('touchmove',  e => { if (dragging) setPos(pct(e.touches[0].clientX)); }, { passive: true });
  window.addEventListener('mouseup',  () => { dragging = false; });
  window.addEventListener('touchend', () => { dragging = false; });
  setPos(50);
}
['heroSlider','slider1','slider2','slider3','slider4'].forEach((id, i) => {
  makeSlider(id, id === 'heroSlider' ? 'heroHandle' : 'handle' + i);
});

// ─── Testimonials Slider ──────────────────────────────
const testiIdx = {};
function slideTestimonials(id, dir) {
  const track = document.getElementById(id + 'TestiTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonial-card');
  const per = window.innerWidth < 900 ? 1 : 3;
  const max = Math.max(0, cards.length - per);
  if (!testiIdx[id]) testiIdx[id] = 0;
  testiIdx[id] = Math.max(0, Math.min(max, testiIdx[id] + dir));
  track.style.transform = `translateX(-${testiIdx[id] * (100 / per)}%)`;
  buildDots(id, testiIdx[id], max + 1);
}
function buildDots(id, cur, total) {
  const el = document.getElementById(id + 'TestiDots');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === cur ? ' active' : '');
    d.onclick = () => { testiIdx[id] = i; slideTestimonials(id, 0); };
    el.appendChild(d);
  }
}
buildDots('home', 0, 2);
setInterval(() => slideTestimonials('home', 1), 5000);

// ─── FAQ Accordion ────────────────────────────────────
function toggleFAQ(btn) {
  const ans = btn.nextElementSibling;
  const open = btn.classList.contains('open');
  document.querySelectorAll('.faq-question.open').forEach(q => {
    q.classList.remove('open'); q.nextElementSibling.classList.remove('open');
  });
  if (!open) { btn.classList.add('open'); ans.classList.add('open'); }
}

// ─── Project Filter ───────────────────────────────────
function filterProjects(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.pf-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
    if (show) { card.classList.remove('visible'); setTimeout(() => card.classList.add('visible'), 50); }
  });
}

// ─── Forms ───────────────────────────────────────────
function handleQuoteSubmit(e) {
  e.preventDefault();
  document.getElementById('quoteForm').classList.add('hidden');
  document.getElementById('quoteSuccess').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('✅ Quote request submitted! We\'ll be in touch within 24 hours.');
}
function handleQuickContact(e) { e.preventDefault(); e.target.reset(); showToast('✅ Message sent!'); }
function handleContact(e) { e.preventDefault(); e.target.reset(); showToast('✅ Message sent! We\'ll respond within 24 hours.'); }
function showFileNames(input) {
  const d = document.getElementById('fileNames');
  if (d) d.textContent = Array.from(input.files).map(f => f.name).join(', ');
}

// ─── Toast ───────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 4000);
}
