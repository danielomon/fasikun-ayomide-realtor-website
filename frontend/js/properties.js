/* Property data fetching + rendering: featured grid, full listing with
   filters, and the single property detail page. */

function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

function propertyCardHTML(p) {
  return `
    <a href="/properties/${p.id}" class="property-card reveal">
      <div class="property-card-img">
        <img src="${p.heroImage}" alt="${p.name}" loading="lazy" />
        <span class="property-status">${p.status}</span>
      </div>
      <div class="property-card-body">
        <h3>${p.name}</h3>
        <div class="property-loc">${p.location}</div>
        <p style="margin:0; font-size:0.92rem; color:var(--text-muted);">${p.summary}</p>
        <div class="property-meta">
          <div>
            <div class="property-price-label">Starting from</div>
            <div class="property-price">${formatNaira(p.priceFrom)}</div>
          </div>
          <div class="property-type-tag">${p.type}</div>
        </div>
      </div>
    </a>
  `;
}

async function loadFeaturedProperties(limit = 3) {
  const mount = document.getElementById('featuredProperties');
  if (!mount) return;
  try {
    const res = await fetch('/api/properties');
    const properties = await res.json();
    mount.innerHTML = properties.slice(0, limit).map(propertyCardHTML).join('');
    initReveal();
  } catch (e) {
    mount.innerHTML = '<p>Unable to load properties right now. Please refresh, or message me directly on WhatsApp.</p>';
  }
}

async function loadPropertyListing() {
  const mount = document.getElementById('propertyGrid');
  if (!mount) return;

  let allProperties = [];
  try {
    const res = await fetch('/api/properties');
    allProperties = await res.json();
  } catch (e) {
    mount.innerHTML = '<p>Unable to load properties right now. Please refresh, or message me directly on WhatsApp.</p>';
    return;
  }

  const locationSelect = document.getElementById('filterLocation');
  const typeSelect = document.getElementById('filterType');
  const priceSelect = document.getElementById('filterPrice');
  const countEl = document.getElementById('filterCount');

  const locations = [...new Set(allProperties.map((p) => p.location))];
  const types = [...new Set(allProperties.map((p) => p.type))];

  locationSelect.innerHTML =
    '<option value="">All locations</option>' + locations.map((l) => `<option value="${l}">${l}</option>`).join('');
  typeSelect.innerHTML =
    '<option value="">All property types</option>' + types.map((t) => `<option value="${t}">${t}</option>`).join('');

  function render() {
    const loc = locationSelect.value;
    const type = typeSelect.value;
    const price = priceSelect.value;

    let filtered = allProperties.filter((p) => {
      if (loc && p.location !== loc) return false;
      if (type && p.type !== type) return false;
      if (price === 'under10' && p.priceFrom >= 10000000) return false;
      if (price === '10to20' && (p.priceFrom < 10000000 || p.priceFrom > 20000000)) return false;
      if (price === 'over20' && p.priceFrom <= 20000000) return false;
      return true;
    });

    mount.innerHTML = filtered.length
      ? filtered.map(propertyCardHTML).join('')
      : '<p>No properties match those filters right now. Try widening your search, or message me on WhatsApp and I\'ll help you find the right fit.</p>';
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`;
    initReveal();
  }

  [locationSelect, typeSelect, priceSelect].forEach((el) => el.addEventListener('change', render));
  render();
}

async function loadPropertyDetail() {
  const mount = document.getElementById('propertyDetail');
  if (!mount) return;
  const id = window.location.pathname.split('/').filter(Boolean).pop();

  let p;
  try {
    const res = await fetch(`/api/properties/${id}`);
    if (!res.ok) throw new Error('not found');
    p = await res.json();
  } catch (e) {
    mount.innerHTML = `<div class="wrap section"><h2>Property not found</h2><p>This listing may have sold or moved. <a href="/properties" style="color:var(--brass); font-weight:700;">View all available properties →</a></p></div>`;
    return;
  }

  document.title = `${p.name} | Fasikun Ayomide, Realtor`;

  const waMessage = `Hi Ayomide, I'd like to enquire about ${p.name} in ${p.location}. Could you share more details and available inspection dates?`;

  mount.innerHTML = `
    <div class="hero" style="min-height:64vh;">
      <div class="hero-copy">
        <span class="eyebrow">${p.status} · ${p.type}</span>
        <h1 style="max-width:16ch;">${p.name}</h1>
        <p class="lede">${p.location}</p>
        <div class="hero-cta">
          <a href="${waLink(waMessage)}" target="_blank" rel="noopener" class="btn btn-whatsapp">Enquire on WhatsApp</a>
          <a href="#inspection" class="btn btn-outline-paper">Book an Inspection</a>
        </div>
      </div>
      <div class="hero-media">
        <img src="${p.heroImage}" alt="${p.name}" />
      </div>
    </div>

    <section class="section">
      <div class="wrap">
        <div class="grid-3" style="margin-bottom:56px;">
          ${p.gallery.map((src) => `<div class="property-card-img" style="aspect-ratio:4/3;"><img src="${src}" alt="${p.name} photo" loading="lazy" /></div>`).join('')}
        </div>

        <div class="grid-2">
          <div>
            <span class="eyebrow">Overview</span>
            <p class="lede">${p.summary}</p>

            <h3 style="margin-top:40px; margin-bottom:16px;">Key features</h3>
            ${p.features.map((f) => `<div class="value-row" style="grid-template-columns:20px 1fr;"><span class="value-icon" style="font-size:1rem;">—</span><p style="margin:0;">${f}</p></div>`).join('')}

            <h3 style="margin-top:40px; margin-bottom:16px;">Location advantages</h3>
            ${p.locationAdvantages.map((f) => `<div class="value-row" style="grid-template-columns:20px 1fr;"><span class="value-icon" style="font-size:1rem;">—</span><p style="margin:0;">${f}</p></div>`).join('')}

            <h3 style="margin-top:40px; margin-bottom:16px;">Investment potential</h3>
            <p>${p.investmentPotential}</p>

            <h3 id="inspection" style="margin-top:40px; margin-bottom:16px;">Inspection</h3>
            <p>${p.inspection}</p>
          </div>

          <div>
            <div style="border:1px solid var(--line); padding:28px 26px;">
              <span class="eyebrow">Available sizes &amp; pricing</span>
              ${p.sizes
                .map(
                  (s) => `
                <div style="display:flex; justify-content:space-between; padding:14px 0; border-bottom:1px solid var(--line);">
                  <span style="font-weight:600;">${s.size}</span>
                  <span style="font-family:var(--font-display); color:var(--ink);">${formatNaira(s.price)}</span>
                </div>`
                )
                .join('')}

              <h4 style="margin-top:26px; font-size:0.85rem; color:var(--text-muted); font-family:var(--font-body); font-weight:700;">Payment plan</h4>
              <p style="font-size:0.92rem;">${p.paymentPlan}</p>

              <h4 style="margin-top:20px; font-size:0.85rem; color:var(--text-muted); font-family:var(--font-body); font-weight:700;">Title &amp; documentation</h4>
              <p style="font-size:0.92rem;">${p.documentation}</p>

              <a href="${waLink(waMessage)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-block" style="margin-top:12px;">Enquire on WhatsApp</a>
              <a href="/contact" class="btn btn-outline-ink btn-block" style="margin-top:12px;">Book a Consultation</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="enquire-bar">
      <div class="price">${formatNaira(p.priceFrom)} <small>Starting price · ${p.location}</small></div>
      <a href="${waLink(waMessage)}" target="_blank" rel="noopener" class="btn btn-whatsapp">Enquire on WhatsApp</a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedProperties();
  loadPropertyListing();
  loadPropertyDetail();
});
