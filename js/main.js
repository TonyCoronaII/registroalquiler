document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initFaqAccordions();
  injectSchemaFAQ();
});

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      toggle.classList.remove('active');
      nav.classList.remove('open');
    }
  });
}

function initFaqAccordions() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.closest('.faq-list')
        ?.querySelectorAll('.faq-item.open')
        .forEach((el) => el.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

async function loadJSON(path) {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Error cargando ${path}`);
  return resp.json();
}

function injectSchemaFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  const entries = [];
  faqItems.forEach((item) => {
    const q = item.querySelector('.faq-question')?.textContent?.trim();
    const a = item.querySelector('.faq-answer-inner')?.textContent?.trim();
    if (q && a) {
      entries.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      });
    }
  });

  if (!entries.length) return;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries,
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function renderStars(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function generateWhatsAppURL(numero, mensaje) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
