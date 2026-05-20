/* =====================================================
   NEXUSGEAR — script.js
   ===================================================== */

// ---- CART STATE ----
const cart = {
  items: [],
  
  add(product) {
    this.items.push({ ...product, cartId: Date.now() + Math.random() });
    this.update();
    showToast(`${product.name} adicionado ao carrinho 🛒`);
  },

  remove(cartId) {
    this.items = this.items.filter(i => i.cartId !== cartId);
    this.update();
  },

  total() {
    return this.items.reduce((sum, item) => {
      const raw = item.price.replace(/[R$.\s]/g, '').replace(',', '.');
      return sum + parseFloat(raw);
    }, 0);
  },

  update() {
    renderCart();
    // update ALL cart count badges on the page
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = this.items.length;
      el.classList.toggle('visible', this.items.length > 0);
    });
  }
};

// ---- RENDER CART ----
function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-val');
  if (!itemsEl) return;

  if (cart.items.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">🎮</span>
        <p>Nenhum item no carrinho ainda.<br>Explore nosso portfólio!</p>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.items.map(item => {
      // Use product image in cart if available, otherwise fall back to icon/emoji
      const iconHtml = item.imgSrc
        ? `<img src="${item.imgSrc}" alt="${item.name}" />`
        : item.icon || '🎮';
      return `
      <div class="cart-item" id="ci-${item.cartId}">
        <div class="cart-item-icon">${iconHtml}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-price">${item.price}</div>
        </div>
        <button class="cart-item-remove" onclick="cart.remove(${item.cartId})" title="Remover">✕</button>
      </div>`;
    }).join('');
  }

  if (totalEl) {
    const total = cart.total();
    totalEl.textContent = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }
}

// ---- CART OPEN/CLOSE ----
function openCart() {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- TOAST ----
function showToast(msg, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  void toast.offsetWidth; // reflow
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- ADD TO CART BUTTONS ----
function initAddToCartButtons() {
  document.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;
      const name     = card.querySelector('.card-title')?.textContent  || 'Produto';
      const category = card.querySelector('.card-category')?.textContent || '';
      const price    = card.querySelector('.price-current')?.textContent || 'R$ 0,00';

      // Prefer real image src; fall back to emoji text
      const imgEl  = card.querySelector('.card-img img');
      const imgSrc = imgEl ? imgEl.src : null;
      const icon   = imgSrc ? null : (card.querySelector('.card-img')?.textContent?.trim() || '🎮');

      cart.add({ name, category, imgSrc, icon, price });

      btn.textContent = '✓ Adicionado';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = 'Adicionar ao Carrinho';
        btn.classList.remove('added');
      }, 2000);
    });
  });
}

// ---- NAVBAR SCROLL ----
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---- HAMBURGER MENU ----
function initHamburger() {
  const ham = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if (!ham || !links) return;
  ham.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!ham.contains(e.target) && !links.contains(e.target)) links.classList.remove('open');
  });
}

// ---- FILTER (portfolio) ----
function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const grid = document.getElementById('portfolio-grid');
  if (!btns.length || !grid) return;

  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get('cat');
  if (urlCat) {
    btns.forEach(b => b.classList.toggle('active', b.dataset.filter === urlCat));
    applyFilter(urlCat, grid);
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter, grid);
    });
  });
}

function applyFilter(filter, grid) {
  grid.querySelectorAll('.product-card').forEach(card => {
    card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
  });
}

// ---- COUNTER ANIMATION ----
function initCounters() {
  const nums = document.querySelectorAll('[data-counter]');
  if (!nums.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });
  nums.forEach(n => obs.observe(n));
}

// ---- COUNTDOWN TIMER ----
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  let end = sessionStorage.getItem('promo-end');
  if (!end) {
    end = Date.now() + 3 * 24 * 60 * 60 * 1000;
    sessionStorage.setItem('promo-end', end);
  }
  end = parseInt(end, 10);

  function tick() {
    const diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const f = n => String(n).padStart(2, '0');
    const days  = document.getElementById('cd-days');
    const hours = document.getElementById('cd-hours');
    const mins  = document.getElementById('cd-mins');
    const secs  = document.getElementById('cd-secs');
    if (days)  days.textContent  = f(d);
    if (hours) hours.textContent = f(h);
    if (mins)  mins.textContent  = f(m);
    if (secs)  secs.textContent  = f(s);
  }
  tick();
  setInterval(tick, 1000);
}

// ---- CONTACT FORM ----
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.form-group');
      if (!field.value.trim()) { group?.classList.add('error'); valid = false; }
      else { group?.classList.remove('error'); }
    });
    if (!valid) { showToast('Preencha todos os campos obrigatórios.', 'error'); return; }
    form.style.display = 'none';
    const success = document.querySelector('.form-success');
    if (success) success.style.display = 'block';
    showToast('Mensagem enviada com sucesso! ✓');
  });
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => field.closest('.form-group')?.classList.remove('error'));
  });
}

// ---- BOOT ----
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initCounters();
  initCountdown();
  initFilter();
  initAddToCartButtons();
  initContactForm();
  renderCart();
});
