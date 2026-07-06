// S·A Intelligent Designs — site behaviour (no animation loops, no canvas)

// Header shadow on scroll
const header = document.getElementById('siteHeader');
let lastScrolled = false;
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 8;
  if (scrolled !== lastScrolled) {
    header.classList.toggle('scrolled', scrolled);
    lastScrolled = scrolled;
  }
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

// Package selector
function selectPackage(which) {
  document.getElementById('packDetailLaunch').classList.toggle('open', which === 'launch');
  document.getElementById('packDetailSignature').classList.toggle('open', which === 'signature');
  const target = document.getElementById(which === 'launch' ? 'packDetailLaunch' : 'packDetailSignature');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
document.querySelectorAll('[data-package]').forEach(card => {
  card.addEventListener('click', () => selectPackage(card.dataset.package));
});

// Contact form
const consultForm = document.getElementById('consultForm');
consultForm.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const nameField = form.querySelector('#fname');
  const emailField = form.querySelector('#femail');
  if (!nameField.value || !emailField.value) {
    nameField.reportValidity();
    emailField.reportValidity();
    return;
  }
  const btn = form.querySelector('button[type="submit"]');
  const note = document.getElementById('formNote');
  const originalBtnText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result = await res.json();
    if (result.success) {
      form.style.display = 'none';
      document.getElementById('sentMsg').style.display = 'block';
    } else {
      throw new Error(result.message || 'Something went wrong');
    }
  } catch (err) {
    note.textContent = "That didn't send — please try again, or email us directly.";
    note.style.color = '#c0392b';
    btn.disabled = false;
    btn.textContent = originalBtnText;
  }
});

// Cookie consent
const CONSENT_KEY = 'sa_cookie_consent';
function cookieGetConsent() {
  try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) { return null; }
}
function cookieStore(analytics, marketing) {
  const record = { essential: true, analytics: !!analytics, marketing: !!marketing, ts: new Date().toISOString(), version: 1 };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch (e) {}
  document.getElementById('cookiePop').classList.remove('show');
}
function cookieConsent(mode) {
  if (mode === 'all') { cookieStore(true, true); }
  else if (mode === 'reject' || mode === 'essential') { cookieStore(false, false); }
  else {
    cookieStore(document.getElementById('ckAnalytics').checked, document.getElementById('ckMarketing').checked);
  }
}
function toggleCookiePrefs() {
  const p = document.getElementById('cookiePrefs');
  const link = document.getElementById('cookieManageLink');
  const actions = document.querySelector('#cookiePop .cookie-actions');
  if (p.hidden) {
    p.hidden = false;
    link.textContent = 'Hide preferences';
    if (!document.getElementById('ckSaveBtn')) {
      const b = document.createElement('button');
      b.className = 'btn'; b.id = 'ckSaveBtn'; b.textContent = 'Save preferences';
      b.onclick = () => cookieConsent('custom');
      actions.appendChild(b);
    }
  } else {
    p.hidden = true;
    link.textContent = 'Manage preferences';
    const b = document.getElementById('ckSaveBtn');
    if (b) b.remove();
  }
}
function openCookiePolicy() {
  const d = document.getElementById('cookies');
  if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}
document.getElementById('cookieAcceptAll').addEventListener('click', () => cookieConsent('all'));
document.getElementById('cookieEssentialOnly').addEventListener('click', () => cookieConsent('essential'));
document.getElementById('cookieReject').addEventListener('click', () => cookieConsent('reject'));
document.getElementById('cookieManageLink').addEventListener('click', toggleCookiePrefs);
document.querySelectorAll('.js-open-cookies').forEach(el => el.addEventListener('click', openCookiePolicy));

setTimeout(() => {
  if (!cookieGetConsent()) document.getElementById('cookiePop').classList.add('show');
}, 1200);
