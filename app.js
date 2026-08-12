/* ===================================================
   MTARISE CONSTRUCTION LTD — app.js (multi-page version)
   No routing needed — real HTML pages handle navigation
   =================================================== */
'use strict';

const QUOTE_EMAIL = 'anto@mtarise.com';
let quoteShareFiles = [];
let quoteShareText = '';

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
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('open');
  document.body.classList.remove('menu-open');
  const b = document.getElementById('navBackdrop');
  if (b) b.classList.remove('visible');
}
function openMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-label', 'Close menu');
  hamburger.setAttribute('aria-expanded', 'true');
  navLinks.classList.add('open');
  document.body.classList.add('menu-open');
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
document.querySelectorAll('#navLinks a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

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
  slider.addEventListener('pointerdown', e => {
    dragging = true;
    slider.setPointerCapture?.(e.pointerId);
    setPos(pct(e.clientX));
  });
  slider.addEventListener('pointermove', e => {
    if (!dragging) return;
    e.preventDefault();
    setPos(pct(e.clientX));
  });
  const stopDragging = e => {
    dragging = false;
    if (e?.pointerId != null) slider.releasePointerCapture?.(e.pointerId);
  };
  slider.addEventListener('pointerup', stopDragging);
  slider.addEventListener('pointercancel', stopDragging);
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
  const form = document.getElementById('quoteForm');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const d = new FormData(form);

  const fullName   = d.get('fullName')    || '';
  const phone      = d.get('phone')       || '';
  const email      = d.get('email')       || '';
  const address    = d.get('address')     || '';
  const projectType= d.get('projectType') || '';
  const budget     = d.get('budget')      || '';
  const startDate  = d.get('startDate')   || '';
  const description= d.get('description') || '';
  const methods    = d.getAll('contactMethod').join(', ') || 'Not specified';
  quoteShareFiles = d.getAll('files').filter(file => file && file.size > 0);
  const attachments = quoteShareFiles.map(file => file.name).join(', ') || 'None';

  const subject = encodeURIComponent('Quote Request — ' + projectType + ' — ' + fullName);
  const body = encodeURIComponent(
    'NEW QUOTE REQUEST — MTARISE CONSTRUCTION LTD\n' +
    '==================================================\n\n' +
    'CONTACT DETAILS\n' +
    'Name:         ' + fullName + '\n' +
    'Phone:        ' + phone + '\n' +
    'Email:        ' + email + '\n' +
    'Property:     ' + address + '\n\n' +
    'PROJECT DETAILS\n' +
    'Type:         ' + projectType + '\n' +
    'Budget:       ' + budget + '\n' +
    'Start Date:   ' + startDate + '\n\n' +
    'DESCRIPTION\n' + description + '\n\n' +
    'PREFERENCES\n' +
    'Contact via:  ' + methods + '\n\n' +
    'ATTACHMENTS SELECTED\n' + attachments + '\n\n' +
    '==================================================\n' +
    'Submitted via mtarise.com'
  );

  quoteShareText = [
    'NEW QUOTE REQUEST — MTARISE CONSTRUCTION LTD',
    '',
    'Name: ' + fullName,
    'Phone: ' + phone,
    'Email: ' + email,
    'Property: ' + address,
    'Project: ' + projectType,
    'Budget: ' + budget,
    'Start Date: ' + startDate,
    'Contact via: ' + methods,
    '',
    'DESCRIPTION',
    description,
    '',
    'Selected attachments: ' + attachments,
    '',
    'Submitted via mtarise.com'
  ].join('\n');

  const mailto = 'mailto:' + QUOTE_EMAIL + '?subject=' + subject + '&body=' + body;
  const emailLink = document.getElementById('quoteEmailLink');
  if (emailLink) emailLink.href = mailto;
  const shareButton = document.getElementById('shareQuoteButton');
  if (shareButton) shareButton.classList.toggle('hidden', quoteShareFiles.length === 0);
  let nativeShareAvailable = false;
  try {
    nativeShareAvailable = quoteShareFiles.length > 0 && !!navigator.share && !!navigator.canShare && navigator.canShare({ files: quoteShareFiles });
  } catch (error) {
    nativeShareAvailable = false;
  }
  if (nativeShareAvailable) {
    shareQuoteWithAttachments();
  } else {
    window.location.assign(mailto);
  }

  form.classList.add('hidden');
  document.getElementById('quoteSuccess').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('✅ Opening email client — your request will be sent to ' + QUOTE_EMAIL);
}
async function shareQuoteWithAttachments() {
  if (!quoteShareFiles.length) {
    showToast('Please select at least one image or PDF first.');
    return;
  }
  let canShareFiles = false;
  try {
    canShareFiles = !!navigator.share && !!navigator.canShare && navigator.canShare({ files: quoteShareFiles });
  } catch (error) {
    canShareFiles = false;
  }
  if (!canShareFiles) {
    showToast('Your device cannot attach files automatically. Use Open Email App, then attach the selected files manually.');
    return;
  }
  try {
    await navigator.share({
      title: 'MTARISE Construction quote request',
      text: 'To: ' + QUOTE_EMAIL + '\nSubject: MTARISE Construction quote request\n\n' + quoteShareText,
      files: quoteShareFiles
    });
  } catch (error) {
    if (error && error.name !== 'AbortError') {
      showToast('Sharing was unavailable. Use Open Email App and attach the files manually.');
    }
  }
}

function handleQuickContact(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const fields = form.querySelectorAll('input, textarea');
  const subject = encodeURIComponent('Website enquiry — ' + fields[0].value);
  const body = encodeURIComponent(
    'NEW WEBSITE ENQUIRY — MTARISE CONSTRUCTION LTD\n\n' +
    'Name: ' + fields[0].value + '\n' +
    'Email: ' + fields[1].value + '\n' +
    'Phone: ' + fields[2].value + '\n' +
    'Message: ' + fields[3].value
  );
  window.location.href = 'mailto:' + QUOTE_EMAIL + '?subject=' + subject + '&body=' + body;
  form.reset();
  showToast('✅ Opening email client — your message will be sent to ' + QUOTE_EMAIL);
}
function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const d = new FormData(form);
  const name = d.get('name') || '';
  const subject = encodeURIComponent((d.get('subject') || 'Website enquiry') + ' — ' + name);
  const body = encodeURIComponent(
    'NEW WEBSITE ENQUIRY — MTARISE CONSTRUCTION LTD\n\n' +
    'Name: ' + name + '\n' +
    'Email: ' + (d.get('email') || '') + '\n' +
    'Phone: ' + (d.get('phone') || '') + '\n' +
    'Message: ' + (d.get('message') || '')
  );
  window.location.href = 'mailto:' + QUOTE_EMAIL + '?subject=' + subject + '&body=' + body;
  form.reset();
  const fields = document.getElementById('contactFormFields');
  const success = document.getElementById('contactSuccess');
  if (fields) fields.classList.add('hidden');
  if (success) success.classList.remove('hidden');
  showToast('✅ Opening email client — your message will be sent to ' + QUOTE_EMAIL);
}
function showFileNames(input) {
  const d = document.getElementById('fileNameList') || document.getElementById('fileNames');
  if (d) d.textContent = Array.from(input.files).map(f => f.name).join(', ');
}

// ─── Toast ───────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 4000);
}
