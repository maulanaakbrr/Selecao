// main.test.js
const fs = require('fs');
const path = require('path');

// Muat konten dari main.js
const mainJsContent = fs.readFileSync(path.resolve(__dirname, 'main.js'), 'utf8');

describe('main.js functionality', () => {
  beforeEach(() => {
    // Mock global libs
    global.GLightbox = jest.fn(() => ({}));
    global.AOS = { init: jest.fn(), refresh: jest.fn(), refreshHard: jest.fn() };
    global.Isotope = jest.fn(() => ({ arrange: jest.fn() }));
    global.imagesLoaded = jest.fn((elements, callback) => { if(callback) setTimeout(callback, 0); return { on: jest.fn(), off: jest.fn() }; });
    global.Swiper = jest.fn(() => ({}));

    // Setup DOM
    document.body.innerHTML = `
      <header id="header"></header>
      <div class="mobile-nav-toggle bi-list"></div>
      <nav id="navmenu" class="navmenu">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <li class="navmenu-item">
          <a href="#" class="toggle-dropdown">Dropdown Item</a>
          <ul class="dropdown"><li>Sub Item</li></ul>
        </li>
      </nav>
      <div id="preloader"></div>
      <a class="scroll-top"></a>
      <div class="isotope-layout" data-layout="masonry" data-default-filter="*" data-sort="original-order">
        <div class="isotope-container">
          <div class="isotope-item">Item 1</div>
          <div class="isotope-item">Item 2</div>
        </div>
        <ul class="isotope-filters">
          <li data-filter="*" class="filter-active">All</li>
          <li data-filter=".cat-a">Category A</li>
        </ul>
      </div>
      <div class="init-swiper">
        <div class="swiper-config">{"loop":true}</div>
      </div>
      <section id="home" style="height: 500px;"></section>
      <section id="about" style="height: 500px;"></section>
    `;

    // Load main.js script
    const script = document.createElement('script');
    script.textContent = mainJsContent;
    document.body.appendChild(script);

    // Mock scroll related
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.scrollTo = jest.fn();

    // Trigger load event
    window.dispatchEvent(new Event('load'));
  });

  // ---

  describe('mobileNavToogle', () => {
    test('toggles mobile-nav-active and icon classes on click', () => {
      const btn = document.querySelector('.mobile-nav-toggle');
      const body = document.body;

      // Initial: bi-list class present
      btn.classList.add('bi-list');
      btn.click();
      expect(body.classList.contains('mobile-nav-active')).toBe(true);
      expect(btn.classList.contains('bi-x')).toBe(true);
      expect(btn.classList.contains('bi-list')).toBe(false);

      // Click again toggles off
      btn.click();
      expect(body.classList.contains('mobile-nav-active')).toBe(false);
      expect(btn.classList.contains('bi-list')).toBe(true);
      expect(btn.classList.contains('bi-x')).toBe(false);
    });
  });

 

  describe('mobile nav hide on same-page links', () => {
    beforeEach(() => {
      document.body.classList.add('mobile-nav-active');
      const toggle = document.querySelector('.mobile-nav-toggle');
      toggle.classList.add('bi-x');
      toggle.classList.remove('bi-list');
    });

    test('hides mobile nav when link clicked if mobile nav active', () => {
      const link = document.querySelector('#navmenu a[href="#home"]');
      link.click();
      expect(document.body.classList.contains('mobile-nav-active')).toBe(false);
      const toggle = document.querySelector('.mobile-nav-toggle');
      expect(toggle.classList.contains('bi-list')).toBe(true);
      expect(toggle.classList.contains('bi-x')).toBe(false);
    });
  });

  

  describe('Preloader', () => {
    test('removes preloader after load', () => {
      expect(document.querySelector('#preloader')).toBeNull();
    });
  });

  

  describe('Scroll top button', () => {
    let btn;

    beforeEach(() => {
      btn = document.querySelector('.scroll-top');
      btn.classList.remove('active');
    });

    test('calls scrollTo on click', () => {
      btn.click();
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  

  describe('aosInit', () => {
    test('calls AOS.init on load', () => {
      expect(global.AOS.init).toHaveBeenCalledWith({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    });
  });

  

  describe('glightbox', () => {
    test('calls GLightbox on load', () => {
      expect(global.GLightbox).toHaveBeenCalledWith({ selector: '.glightbox' });
    });
  });

  

  describe('initSwiper', () => {
    test('initializes Swiper on elements', () => {
      expect(global.Swiper).toHaveBeenCalled();

      const swiperElement = document.querySelector(".init-swiper");
      const expectedConfig = JSON.parse(swiperElement.querySelector(".swiper-config").textContent.trim());
      expect(global.Swiper).toHaveBeenCalledWith(swiperElement, expectedConfig);
    });
  });
});