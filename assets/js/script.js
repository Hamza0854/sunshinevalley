/* Sunshine Valley Academy — site behaviour */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = '233595389846';

  /* sticky header shadow */
  var header = doc.getElementById('siteHeader');
  function onScroll() { if (header) header.classList.toggle('is-stuck', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* active nav link */
  var links = Array.prototype.slice.call(doc.querySelectorAll('.nav-link[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = doc.querySelector(l.getAttribute('href')); if (s) navIo.observe(s); });
  }

  /* close mobile menu after tapping a link */
  var nav = doc.getElementById('nav');
  if (nav) {
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (nav.classList.contains('show') && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(nav).hide();
      });
    });
  }

  /* missing photos fall back to the gradient behind them */
  doc.querySelectorAll('.imgbox img').forEach(function (img) {
    img.addEventListener('error', function () { img.classList.add('is-missing'); });
    if (img.complete && img.naturalWidth === 0) img.classList.add('is-missing');
  });

  /* "Enquire" on an age group → pre-select it in the form */
  var group = doc.getElementById('fGroup');
  var card = doc.getElementById('formCard');
  doc.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-enrol]');
    if (!btn) return;
    if (group) group.value = btn.getAttribute('data-enrol');
    if (card) {
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      card.classList.remove('is-flash'); void card.offsetWidth; card.classList.add('is-flash');
      setTimeout(function () { var f = doc.getElementById('fParent'); if (f && !f.value) f.focus({ preventScroll: true }); }, reduce ? 0 : 550);
    }
  });

  /* enrolment form → WhatsApp (or endpoint if set) */
  var form = doc.getElementById('enrolForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = doc.getElementById('enrolMsg');
      var ok = true;

      form.querySelectorAll('[required]').forEach(function (f) {
        var good = f.value.trim() !== '' && f.checkValidity();
        f.closest('.fld').classList.toggle('is-bad', !good);
        if (!good && ok) { f.focus(); ok = false; }
      });
      if (!ok) { msg.className = 'formmsg is-bad'; msg.textContent = 'Please fill in the highlighted fields.'; return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

      var labels = { parent: 'Parent', phone: 'Phone', child: 'Child', group: 'Age group', start: 'Start', calltime: 'Best time to call', message: 'Notes' };
      var lines = ['Hello Sunshine Valley! I would like to enrol my child.', ''];
      Object.keys(data).forEach(function (k) { if (data[k]) lines.push((labels[k] || k) + ': ' + data[k]); });

      var btn = form.querySelector('button[type="submit"]');
      btn.classList.add('is-loading');

      function done(good, text) {
        btn.classList.remove('is-loading');
        msg.className = 'formmsg ' + (good ? 'is-ok' : 'is-bad');
        msg.textContent = text;
        if (good) { form.reset(); form.querySelectorAll('.is-bad').forEach(function (x) { x.classList.remove('is-bad'); }); }
      }

      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw 0; done(true, 'Thank you! We\u2019ll call you soon to arrange a visit.'); })
          .catch(function () { done(false, 'That didn\u2019t send. Please call 0595 389 846.'); });
        return;
      }
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      done(true, 'Thank you! We\u2019ll call you soon to arrange a visit.');
    });
  }

  /* gallery lightbox */
  var lb = doc.getElementById('lightbox'), lbImg = doc.getElementById('lbImg'), lbClose = doc.getElementById('lbClose');
  var lastFocus = null;
  function openLb(src, alt) {
    lastFocus = doc.activeElement;
    lbImg.src = src; lbImg.alt = alt || '';
    lb.hidden = false; doc.body.style.overflow = 'hidden'; lbClose.focus();
  }
  function closeLb() {
    lb.hidden = true; doc.body.style.overflow = ''; lbImg.src = '';
    if (lastFocus) lastFocus.focus();
  }
  doc.querySelectorAll('.gal__item').forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img');
      if (img && img.classList.contains('is-missing')) return;
      openLb(item.getAttribute('data-full'), img ? img.alt : '');
    });
  });
  if (lb) {
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  /* scroll reveal */
  var targets = doc.querySelectorAll('.feat__item, .prog, .timeline li, .gal__item, .collage, .formcard, .visitbox, .faq .accordion-item, .ticks li');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  } else {
    targets.forEach(function (t) { t.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('is-in'); }, Math.min(i, 6) * 70);
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });
    targets.forEach(function (t) { io.observe(t); });
  }

  var y = doc.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
