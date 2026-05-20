/* =========================================
   MOBILE MENU TOGGLE
   ========================================= */
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
  });
});

/* =========================================
   HERO SLIDER — SLIDE LEFT
   ========================================= */
const track        = document.getElementById('slidesTrack');
const slides       = document.querySelectorAll('.slide');
const dots         = document.querySelectorAll('.dot');
const progressFill = document.getElementById('heroProgressFill');
const slideNumEl   = document.getElementById('slideNum');
const prevBtn      = document.getElementById('heroPrev');
const nextBtn      = document.getElementById('heroNext');

const TOTAL         = slides.length;   // 3
const SLIDE_MS      = 5500;            // auto-advance interval
let   current       = 0;
let   autoTimer     = null;
let   isAnimating   = false;

/* ── helpers ── */
function pad(n) {
  return String(n + 1).padStart(2, '0');
}

/* ── core: move to slide at index ── */
function goTo(index, direction) {

  if (isAnimating) return;
  if (index === current) return;

  isAnimating = true;

  // wrap
  if (index < 0)      index = TOTAL - 1;
  if (index >= TOTAL) index = 0;

  // 1. remove is-active from old slide (stops Ken Burns, hides content)
  slides[current].classList.remove('is-active');
  dots[current].classList.remove('active');

  // 2. move the track left to the new slide
  track.style.transform = `translateX(-${index * (100 / TOTAL)}%)`;

  // 3. update state
  current = index;

  // 4. activate new slide after a tiny delay so CSS transition starts
  //    (content animations fire via .is-active class)
  setTimeout(() => {
    slides[current].classList.add('is-active');
    dots[current].classList.add('active');
    slideNumEl.textContent = pad(current);
    isAnimating = false;

    // fire counters after content animates in (~900ms delay)
    setTimeout(() => runSlideCounters(slides[current]), 900);
  }, 50);

  // 5. restart progress bar
  restartProgress();
}

/* ── next / prev ── */
function nextSlide() { goTo(current + 1); }
function prevSlide() { goTo(current - 1); }

/* ── dot click (global, called from HTML onclick) ── */
function goToSlide(index) {
  stopAuto();
  goTo(index);
  startAuto();
}

/* ── arrow buttons ── */
prevBtn.addEventListener('click', () => {
  stopAuto();
  prevSlide();
  startAuto();
});

nextBtn.addEventListener('click', () => {
  stopAuto();
  nextSlide();
  startAuto();
});

/* ── dot buttons (data-index approach as backup) ── */
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.index, 10);
    goToSlide(idx);
  });
});

/* =========================================
   PROGRESS BAR
   ========================================= */
function restartProgress() {
  // reset instantly
  progressFill.style.transition = 'none';
  progressFill.style.width = '0%';

  // force reflow
  progressFill.getBoundingClientRect();

  // animate fill over SLIDE_MS
  progressFill.style.transition = `width ${SLIDE_MS}ms linear`;
  progressFill.style.width = '100%';
}

/* =========================================
   AUTO PLAY
   ========================================= */
function startAuto() {
  autoTimer = setInterval(nextSlide, SLIDE_MS);
}

function stopAuto() {
  clearInterval(autoTimer);
}

/* =========================================
   KEYBOARD NAVIGATION
   ========================================= */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { stopAuto(); prevSlide(); startAuto(); }
  if (e.key === 'ArrowRight') { stopAuto(); nextSlide(); startAuto(); }
});

/* =========================================
   TOUCH / SWIPE SUPPORT
   ========================================= */
let touchX = 0;

document.querySelector('.hero-section').addEventListener('touchstart', e => {
  touchX = e.changedTouches[0].screenX;
}, { passive: true });

document.querySelector('.hero-section').addEventListener('touchend', e => {
  const diff = touchX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 55) {
    stopAuto();
    diff > 0 ? nextSlide() : prevSlide();
    startAuto();
  }
}, { passive: true });

/* =========================================
   PAUSE ON HOVER (desktop)
   ========================================= */
const heroSection = document.querySelector('.hero-section');

heroSection.addEventListener('mouseenter', stopAuto);
heroSection.addEventListener('mouseleave', startAuto);

/* =========================================
   STAT COUNTER ANIMATION
   Fires every time a slide becomes active.
   Each .stat-num counts up from 0 → data-target
   with an easeOutExpo curve, shimmer while
   counting, glow+bounce on finish.
   ========================================= */

/**
 * Easing: easeOutExpo
 * t = elapsed / duration  (0 → 1)
 */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animate a single .stat-num element
 * @param {HTMLElement} el
 */
function animateStat(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix  || '';
  const label    = el.dataset.label   || null; // e.g. "A+" override at end
  const duration = Math.min(1800, 600 + target * 2); // scale with size, cap 1.8s
  const start    = performance.now();

  // reset
  el.classList.remove('done');
  el.classList.add('counting');
  el.textContent = '0' + suffix;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutExpo(progress);
    const current  = Math.floor(eased * target);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // finished
      el.classList.remove('counting');
      el.classList.add('done');

      // if there's a special label override (e.g. "A+"), show it after count
      if (label) {
        setTimeout(() => {
          el.textContent = label;
        }, 300);
      } else {
        el.textContent = target + suffix;
      }
    }
  }

  requestAnimationFrame(tick);
}

/**
 * Run counters for all .stat-num inside a given slide element
 * @param {HTMLElement} slideEl
 */
function runSlideCounters(slideEl) {
  const nums = slideEl.querySelectorAll('.stat-num');
  nums.forEach((el, i) => {
    // stagger each counter slightly
    setTimeout(() => animateStat(el), i * 180);
  });
}

/* =========================================
   INIT
   ========================================= */
// Activate first slide immediately
slides[0].classList.add('is-active');
dots[0].classList.add('active');
slideNumEl.textContent = '01';
restartProgress();
startAuto();

// Run counters on first slide after its content animates in
setTimeout(() => runSlideCounters(slides[0]), 900);

/* =========================================
   PARTNERS SECTION — SCROLL REVEAL
   ========================================= */

/**
 * IntersectionObserver — triggers .in-view
 * on the section and each trust badge
 * when they scroll into the viewport.
 */
const partnersSection = document.getElementById('partnersSection');
const trustBadges     = document.querySelectorAll('.trust-badge');

/* ── section reveal ── */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        sectionObserver.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.15 }
);

if (partnersSection) {
  sectionObserver.observe(partnersSection);
}

/* ── trust badge stagger reveal ── */
const badgeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        badgeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

trustBadges.forEach(badge => badgeObserver.observe(badge));

/* =========================================
   MARQUEE — SPEED CONTROL
   Slow down on mobile for readability
   ========================================= */
function setMarqueeSpeed() {
  const tracks = document.querySelectorAll('.marquee-track');
  const speed  = window.innerWidth < 600 ? '40s' : '28s';
  tracks.forEach(t => t.style.animationDuration = speed);
}

setMarqueeSpeed();
window.addEventListener('resize', setMarqueeSpeed);

/* =========================================
   TRUSTED BRANDS / LOGO SECTION
   ========================================= */

const brandsSection = document.getElementById('brandsSection');
const brandsTabs    = document.querySelectorAll('.brands-tab');
const brandsPanels  = document.querySelectorAll('.brands-panel');

/* ── TAB SWITCHING ── */
brandsTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    /* deactivate all tabs + panels */
    brandsTabs.forEach(t  => t.classList.remove('active'));
    brandsPanels.forEach(p => p.classList.remove('active'));

    /* activate clicked tab + matching panel */
    tab.classList.add('active');
    const panel = document.querySelector(`.brands-panel[data-panel="${target}"]`);
    if (panel) {
      panel.classList.add('active');

      /* re-trigger card animations by forcing reflow */
      const cards = panel.querySelectorAll('.brand-card');
      cards.forEach(card => {
        card.style.animation = 'none';
        card.getBoundingClientRect(); /* reflow */
        card.style.animation = '';
      });
    }
  });
});

/* ── SCROLL REVEAL for brands section ── */
const brandsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        brandsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.10 }
);

if (brandsSection) {
  brandsObserver.observe(brandsSection);
}

/* =========================================
   ABOUT US SECTION — SCROLL REVEAL + COUNTERS
   ========================================= */

/* ── elements to reveal ── */
const aboutRevealEls = document.querySelectorAll(`
  .about-top,
  .about-intro,
  .about-img-main,
  .about-img-small,
  .about-body,
  .about-features,
  .about-stats-bar
`);

/* ── generic reveal observer ── */
const aboutObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        aboutObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

aboutRevealEls.forEach(el => {
  if (el) aboutObserver.observe(el);
});

/* ── CTA wrapper reveal (data-aos fallback) ── */
const aboutCtaWrap = document.querySelector('.about-right [data-aos="fade-up"]');
if (aboutCtaWrap) {
  const ctaObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          ctaObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  aboutCtaWrap.style.opacity = '0';
  aboutCtaWrap.style.transform = 'translateY(30px)';
  aboutCtaWrap.style.transition = 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s';
  ctaObs.observe(aboutCtaWrap);
}

/* =========================================
   ABOUT STATS — PREMIUM INTERACTIVE COUNTERS
   Features:
   • easeOutExpo count-up on scroll-in
   • Shimmer sweep while counting
   • Glow + scale bounce on finish
   • Particle burst on finish
   • Pulse ring animation on finish
   • Magnetic hover (number follows cursor)
   • Click to re-trigger counter
   • Staggered entry per stat item
   ========================================= */

const aboutStatNums  = document.querySelectorAll('.about-stat-num');
const aboutStatItems = document.querySelectorAll('.about-stat');

/* ── easing ── */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/* ── particle burst ── */
function burstParticles(el) {
  const rect    = el.getBoundingClientRect();
  const cx      = rect.left + rect.width  / 2;
  const cy      = rect.top  + rect.height / 2;
  const count   = 12;

  for (let i = 0; i < count; i++) {
    const p   = document.createElement('span');
    const ang = (360 / count) * i;
    const rad = (ang * Math.PI) / 180;
    const dist = 40 + Math.random() * 30;
    const size = 4 + Math.random() * 5;

    p.style.cssText = `
      position:fixed;
      left:${cx}px;
      top:${cy}px;
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:#c57307;
      pointer-events:none;
      z-index:9999;
      transform:translate(-50%,-50%);
      transition: transform 0.7s ease, opacity 0.7s ease;
    `;
    document.body.appendChild(p);

    /* force reflow then animate */
    p.getBoundingClientRect();
    p.style.transform = `translate(
      calc(-50% + ${Math.cos(rad) * dist}px),
      calc(-50% + ${Math.sin(rad) * dist}px)
    )`;
    p.style.opacity = '0';

    setTimeout(() => p.remove(), 750);
  }
}

/* ── pulse ring ── */
function pulseRing(el) {
  const ring = document.createElement('span');
  ring.className = 'about-stat-ring';
  el.closest('.about-stat').appendChild(ring);
  setTimeout(() => ring.remove(), 900);
}

/* ── core counter ── */
function runAboutCounter(el, delay = 0) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = Math.min(2000, 700 + target * 1.8);

  setTimeout(() => {
    const start = performance.now();

    /* counting state */
    el.classList.remove('asc-done');
    el.classList.add('asc-counting');
    el.textContent = '0' + suffix;

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const val      = Math.floor(eased * target);

      el.textContent = val + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        /* finished */
        el.textContent = target + suffix;
        el.classList.remove('asc-counting');
        el.classList.add('asc-done');

        burstParticles(el);
        pulseRing(el);

        /* remove done class after animation so hover re-trigger works */
        setTimeout(() => el.classList.remove('asc-done'), 1200);
      }
    }

    requestAnimationFrame(tick);
  }, delay);
}

/* ── scroll-in trigger (staggered) ── */
const aboutStatObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.about-stat-num');
        items.forEach((el, i) => runAboutCounter(el, i * 200));
        aboutStatObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const statsBar = document.querySelector('.about-stats-bar');
if (statsBar) aboutStatObserver.observe(statsBar);

/* ── click to re-trigger ── */
aboutStatItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    const num = item.querySelector('.about-stat-num');
    if (num) runAboutCounter(num, 0);
  });
});

/* ── magnetic hover — number follows cursor ── */
aboutStatItems.forEach(item => {
  const num = item.querySelector('.about-stat-num');
  if (!num) return;

  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    num.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
  });

  item.addEventListener('mouseleave', () => {
    num.style.transform = 'translate(0,0) scale(1)';
  });
});

/* =========================================
   SERVICES SECTION
   ========================================= */

const servicesSection  = document.getElementById('servicesSection');
const servicesHeader   = document.querySelector('.services-header');
const servicesTrack    = document.getElementById('servicesTrack');
const servicesWrap     = document.getElementById('servicesScrollWrap');
const svcPrevBtn       = document.getElementById('svcPrev');
const svcNextBtn       = document.getElementById('svcNext');
const svcDotsWrap      = document.getElementById('svcDots');
const serviceCards     = document.querySelectorAll('.service-card');

/* ── SCROLL REVEAL — header ── */
const svcHeaderObs = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        svcHeaderObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.2 }
);
if (servicesHeader) svcHeaderObs.observe(servicesHeader);

/* ── SCROLL REVEAL — cards (staggered) ── */
const svcCardObs = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = Array.from(serviceCards).indexOf(e.target);
        setTimeout(() => {
          e.target.classList.add('is-visible');
        }, idx * 80);
        svcCardObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
serviceCards.forEach(c => svcCardObs.observe(c));

/* ── BUILD DOTS ── */
const CARD_WIDTH   = () => (serviceCards[0]?.offsetWidth || 300) + 24; // card + gap
const VISIBLE_COLS = () => Math.floor(servicesWrap.offsetWidth / CARD_WIDTH());
const TOTAL_PAGES  = () => Math.ceil(serviceCards.length / VISIBLE_COLS());

function buildDots() {
  if (!svcDotsWrap) return;
  svcDotsWrap.innerHTML = '';
  const pages = TOTAL_PAGES();
  for (let i = 0; i < pages; i++) {
    const d = document.createElement('button');
    d.className = 'svc-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to page ${i + 1}`);
    d.addEventListener('click', () => scrollToPage(i));
    svcDotsWrap.appendChild(d);
  }
}

function updateDots() {
  if (!svcDotsWrap) return;
  const scrollLeft  = servicesWrap.scrollLeft;
  const pageWidth   = CARD_WIDTH() * VISIBLE_COLS();
  const activePage  = Math.round(scrollLeft / pageWidth);
  svcDotsWrap.querySelectorAll('.svc-dot').forEach((d, i) => {
    d.classList.toggle('active', i === activePage);
  });
}

function scrollToPage(page) {
  const pageWidth = CARD_WIDTH() * VISIBLE_COLS();
  servicesWrap.scrollTo({ left: page * pageWidth, behavior: 'smooth' });
}

buildDots();
window.addEventListener('resize', buildDots);
servicesWrap.addEventListener('scroll', updateDots, { passive: true });

/* ── ARROW BUTTONS ── */
svcPrevBtn.addEventListener('click', () => {
  servicesWrap.scrollBy({ left: -CARD_WIDTH() * VISIBLE_COLS(), behavior: 'smooth' });
});

svcNextBtn.addEventListener('click', () => {
  servicesWrap.scrollBy({ left:  CARD_WIDTH() * VISIBLE_COLS(), behavior: 'smooth' });
});

/* ── DRAG TO SCROLL (mouse) ── */
let isDragging  = false;
let dragStartX  = 0;
let scrollStart = 0;

servicesWrap.addEventListener('mousedown', e => {
  isDragging  = true;
  dragStartX  = e.pageX - servicesWrap.offsetLeft;
  scrollStart = servicesWrap.scrollLeft;
  servicesWrap.classList.add('is-dragging');
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  const x    = e.pageX - servicesWrap.offsetLeft;
  const walk = (x - dragStartX) * 1.4;
  servicesWrap.scrollLeft = scrollStart - walk;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  servicesWrap.classList.remove('is-dragging');
});

/* ── TOUCH SWIPE ── */
let svcTouchX = 0;

servicesWrap.addEventListener('touchstart', e => {
  svcTouchX = e.changedTouches[0].screenX;
}, { passive: true });

servicesWrap.addEventListener('touchend', e => {
  const diff = svcTouchX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 40) {
    servicesWrap.scrollBy({
      left: diff > 0 ? CARD_WIDTH() : -CARD_WIDTH(),
      behavior: 'smooth'
    });
  }
}, { passive: true });

/* ── KEYBOARD (when section is focused) ── */
servicesWrap.setAttribute('tabindex', '0');
servicesWrap.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  servicesWrap.scrollBy({ left: -CARD_WIDTH(), behavior: 'smooth' });
  if (e.key === 'ArrowRight') servicesWrap.scrollBy({ left:  CARD_WIDTH(), behavior: 'smooth' });
});

/* ── NUMBER HOVER EFFECT — count up on card hover ── */
serviceCards.forEach(card => {
  const numEl = card.querySelector('.service-num');
  if (!numEl) return;
  const finalVal = numEl.textContent.trim();

  card.addEventListener('mouseenter', () => {
    const target = parseInt(finalVal, 10);
    if (isNaN(target)) return;
    let frame = 0;
    const total = 12;
    const interval = setInterval(() => {
      frame++;
      numEl.textContent = String(Math.floor((frame / total) * target)).padStart(2, '0');
      if (frame >= total) {
        clearInterval(interval);
        numEl.textContent = finalVal;
      }
    }, 30);
  });
});

/* =========================================
   SERVICE MODAL DATA
   ========================================= */
const SERVICE_DATA = {
  'sea-freight': {
    num: '01', tag: 'Ocean Logistics', tagIcon: 'fa-ship',
    title: 'Sea Freight',
    img: 'image/pexels-port-1845350_1920.jpg',
    desc: 'End-to-end ocean freight solutions connecting major ports worldwide. We handle FCL and LCL shipments with reliable schedules, competitive rates, and full cargo tracking from origin to destination.',
    features: [
      'Full Container Load (FCL) & Less than Container Load (LCL)',
      'Real-time cargo tracking & status updates',
      'Port-to-port and door-to-door delivery',
      'Hazardous and temperature-controlled cargo',
      'Customs clearance & documentation support'
    ],
    meta: [{ val: '80+', label: 'Countries' }, { val: '200+', label: 'Ports' }, { val: '99%', label: 'On-Time' }],
    cta: 'Get a Sea Freight Quote'
  },
  'air-freight': {
    num: '02', tag: 'Air Logistics', tagIcon: 'fa-plane-departure',
    title: 'Air Freight',
    img: 'image/Air Transport Services, Air Logistics.jpg',
    desc: 'Air freight is ideal for high-value or time-sensitive goods. We move your products with speed and reliability, offering express, standard, and charter air cargo services globally.',
    features: [
      'Express next-day and 2-day delivery options',
      'Charter flights for oversized or urgent cargo',
      'Airport-to-airport and door-to-door service',
      'Dangerous goods handling (IATA certified)',
      'Live tracking with instant notifications'
    ],
    meta: [{ val: '150+', label: 'Airlines' }, { val: '48hr', label: 'Express' }, { val: '24/7', label: 'Support' }],
    cta: 'Get an Air Freight Quote'
  },
  'road-freight': {
    num: '03', tag: 'Road Logistics', tagIcon: 'fa-truck-fast',
    title: 'Road Freight',
    img: 'image/download (89).jpg',
    desc: 'Our road freight services deliver your goods across borders with speed and security. We navigate customs and regulations so you can focus on your business.',
    features: [
      'Full Truck Load (FTL) & Less than Truck Load (LTL)',
      'Cross-border and domestic delivery',
      'Refrigerated and temperature-controlled transport',
      'GPS-tracked fleet for real-time visibility',
      'Dedicated account manager for each client'
    ],
    meta: [{ val: '500+', label: 'Trucks' }, { val: '30+', label: 'Countries' }, { val: '12yr', label: 'Experience' }],
    cta: 'Get a Road Freight Quote'
  },
  'warehousing': {
    num: '04', tag: 'Storage Solutions', tagIcon: 'fa-warehouse',
    title: 'Warehousing Service',
    img: 'image/CENTRO IMPRESION (1).jpg',
    desc: 'Our ISO-certified warehousing facilities provide secure, flexible storage solutions for businesses of all sizes. From short-term overflow to long-term distribution hubs.',
    features: [
      'ISO-certified secure storage facilities',
      'Inventory management & WMS integration',
      'Pick, pack, and fulfillment services',
      'Cold storage and climate-controlled options',
      'Cross-docking and distribution services'
    ],
    meta: [{ val: '50K+', label: 'Sq. Meters' }, { val: '99.8%', label: 'Accuracy' }, { val: '24/7', label: 'Security' }],
    cta: 'Enquire About Warehousing'
  },
  'packaging': {
    num: '05', tag: 'Packaging Solutions', tagIcon: 'fa-box-open',
    title: 'Packaging',
    img: 'image/Fast Shipping Custom Tote Bags _ Add Your Logo or Photo Today.jpg',
    desc: 'Professional packaging solutions designed to protect your goods during transit. From standard boxes to custom branded packaging, we ensure your products arrive in perfect condition.',
    features: [
      'Custom branded packaging design',
      'Industrial and fragile goods packaging',
      'Eco-friendly sustainable materials',
      'Bulk packaging for large shipments',
      'Labelling and barcoding services'
    ],
    meta: [{ val: '100%', label: 'Protected' }, { val: 'Eco', label: 'Friendly' }, { val: 'Custom', label: 'Branding' }],
    cta: 'Get a Packaging Quote'
  },
  'printing': {
    num: '06', tag: 'Printing Services', tagIcon: 'fa-print',
    title: 'Printing Services',
    img: 'image/download (90).jpg',
    desc: 'Professional printing for all your business needs — from business cards and brochures to large-format banners and custom packaging. Fast turnaround, premium quality, delivered to your door.',
    features: [
      'Business cards, flyers & brochures',
      'Large-format banners & signage',
      'Custom packaging & product labels',
      'Corporate stationery & letterheads',
      'Same-day & express printing available'
    ],
    meta: [{ val: '24hr', label: 'Turnaround' }, { val: 'HD', label: 'Quality' }, { val: 'Free', label: 'Delivery' }],
    cta: 'Get a Print Quote'
  },
  'custom-clearance': {
    num: '07', tag: 'Customs Brokerage', tagIcon: 'fa-file-contract',
    title: 'Custom Clearance',
    img: 'image/pexels-port-1845350_1920.jpg',
    desc: 'Expert customs brokerage ensuring smooth border crossings and full regulatory compliance for all shipment types. We handle all documentation so your cargo moves without delays.',
    features: [
      'Import & export customs declarations',
      'Tariff classification & duty calculation',
      'Trade compliance consulting',
      'Bonded warehouse & duty deferment',
      'AEO certified brokerage services'
    ],
    meta: [{ val: '100%', label: 'Compliant' }, { val: '48hr', label: 'Clearance' }, { val: 'AEO', label: 'Certified' }],
    cta: 'Enquire About Customs'
  }
};

/* ── modal elements ── */
const modalBackdrop = document.getElementById('svcModalBackdrop');
const modalImg      = document.getElementById('modalImg');
const modalNum      = document.getElementById('modalNum');
const modalTag      = document.getElementById('modalTag');
const modalTagText  = document.getElementById('modalTagText');
const modalTitle    = document.getElementById('modalTitle');
const modalDesc     = document.getElementById('modalDesc');
const modalFeatures = document.getElementById('modalFeatures');
const modalMeta     = document.getElementById('modalMeta');
const modalCta      = document.getElementById('modalCta');
const modalClose    = document.getElementById('svcModalClose');
const modalClose2   = document.getElementById('svcModalClose2');
const modalPrev     = document.getElementById('modalPrev');
const modalNext     = document.getElementById('modalNext');

const SERVICE_KEYS = Object.keys(SERVICE_DATA);
let currentModalKey = null;

/* ── open modal ── */
function openModal(key) {
  const d = SERVICE_DATA[key];
  if (!d) return;
  currentModalKey = key;

  modalImg.src          = d.img;
  modalImg.alt          = d.title;
  modalNum.textContent  = d.num;
  modalTagText.textContent = d.tag;
  modalTag.querySelector('i').className = `fa-solid ${d.tagIcon}`;
  modalTitle.textContent = d.title;
  modalDesc.textContent  = d.desc;
  modalCta.textContent   = d.cta + ' ';
  modalCta.appendChild(Object.assign(document.createElement('i'), { className: 'fa-solid fa-arrow-right' }));

  /* features */
  modalFeatures.innerHTML = d.features.map(f =>
    `<li><i class="fa-solid fa-circle-check"></i>${f}</li>`
  ).join('');

  /* meta */
  modalMeta.innerHTML = d.meta.map(m =>
    `<div class="svc-meta-item"><strong>${m.val}</strong><span>${m.label}</span></div>`
  ).join('');

  modalBackdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  /* focus trap */
  setTimeout(() => modalClose.focus(), 100);
}

/* ── close modal ── */
function closeModal() {
  modalBackdrop.classList.remove('is-open');
  document.body.style.overflow = '';
  currentModalKey = null;
}

/* ── navigate modal ── */
function navigateModal(dir) {
  const idx     = SERVICE_KEYS.indexOf(currentModalKey);
  const nextIdx = (idx + dir + SERVICE_KEYS.length) % SERVICE_KEYS.length;
  openModal(SERVICE_KEYS[nextIdx]);
}

/* ── event listeners ── */
modalClose.addEventListener('click',  closeModal);
modalClose2.addEventListener('click', closeModal);
modalPrev.addEventListener('click',   () => navigateModal(-1));
modalNext.addEventListener('click',   () => navigateModal(1));

/* close on backdrop click */
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});

/* close on Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && currentModalKey) closeModal();
  if (e.key === 'ArrowLeft'  && currentModalKey) navigateModal(-1);
  if (e.key === 'ArrowRight' && currentModalKey) navigateModal(1);
});

/* ── wire up all "Learn More" buttons ── */
document.querySelectorAll('.svc-modal-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    openModal(btn.dataset.modal);
  });
});

/* also wire card clicks (anywhere on card except scroll) */
document.querySelectorAll('.service-card[data-modal]').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('.svc-modal-btn')) return; /* already handled */
    openModal(card.dataset.modal);
  });
});

/* =========================================
   WHY CHOOSE US — SCROLL REVEAL
   ========================================= */
const whyHeadingWrap = document.querySelector('.why-heading-wrap');
const whyItems       = document.querySelectorAll('.why-item');

const whyHeadObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      whyHeadObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

if (whyHeadingWrap) whyHeadObs.observe(whyHeadingWrap);

const whyItemObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const idx = Array.from(whyItems).indexOf(e.target);
      setTimeout(() => e.target.classList.add('is-visible'), idx * 80);
      whyItemObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

whyItems.forEach(el => whyItemObs.observe(el));

/* =========================================
   TESTIMONIALS SLIDER
   ========================================= */
const testiSlides = document.querySelectorAll('.testi-slide');
const testiDots   = document.querySelectorAll('.testi-dot');
const testiPrev   = document.getElementById('testiPrev');
const testiNext   = document.getElementById('testiNext');
let   testiCurrent = 0;
let   testiTimer   = null;

function showTesti(idx) {
  testiSlides.forEach((s, i) => {
    s.classList.toggle('active', i === idx);
    if (testiDots[i]) testiDots[i].classList.toggle('active', i === idx);
  });
  testiCurrent = idx;
}

function nextTesti() { showTesti((testiCurrent + 1) % testiSlides.length); }
function prevTesti() { showTesti((testiCurrent - 1 + testiSlides.length) % testiSlides.length); }

if (testiPrev) testiPrev.addEventListener('click', () => { clearInterval(testiTimer); prevTesti(); testiTimer = setInterval(nextTesti, 6000); });
if (testiNext) testiNext.addEventListener('click', () => { clearInterval(testiTimer); nextTesti(); testiTimer = setInterval(nextTesti, 6000); });

testiDots.forEach((dot, i) => {
  dot.addEventListener('click', () => { clearInterval(testiTimer); showTesti(i); testiTimer = setInterval(nextTesti, 6000); });
});

testiTimer = setInterval(nextTesti, 6000);

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
