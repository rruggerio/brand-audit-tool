/* ═══════════════════════════════════════════════════════════
   RICHARD RUGGERIO - PORTFOLIO JAVASCRIPT
   Shared interactive functionality for multi-page portfolio
   ═══════════════════════════════════════════════════════════ */

// ── 1. CUSTOM CURSOR ──────────────────────────────────────────
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let rx = 0, ry = 0; // ring position (lagged)
let mx = 0, my = 0; // mouse position

document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
});

// Ring follows with spring lag
function animateRing() {
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover effect on interactive elements
const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-category, .exp-item');
hoverElements.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── 2. NAVIGATION ─────────────────────────────────────────────
const nav = document.getElementById('main-nav');

// Show nav after brief delay
setTimeout(() => {
  if (nav) nav.classList.add('nav-visible');
}, 300);

// Active nav link based on current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || 
      (currentPage === '' && href === 'index.html') ||
      (currentPage === 'index.html' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── 3. HERO ANIMATIONS ────────────────────────────────────────
function initHeroAnimations() {
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  const heroLines = document.querySelectorAll('.reveal-line');
  const heroTagline = document.querySelector('.hero-tagline');
  const heroStats = document.querySelector('.hero-stats');
  const statItems = document.querySelectorAll('.stat-item');
  const orbs = document.querySelectorAll('.hero-orb');

  // Stagger hero entrance
  setTimeout(() => {
    if (orbs.length) orbs.forEach(orb => orb.classList.add('orb-visible'));
  }, 100);

  setTimeout(() => {
    if (heroEyebrow) heroEyebrow.classList.add('hero-in');
  }, 400);

  if (heroLines.length) {
    heroLines.forEach((line, i) => {
      setTimeout(() => line.classList.add('line-in'), 600 + i * 150);
    });
  }

  setTimeout(() => {
    if (heroTagline) heroTagline.classList.add('hero-in');
  }, 1100);

  setTimeout(() => {
    if (heroStats) heroStats.classList.add('hero-in');
  }, 1300);

  if (statItems.length) {
    statItems.forEach((item, i) => {
      setTimeout(() => item.classList.add('stat-in'), 1400 + i * 100);
    });
  }

  // Animate stat numbers
  setTimeout(() => animateStatNumbers(), 1500);
}

// Animate counting numbers
function animateStatNumbers() {
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  statNums.forEach(el => {
    const target = parseInt(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ── 4. SCROLL ANIMATIONS ──────────────────────────────────────
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      
      // For section headers
      if (entry.target.classList.contains('section-header')) {
        const num = entry.target.querySelector('.section-num');
        const title = entry.target.querySelector('.section-title');
        if (num) num.classList.add('in');
        if (title) title.classList.add('in');
      }
      
      // For staggered children
      if (entry.target.hasAttribute('data-stagger')) {
        const children = entry.target.children;
        const step = parseInt(entry.target.dataset.staggerStep) || 80;
        Array.from(children).forEach((child, i) => {
          child.style.setProperty('--delay', i * step);
        });
      }
    }
  });
}, observerOptions);

// Observe all animated elements
function observeElements() {
  const elements = document.querySelectorAll('.fade-up, .section-header, [data-stagger]');
  elements.forEach(el => observer.observe(el));
}

// ── 5. SMOOTH SCROLL ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#hero') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    }
  });
});

// ── 6. FORM VALIDATION ────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
      showFormMessage('Please fill in all required fields.', 'error');
      return;
    }
    
    if (!isValidEmail(data.email)) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      showFormMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 1500);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormMessage(message, type) {
  const existingMsg = document.querySelector('.form-message');
  if (existingMsg) existingMsg.remove();
  
  const msg = document.createElement('div');
  msg.className = `form-message form-message-${type}`;
  msg.textContent = message;
  
  const form = document.getElementById('contact-form');
  form.insertAdjacentElement('afterend', msg);
  
  setTimeout(() => msg.classList.add('visible'), 10);
  setTimeout(() => {
    msg.classList.remove('visible');
    setTimeout(() => msg.remove(), 300);
  }, 5000);
}

// ── 7. PROJECT FILTERING ──────────────────────────────────────
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (!filterBtns.length) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter projects
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          setTimeout(() => card.classList.add('visible'), 10);
        } else {
          card.classList.remove('visible');
          setTimeout(() => card.style.display = 'none', 300);
        }
      });
    });
  });
}

// ── 8. IMAGE LAZY LOADING ─────────────────────────────────────
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// ── 9. PAGE TRANSITIONS ───────────────────────────────────────
function initPageTransitions() {
  const links = document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"])');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Skip if external link or special protocol
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      e.preventDefault();
      document.body.classList.add('page-transitioning');
      
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  });
}

// ── 10. INITIALIZE ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize hero animations if on homepage
  if (document.querySelector('#hero')) {
    initHeroAnimations();
  }
  
  // Initialize scroll animations
  observeElements();
  
  // Initialize contact form
  initContactForm();
  
  // Initialize project filters
  initProjectFilters();
  
  // Initialize lazy loading
  initLazyLoading();
  
  // Initialize page transitions
  initPageTransitions();
  
  // Remove page transition class on load
  document.body.classList.remove('page-transitioning');
});

// Handle back/forward navigation
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    document.body.classList.remove('page-transitioning');
  }
});

// Made with Bob
