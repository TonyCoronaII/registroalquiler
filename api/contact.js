export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzByHoY0YMa25cA3hOq66I5YNOAO2fw8BAv6GjwWb_pWZYJxX_scOCJaF5WnlZDvyQO/exec';

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    }
    return res.status(500).json({ error: 'Error al registrar la solicitud' });
  } catch (err) {
    return res.status(500).json({ error: 'Error de conexión' });
  }
}
