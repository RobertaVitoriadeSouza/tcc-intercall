document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  var savedTheme = localStorage.getItem('intellicart-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('intellicart-theme', next);
    });
  }

  if (menuToggle && mobileMenu) {
    function closeMenu() {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function openMenu() {
      mobileMenu.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    menuToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1100) closeMenu();
    });
  }
});
