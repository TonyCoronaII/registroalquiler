document.addEventListener('DOMContentLoaded', () => {

  const forms = {
    'form-scoring': { servicio: 'Scoring de Inquilino', precio: '15€' },
    'form-contrato': { servicio: 'Contrato LAU', precio: '19€' },
    'form-burofax': { servicio: 'Burofax por Impago', precio: '39€' },
    'form-acta': { servicio: 'Acta de Entrega', precio: '9€' },
    'form-seguro': { servicio: 'Seguro de Impago', precio: 'Consulta' }
  };

  // --- Photo upload UI ---
  const fileInput = document.getElementById('fotos-acta');
  const previewContainer = document.getElementById('preview-fotos');
  const uploadPlaceholder = document.querySelector('.file-upload-placeholder');
  const uploadArea = document.getElementById('upload-area');
  let selectedFiles = [];

  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);

    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        addFiles(e.dataTransfer.files);
      });
    }
  }

  function handleFileSelect(e) {
    addFiles(e.target.files);
  }

  function addFiles(fileList) {
    const remaining = 10 - selectedFiles.length;
    const newFiles = Array.from(fileList).filter(f => f.type.startsWith('image/')).slice(0, remaining);
    selectedFiles = selectedFiles.concat(newFiles);
    renderPreviews();
  }

  function renderPreviews() {
    if (!previewContainer || !uploadPlaceholder) return;
    if (selectedFiles.length === 0) {
      previewContainer.style.display = 'none';
      uploadPlaceholder.style.display = 'flex';
      return;
    }
    uploadPlaceholder.style.display = 'none';
    previewContainer.style.display = 'flex';
    previewContainer.innerHTML = '';

    selectedFiles.forEach((file, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'remove-thumb';
      btn.textContent = '×';
      btn.onclick = () => { selectedFiles.splice(i, 1); renderPreviews(); };
      thumb.appendChild(img);
      thumb.appendChild(btn);
      previewContainer.appendChild(thumb);
    });

    if (selectedFiles.length < 10) {
      const addMore = document.createElement('div');
      addMore.className = 'add-more';
      addMore.textContent = '+';
      addMore.onclick = () => fileInput.click();
      previewContainer.appendChild(addMore);
    }
  }

  // --- Image compression ---
  function compressImage(file, maxWidth, quality) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function compressAllPhotos(files, onProgress) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      if (onProgress) onProgress(i + 1, files.length);
      const dataUrl = await compressImage(files[i], 1200, 0.6);
      results.push({ name: files[i].name, data: dataUrl });
    }
    return results;
  }

  // --- Form submission ---
  Object.keys(forms).forEach(formId => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.removeAttribute('onsubmit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      const datos = {};
      form.querySelectorAll('input:not([type="file"]), select, textarea').forEach(field => {
        if (field.id && field.value) {
          const label = form.querySelector('label[for="' + field.id + '"]');
          const key = label ? label.textContent.replace(/\s*\(.*\)/, '').trim() : field.id;
          datos[key] = field.value;
        }
      });

      const payload = {
        servicio: forms[formId].servicio,
        precio: forms[formId].precio,
        datos: datos
      };

      // Compress and attach photos if present
      if (formId === 'form-acta' && selectedFiles.length > 0) {
        if (submitBtn) submitBtn.textContent = 'Comprimiendo fotos...';
        payload.fotos = await compressAllPhotos(selectedFiles, (current, total) => {
          if (submitBtn) submitBtn.textContent = 'Foto ' + current + '/' + total + '...';
        });
        if (submitBtn) submitBtn.textContent = 'Enviando...';
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
          showMessage(form, 'success',
            'Solicitud enviada correctamente. Recibirás un email con tu ' +
            forms[formId].servicio.toLowerCase() + ' y el enlace de pago en unos minutos.');
          form.reset();
          selectedFiles = [];
          renderPreviews();
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
    if (type === 'success') setTimeout(() => msg.remove(), 10000);
  }
});
