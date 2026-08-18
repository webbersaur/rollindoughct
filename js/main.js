// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  const open = links.classList.toggle('active');
  toggle.setAttribute('aria-expanded', open);
});

// Close mobile nav on link click
links.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    links.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll animations
const faders = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.about__text, .about__image, .menu__card, .package, .packages__includes, .gallery__item, .contact__inner, .area__towns, .faq__item').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Header background on scroll
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.style.borderBottomColor = window.scrollY > 50
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(255,255,255,0.06)';
}, { passive: true });

// Gallery lightbox
const galleryItems = Array.from(document.querySelectorAll('.gallery__grid .gallery__item'));

if (galleryItems.length) {
  const slides = galleryItems.map(item => {
    const img = item.querySelector('img');
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
  });

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Gallery image viewer');
  box.hidden = true;
  box.innerHTML = `
    <button class="lightbox__close" type="button" aria-label="Close image viewer">&times;</button>
    <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">&#8249;</button>
    <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">&#8250;</button>
    <figure class="lightbox__figure">
      <img class="lightbox__img" src="" alt="">
      <figcaption class="lightbox__caption"></figcaption>
    </figure>
    <p class="lightbox__count" aria-live="polite"></p>`;
  document.body.appendChild(box);

  const boxImg = box.querySelector('.lightbox__img');
  const boxCaption = box.querySelector('.lightbox__caption');
  const boxCount = box.querySelector('.lightbox__count');
  const btnClose = box.querySelector('.lightbox__close');
  const btnPrev = box.querySelector('.lightbox__nav--prev');
  const btnNext = box.querySelector('.lightbox__nav--next');

  let current = 0;
  let lastFocused = null;

  const preload = i => {
    const s = slides[(i + slides.length) % slides.length];
    if (s) new Image().src = s.src;
  };

  const show = i => {
    current = (i + slides.length) % slides.length;
    const slide = slides[current];
    boxImg.src = slide.src;
    boxImg.alt = slide.alt;
    boxCaption.textContent = slide.alt;
    boxCount.textContent = `${current + 1} of ${slides.length}`;
    preload(current + 1);
    preload(current - 1);
  };

  const open = i => {
    lastFocused = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.classList.add('lightbox-open');
    btnClose.focus();
  };

  const close = () => {
    box.hidden = true;
    document.body.classList.remove('lightbox-open');
    if (lastFocused) lastFocused.focus();
  };

  galleryItems.forEach((item, i) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `View larger: ${slides[i].alt}`);
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(current - 1));
  btnNext.addEventListener('click', () => show(current + 1));

  // Click the backdrop (not the image or controls) to close
  box.addEventListener('click', e => {
    if (e.target === box || e.target.classList.contains('lightbox__figure')) close();
  });

  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      // keep focus inside the dialog
      const focusables = [btnClose, btnPrev, btnNext];
      const i = focusables.indexOf(document.activeElement);
      if (i === -1) {
        e.preventDefault();
        btnClose.focus();
      } else if (e.shiftKey && i === 0) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!e.shiftKey && i === focusables.length - 1) {
        e.preventDefault();
        focusables[0].focus();
      }
    }
  });

  // Swipe on touch devices
  let touchX = null;
  box.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(dx < 0 ? current + 1 : current - 1);
    touchX = null;
  }, { passive: true });
}
