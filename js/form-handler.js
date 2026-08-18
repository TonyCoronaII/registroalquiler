document.addEventListener('DOMContentLoaded', () => {

  const forms = {
    'form-scoring': { servicio: 'Scoring de Inquilino', precio: '15€' },
    'form-contrato': { servicio: 'Contrato LAU', precio: '19€' },
    'form-burofax': { servicio: 'Burofax por Impago', precio: '39€' },
    'form-acta': { servicio: 'Acta de Entrega', precio: '9€' },
    'form-seguro': { servicio: 'Seguro de Impago', precio: 'Consulta' }
  };

  Object.keys(forms).forEach(formId => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.removeAttribute('onsubmit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"], [data-action="checkout"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      const datos = {};
      form.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.id && field.value) {
          const label = form.querySelector(`label[for="${field.id}"]`);
          const key = label ? label.textContent.replace(/\s*\(.*\)/, '').trim() : field.id;
          datos[key] = field.value;
        }
      });

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            servicio: forms[formId].servicio,
            precio: forms[formId].precio,
            datos: datos
          })
        });
        const result = await res.json();

        if (result.success) {
          showMessage(form, 'success',
            'Solicitud enviada correctamente. Te contactaremos en menos de 24 horas para gestionar tu ' +
            forms[formId].servicio.toLowerCase() + '.');
          form.reset();
        } else {
          showMessage(form, 'error', 'Error al enviar. Prueba por WhatsApp o escríbenos a contacto@tramitesalquiler.com');
        }
      } catch {
        showMessage(form, 'error', 'Error de conexión. Prueba por WhatsApp o escríbenos a contacto@tramitesalquiler.com');
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });

  function showMessage(form, type, text) {
    let msg = form.querySelector('.form-message');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-message';
      form.appendChild(msg);
    }
    msg.className = 'form-message ' + (type === 'success' ? 'form-message-success' : 'form-message-error');
    msg.textContent = text;
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (type === 'success') {
      setTimeout(() => msg.remove(), 10000);
    }
  }
});
