/* =============================================
   DR. VERMA'S MULTISPECIALITY HOMEOPATHY CLINIC
   Interactive JavaScript
   ============================================= */

'use strict';

/* ── NAVBAR: scroll shadow + active link ── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ── HAMBURGER MENU ── */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Mobile dropdown toggles
  document.querySelectorAll('.has-dropdown').forEach(item => {
    item.querySelector('.nav-link')?.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('open');
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Close on nav link click (mobile)
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        menu.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
})();


/* ── HERO SLIDER ── */
(function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let autoplayTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    resetAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    autoplayTimer = setInterval(next, 5000);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  // Touch swipe
  let touchStartX = 0;
  const heroEl = document.querySelector('.hero');
  heroEl?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }, { passive: true });

  startAutoplay();
})();


/* ── COUNTER ANIMATION ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ── PATIENT FEEDBACK SLIDER ── */
(function initFeedbackSlider() {
  const track = document.getElementById('feedbackTrack');
  const dotsContainer = document.getElementById('fbDots');
  const prevBtn = document.getElementById('fbPrev');
  const nextBtn = document.getElementById('fbNext');
  const slides = track?.querySelectorAll('.feedback-slide');

  if (!track || !slides?.length) return;

  let current = 0;
  let slidesPerView = getSlidesPerView();
  let totalGroups = Math.ceil(slides.length / slidesPerView);
  let autoTimer;

  function getSlidesPerView() {
    const w = window.innerWidth;
    if (w <= 480)  return 1;
    if (w <= 768)  return 2;
    if (w <= 1024) return 3;
    return 4;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    totalGroups = Math.ceil(slides.length / slidesPerView);
    for (let i = 0; i < totalGroups; i++) {
      const dot = document.createElement('button');
      dot.className = 'fb-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Group ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, totalGroups - 1));
    const slideWidth = slides[0].offsetWidth + 16; // gap
    track.style.transform = `translateX(-${current * slidesPerView * slideWidth}px)`;
    dotsContainer.querySelectorAll('.fb-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    clearInterval(autoTimer);
    startAuto();
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo((current + 1) % totalGroups), 4000);
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo((current + 1) % totalGroups));

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      slidesPerView = getSlidesPerView();
      current = 0;
      track.style.transform = 'translateX(0)';
      buildDots();
    }, 200);
  });

  // Touch
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) diff > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });

  buildDots();
  startAuto();
})();


/* ── SCROLL REVEAL ── */
(function initReveal() {
  // Add reveal classes to sections
  const targets = document.querySelectorAll(
    '.feature-item, .service-card, .why-card, .gallery-item, .about-image-wrap, .about-text-col, .stat-item, .section-header, .diseases-text, .cta-text, .cta-contact'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    const delay = (i % 4);
    if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ── SMOOTH SCROLL for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('navbar')?.offsetHeight || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── GALLERY LIGHTBOX ── */
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-item img');
  if (!items.length) return;

  // Create lightbox DOM
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.style.cssText = `
    display:none; position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.92); align-items:center; justify-content:center;
    cursor:zoom-out;
  `;

  const img = document.createElement('img');
  img.style.cssText = 'max-width:90vw; max-height:90vh; object-fit:contain; border-radius:8px; box-shadow:0 20px 60px rgba(0,0,0,.5);';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position:absolute; top:20px; right:24px; background:none; border:none;
    color:#fff; font-size:2.5rem; cursor:pointer; line-height:1;
  `;

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  items.forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      img.src = item.src;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
})();


/* ── ANNOUNCEMENT BAR dismiss ── */
(function initAnnouncement() {
  const bar = document.querySelector('.announcement-bar');
  if (!bar) return;
  const link = bar.querySelector('a');
  if (!link) return;
  link.addEventListener('click', (e) => {
    // Animate close if clicking "Learn more"
    // (leave default behaviour — just a UX note)
  });
})();


/* ── CONSOLE BRANDING ── */
console.log('%c Dr. Verma\'s Homeopathy Clinic ', 'background:#1a4a3a;color:#f0d9a8;font-size:14px;padding:6px 12px;border-radius:4px;font-weight:bold;');
console.log('%c Website built with care ', 'color:#3d7a5e;font-size:12px;');