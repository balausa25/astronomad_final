// ============================================================
// ASTRONOMAD — Assignment 5 & Final Project: Core JavaScript
// Author: Smail Balaussa | Group: SE-2505
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================
  // 1. SHARED DATA & UTILITIES (Объектілер мен функциялар)
  // ==========================================================
  const planetsData = [
    { id: 'mercury', name: 'Mercury', symbol: '☿', rating: 0 },
    { id: 'venus',   name: 'Venus',   symbol: '♀', rating: 0 },
    { id: 'earth',   name: 'Earth',   symbol: '🌍', rating: 0 },
    { id: 'mars',    name: 'Mars',    symbol: '♂', rating: 0 },
    { id: 'jupiter', name: 'Jupiter', symbol: '♃', rating: 0 },
    { id: 'saturn',  name: 'Saturn',  symbol: '♄', rating: 0 },
    { id: 'uranus',  name: 'Uranus',  symbol: '♅', rating: 0 },
    { id: 'neptune', name: 'Neptune', symbol: '♆', rating: 0 },
  ];

  const planetTypes = {
    mercury: 'inner', venus: 'inner', earth: 'inner', mars: 'inner',
    jupiter: 'outer gas', saturn: 'outer gas',
    uranus: 'outer ice', neptune: 'outer ice'
  };

  // Дыбыс эффектілері (Web Audio API)
  const sound = {
    ctx: null,
    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    play(freq = 440, duration = 0.1, type = 'sine') {
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {
        console.warn('Audio not available:', err);
      }
    },
    click() { this.play(660, 0.08, 'square'); },
    success() { this.play(880, 0.15, 'sine'); setTimeout(() => this.play(1100, 0.2, 'sine'), 120); },
    error() { this.play(200, 0.2, 'sawtooth'); },
    pop() { this.play(520, 0.06, 'triangle'); }
  };

  // Тақырыпты басқару (Theme Manager)
  const themeManager = {
    current: 'dark',
    toggle() {
      this.current = this.current === 'dark' ? 'light' : 'dark';
      document.body.classList.toggle('light-theme', this.current === 'light');
      localStorage.setItem('astronomad-theme', this.current);
      return this.current;
    },
    load() {
      const saved = localStorage.getItem('astronomad-theme');
      if (saved === 'light') {
        this.current = 'light';
        document.body.classList.add('light-theme');
      } else {
        this.current = 'dark';
        document.body.classList.remove('light-theme');
      }
    }
  };
  themeManager.load();

  // ==========================================================
  // 2. THEME TOGGLE BUTTON (Түн/Күн режимі)
  // ==========================================================
  const navContainer = document.querySelector('.nav-container');
  if (navContainer && !document.getElementById('themeToggle')) {
    const themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggle';
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Toggle light/dark theme');
    themeBtn.textContent = themeManager.current === 'dark' ? '☀️' : '🌙';
    navContainer.appendChild(themeBtn);

    themeBtn.addEventListener('click', () => {
      const mode = themeManager.toggle();
      themeBtn.textContent = mode === 'dark' ? '☀️' : '🌙';
      sound.click();
    });
  }

  // ==========================================================
  // 3. RATING STARS (Рейтинг жұлдыздары - Gallery)
  // ==========================================================
  function updateStars(container, value) {
    container.querySelectorAll('.star').forEach((star) => {
      const starValue = Number(star.dataset.value);
      star.classList.toggle('active', starValue <= value);
    });
  }

  const galleryCards = document.querySelectorAll('.gallery-card');
  if (galleryCards.length > 0) {
    galleryCards.forEach((card, index) => {
      const planet = planetsData[index];
      if (!planet) return;

      const ratingWrap = document.createElement('div');
      ratingWrap.className = 'rating-wrap';
      ratingWrap.innerHTML = `
        <span class="rating-label">Rate ${planet.name}:</span>
        <div class="stars" data-planet="${planet.id}"></div>
      `;
      const starsBox = ratingWrap.querySelector('.stars');

      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        star.dataset.value = i;
        star.setAttribute('role', 'button');
        star.setAttribute('tabindex', '0');
        star.setAttribute('aria-label', `Rate ${i} stars`);
        starsBox.appendChild(star);
      }

      const infoBox = card.querySelector('.gallery-info');
      if (infoBox) infoBox.appendChild(ratingWrap);

      starsBox.addEventListener('click', (e) => {
        if (!e.target.classList.contains('star')) return;
        const value = Number(e.target.dataset.value);
        planet.rating = value;
        updateStars(starsBox, value);
        sound.pop();
        localStorage.setItem(`rating-${planet.id}`, value);
      });

      const saved = localStorage.getItem(`rating-${planet.id}`);
      if (saved) {
        planet.rating = Number(saved);
        updateStars(starsBox, planet.rating);
      }
    });
  }

  // ==========================================================
  // 4. KEYBOARD NAVIGATION (Навигация Arrow пернелерімен)
  // ==========================================================
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    const links = Array.from(navLinks.querySelectorAll('a'));
    links.forEach(l => l.setAttribute('tabindex', '0'));

    document.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (!links.includes(active)) return;

      const idx = links.indexOf(active);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        links[(idx + 1) % links.length].focus();
        sound.click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        links[(idx - 1 + links.length) % links.length].focus();
        sound.click();
      } else if (e.key === 'Enter') {
        active.click();
      }
    });
  }

  // ==========================================================
  // 5. GREETING BY TIME OF DAY (Уақытқа қарай сәлемдесу)
  // ==========================================================
  const heroBadge = document.querySelector('.hero-badge');
  const heroSection = document.querySelector('.hero');
  if (heroBadge && heroSection) {
    const hour = new Date().getHours();
    let greeting = '';
    switch (true) {
      case (hour >= 5 && hour < 12):
        greeting = '🌅 Good morning, stargazer!';
        break;
      case (hour >= 12 && hour < 17):
        greeting = '☀️ Good afternoon, explorer!';
        break;
      case (hour >= 17 && hour < 22):
        greeting = '🌆 Good evening, astronomer!';
        break;
      default:
        greeting = '🌙 Good night, cosmic traveler!';
    }
    heroBadge.textContent = greeting;
  }

  // ==========================================================
  // 6. PLANET FILTER (Switch операторы - Planets)
  // ==========================================================
  const accordion = document.querySelector('.accordion');
  if (accordion && !document.querySelector('.filter-bar')) {
    const filterBar = document.createElement('div');
    filterBar.className = 'filter-bar';
    filterBar.innerHTML = `
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="inner">Inner Planets</button>
      <button class="filter-btn" data-filter="outer">Outer Planets</button>
      <button class="filter-btn" data-filter="gas">Gas Giants</button>
    `;
    accordion.parentNode.insertBefore(filterBar, accordion);

    filterBar.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;
      const filter = e.target.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      sound.click();

      const items = Array.from(document.querySelectorAll('.accordion-item'));
      items.forEach((item) => {
        const name = item.querySelector('.planet-name').textContent.trim().toLowerCase();
        const found = planetsData.find(p => name.includes(p.name.toLowerCase()));
        const type = found ? (planetTypes[found.id] || '') : '';

        let show = false;
        switch (filter) {
          case 'all':   show = true; break;
          case 'inner': show = type === 'inner'; break;
          case 'outer': show = type.includes('outer'); break;
          case 'gas':   show = type.includes('gas'); break;
          default:      show = true;
        }
        item.style.display = show ? 'block' : 'none';
        if (show) item.style.animation = 'fadeIn 0.4s ease';
      });
    });
  }

  // ==========================================================
  // 7. POPUP (Subscribe) — Ашылу/Жабылу
  // ==========================================================
  const openPopup = document.getElementById('openPopup');
  const openPopup2 = document.getElementById('openPopup2');
  const closePopup = document.getElementById('closePopup');
  const popupOverlay = document.getElementById('popupOverlay');

  [openPopup, openPopup2].forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        popupOverlay.classList.add('show');
        sound.pop();
      });
    }
  });

  if (closePopup) {
    closePopup.addEventListener('click', () => {
      popupOverlay.classList.remove('show');
      sound.click();
    });
  }

  if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        popupOverlay.classList.remove('show');
        sound.click();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupOverlay && popupOverlay.classList.contains('show')) {
      popupOverlay.classList.remove('show');
      sound.click();
    }
  });

  // ==========================================================
  // 8. GALLERY — Background color changer (Фон түсін өзгерту)
  // ==========================================================
  const colorBtn = document.getElementById('colorBtn');
  if (colorBtn) {
    const colors = ['#050510', '#0a0a2e', '#1a0a2e', '#2e0a1a', '#0a2e1a', '#2e2a0a'];
    let colorIndex = 0;
    colorBtn.addEventListener('click', () => {
      colorIndex = (colorIndex + 1) % colors.length;
      document.body.style.backgroundColor = colors[colorIndex];
      colorBtn.textContent = `🎨 Background: ${colors[colorIndex]}`;
      sound.click();
      colorBtn.style.transform = 'scale(1.1)';
      setTimeout(() => { colorBtn.style.transform = 'scale(1)'; }, 200);
    });
  }

  // ==========================================================
  // 9. NAV TOGGLE (Мобильді мәзір)
  // ==========================================================
  const navToggle = document.getElementById('navToggle');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      sound.click();
    });
  }

  // ==========================================================
  // 10. LIVE DATE/TIME (Тірі уақыт)
  // ==========================================================
  const dateTimeEl = document.getElementById('dateTime');
  if (dateTimeEl) {
    const updateDateTime = () => {
      const now = new Date();
      dateTimeEl.textContent = now.toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    };
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }

  // ==========================================================
  // 11. ACCORDION (Планеталар аккордеоны)
  // ==========================================================
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.accordion-item').forEach((i) => {
        i.classList.remove('open');
        const c = i.querySelector('.accordion-content');
        if (c) c.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        sound.pop();
      } else {
        sound.click();
      }
    });
  });

  // ==========================================================
  // 12. FORM VALIDATION (Форма валидациясы - Contact)
  // ==========================================================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone'); // Телефон өрісі
    const passInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmError = document.getElementById('confirmError');
    const formSuccess = document.getElementById('formSuccess');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-\(\)]{10,15}$/; // Телефон форматы

    function validate() {
      let ok = true;

      // Name
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your full name.';
        ok = false;
      } else {
        nameError.textContent = '';
      }

      // Email
      if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        ok = false;
      } else {
        emailError.textContent = '';
      }

      // Phone (міндетті емес, бірақ енгізілсе тексеру)
      if (phoneInput && phoneInput.value.trim() !== '') {
        if (!phoneRegex.test(phoneInput.value.trim())) {
          let phoneErr = document.getElementById('phoneError');
          if (!phoneErr) {
            phoneErr = document.createElement('small');
            phoneErr.id = 'phoneError';
            phoneErr.className = 'error';
            phoneErr.style.color = 'var(--danger)';
            phoneErr.style.fontSize = '0.82rem';
            phoneErr.style.display = 'block';
            phoneErr.style.marginTop = '0.3rem';
            phoneInput.parentNode.appendChild(phoneErr);
          }
          phoneErr.textContent = 'Invalid phone format (e.g., +7 777 123 4567).';
          ok = false;
        } else {
          const phoneErr = document.getElementById('phoneError');
          if (phoneErr) phoneErr.textContent = '';
        }
      }

      // Password
      if (passInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        ok = false;
      } else {
        passwordError.textContent = '';
      }

      // Confirm
      if (passInput.value !== confirmInput.value || !confirmInput.value) {
        confirmError.textContent = 'Passwords do not match.';
        ok = false;
      } else {
        confirmError.textContent = '';
      }

      return ok;
    }

    // Real-time validation
    [nameInput, emailInput, phoneInput, passInput, confirmInput].forEach(inp => {
      if (inp) inp.addEventListener('input', validate);
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Валидацияны тексеру
      if (validate()) {
        // Егер jQuery бар болса, ол спиннерді көрсетеді
        if (window.jQuery) {
          $(registerForm).trigger('submit');
        } else {
          // Егер jQuery жоқ болса, қарапайым сәттілік хабарламасы
          formSuccess.textContent = '✅ Message sent successfully! I will reply within 24 hours.';
          sound.success();
          registerForm.reset();
          const phoneErr = document.getElementById('phoneError');
          if (phoneErr) phoneErr.textContent = '';
        }
      } else {
        formSuccess.textContent = '';
        sound.error();
      }
    });
  }

  // ==========================================================
  // 13. SUBSCRIBE FORM (Popup ішіндегі форма)
  // ==========================================================
  const subscribeForm = document.getElementById('subscribeForm');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('subEmail').value.trim();
      const msg = document.getElementById('subMessage');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        msg.textContent = '❌ Please enter a valid email.';
        msg.style.color = 'var(--danger)';
        sound.error();
        return;
      }

      msg.textContent = '✅ Subscribed! Welcome to Astronomad.';
      msg.style.color = 'var(--success)';
      sound.success();
      subscribeForm.reset();

      setTimeout(() => {
        popupOverlay.classList.remove('show');
        msg.textContent = '';
      }, 2000);
    });
  }

});