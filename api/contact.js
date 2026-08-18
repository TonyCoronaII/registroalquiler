export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { servicio, precio, datos } = req.body;
  if (!servicio || !datos) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const camposHTML = Object.entries(datos)
    .map(([key, val]) => `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">${key}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${val}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1E3A5F;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">Nueva solicitud: ${servicio}</h2>
        <p style="margin:8px 0 0;opacity:.85;">Precio: ${precio}</p>
      </div>
      <div style="padding:20px 24px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          ${camposHTML}
        </table>
        <p style="color:#64748B;font-size:14px;margin:0;">Enviado desde tramitesalquiler.com</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TrámitesAlquiler <onboarding@resend.dev>',
        to: 'contacto@tramitesalquiler.com',
        subject: `Nueva solicitud: ${servicio} (${precio})`,
        html: html
      })
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true });
    }
    return res.status(500).json({ error: result.message || 'Error al enviar' });
  } catch (err) {
    return res.status(500).json({ error: 'Error de conexión con el servicio de email' });
  }
}
