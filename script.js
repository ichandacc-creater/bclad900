// Hero Image Slider
const slides = document.querySelectorAll('.hero img');
let current = 0;

setInterval(() => {
  slides[current].classList.remove('active');
  current = (current + 1) % slides.length;
  slides[current].classList.add('active');
}, 4000); // change every 4 seconds
