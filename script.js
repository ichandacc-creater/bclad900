// Safe DOM queries and small UI helpers
document.addEventListener('DOMContentLoaded', () => {
  // Hero slider (presentation-style with controls)
  const hero = document.querySelector('.hero');
  const slideImgs = document.querySelectorAll('.hero .slides img');
  const prevBtn = document.querySelector('.hero .hero-arrow.prev');
  const nextBtn = document.querySelector('.hero .hero-arrow.next');
  const dotsContainer = document.querySelector('.hero .dots');

  if (hero && slideImgs && slideImgs.length) {
    let current = 0;
    const len = slideImgs.length;
    let autoplayId = null;

    // build dots
    for (let i = 0; i < len; i++) {
      const btn = document.createElement('button');
      if (i === 0) btn.classList.add('active');
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      btn.dataset.index = i;
      dotsContainer.appendChild(btn);
    }
    const dots = dotsContainer.querySelectorAll('button');

    function goTo(index) {
      if (index === current) return;
      slideImgs[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + len) % len;
      slideImgs[current].classList.add('active');
      dots[current].classList.add('active');
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // autoplay
    function startAutoplay(){
      stopAutoplay();
      autoplayId = setInterval(next, 6000);
    }
    function stopAutoplay(){ if (autoplayId) { clearInterval(autoplayId); autoplayId = null; } }

    // attach events
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
    dots.forEach(d => d.addEventListener('click', (e) => { const idx = Number(e.currentTarget.dataset.index); goTo(idx); startAutoplay(); }));

    // pause on hover / resume on leave
    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', startAutoplay);

    // keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
      if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    });

    // start
    startAutoplay();
  }

  // Accessible mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.style.display = expanded ? 'none' : 'flex';
      siteNav.style.flexDirection = 'column';
    });

    // close menu when a nav link is clicked (mobile)
    siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth < 720) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.style.display = 'none';
      }
    }));
  }

  // Smooth scroll for internal anchors
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Scroll reveal (safe check)
  const revealElements = document.querySelectorAll('.project-card, .about-preview, .contact-preview');
  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 100) el.classList.add('visible');
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);

  // WhatsApp pulse (if present)
  const whatsappBtn = document.querySelector('.whatsapp-btn');
  if (whatsappBtn) {
    setInterval(() => whatsappBtn.classList.toggle('pulse'), 1500);
  }

  // Contact form handling (client-side only)
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // basic validation using classes
      const fields = [contactForm.name, contactForm.email, contactForm.message];
      let hasError = false;
      fields.forEach(f => {
        if (!f.value.trim()) { f.classList.add('input-error'); hasError = true; }
        else { f.classList.remove('input-error'); }
      });
      // simple email check
      const email = contactForm.email.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        contactForm.email.classList.add('input-error'); hasError = true;
      }
      if (hasError) return;

      // simulate successful submission
      contactForm.reset();
      fields.forEach(f => f.classList.remove('input-error'));
      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        setTimeout(() => formSuccess.classList.add('hidden'), 6000);
      }
    });
  }
});
