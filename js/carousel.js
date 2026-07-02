// ============================================
// CARRUSEL
// ============================================

let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    if (n >= slides.length) currentSlide = 0;
    if (n < 0) currentSlide = slides.length - 1;
    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('active');
    }
}

function changeSlide(n) {
    currentSlide += n;
    showSlide(currentSlide);
}

// Auto-rotar carrusel cada 5 segundos
if (slides.length > 0) {
    showSlide(0);
    setInterval(() => changeSlide(1), 5000);
}
