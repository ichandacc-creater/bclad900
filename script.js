// Safe DOM queries and small UI helpers
document.addEventListener('DOMContentLoaded', () => {
  // Hero slider (presentation-style with controls)
  const hero = document.querySelector('.hero');
  const slides = document.querySelectorAll('.hero .slides img, .hero .slides video');
  const prevBtn = document.querySelector('.hero .hero-arrow.prev');
  const nextBtn = document.querySelector('.hero .hero-arrow.next');
  const dotsContainer = document.querySelector('.hero .dots');

  if (hero && slides && slides.length) {
    let current = 0;
    const len = slides.length;
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
    const heroControls = document.querySelector('.hero-controls');
    if (len <= 1) {
      if (heroControls) heroControls.style.display = 'none';
      hero.classList.add('single');
    } else {
      hero.classList.remove('single');
    }

    function deactivateSlide(idx) {
      const s = slides[idx];
      s.classList.remove('active');
      if (s.tagName === 'VIDEO') {
        try { s.pause(); s.currentTime = 0; } catch (e) {}
      }
    }
    function activateSlide(idx) {
      const s = slides[idx];
      s.classList.add('active');
      if (s.tagName === 'VIDEO') {
        s.muted = true;
        s.playsInline = true;
        s.loop = true;
        s.play().catch(() => {});
      }
    }

    function goTo(index) {
      if (index === current) return;
      deactivateSlide(current);
      dots[current].classList.remove('active');
      current = (index + len) % len;
      activateSlide(current);
      dots[current].classList.add('active');
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // autoplay
    function startAutoplay(){
      if (len <= 1) return; // no autoplay for single slide
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

    // initialize: ensure first slide active and play if it's a video
    slides.forEach((s, i) => {
      if (i !== 0) s.classList.remove('active');
      else { s.classList.add('active'); if (s.tagName === 'VIDEO') { s.muted = true; s.playsInline = true; s.loop = true; s.play().catch(()=>{}); } }
    });

    // start
    startAutoplay();

    // Quick hero popup: ensure the hero-card doesn't stay visible longer than 1.5s
    (function(){
      const heroCard = document.querySelector('.hero .hero-card');
      if (!heroCard) return;
      // hide after 1500ms (1.5 seconds)
      setTimeout(() => heroCard.classList.add('hidden-short'), 1500);
    })();
  }

  // Thumbnail gallery interactions (project pages)
  document.querySelectorAll('.project-card .thumbs').forEach((thumbs) => {
    const main = thumbs.closest('.project-card').querySelector('.project-main');
    thumbs.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', (e) => {
        const src = e.currentTarget.dataset.full || e.currentTarget.src;
        if (main) main.src = src;
        thumbs.querySelectorAll('img').forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });
  });

  // NSOBE project page: initial image and lightbox
  (function(){
    const nsobeMain = document.getElementById('nsobe-main');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (nsobeMain) {
      const params = new URLSearchParams(window.location.search);
      const img = params.get('img');
      if (img) nsobeMain.src = decodeURIComponent(img);

      // clicking main image opens lightbox
      nsobeMain.addEventListener('click', () => {
        if (lightbox && lightboxImg) { lightboxImg.src = nsobeMain.src; lightbox.classList.remove('hidden'); }
      });

      // wire thumbnails on nsobe page (if present) to change main image without navigating
      const nsobeThumbs = document.querySelectorAll('#nsobe-page .thumbs img');
      nsobeThumbs.forEach(t => t.addEventListener('click', (e)=>{
        const src = e.currentTarget.dataset.full || e.currentTarget.src;
        nsobeMain.src = src;
        nsobeThumbs.forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
      }));
    }

    // Global lightbox handlers (for decorative images and general use)
    if (lightbox && lightboxImg) {
      // close with ESC
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.add('hidden'); });
      // click outside the image closes
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.add('hidden'); });
      // close button
      const closeBtn = document.querySelector('.lightbox .close');
      if (closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.add('hidden'));

      // open lightbox for decorative images on index
      document.querySelectorAll('.decor-img').forEach(img => {
        img.addEventListener('click', () => {
          lightboxImg.src = img.src;
          lightbox.classList.remove('hidden');
        });
      });

      // open lightbox for main project images on projects page
      document.querySelectorAll('.project-card > img').forEach(img => {
        img.addEventListener('click', () => {
          lightboxImg.src = img.src;
          lightbox.classList.remove('hidden');
        });
      });
    }
  })();

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

  // Scroll & reveal: use IntersectionObserver for performance
  const revealElements = document.querySelectorAll('.project-card, .about-preview, .contact-preview, .decor-img, .feature, .preview-grid .project-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  revealElements.forEach(el => revealObserver.observe(el));

  // Header shrink on scroll and back-to-top visibility
  const header = document.querySelector('.site-header');
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    const sc = window.scrollY || window.pageYOffset;
    if (header) {
      if (sc > 80) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    }
    if (backToTop) {
      if (sc > 400) backToTop.classList.add('visible'); else backToTop.classList.remove('visible');
    }
  });
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

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
