/* Shared site chrome: header, mobile nav, footer, WhatsApp float.
   Edit CONFIG below to update contact details across the whole site. */

const CONFIG = {
  whatsappNumber: '2349035601704', // digits only, country code first
  phone: '+234 903 560 1704',
  email: 'fasikunayomide3@gmail.com',
  instagram: 'https://instagram.com/fasikunayomide',
  linkedin: 'https://linkedin.com/in/fasikunayomide',
  calendlyUrl: '#contact', // swap for a real booking link when ready
};

function waLink(message) {
  const text = encodeURIComponent(message || "Hi Ayomide, I'd like to know more about your available properties.");
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'About Me', href: '/about' },
  { label: 'Why Invest', href: '/why-invest' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

function currentPath() {
  const p = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  return p === '' ? '/' : p;
}

function renderHeader() {
  const mount = document.getElementById('site-header');
  if (!mount) return;
  const path = currentPath();

  const links = NAV_ITEMS.map((item) => {
    const isActive = path === item.href || (item.href !== '/' && path.startsWith(item.href));
    return `<a href="${item.href}" class="${isActive ? 'active' : ''}">${item.label}</a>`;
  }).join('');

  mount.innerHTML = `
    <header class="site-header">
      <div class="wrap nav-row">
        <a href="/" class="brand">Fasikun Ayomide<span>REALTOR &amp; INVESTMENT ADVISOR</span></a>
        <nav>
          <ul class="nav-links">${links}</ul>
        </nav>
        <div class="nav-right">
          <a href="/contact" class="btn btn-brass">Book a Consultation</a>
          <button class="nav-toggle" id="navToggle" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
    <div class="mobile-nav" id="mobileNav">
      <div class="mobile-nav-top wrap" style="padding:0;">
        <a href="/" class="brand" style="color:var(--text-on-ink);">Fasikun Ayomide</a>
        <button class="mobile-close" id="mobileClose" aria-label="Close menu">&times;</button>
      </div>
      <div class="wrap" style="padding-top:8px;">
        ${NAV_ITEMS.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
        <a href="/contact" class="btn btn-brass btn-block">Book a Consultation</a>
      </div>
    </div>
  `;

  const toggle = document.getElementById('navToggle');
  const close = document.getElementById('mobileClose');
  const menu = document.getElementById('mobileNav');
  toggle.addEventListener('click', () => menu.classList.add('open'));
  close.addEventListener('click', () => menu.classList.remove('open'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('open')));
}

function renderFooter() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  mount.innerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">Fasikun Ayomide</div>
            <p>Helping young and first-time investors make smart, well-documented real estate decisions across Lagos.</p>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <a href="/properties">Properties</a>
            <a href="/why-invest">Why Invest</a>
            <a href="/how-it-works">How It Works</a>
            <a href="/insights">Insights</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="/about">About Me</a>
            <a href="/testimonials">Testimonials</a>
            <a href="/contact">Contact</a>
          </div>
          <div class="footer-col">
            <h4>Get in touch</h4>
            <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a>
            <a href="tel:${CONFIG.phone.replace(/\s/g, '')}">${CONFIG.phone}</a>
            <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
            <a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} Fasikun Ayomide. All rights reserved.</span>
          <span>Licensed Real Estate Advisor, Lagos, Nigeria</span>
        </div>
      </div>
    </footer>
  `;
}

function renderWhatsAppFloat() {
  if (document.getElementById('waFloat')) return;
  const a = document.createElement('a');
  a.href = waLink();
  a.target = '_blank';
  a.rel = 'noopener';
  a.className = 'wa-float';
  a.id = 'waFloat';
  a.setAttribute('aria-label', 'Chat on WhatsApp');
  a.innerHTML = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.34.66 4.52 1.8 6.38L4 29l7.8-1.75A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3Z" fill="#25D366"/>
    <path d="M22.1 18.53c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.56.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.53 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" fill="#fff"/>
  </svg>`;
  document.body.appendChild(a);
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  renderWhatsAppFloat();
  initReveal();
});
