// Navigation behaviour will live here.
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');

  if (header) {
    const syncHeaderScrollState = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };

    syncHeaderScrollState();
    window.addEventListener('scroll', syncHeaderScrollState, { passive: true });
  }

  /* ── HAMBURGER MENU ── */
  const hamburger=document.getElementById('hamburger');
  const mobileMenu=document.getElementById('mobile-menu');
  if(hamburger && mobileMenu){
    function syncMenuTop() {
      mobileMenu.style.top = (header ? header.offsetHeight : 57) + 'px';
    }
    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
    syncMenuTop();
    hamburger.setAttribute('aria-expanded', 'false');
    window.addEventListener('resize', () => {
      syncMenuTop();
      if (getComputedStyle(hamburger).display === 'none') closeMobileMenu();
    });

    hamburger.addEventListener('click',()=>{
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });
    document.querySelectorAll('.mobile-nav a').forEach(link=>{
      link.addEventListener('click',()=>{
        closeMobileMenu();
      });
    });
    document.addEventListener('click',e=>{
      if(!hamburger.contains(e.target) && !mobileMenu.contains(e.target)){
        closeMobileMenu();
      }
    });
    document.addEventListener('keydown',e=>{
      if(e.key === 'Escape'){
        const wasOpen = mobileMenu.classList.contains('open');
        closeMobileMenu();
        if (wasOpen) {
          hamburger.focus();
        }
      }
    });
  }

  /* ── DARK/LIGHT TOGGLE ── */
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const storedTheme = localStorage.getItem('site-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
  }

  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      setTheme(dark ? 'light' : 'dark');
    });
  });
});
