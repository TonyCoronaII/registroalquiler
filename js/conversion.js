document.addEventListener('DOMContentLoaded', () => {
  initConversionButtons();
});

function initConversionButtons() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      const servicioId = btn.dataset.servicio;

      if (action === 'whatsapp') {
        e.preventDefault();
        openWhatsApp(servicioId, btn.dataset.mensaje);
      }

      if (action === 'checkout') {
        e.preventDefault();
        goToCheckout(servicioId, btn.dataset.stripe);
      }
    });
  });
}

function openWhatsApp(servicioId, mensajeCustom) {
  loadJSON(getConversionDataPath('servicios.json')).then((data) => {
    const servicio = data.servicios.find((s) => s.id === servicioId);
    if (!servicio) return;

    const numero = servicio.whatsappNumero || data.configuracionGlobal.whatsappNumero;
    const mensaje = mensajeCustom || servicio.ctaWhatsApp;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  });
}

function goToCheckout(servicioId, stripeUrl) {
  if (stripeUrl && stripeUrl !== '#') {
    window.location.href = stripeUrl;
    return;
  }

  loadJSON(getConversionDataPath('servicios.json')).then((data) => {
    const servicio = data.servicios.find((s) => s.id === servicioId);
    if (!servicio) return;

    if (servicio.stripeLink && servicio.stripeLink !== '#') {
      window.location.href = servicio.stripeLink;
    } else {
      const numero = servicio.whatsappNumero || data.configuracionGlobal.whatsappNumero;
      const msg = `Quiero contratar ${servicio.nombre} (${servicio.precio}€). ¿Cómo puedo pagar?`;
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  });
}

function getConversionDataPath(file) {
  const depth = document.querySelector('meta[name="data-depth"]');
  const prefix = depth ? depth.content : '';
  return `${prefix}data/${file}`;
}
