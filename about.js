/* =========================================
   ABOUT PAGE — about.js
   ========================================= */

/* =========================================
   MOBILE MENU TOGGLE
   ========================================= */
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
    });
  });
}

/* =========================================
   SCROLL REVEAL
   All elements with .ab-reveal get
   .is-visible when they enter the viewport
   ========================================= */
const revealEls = document.querySelectorAll('.ab-reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

/* =========================================
   STATS COUNTER
   Counts up from 0 → data-target on scroll
   ========================================= */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function runCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = Math.min(1800, 600 + target * 2);
  const start    = performance.now();

  el.classList.add('ab-counting');

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutExpo(progress);
    el.textContent = Math.floor(eased * target) + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
      el.classList.remove('ab-counting');
      el.classList.add('ab-done');

      /* bounce finish */
      el.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.22)' },
          { transform: 'scale(0.93)' },
          { transform: 'scale(1.08)' },
          { transform: 'scale(1)' }
        ],
        { duration: 550, easing: 'ease' }
      );

      /* remove done class after animation */
      setTimeout(() => el.classList.remove('ab-done'), 800);
    }
  }

  requestAnimationFrame(tick);
}

const statNums = document.querySelectorAll('.ab-stat-num');

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.ab-stat-num');
        nums.forEach((el, i) => setTimeout(() => runCounter(el), i * 200));
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const statsSection = document.getElementById('abStats');
if (statsSection) statsObserver.observe(statsSection);

/* click to replay counter */
document.querySelectorAll('.ab-stat-item').forEach(item => {
  item.addEventListener('click', () => {
    const num = item.querySelector('.ab-stat-num');
    if (num) runCounter(num);
  });
});

/* magnetic hover on stat numbers */
document.querySelectorAll('.ab-stat-item').forEach(item => {
  const num = item.querySelector('.ab-stat-num');
  if (!num) return;

  item.addEventListener('mousemove', e => {
    const rect = item.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
    num.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
  });

  item.addEventListener('mouseleave', () => {
    num.style.transform = 'translate(0,0) scale(1)';
  });
});

/* =========================================
   TIMELINE — hover highlight
   ========================================= */
document.querySelectorAll('.ab-tl-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const dot = item.querySelector('.ab-tl-dot');
    if (dot) dot.style.background = '#a86206';
  });
  item.addEventListener('mouseleave', () => {
    const dot = item.querySelector('.ab-tl-dot');
    if (dot) dot.style.background = '';
  });
});

/* =========================================
   NAVBAR SCROLL EFFECT
   Adds shadow + slight shrink on scroll
   ========================================= */
const header = document.getElementById('mainHeader');

window.addEventListener('scroll', () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }
}, { passive: true });

/* =========================================
   BACK TO TOP
   ========================================= */
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (backToTopBtn) {
    backToTopBtn.classList.toggle('is-visible', window.scrollY > 400);
  }
}, { passive: true });

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =========================================
   FOOTER — YEAR + NEWSLETTER
   ========================================= */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    const btn   = newsletterForm.querySelector('button');
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    btn.style.background = '#16a34a';
    input.value = '';
    input.placeholder = 'Thank you for subscribing!';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
      btn.style.background = '';
      input.placeholder = 'Your email address';
    }, 3000);
  });
}

/* =========================================
   HEADER SCROLLED STATE CSS
   (injected so no extra file needed)
   ========================================= */
const scrollStyle = document.createElement('style');
scrollStyle.textContent = `
  header.scrolled {
    box-shadow: 0 4px 24px rgba(7,23,57,0.14);
  }
  header.scrolled .navbar {
    height: 72px;
    transition: height 0.3s ease;
  }
`;
document.head.appendChild(scrollStyle);
