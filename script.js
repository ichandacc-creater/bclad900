// =============================
// Hero Image Slider
// =============================
const slides = document.querySelectorAll('.hero img');
let current = 0;

function changeSlide() {
  slides[current].classList.remove('active');
  current = (current + 1) % slides.length;
  slides[current].classList.add('active');
}

// Change every 5 seconds
setInterval(changeSlide, 5000);

// =============================
// Smooth Scroll for Navigation
// =============================
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    if (link.hash) {
      e.preventDefault();
      const target = document.querySelector(link.hash);
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// =============================
// Scroll Reveal Animations
// =============================
const revealElements = document.querySelectorAll('.project-card, .about-preview, .contact-preview');

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// =============================
// WhatsApp Button Pulse Effect
// =============================
const whatsappBtn = document.querySelector('.whatsapp-btn');
setInterval(() => {
  whatsappBtn.classList.toggle('pulse');
}, 1500);
