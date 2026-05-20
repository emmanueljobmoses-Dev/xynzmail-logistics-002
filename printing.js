/* =========================================
   PRINTING PAGE — printing.js
   ========================================= */

window.addEventListener('DOMContentLoaded', () => {

  /* ── activate scroll-reveal after first paint ── */
  setTimeout(() => {
    document.body.classList.add('pr-loaded');
    initReveal();
  }, 80);

  initAll();
});

/* =========================================
   MOBILE MENU
   ========================================= */
function initAll() {

  const menuToggle = document.getElementById('menuToggle');
  const navLinks   = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
      });
    });
  }

  /* ── navbar scroll shrink ── */
  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const s = document.createElement('style');
  s.textContent = `
    header.scrolled { box-shadow: 0 4px 24px rgba(7,23,57,.14); }
    header.scrolled .navbar { height: 72px; transition: height .3s ease; }
  `;
  document.head.appendChild(s);

  /* ── back to top ── */
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (btn) btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── footer year ── */
  const yr = document.getElementById('footerYear');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── newsletter ── */
  const nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = nlForm.querySelector('input');
      const fbtn  = nlForm.querySelector('button');
      fbtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      fbtn.style.background = '#16a34a';
      input.value = '';
      input.placeholder = 'Thank you!';
      setTimeout(() => {
        fbtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        fbtn.style.background = '';
        input.placeholder = 'Your email address';
      }, 3000);
    });
  }

  /* ── smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ── hero parallax ── */
  const heroBg = document.querySelector('.pr-hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      heroBg.style.transform = `scale(1.06) translateY(${window.scrollY * 0.2}px)`;
    }, { passive: true });
  }

  /* ── product card 3D tilt ── */
  document.querySelectorAll('.pr-product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 8;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 6;
      card.style.transform = `translateY(-10px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.02)`;
      card.style.transition = 'transform .08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s ease, box-shadow .35s ease, border-color .3s ease';
    });
  });

  /* ── process step number count-up ── */
  document.querySelectorAll('.pr-step-num').forEach(el => {
    const target = parseInt(el.textContent, 10);
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          let f = 0;
          const t = setInterval(() => {
            f++;
            el.textContent = String(Math.ceil((f / 20) * target)).padStart(2, '0');
            if (f >= 20) { clearInterval(t); el.textContent = String(target).padStart(2, '0'); }
          }, 40);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.6 });
    obs.observe(el);
  });

  /* ── stats counter ── */
  initStatsCounter();

  /* ── quote form ── */
  initQuoteForm();

  /* ── testimonial card hover ── */
  document.querySelectorAll('.pr-testi-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      document.querySelectorAll('.pr-testi-card').forEach(c => {
        if (c !== card) c.style.opacity = '0.65';
      });
    });
    card.addEventListener('mouseleave', () => {
      document.querySelectorAll('.pr-testi-card').forEach(c => c.style.opacity = '1');
    });
  });
}

/* =========================================
   SCROLL REVEAL
   ========================================= */
function initReveal() {
  const els = document.querySelectorAll('.pr-reveal');

  /* immediately reveal anything already in viewport */
  els.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40) el.classList.add('is-visible');
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => {
    if (!el.classList.contains('is-visible')) obs.observe(el);
  });
}

/* =========================================
   STATS COUNTER
   ========================================= */
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

function animateCount(el, target, suffix, duration) {
  const start = performance.now();
  el.classList.add('pr-counting');

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const v = easeOutExpo(p);
    el.textContent = Math.floor(v * target) + suffix;
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
      el.classList.remove('pr-counting');
      el.classList.add('pr-done');
      el.animate(
        [{ transform:'scale(1)' },{ transform:'scale(1.22)' },{ transform:'scale(0.93)' },{ transform:'scale(1)' }],
        { duration: 500, easing: 'ease' }
      );
      setTimeout(() => el.classList.remove('pr-done'), 800);
    }
  }
  requestAnimationFrame(tick);
}

function initStatsCounter() {
  const statsBar = document.querySelector('.pr-stats');
  if (!statsBar) return;

  /* inject shimmer CSS */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes prShimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
    .pr-counting {
      background: linear-gradient(90deg,#c57307 0%,#f5c518 30%,#fff8c0 50%,#f5c518 70%,#c57307 100%);
      background-size: 300% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: prShimmer .9s linear infinite;
    }
    .pr-done { -webkit-text-fill-color: #c57307; color: #c57307; background: none; }
    .pr-stat-item:hover .pr-stat-num { -webkit-text-fill-color: #f5c518; color: #f5c518; }
  `;
  document.head.appendChild(style);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        statsBar.querySelectorAll('.pr-stat-num').forEach((el, i) => {
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          const dur    = Math.min(1800, 600 + target * 2);
          setTimeout(() => animateCount(el, target, suffix, dur), i * 200);
        });
        obs.unobserve(statsBar);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(statsBar);

  /* click to replay */
  statsBar.querySelectorAll('.pr-stat-item').forEach(item => {
    item.addEventListener('click', () => {
      const el     = item.querySelector('.pr-stat-num');
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      animateCount(el, target, suffix, Math.min(1800, 600 + target * 2));
    });
  });

  /* magnetic hover */
  statsBar.querySelectorAll('.pr-stat-item').forEach(item => {
    const num = item.querySelector('.pr-stat-num');
    if (!num) return;
    item.addEventListener('mousemove', e => {
      const r = item.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 8;
      num.style.transform = `translate(${x}px,${y}px) scale(1.08)`;
    });
    item.addEventListener('mouseleave', () => { num.style.transform = ''; });
  });
}

/* =========================================
   QUOTE FORM
   ========================================= */
function initQuoteForm() {
  const form = document.getElementById('prQuoteForm');
  const btn  = document.getElementById('prSubmitBtn');
  if (!form || !btn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    /* loading state */
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Quote Sent!';
      btn.classList.add('success');
      btn.disabled = false;

      /* reset after 4s */
      setTimeout(() => {
        btn.innerHTML = '<span>Send Quote Request</span><i class="fa-solid fa-paper-plane"></i>';
        btn.classList.remove('success');
        form.reset();
      }, 4000);
    }, 1800);
  });

  /* real-time input validation highlight */
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.required && !field.value.trim()) {
        field.style.borderColor = '#ef4444';
      } else {
        field.style.borderColor = '';
      }
    });
    field.addEventListener('input', () => {
      if (field.value.trim()) field.style.borderColor = '#16a34a';
    });
  });
}
