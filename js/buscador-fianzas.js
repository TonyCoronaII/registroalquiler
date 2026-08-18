document.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('ccaa-selector');
  if (!selector) return;

  loadJSON(getDataPath('comunidades.json')).then((data) => {
    populateSelector(selector, data.comunidades);
    selector.addEventListener('change', () => {
      const ccaa = data.comunidades.find((c) => c.id === selector.value);
      if (ccaa) renderFicha(ccaa);
      else clearFicha();
    });

    const preselected = selector.dataset.preselect;
    if (preselected) {
      selector.value = preselected;
      const ccaa = data.comunidades.find((c) => c.id === preselected);
      if (ccaa) renderFicha(ccaa);
    }
  });
});

function getDataPath(file) {
  const depth = document.querySelector('meta[name="data-depth"]');
  const prefix = depth ? depth.content : '';
  return `${prefix}data/${file}`;
}

function populateSelector(select, comunidades) {
  comunidades
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });
}

function renderFicha(ccaa) {
  const container = document.getElementById('ficha-resultado');
  if (!container) return;

  container.innerHTML = `
    <div class="ficha-ccaa">
      <h3>Fianza de alquiler en ${ccaa.nombre}</h3>
      <div class="ficha-grid">
        <div class="ficha-dato">
          <span class="label">Organismo competente</span>
          <span class="value">${ccaa.organismo}</span>
        </div>
        <div class="ficha-dato">
          <span class="label">Plazo de depósito</span>
          <span class="value">${ccaa.plazoDeposito} ${ccaa.unidadPlazo}</span>
        </div>
        <div class="ficha-dato">
          <span class="label">Importe legal</span>
          <span class="value">${ccaa.importeFianza}</span>
        </div>
        <div class="ficha-dato">
          <span class="label">Plazo de devolución</span>
          <span class="value">${ccaa.devolucion}</span>
        </div>
        <div class="ficha-dato">
          <span class="label">Modelo tributario</span>
          <span class="value">${ccaa.modeloITP}</span>
        </div>
        <div class="ficha-dato">
          <span class="label">Normativa</span>
          <span class="value">${ccaa.normativa}</span>
        </div>
        <div class="ficha-dato">
          <span class="label">Sede electrónica</span>
          <span class="value"><a href="${ccaa.sedeElectronica}" target="_blank" rel="noopener">Acceder a la sede oficial ↗</a></span>
        </div>
        <div class="ficha-dato">
          <span class="label">Trámite online</span>
          <span class="value"><a href="${ccaa.tramiteOnline}" target="_blank" rel="noopener">Iniciar trámite ↗</a></span>
        </div>
      </div>
      <div class="checklist">
        <h4>Documentación necesaria</h4>
        <ul>
          ${ccaa.checklist.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      ${ccaa.observaciones ? `<div class="info-box"><strong>Nota importante</strong>${ccaa.observaciones}</div>` : ''}
      <div class="cross-sell">
        <h4>Completa tu alquiler con seguridad</h4>
        <p>Ya sabes cómo depositar la fianza. Ahora protege tu inversión:</p>
        <div class="cross-sell-links">
          <a href="${getRelativePath()}validar-inquilino/" class="btn btn-primary">Verificar inquilino — 15€</a>
          <a href="${getRelativePath()}contratos/" class="btn btn-success">Generar contrato LAU — 19€</a>
          <a href="${getRelativePath()}reclamaciones/" class="btn btn-danger">Enviar burofax — 39€</a>
        </div>
      </div>
    </div>
  `;
}

function clearFicha() {
  const container = document.getElementById('ficha-resultado');
  if (container) container.innerHTML = '';
}

function getRelativePath() {
  const depth = document.querySelector('meta[name="data-depth"]');
  return depth ? depth.content : '';
}
